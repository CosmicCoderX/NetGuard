"""Reproducible model comparison; selection uses validation data, never test scores.

Run: backend/venv/Scripts/python.exe -u ml/src/improve_model.py
Original serving artifacts are preserved. A complete new bundle is staged in validated/.
"""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import time

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score, precision_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier
import xgboost

from preprocessing import load_raw_data, clean_data, prepare_dataset, create_preprocessor

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'ml/models/validated'


def file_hash(path):
    with path.open('rb') as source:
        return hashlib.file_digest(source, 'sha256').hexdigest()


def metrics(y, prediction):
    return {
        'accuracy': float(accuracy_score(y, prediction)),
        'macro_precision': float(precision_score(y, prediction, average='macro', zero_division=0)),
        'macro_f1': float(f1_score(y, prediction, average='macro', zero_division=0)),
        'weighted_f1': float(f1_score(y, prediction, average='weighted', zero_division=0)),
    }


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    X, labels = prepare_dataset(clean_data(load_raw_data()))
    # Keep identical feature vectors in one partition, even when raw labels differ.
    signatures = pd.util.hash_pandas_object(X, index=False).to_numpy()
    signature_labels = pd.DataFrame({'signature': signatures, 'label': labels.to_numpy()})
    conflicts = signature_labels.groupby('signature')['label'].nunique()
    conflict_ids = conflicts[conflicts > 1].index
    keep = ~pd.Series(signatures).isin(conflict_ids).to_numpy() & ~pd.Series(signatures).duplicated().to_numpy()
    excluded = int((~keep).sum())
    X = X.loc[keep].reset_index(drop=True)
    labels = labels.loc[keep].reset_index(drop=True)
    signatures = signatures[keep]
    encoder = LabelEncoder().fit(labels)
    y = encoder.transform(labels)
    indices = np.arange(len(X))
    train_val, test = train_test_split(indices, test_size=.2, stratify=y, random_state=2026)
    train, validation = train_test_split(train_val, test_size=.25, stratify=y[train_val], random_state=2027)
    np.savez_compressed(OUT / 'split_manifest.npz', train=signatures[train], validation=signatures[validation], test=signatures[test])
    preprocessor = create_preprocessor(X.iloc[train])
    train_x = preprocessor.fit_transform(X.iloc[train]).astype(np.float32)
    validation_x = preprocessor.transform(X.iloc[validation]).astype(np.float32)
    test_x = preprocessor.transform(X.iloc[test]).astype(np.float32)
    print(f'Clean feature-unique rows={len(X):,}; train={len(train):,}; validation={len(validation):,}; test={len(test):,}; additional excluded={excluded}', flush=True)
    common = dict(objective='multi:softprob', n_estimators=300, max_depth=8,
                  learning_rate=.1, subsample=.8, colsample_bytree=.8,
                  tree_method='hist', eval_metric='mlogloss', random_state=42, n_jobs=4)
    candidates = [
        ('XGBoost baseline', XGBClassifier(**common), .5),
        ('XGBoost refined', XGBClassifier(**{**common, 'n_estimators': 450,
             'learning_rate': .08, 'max_depth': 9, 'min_child_weight': 3,
             'reg_lambda': 3, 'reg_alpha': .1}), .25),
        ('Random Forest', RandomForestClassifier(n_estimators=80, max_depth=22,
             min_samples_leaf=1, max_samples=.6, class_weight='balanced_subsample',
             random_state=42, n_jobs=4), None),
    ]
    counts = np.bincount(y[train])
    records = []
    for name, model, exponent in candidates:
        print(f'Training {name}...', flush=True)
        start = time.perf_counter()
        kwargs = {} if exponent is None else {'sample_weight': (len(train) / (len(counts) * counts[y[train]])) ** exponent}
        if exponent is not None:
            # Monitoring only; no early stopping or test-set feedback.
            kwargs.update(eval_set=[(validation_x, y[validation])], verbose=50)
        model.fit(train_x, y[train], **kwargs)
        training_seconds = time.perf_counter() - start
        validation_metrics = metrics(y[validation], model.predict(validation_x))
        # Predeclared objective balances per-class F1 and precision.
        selection_score = (validation_metrics['macro_f1'] + validation_metrics['macro_precision']) / 2
        record = {'name': name, 'validation': validation_metrics, 'selection_score': selection_score,
                  'training_seconds': training_seconds, 'weight_exponent': exponent}
        records.append(record)
        joblib.dump(model, OUT / (name.lower().replace(' ', '_') + '.joblib'), compress=3)
        print(json.dumps(record), flush=True)
        del model
    chosen = max(records, key=lambda row: row['selection_score'])['name']
    print(f'Locked validation winner: {chosen}. Evaluating all candidates once on the shared test partition.', flush=True)
    selected_prediction = None
    for record in records:
        path = OUT / (record['name'].lower().replace(' ', '_') + '.joblib')
        model = joblib.load(path)
        start = time.perf_counter()
        prediction = model.predict(test_x)
        record['test'] = metrics(y[test], prediction)
        record['test_batch_ms_per_flow'] = (time.perf_counter() - start) * 1000 / len(test)
        # Median single-flow latency after warmup; only includes classifier inference.
        model.predict_proba(test_x[:1])
        timings = []
        for _ in range(20):
            start = time.perf_counter(); model.predict_proba(test_x[:1]); timings.append((time.perf_counter() - start) * 1000)
        record['single_flow_ms'] = float(np.median(timings))
        record['selected'] = record['name'] == chosen
        if record['selected']:
            selected_prediction = prediction
            joblib.dump(model, OUT / 'netguard_final_xgboost.joblib', compress=3)
        print(record['name'], record['test'], flush=True)
        del model
    joblib.dump(preprocessor, OUT / 'netguard_final_preprocessor.joblib')
    joblib.dump(encoder, OUT / 'netguard_final_label_encoder.joblib')
    schema = {'num_features': len(X.columns), 'features': X.columns.tolist(), 'classes': encoder.classes_.tolist(), 'model_name': chosen}
    (OUT / 'netguard_schema.json').write_text(json.dumps(schema, indent=2), encoding='utf-8')
    actual = encoder.inverse_transform(y[test])
    predicted = encoder.inverse_transform(selected_prediction.astype(int))
    report = {
        'evaluated_at': datetime.now(timezone.utc).isoformat(), 'model_name': chosen,
        'split': 'Feature-unique stratified 60/20/20 train/validation/test; seeds 2026 and 2027.',
        'selection_rule': 'Highest validation mean of macro F1 and macro precision. Test scores are not used for selection.',
        'limitations': ['Internal random split of CIC-IDS2017; external networks and future attacks remain unvalidated.',
                        'Infiltration and Heartbleed are excluded. Probabilities are not calibrated.',
                        'Duplicate feature vectors and conflicting labels are excluded before splitting; historical benchmark scores are not directly comparable.'],
        'dataset_rows': len(X), 'train_rows': len(train), 'validation_rows': len(validation), 'test_rows': len(test),
        'additional_excluded_rows': excluded,
        'class_counts': {str(k): int(v) for k, v in labels.value_counts().items()},
        **metrics(y[test], selected_prediction), 'classes': encoder.classes_.tolist(),
        'classification_report': classification_report(actual, predicted, output_dict=True, zero_division=0),
        'confusion_matrix': confusion_matrix(actual, predicted, labels=encoder.classes_).tolist(),
        'comparison': records,
        'versions': {'sklearn': sklearn.__version__, 'xgboost': xgboost.__version__, 'numpy': np.__version__},
        'sources': [{'name': p.name, 'bytes': p.stat().st_size, 'sha256': file_hash(p)} for p in sorted((ROOT / 'ml/data/raw/MachineLearningCVE').glob('*.csv'))],
        'artifact_sha256': {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in [
            OUT / 'netguard_final_xgboost.joblib', OUT / 'netguard_final_preprocessor.joblib',
            OUT / 'netguard_final_label_encoder.joblib', OUT / 'netguard_schema.json']},
        'manifest_sha256': hashlib.sha256((OUT / 'split_manifest.npz').read_bytes()).hexdigest(),
    }
    (OUT / 'evaluation_report.json').write_text(json.dumps(report, indent=2, allow_nan=False), encoding='utf-8')
    print(f'Complete: {chosen}; report: {OUT / "evaluation_report.json"}', flush=True)


if __name__ == '__main__':
    main()

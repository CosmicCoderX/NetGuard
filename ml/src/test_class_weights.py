from pathlib import Path

import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    classification_report,
)

from xgboost import XGBClassifier

from preprocessing import (
    load_raw_data,
    clean_data,
    create_netguard_labels,
    prepare_dataset,
    create_preprocessor,
)


MODEL_DIR = (
    Path(__file__).resolve().parent.parent / "models"
)


def calculate_weights(y, mode):
    """Calculate sample weights using different strategies."""

    counts = pd.Series(y).value_counts()

    total = len(y)
    num_classes = len(counts)

    if mode == "none":
        return np.ones(len(y))

    if mode == "balanced":
        class_weights = {
            class_id: total / (num_classes * count)
            for class_id, count in counts.items()
        }

    elif mode == "sqrt":
        class_weights = {
            class_id: np.sqrt(
                total / (num_classes * count)
            )
            for class_id, count in counts.items()
        }

    else:
        raise ValueError(
            f"Unknown weighting mode: {mode}"
        )

    return np.array([
        class_weights[class_id]
        for class_id in y
    ])


def main():

    print("Loading dataset...")

    df = load_raw_data()
    df = clean_data(df)
    df = create_netguard_labels(df)

    X, y = prepare_dataset(df)

    print(f"Dataset: {X.shape}")

    # Encode target
    encoder = LabelEncoder()
    y_encoded = encoder.fit_transform(y)

    # Same reproducible split as previous experiments
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_encoded,
        test_size=0.20,
        random_state=42,
        stratify=y_encoded,
    )

    # Use a representative subset for experimentation.
    # Final model will still be trained on the full dataset.
    experiment_size = 500_000

    if len(X_train) > experiment_size:

        X_train, _, y_train, _ = train_test_split(
            X_train,
            y_train,
            train_size=experiment_size,
            random_state=42,
            stratify=y_train,
        )

    print(
        f"\nExperiment training samples: "
        f"{len(X_train):,}"
    )

    print(
        f"Test samples: "
        f"{len(X_test):,}"
    )

    # Preprocessing
    preprocessor = create_preprocessor(X_train)

    print("\nFitting preprocessor...")

    X_train_processed = preprocessor.fit_transform(
        X_train
    )

    X_test_processed = preprocessor.transform(
        X_test
    )

    results = []

    for mode in ["none", "balanced", "sqrt"]:

        print("\n" + "=" * 60)
        print(f"WEIGHTING STRATEGY: {mode.upper()}")
        print("=" * 60)

        sample_weights = calculate_weights(
            y_train,
            mode
        )

        model = XGBClassifier(
            objective="multi:softprob",
            num_class=len(encoder.classes_),
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            subsample=0.8,
            colsample_bytree=0.8,
            tree_method="hist",
            eval_metric="mlogloss",
            random_state=42,
            n_jobs=-1,
        )

        print("Training...")

        model.fit(
            X_train_processed,
            y_train,
            sample_weight=sample_weights,
            verbose=False,
        )

        print("Predicting...")

        predictions = model.predict(
            X_test_processed
        )

        predictions = predictions.astype(int).ravel()

        accuracy = accuracy_score(
            y_test,
            predictions
        )

        macro_f1 = f1_score(
            y_test,
            predictions,
            average="macro"
        )

        weighted_f1 = f1_score(
            y_test,
            predictions,
            average="weighted"
        )

        report = classification_report(
            y_test,
            predictions,
            target_names=encoder.classes_,
            output_dict=True,
            zero_division=0,
        )

        botnet_f1 = report["Botnet"]["f1-score"]
        botnet_precision = report["Botnet"]["precision"]
        botnet_recall = report["Botnet"]["recall"]

        web_attack_f1 = report["Web Attack"]["f1-score"]

        print(
            f"Accuracy        : {accuracy:.4f}"
        )

        print(
            f"Macro F1        : {macro_f1:.4f}"
        )

        print(
            f"Weighted F1     : {weighted_f1:.4f}"
        )

        print(
            f"Botnet Precision: {botnet_precision:.4f}"
        )

        print(
            f"Botnet Recall   : {botnet_recall:.4f}"
        )

        print(
            f"Botnet F1       : {botnet_f1:.4f}"
        )

        print(
            f"Web Attack F1   : {web_attack_f1:.4f}"
        )

        results.append({
            "weighting": mode,
            "accuracy": accuracy,
            "macro_f1": macro_f1,
            "weighted_f1": weighted_f1,
            "botnet_precision": botnet_precision,
            "botnet_recall": botnet_recall,
            "botnet_f1": botnet_f1,
            "web_attack_f1": web_attack_f1,
        })

    comparison = pd.DataFrame(results)

    print("\n" + "=" * 60)
    print("CLASS WEIGHT COMPARISON")
    print("=" * 60)

    print(
        comparison.to_string(index=False)
    )


if __name__ == "__main__":
    main()
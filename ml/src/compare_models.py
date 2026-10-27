from pathlib import Path

import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
)
from sklearn.model_selection import train_test_split

from preprocessing import (
    load_raw_data,
    clean_data,
    create_netguard_labels,
    prepare_dataset,
)


MODEL_DIR = (
    Path(__file__).resolve().parent.parent / "models"
)


def load_test_data():

    print("Loading dataset...")

    df = load_raw_data()

    df = clean_data(df)

    df = create_netguard_labels(df)

    X, y = prepare_dataset(df)

    _, X_test, _, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    return X_test, y_test


def evaluate_random_forest(X_test, y_test):

    print("\n" + "=" * 60)
    print("RANDOM FOREST")
    print("=" * 60)

    model_path = MODEL_DIR / "netguard_random_forest.joblib"

    model = joblib.load(model_path)

    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)

    macro_f1 = f1_score(
        y_test,
        y_pred,
        average="macro"
    )

    weighted_f1 = f1_score(
        y_test,
        y_pred,
        average="weighted"
    )

    print(f"Accuracy    : {accuracy:.4f}")
    print(f"Macro F1    : {macro_f1:.4f}")
    print(f"Weighted F1 : {weighted_f1:.4f}")

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            y_pred,
            digits=4
        )
    )

    return {
        "model": "Random Forest",
        "accuracy": accuracy,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
    }


def evaluate_xgboost(X_test, y_test):

    print("\n" + "=" * 60)
    print("XGBOOST")
    print("=" * 60)

    model_path = MODEL_DIR / "netguard_xgboost.joblib"
    encoder_path = MODEL_DIR / "netguard_label_encoder.joblib"
    preprocessor_path = (
        MODEL_DIR / "netguard_xgboost_preprocessor.joblib"
    )

    model = joblib.load(model_path)
    label_encoder = joblib.load(encoder_path)
    preprocessor = joblib.load(preprocessor_path)

    print("Preprocessing test data...")

    X_test_processed = preprocessor.transform(X_test)

    print("Generating predictions...")

    y_pred_encoded = model.predict(X_test_processed)

    # XGBoost may return shape (n_samples, 1)
    y_pred_encoded = y_pred_encoded.astype(int).ravel()

    y_pred = label_encoder.inverse_transform(
        y_pred_encoded
    )

    accuracy = accuracy_score(y_test, y_pred)

    macro_f1 = f1_score(
        y_test,
        y_pred,
        average="macro"
    )

    weighted_f1 = f1_score(
        y_test,
        y_pred,
        average="weighted"
    )

    print(f"Accuracy    : {accuracy:.4f}")
    print(f"Macro F1    : {macro_f1:.4f}")
    print(f"Weighted F1 : {weighted_f1:.4f}")

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            y_pred,
            digits=4
        )
    )

    return {
        "model": "XGBoost",
        "accuracy": accuracy,
        "macro_f1": macro_f1,
        "weighted_f1": weighted_f1,
    }


def main():

    X_test, y_test = load_test_data()

    print(f"\nTest samples: {len(X_test):,}")

    rf_results = evaluate_random_forest(
        X_test,
        y_test
    )

    xgb_results = evaluate_xgboost(
        X_test,
        y_test
    )

    comparison = pd.DataFrame([
        rf_results,
        xgb_results
    ])

    print("\n" + "=" * 60)
    print("MODEL COMPARISON")
    print("=" * 60)

    print(
        comparison.to_string(index=False)
    )


if __name__ == "__main__":
    main()
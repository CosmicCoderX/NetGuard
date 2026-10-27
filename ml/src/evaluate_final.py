from pathlib import Path

import joblib
import pandas as pd

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
    f1_score,
)

from sklearn.model_selection import train_test_split

import matplotlib.pyplot as plt

from preprocessing import (
    load_raw_data,
    clean_data,
    create_netguard_labels,
    prepare_dataset,
)


MODEL_DIR = (
    Path(__file__).resolve().parent.parent / "models"
)


def main():

    print("=" * 60)
    print("NETGUARD FINAL MODEL EVALUATION")
    print("=" * 60)

    # ---------------------------------------------------------
    # 1. Load final artifacts
    # ---------------------------------------------------------

    print("\nLoading final model...")

    model = joblib.load(
        MODEL_DIR / "netguard_final_xgboost.joblib"
    )

    label_encoder = joblib.load(
        MODEL_DIR / "netguard_final_label_encoder.joblib"
    )

    preprocessor = joblib.load(
        MODEL_DIR / "netguard_final_preprocessor.joblib"
    )

    print("Final model loaded.")

    # ---------------------------------------------------------
    # 2. Load and prepare dataset
    # ---------------------------------------------------------

    print("\nLoading dataset...")

    df = load_raw_data()

    df = clean_data(df)

    df = create_netguard_labels(df)

    X, y = prepare_dataset(df)

    print(f"Production dataset: {X.shape}")

    # ---------------------------------------------------------
    # 3. Recreate exact test split
    # ---------------------------------------------------------

    _, X_test, _, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    print(
        f"Test samples: {len(X_test):,}"
    )

    # ---------------------------------------------------------
    # 4. Preprocess
    # ---------------------------------------------------------

    print("\nPreprocessing test data...")

    X_test_processed = preprocessor.transform(
        X_test
    )

    # ---------------------------------------------------------
    # 5. Predictions
    # ---------------------------------------------------------

    print("Generating predictions...")

    y_pred_encoded = model.predict(
        X_test_processed
    )

    y_pred_encoded = (
        y_pred_encoded.astype(int).ravel()
    )

    y_pred = label_encoder.inverse_transform(
        y_pred_encoded
    )

    # ---------------------------------------------------------
    # 6. Metrics
    # ---------------------------------------------------------

    accuracy = accuracy_score(
        y_test,
        y_pred
    )

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

    print("\n" + "=" * 60)
    print("FINAL NETGUARD PERFORMANCE")
    print("=" * 60)

    print(
        f"Accuracy    : {accuracy:.4f}"
    )

    print(
        f"Macro F1    : {macro_f1:.4f}"
    )

    print(
        f"Weighted F1 : {weighted_f1:.4f}"
    )

    # ---------------------------------------------------------
    # 7. Classification report
    # ---------------------------------------------------------

    print("\n" + "=" * 60)
    print("CLASSIFICATION REPORT")
    print("=" * 60)

    report = classification_report(
        y_test,
        y_pred,
        digits=4,
        zero_division=0,
    )

    print(report)

    # ---------------------------------------------------------
    # 8. Confusion matrix
    # ---------------------------------------------------------

    labels = label_encoder.classes_

    cm = confusion_matrix(
        y_test,
        y_pred,
        labels=labels,
    )

    print("\n" + "=" * 60)
    print("CONFUSION MATRIX")
    print("=" * 60)

    print(cm)

    # ---------------------------------------------------------
    # 9. Plot confusion matrix
    # ---------------------------------------------------------

    display = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=labels,
    )

    display.plot(
        xticks_rotation=45
    )

    plt.title(
        "NetGuard Final XGBoost - Confusion Matrix"
    )

    plt.tight_layout()

    plt.show()


if __name__ == "__main__":
    main()
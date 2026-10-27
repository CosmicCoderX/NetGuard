from pathlib import Path

import joblib
import matplotlib.pyplot as plt

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
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


def main():

    print("Loading XGBoost artifacts...")

    model = joblib.load(
        MODEL_DIR / "netguard_xgboost.joblib"
    )

    label_encoder = joblib.load(
        MODEL_DIR / "netguard_label_encoder.joblib"
    )

    preprocessor = joblib.load(
        MODEL_DIR / "netguard_xgboost_preprocessor.joblib"
    )

    print("Artifacts loaded.")

    print("\nLoading dataset...")

    df = load_raw_data()
    df = clean_data(df)
    df = create_netguard_labels(df)

    X, y = prepare_dataset(df)

    _, X_test, _, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    print(f"Test samples: {len(X_test):,}")

    print("\nPreprocessing test data...")

    X_test_processed = preprocessor.transform(X_test)

    print("Generating predictions...")

    y_pred_encoded = model.predict(
        X_test_processed
    )

    y_pred_encoded = y_pred_encoded.astype(int).ravel()

    y_pred = label_encoder.inverse_transform(
        y_pred_encoded
    )

    print("\n" + "=" * 60)
    print("XGBOOST CLASSIFICATION REPORT")
    print("=" * 60)

    print(
        classification_report(
            y_test,
            y_pred,
            digits=4,
        )
    )

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

    display = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=labels,
    )

    display.plot(
        xticks_rotation=45,
    )

    plt.title(
        "NetGuard XGBoost - Confusion Matrix"
    )

    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
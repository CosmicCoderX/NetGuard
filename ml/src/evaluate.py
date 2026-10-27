from pathlib import Path

import joblib
import matplotlib.pyplot as plt
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay,
    f1_score,
)

from preprocessing import load_raw_data
from preprocessing import clean_data
from preprocessing import create_netguard_labels
from preprocessing import prepare_dataset
from sklearn.model_selection import train_test_split


MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "netguard_random_forest.joblib"
)


def main():

    print("Loading trained model...")

    pipeline = joblib.load(MODEL_PATH)

    print("Model loaded.")

    print("\nLoading dataset...")

    df = load_raw_data()

    df = clean_data(df)

    df = create_netguard_labels(df)

    X, y = prepare_dataset(df)

    # Recreate the exact same test split
    _, X_test, _, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    print(f"Test samples: {len(X_test):,}")

    print("\nGenerating predictions...")

    y_pred = pipeline.predict(X_test)

    print("Predictions completed.")

    # Accuracy
    accuracy = accuracy_score(y_test, y_pred)

    # F1 scores
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
    print("NETGUARD MODEL PERFORMANCE")
    print("=" * 60)

    print(f"Accuracy    : {accuracy:.4f}")
    print(f"Macro F1    : {macro_f1:.4f}")
    print(f"Weighted F1 : {weighted_f1:.4f}")

    # Classification report
    print("\n" + "=" * 60)
    print("CLASSIFICATION REPORT")
    print("=" * 60)

    print(
        classification_report(
            y_test,
            y_pred,
            digits=4
        )
    )

    # Confusion matrix
    labels = pipeline.classes_

    cm = confusion_matrix(
        y_test,
        y_pred,
        labels=labels
    )

    print("\n" + "=" * 60)
    print("CONFUSION MATRIX")
    print("=" * 60)

    print(cm)

    # Visualize confusion matrix
    display = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=labels
    )

    display.plot(
        xticks_rotation=45
    )

    plt.title("NetGuard Random Forest - Confusion Matrix")
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()
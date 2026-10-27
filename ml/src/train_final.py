from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
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


def calculate_sqrt_weights(y):
    """Calculate square-root balanced sample weights."""

    counts = pd.Series(y).value_counts()

    total = len(y)
    num_classes = len(counts)

    class_weights = {
        class_id: np.sqrt(
            total / (num_classes * count)
        )
        for class_id, count in counts.items()
    }

    sample_weights = np.array([
        class_weights[class_id]
        for class_id in y
    ])

    return sample_weights, class_weights


def main():

    print("=" * 60)
    print("NETGUARD FINAL MODEL TRAINING")
    print("=" * 60)

    # ---------------------------------------------------------
    # 1. Load dataset
    # ---------------------------------------------------------

    print("\nLoading dataset...")

    df = load_raw_data()

    print(f"Raw shape: {df.shape}")

    # ---------------------------------------------------------
    # 2. Clean dataset
    # ---------------------------------------------------------

    df = clean_data(df)

    print(f"Cleaned shape: {df.shape}")

    # ---------------------------------------------------------
    # 3. Create NetGuard labels
    # ---------------------------------------------------------

    df = create_netguard_labels(df)

    # ---------------------------------------------------------
    # 4. Prepare production dataset
    # ---------------------------------------------------------

    X, y = prepare_dataset(df)

    print(f"\nProduction dataset: {X.shape}")

    print("\nClass distribution:")

    print(y.value_counts())

    # ---------------------------------------------------------
    # 5. Encode target
    # ---------------------------------------------------------

    label_encoder = LabelEncoder()

    y_encoded = label_encoder.fit_transform(y)

    print("\nTarget encoding:")

    for index, class_name in enumerate(
        label_encoder.classes_
    ):
        print(f"{index}: {class_name}")

    # ---------------------------------------------------------
    # 6. Train/test split
    # ---------------------------------------------------------

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y_encoded,
        test_size=0.20,
        random_state=42,
        stratify=y_encoded,
    )

    print("\n" + "=" * 60)
    print("DATA SPLIT")
    print("=" * 60)

    print(
        f"Training samples: {len(X_train):,}"
    )

    print(
        f"Testing samples : {len(X_test):,}"
    )

    # ---------------------------------------------------------
    # 7. Create preprocessing pipeline
    # ---------------------------------------------------------

    preprocessor = create_preprocessor(X_train)

    print("\nFitting preprocessor...")

    X_train_processed = (
        preprocessor.fit_transform(X_train)
    )

    print("Preprocessor fitted.")

    # ---------------------------------------------------------
    # 8. Calculate √ balanced weights
    # ---------------------------------------------------------

    print("\nCalculating class weights...")

    sample_weights, class_weights = (
        calculate_sqrt_weights(y_train)
    )

    print("\nClass weights:")

    for class_id, weight in class_weights.items():

        print(
            f"{label_encoder.classes_[class_id]}: "
            f"{weight:.4f}"
        )

    # ---------------------------------------------------------
    # 9. Create final XGBoost model
    # ---------------------------------------------------------

    model = XGBClassifier(

        objective="multi:softprob",

        num_class=len(
            label_encoder.classes_
        ),

        n_estimators=300,

        max_depth=8,

        learning_rate=0.1,

        subsample=0.8,

        colsample_bytree=0.8,

        tree_method="hist",

        eval_metric="mlogloss",

        random_state=42,

        n_jobs=-1,
    )

    # ---------------------------------------------------------
    # 10. Train
    # ---------------------------------------------------------

    print("\n" + "=" * 60)
    print("TRAINING FINAL XGBOOST MODEL")
    print("=" * 60)

    print(
        "Training on "
        f"{len(X_train):,} samples..."
    )

    model.fit(
        X_train_processed,
        y_train,
        sample_weight=sample_weights,
        verbose=True,
    )

    print("\nTraining completed.")

    # ---------------------------------------------------------
    # 11. Save artifacts
    # ---------------------------------------------------------

    MODEL_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    model_path = (
        MODEL_DIR
        / "netguard_final_xgboost.joblib"
    )

    encoder_path = (
        MODEL_DIR
        / "netguard_final_label_encoder.joblib"
    )

    preprocessor_path = (
        MODEL_DIR
        / "netguard_final_preprocessor.joblib"
    )

    joblib.dump(
        model,
        model_path
    )

    joblib.dump(
        label_encoder,
        encoder_path
    )

    joblib.dump(
        preprocessor,
        preprocessor_path
    )

    print("\n" + "=" * 60)
    print("FINAL MODEL SAVED")
    print("=" * 60)

    print(model_path)
    print(encoder_path)
    print(preprocessor_path)


if __name__ == "__main__":
    main()
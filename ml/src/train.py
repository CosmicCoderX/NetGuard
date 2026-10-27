from pathlib import Path

import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from preprocessing import load_raw_data
from preprocessing import clean_data
from preprocessing import create_netguard_labels
from preprocessing import prepare_dataset
from preprocessing import create_preprocessor


MODEL_DIR = (
    Path(__file__).resolve().parent.parent / "models"
)


def main():

    print("Loading dataset...")

    df = load_raw_data()

    print(f"Raw shape: {df.shape}")

    # Clean data
    df = clean_data(df)

    print(f"Cleaned shape: {df.shape}")

    # Create NetGuard labels
    df = create_netguard_labels(df)

    # Prepare production dataset
    X, y = prepare_dataset(df)

    print(f"Production dataset: {X.shape}")

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    print(f"Training samples: {len(X_train):,}")
    print(f"Testing samples : {len(X_test):,}")

    # Create preprocessing pipeline
    preprocessor = create_preprocessor(X_train)

    # Create Random Forest
    model = RandomForestClassifier(
        n_estimators=100,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )

    # Combine preprocessing + model
    pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            ("model", model)
        ]
    )

    print("\nTraining Random Forest...")

    pipeline.fit(X_train, y_train)

    print("Training completed.")

    # Create models directory
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    model_path = MODEL_DIR / "netguard_random_forest.joblib"

    joblib.dump(pipeline, model_path)

    print(f"\nModel saved to:")
    print(model_path)


if __name__ == "__main__":
    main()
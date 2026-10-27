from pathlib import Path

import joblib
import pandas as pd


MODEL_PATH = (
    Path(__file__).resolve().parent.parent
    / "models"
    / "netguard_random_forest.joblib"
)


def main():

    print("Loading trained model...")

    pipeline = joblib.load(MODEL_PATH)

    print("Model loaded.")

    # Get the Random Forest model
    model = pipeline.named_steps["model"]

    # Get feature names after preprocessing
    preprocessor = pipeline.named_steps["preprocessor"]

    feature_names = preprocessor.get_feature_names_out()

    # Get feature importance
    importances = model.feature_importances_

    importance_df = pd.DataFrame({
        "feature": feature_names,
        "importance": importances
    })

    importance_df = importance_df.sort_values(
        by="importance",
        ascending=False
    )

    print("\n" + "=" * 60)
    print("TOP 20 FEATURES")
    print("=" * 60)

    print(
        importance_df.head(20).to_string(index=False)
    )


if __name__ == "__main__":
    main()
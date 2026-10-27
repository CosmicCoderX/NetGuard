import json
import joblib
import pandas as pd

from .config import (
    MODEL_PATH,
    PREPROCESSOR_PATH,
    LABEL_ENCODER_PATH,
    SCHEMA_PATH,
)


class NetGuardModel:
    def __init__(self):
        print("Loading NetGuard model...")

        self.model = joblib.load(MODEL_PATH)
        self.preprocessor = joblib.load(PREPROCESSOR_PATH)
        self.label_encoder = joblib.load(LABEL_ENCODER_PATH)

        with open(SCHEMA_PATH, "r", encoding="utf-8") as file:
            self.schema = json.load(file)

        self.features = self.schema["features"]

        self.feature_importances = sorted(
            zip(self.features, self.model.feature_importances_),
            key=lambda item: item[1],
            reverse=True,
        )

        print(f"Expected features: {len(self.features)}")
        print("NetGuard model loaded.")

    def predict(self, data: dict):

        # -----------------------------
        # 1. Validate feature names
        # -----------------------------

        received_features = set(data.keys())
        expected_features = set(self.features)

        missing_features = expected_features - received_features
        extra_features = received_features - expected_features

        if missing_features:
            raise ValueError(
                f"Missing features: {sorted(missing_features)}"
            )

        if extra_features:
            raise ValueError(
                f"Unknown features: {sorted(extra_features)}"
            )

        # -----------------------------
        # 2. Create DataFrame
        # -----------------------------

        df = pd.DataFrame(
            [data],
            columns=self.features
        )

        # -----------------------------
        # 3. Preprocess
        # -----------------------------

        processed = self.preprocessor.transform(df)

        # -----------------------------
        # 4. Prediction
        # -----------------------------

        prediction_encoded = self.model.predict(processed)[0]

        probabilities = self.model.predict_proba(processed)[0]

        prediction = self.label_encoder.inverse_transform(
            [int(prediction_encoded)]
        )[0]

        # -----------------------------
        # 5. Probability mapping
        # -----------------------------

        probability_map = {
            class_name: float(probability)
            for class_name, probability in zip(
                self.label_encoder.classes_,
                probabilities
            )
        }

        confidence = float(max(probabilities))

        # -----------------------------
        # 6. Risk level
        # -----------------------------

        if prediction == "Normal":
            risk_level = "Low"

        elif prediction in ["DoS / DDoS", "Port Scanning"]:
            risk_level = "High"

        else:
            risk_level = "Critical"

        # -----------------------------
        # 7. Return result
        # -----------------------------

        return {
            "prediction": prediction,
            "confidence": confidence,
            "risk_level": risk_level,
            "probabilities": probability_map,
            "feature_importances": [
                {
                    "feature": feature,
                    "importance": float(importance),
                }
                for feature, importance in self.feature_importances[:10]
            ],
        }


netguard_model = NetGuardModel()
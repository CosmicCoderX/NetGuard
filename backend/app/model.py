import json
import hashlib
import joblib
import pandas as pd
import numpy as np

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
        self.name = self.schema.get("model_name", "XGBoost")
        self.artifact_hashes = {
            path.name: hashlib.sha256(path.read_bytes()).hexdigest()
            for path in (MODEL_PATH, PREPROCESSOR_PATH, LABEL_ENCODER_PATH, SCHEMA_PATH)
        }
        report_path = MODEL_PATH.parent / "evaluation_report.json"
        if report_path.exists():
            report = json.loads(report_path.read_text(encoding="utf-8"))
            if report.get("artifact_sha256") == self.artifact_hashes:
                self.name = report.get("model_name", self.name)
        if list(self.preprocessor.feature_names_in_) != self.features:
            raise ValueError("Schema feature order differs from the fitted preprocessor.")
        if self.model.n_features_in_ != len(self.features):
            raise ValueError("Model feature count differs from the schema.")
        if list(self.label_encoder.classes_) != self.schema["classes"]:
            raise ValueError("Schema classes differ from the fitted label encoder.")

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
        if not np.isfinite(df.to_numpy(dtype=float)).all():
            raise ValueError("Feature values must be finite numbers.")

        # -----------------------------
        # 3. Preprocess
        # -----------------------------

        processed = self.preprocessor.transform(df)

        # -----------------------------
        # 4. Prediction
        # -----------------------------

        probabilities = self.model.predict_proba(processed)[0]
        if (not np.isfinite(probabilities).all() or np.any(probabilities < 0)
                or not np.isclose(probabilities.sum(), 1.0, atol=1e-5)):
            raise RuntimeError("Model returned invalid probabilities.")
        encoded_classes = np.asarray(self.model.classes_, dtype=int)
        prediction_encoded = encoded_classes[int(np.argmax(probabilities))]

        prediction = self.label_encoder.inverse_transform(
            [int(prediction_encoded)]
        )[0]

        # -----------------------------
        # 5. Probability mapping
        # -----------------------------

        probability_map = {
            class_name: float(probability)
            for class_name, probability in zip(
                self.label_encoder.inverse_transform(encoded_classes),
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

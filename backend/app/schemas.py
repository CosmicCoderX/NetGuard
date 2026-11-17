from typing import Dict, List
from pydantic import BaseModel, ConfigDict, Field, FiniteFloat, field_validator


class PredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    features: Dict[str, FiniteFloat] = Field(
        ...,
        description="Exactly 78 network flow features required by the NetGuard model.",
    )

    @field_validator("features", mode="before")
    @classmethod
    def reject_non_numeric_values(cls, value):
        if isinstance(value, dict) and any(
            isinstance(item, bool) or not isinstance(item, (int, float))
            for item in value.values()
        ):
            raise ValueError("Feature values must be finite JSON numbers.")
        return value


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    risk_level: str
    probabilities: Dict[str, float]
    feature_importances: List[FeatureImportance]

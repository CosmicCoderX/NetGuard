from typing import Dict, List
from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    features: Dict[str, float] = Field(
        ...,
        description="Exactly 78 network flow features required by the NetGuard model.",
    )


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class PredictionResponse(BaseModel):
    prediction: str
    confidence: float
    risk_level: str
    probabilities: Dict[str, float]
    feature_importances: List[FeatureImportance]
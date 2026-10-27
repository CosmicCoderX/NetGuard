import json

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .model import netguard_model
from .schemas import PredictionRequest, PredictionResponse
from .config import PROJECT_ROOT


app = FastAPI(
    title="NetGuard API",
    description="Network intrusion detection API powered by XGBoost",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


SAMPLE_DATA_PATH = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "processed"
    / "sample_flows.json"
)


@app.get("/")
def root():
    return {
        "name": "NetGuard",
        "status": "running",
        "model": "XGBoost",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/sample")
def get_sample(traffic_type: str):
    try:
        with open(SAMPLE_DATA_PATH, "r", encoding="utf-8") as file:
            sample_data = json.load(file)

        if traffic_type not in sample_data:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown traffic type: {traffic_type}",
            )

        samples = sample_data[traffic_type]

        if not samples:
            raise HTTPException(
                status_code=404,
                detail=f"No samples available for: {traffic_type}",
            )

        import random

        sample = random.choice(samples)

        return {
            "traffic_type": traffic_type,
            "features": sample,
        }

    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    try:
        result = netguard_model.predict(request.features)
        return result

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
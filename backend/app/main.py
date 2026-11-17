import json
import logging

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from .model import netguard_model
from .schemas import PredictionRequest, PredictionResponse
from .config import PROJECT_ROOT, MODEL_DIR


app = FastAPI(
    title="NetGuard API",
    description="Network intrusion detection API powered by validated machine learning models",
    version="1.0.0",
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request, error):
    # Pydantic error inputs can contain NaN/Infinity, which cannot be JSON encoded.
    return JSONResponse(status_code=422, content={"detail": [
        {"loc": item["loc"], "msg": item["msg"], "type": item["type"]}
        for item in error.errors()
    ]})

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
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
        "model": netguard_model.name,
    }


@app.get("/health")
def health():
    return {"status": "healthy", "model_loaded": True,
            "num_features": len(netguard_model.features)}


@app.get("/metadata")
def metadata():
    report_path = MODEL_DIR / "evaluation_report.json"
    report = json.loads(report_path.read_text(encoding="utf-8")) if report_path.exists() else None
    if report:
        if report.get("artifact_sha256") != netguard_model.artifact_hashes:
            report = None
    with open(SAMPLE_DATA_PATH, encoding="utf-8") as file:
        samples = json.load(file)
    return {"model": netguard_model.name, "features": netguard_model.features,
            "classes": netguard_model.schema["classes"],
            "sample_counts": {key: len(value) for key, value in samples.items()},
            "evaluation": report,
            "importance_scope": "Global model importance; not an explanation of an individual prediction."}


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
    except Exception:
        logging.exception("Unable to load traffic samples")
        raise HTTPException(
            status_code=500,
            detail="Unable to load traffic samples.",
        )

@app.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    try:
        result = netguard_model.predict(request.features)
        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
    except Exception:
        logging.exception("Prediction failed")
        raise HTTPException(status_code=500, detail="Prediction failed on the server.")

from pathlib import Path


# backend/
#   app/
#     config.py
#
# Project root is two levels above this file.

PROJECT_ROOT = (
    Path(__file__).resolve().parents[2]
)

MODEL_DIR = (
    PROJECT_ROOT
    / "ml"
    / "models"
)


MODEL_PATH = (
    MODEL_DIR
    / "netguard_final_xgboost.joblib"
)

PREPROCESSOR_PATH = (
    MODEL_DIR
    / "netguard_final_preprocessor.joblib"
)

LABEL_ENCODER_PATH = (
    MODEL_DIR
    / "netguard_final_label_encoder.joblib"
)

SCHEMA_PATH = (
    MODEL_DIR
    / "netguard_schema.json"
)
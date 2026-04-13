import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODEL_PATH = ARTIFACTS_DIR / "xgb_forecast_model.joblib"
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")

USE_MOCK_FORECAST = os.environ.get("USE_MOCK_FORECAST", "0").lower() in (
    "1",
    "true",
    "yes",
)

DEFAULT_FORECAST_HORIZON = 7
DEFAULT_LEAD_TIME_DAYS = 3
RISK_SIGMOID_SCALE = 50.0
SAFETY_STOCK_Z = 1.65

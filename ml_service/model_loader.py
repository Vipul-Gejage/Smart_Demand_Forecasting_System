from __future__ import annotations

import os
from typing import Any, Dict, List, Optional, Tuple

import joblib

from config import MODEL_PATH, USE_MOCK_FORECAST
from features import FEATURE_COLUMNS


def model_should_mock() -> bool:
    if USE_MOCK_FORECAST:
        return True
    if not MODEL_PATH.is_file():
        return True
    return False


def load_trained_artifact() -> Tuple[Optional[Any], List[str]]:
    """Load XGBoost model and feature name order from disk."""
    if model_should_mock():
        return None, list(FEATURE_COLUMNS)
    blob: Dict[str, Any] = joblib.load(MODEL_PATH)
    model = blob.get("model")
    names = blob.get("feature_names") or list(FEATURE_COLUMNS)
    return model, list(names)


def save_trained_artifact(model: Any, feature_names: List[str]) -> None:
    os.makedirs(MODEL_PATH.parent, exist_ok=True)
    joblib.dump({"model": model, "feature_names": feature_names}, MODEL_PATH)

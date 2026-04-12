from __future__ import annotations

from datetime import timedelta
from typing import Any, List, Optional, Tuple

import numpy as np
import pandas as pd

from ml_service.config import DEFAULT_FORECAST_HORIZON
from ml_service.features import build_feature_matrix_for_series, row_feature_vector
from ml_service.model_loader import load_trained_artifact


def _mock_step_prediction(units_series: pd.Series, step_index: int) -> float:
    vals = units_series.dropna().tail(7)
    base = float(vals.mean()) if len(vals) else 0.0
    jitter = 1.0 + 0.03 * np.sin(step_index / 2.0)
    return max(0.0, base * jitter)


def recursive_multistep_forecast(
    hist: pd.DataFrame,
    store_id: int,
    product_id: int,
    promos: pd.DataFrame,
    weather: pd.DataFrame,
    events: pd.DataFrame,
    horizon: int = DEFAULT_FORECAST_HORIZON,
) -> Tuple[List[Tuple[pd.Timestamp, float]], Optional[Any], List[str]]:
    """
    Predict next `horizon` days by appending each prediction and recomputing features.
    Returns list of (date, predicted_units), model (or None if mock), feature_names.
    """
    if hist.empty or "units_sold" not in hist.columns:
        raise ValueError("sales_history must include units_sold and at least one row")

    h = hist.sort_values("date").reset_index(drop=True)
    last_date = pd.Timestamp(h["date"].iloc[-1]).normalize()

    extended = h[["date", "units_sold"]].copy()
    extended["units_sold"] = pd.to_numeric(extended["units_sold"], errors="coerce").fillna(
        0.0
    )

    model, feature_names = load_trained_artifact()
    out: List[Tuple[pd.Timestamp, float]] = []

    for step in range(horizon):
        next_date = last_date + timedelta(days=step + 1)
        chunk = pd.concat(
            [
                extended,
                pd.DataFrame({"date": [next_date], "units_sold": [np.nan]}),
            ],
            ignore_index=True,
        )
        feat_full = build_feature_matrix_for_series(
            chunk,
            store_id,
            product_id,
            promos,
            weather,
            events,
        )
        row = row_feature_vector(feat_full, feature_names)
        if model is None:
            pred = _mock_step_prediction(extended["units_sold"], step)
        else:
            pred = float(model.predict(row)[0])
        pred = max(0.0, pred)
        out.append((next_date, pred))
        extended = pd.concat(
            [
                extended,
                pd.DataFrame({"date": [next_date], "units_sold": [pred]}),
            ],
            ignore_index=True,
        )

    return out, model, feature_names

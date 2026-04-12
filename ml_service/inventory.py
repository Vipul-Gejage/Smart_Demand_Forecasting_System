from __future__ import annotations

import math

from ml_service.config import DEFAULT_LEAD_TIME_DAYS, SAFETY_STOCK_Z


def safety_stock(sigma_demand: float, lead_time_days: int) -> float:
    """Safety Stock = Z * sigma * sqrt(L)."""
    L = max(int(lead_time_days), 1)
    sig = max(float(sigma_demand), 0.0)
    return SAFETY_STOCK_Z * sig * math.sqrt(L)


def recommended_inventory(
    sum_predicted_7d: float, sigma_demand: float, lead_time_days: int
) -> float:
    """Sum of 7-day forecast + safety stock."""
    ss = safety_stock(sigma_demand, lead_time_days)
    return float(sum_predicted_7d) + ss

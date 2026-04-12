from __future__ import annotations

import numpy as np

from config import RISK_SIGMOID_SCALE


def sigmoid(x: float) -> float:
    return float(1.0 / (1.0 + np.exp(-np.clip(x, -50.0, 50.0))))


def stockout_risk(total_predicted: float, current_inventory: float, scale: float) -> float:
    return sigmoid((total_predicted - current_inventory) / scale)


def overstock_risk(total_predicted: float, current_inventory: float, scale: float) -> float:
    return sigmoid((current_inventory - total_predicted) / scale)

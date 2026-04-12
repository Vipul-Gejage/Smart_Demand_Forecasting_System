"""
Offline training: load CSVs from data/, build features, train XGBoost, save joblib artifact.
Run from repository root:
  python scripts/train_model.py
"""
from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
from xgboost import XGBRegressor

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from ml_service.features import (  # noqa: E402
    FEATURE_COLUMNS,
    encode_impact,
    training_table_from_prejoined,
)
from ml_service.model_loader import save_trained_artifact  # noqa: E402


def load_and_merge(data_dir: Path) -> pd.DataFrame:
    sales = pd.read_csv(data_dir / "sales_history.csv")
    stores = pd.read_csv(data_dir / "stores.csv")
    promos = pd.read_csv(data_dir / "promotions.csv")
    weather = pd.read_csv(data_dir / "weather.csv")
    events = pd.read_csv(data_dir / "events_calendar.csv")

    sales["date"] = pd.to_datetime(sales["date"]).dt.normalize()
    stores["store_id"] = stores["store_id"].astype(int)
    sales["store_id"] = sales["store_id"].astype(int)
    sales["product_id"] = sales["product_id"].astype(int)

    promo_agg = (
        promos.groupby(["date", "store_id", "product_id"], as_index=False)
        .agg(discount_pct=("discount_pct", "max"))
    )
    promo_agg["date"] = pd.to_datetime(promo_agg["date"]).dt.normalize()
    promo_agg["promo_flag"] = 1

    sales = sales.merge(stores[["store_id", "city"]], on="store_id", how="left")
    sales = sales.merge(
        promo_agg, on=["date", "store_id", "product_id"], how="left"
    )
    sales["discount_pct"] = sales["discount_pct"].fillna(0.0)
    sales["promo_flag"] = sales["promo_flag"].fillna(0).astype(int)
    sales.loc[sales["discount_pct"] > 0, "promo_flag"] = 1

    weather = weather.copy()
    weather["date"] = pd.to_datetime(weather["date"]).dt.normalize()
    sales = sales.merge(
        weather[["date", "city", "avg_temp", "rainfall_mm"]],
        on=["date", "city"],
        how="left",
    )
    sales["avg_temp"] = sales["avg_temp"].fillna(0.0)
    sales["rainfall_mm"] = sales["rainfall_mm"].fillna(0.0)

    events = events.copy()
    events["date"] = pd.to_datetime(events["date"]).dt.normalize()
    events["impact_level_encoded"] = events["impact_level"].map(
        lambda x: encode_impact(str(x) if pd.notna(x) else None)
    )
    ev_agg = events.groupby(["date", "city"], as_index=False).agg(
        impact_level_encoded=("impact_level_encoded", "max"),
    )
    ev_agg["event_flag"] = 1
    sales = sales.merge(ev_agg, on=["date", "city"], how="left")
    sales["event_flag"] = sales["event_flag"].fillna(0).astype(int)
    sales["impact_level_encoded"] = (
        sales["impact_level_encoded"].fillna(0).astype(int).clip(lower=0)
    )

    return sales


def main() -> None:
    data_dir = ROOT / "data"
    merged = load_and_merge(data_dir)
    full = training_table_from_prejoined(merged)

    y = full["units_sold"].astype(float)
    X = full[list(FEATURE_COLUMNS)].copy()
    for c in FEATURE_COLUMNS:
        X[c] = pd.to_numeric(X[c], errors="coerce").fillna(0.0)

    model = XGBRegressor(
        n_estimators=300,
        max_depth=8,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X, y)
    save_trained_artifact(model, list(FEATURE_COLUMNS))
    print(f"Trained on {len(X)} rows; saved model to ml_service/artifacts/")


if __name__ == "__main__":
    main()

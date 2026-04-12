from __future__ import annotations

from typing import List, Sequence

import numpy as np
import pandas as pd

IMPACT_LEVEL_MAP = {"low": 1, "medium": 2, "high": 3}


def encode_impact(level: str | None) -> int:
    if not level:
        return 0
    return int(IMPACT_LEVEL_MAP.get(str(level).lower().strip(), 0))


FEATURE_COLUMNS: List[str] = [
    "lag_1",
    "lag_7",
    "rolling_mean_7",
    "rolling_std_7",
    "day_of_week",
    "is_weekend",
    "promo_flag",
    "discount_pct",
    "avg_temp",
    "rainfall_mm",
    "event_flag",
    "impact_level_encoded",
    "store_id",
    "product_id",
]


def add_time_series_features(series: pd.DataFrame) -> pd.DataFrame:
    """Add lag and rolling features to a single (store, product) series sorted by date."""
    df = series.copy()
    df = df.sort_values("date").reset_index(drop=True)
    y = df["units_sold"].astype(float)
    df["lag_1"] = y.shift(1)
    df["lag_7"] = y.shift(7)
    shifted = y.shift(1)
    df["rolling_mean_7"] = shifted.rolling(7, min_periods=1).mean()
    df["rolling_std_7"] = shifted.rolling(7, min_periods=1).std()
    df["rolling_std_7"] = df["rolling_std_7"].fillna(0.0)
    df["day_of_week"] = df["date"].dt.dayofweek
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    for c in ("lag_1", "lag_7", "rolling_mean_7"):
        df[c] = df[c].fillna(0.0)
    return df


def merge_external_features(
    df: pd.DataFrame,
    store_id: int,
    product_id: int,
    promos: pd.DataFrame,
    weather: pd.DataFrame,
    events: pd.DataFrame,
) -> pd.DataFrame:
    """Left-merge promos (store/product), weather and events on date."""
    out = df.copy()
    out["store_id"] = store_id
    out["product_id"] = product_id

    if not promos.empty and {"date", "store_id", "product_id"}.issubset(promos.columns):
        p = promos[
            (promos["store_id"] == store_id) & (promos["product_id"] == product_id)
        ][["date", "discount_pct"]].copy()
        if not p.empty:
            p = p.groupby("date", as_index=False)["discount_pct"].max()
        p["promo_flag"] = 1
        out = out.merge(p, on="date", how="left")
    else:
        out["discount_pct"] = 0.0
        out["promo_flag"] = 0

    out["discount_pct"] = out["discount_pct"].fillna(0.0)
    out["promo_flag"] = out["promo_flag"].fillna(0).astype(int)
    out.loc[out["discount_pct"] > 0, "promo_flag"] = 1

    if not weather.empty and {"date", "avg_temp", "rainfall_mm"}.issubset(
        weather.columns
    ):
        w = weather[["date", "avg_temp", "rainfall_mm"]].drop_duplicates(
            subset=["date"], keep="last"
        )
        out = out.merge(w, on="date", how="left")
    else:
        out["avg_temp"] = 0.0
        out["rainfall_mm"] = 0.0

    out["avg_temp"] = out["avg_temp"].fillna(0.0)
    out["rainfall_mm"] = out["rainfall_mm"].fillna(0.0)

    if not events.empty and "date" in events.columns:
        ev = events.copy()
        ev["impact_level_encoded"] = ev["impact_level"].map(
            lambda x: encode_impact(x if isinstance(x, str) else None)
        )
        agg = ev.groupby("date", as_index=False).agg(
            impact_level_encoded=("impact_level_encoded", "max"),
        )
        agg["event_flag"] = 1
        out = out.merge(agg, on="date", how="left")
    else:
        out["event_flag"] = 0
        out["impact_level_encoded"] = 0

    out["event_flag"] = out["event_flag"].fillna(0).astype(int)
    out["impact_level_encoded"] = (
        out["impact_level_encoded"].fillna(0).astype(int).clip(lower=0)
    )
    return out


def build_feature_matrix_for_series(
    base: pd.DataFrame,
    store_id: int,
    product_id: int,
    promos: pd.DataFrame,
    weather: pd.DataFrame,
    events: pd.DataFrame,
) -> pd.DataFrame:
    ts = add_time_series_features(base)
    return merge_external_features(ts, store_id, product_id, promos, weather, events)


def row_feature_vector(
    feat_df: pd.DataFrame, feature_names: Sequence[str]
) -> pd.DataFrame:
    """Last row as a single-row frame aligned to model feature_names."""
    if feat_df.empty:
        raise ValueError("Feature frame is empty")
    last = feat_df.iloc[[-1]]
    missing = [c for c in feature_names if c not in last.columns]
    for c in missing:
        last[c] = 0.0
    return last[list(feature_names)]


def compose_features_from_prejoined_group(g: pd.DataFrame) -> pd.DataFrame:
    """Build feature rows when externals are already aligned on each date (training CSV path)."""
    g = g.sort_values("date").reset_index(drop=True)
    ts = add_time_series_features(g[["date", "units_sold"]].copy())
    for col in (
        "discount_pct",
        "promo_flag",
        "avg_temp",
        "rainfall_mm",
        "event_flag",
        "impact_level_encoded",
    ):
        if col in g.columns:
            ts[col] = g[col].values
        else:
            ts[col] = 0.0 if col != "promo_flag" else 0
    ts["store_id"] = int(g["store_id"].iloc[0])
    ts["product_id"] = int(g["product_id"].iloc[0])
    ts["promo_flag"] = ts["promo_flag"].fillna(0).astype(int)
    ts["discount_pct"] = ts["discount_pct"].fillna(0.0)
    ts["avg_temp"] = ts["avg_temp"].fillna(0.0)
    ts["rainfall_mm"] = ts["rainfall_mm"].fillna(0.0)
    ts["event_flag"] = ts["event_flag"].fillna(0).astype(int)
    ts["impact_level_encoded"] = ts["impact_level_encoded"].fillna(0).astype(int)
    return ts


def training_table_from_prejoined(merged: pd.DataFrame) -> pd.DataFrame:
    """Full training matrix from a sales table merged with promos, weather, and events."""
    parts: List[pd.DataFrame] = []
    for _, g in merged.groupby(["store_id", "product_id"], sort=False):
        parts.append(compose_features_from_prejoined_group(g))
    return pd.concat(parts, ignore_index=True)

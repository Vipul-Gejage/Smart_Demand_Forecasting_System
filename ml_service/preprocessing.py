from __future__ import annotations

from datetime import timedelta
from typing import Any, Dict, List, Optional, Tuple, Union

import pandas as pd

from schemas import ForecastRequest


def _parse_date(s: str) -> pd.Timestamp:
    return pd.to_datetime(s).normalize()


def weather_to_daily_df(
    weather: Union[List[Dict[str, Any]], Dict[str, Any], None],
) -> pd.DataFrame:
    """Normalize weather payload to columns date, avg_temp, rainfall_mm."""
    if weather is None:
        return pd.DataFrame(columns=["date", "avg_temp", "rainfall_mm"])
    rows: List[Dict[str, Any]] = []
    if isinstance(weather, dict):
        if all(k in weather for k in ("avg_temp", "rainfall_mm")) and "date" not in weather:
            return pd.DataFrame(columns=["date", "avg_temp", "rainfall_mm"])
        for k, v in weather.items():
            if isinstance(v, dict):
                rows.append(
                    {
                        "date": _parse_date(k if not str(k).isdigit() else v.get("date", k)),
                        "avg_temp": float(v.get("avg_temp", 0) or 0),
                        "rainfall_mm": float(v.get("rainfall_mm", 0) or 0),
                    }
                )
            else:
                continue
        if rows:
            return pd.DataFrame(rows)
        for item in weather.get("days", []) or weather.get("forecast", []):
            if isinstance(item, dict):
                rows.append(
                    {
                        "date": _parse_date(str(item["date"])),
                        "avg_temp": float(item.get("avg_temp", 0) or 0),
                        "rainfall_mm": float(item.get("rainfall_mm", 0) or 0),
                    }
                )
    else:
        for item in weather:
            if not isinstance(item, dict):
                continue
            rows.append(
                {
                    "date": _parse_date(str(item["date"])),
                    "avg_temp": float(item.get("avg_temp", 0) or 0),
                    "rainfall_mm": float(item.get("rainfall_mm", 0) or 0),
                }
            )
    if not rows:
        return pd.DataFrame(columns=["date", "avg_temp", "rainfall_mm"])
    out = pd.DataFrame(rows)
    out["date"] = pd.to_datetime(out["date"]).dt.normalize()
    return out.drop_duplicates(subset=["date"], keep="last")


def request_to_dataframes(
    body: ForecastRequest,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, Optional[str]]:
    """Convert API JSON into pandas frames keyed by date (and store/product for promos)."""
    hist = pd.DataFrame([r.model_dump() for r in body.sales_history])
    if hist.empty:
        hist = pd.DataFrame(
            columns=[
                "date",
                "units_sold",
                "inventory_on_hand",
                "sell_price",
                "stockout_flag",
            ]
        )
    else:
        hist["date"] = pd.to_datetime(hist["date"]).dt.normalize()
        for c in ("units_sold", "inventory_on_hand", "sell_price"):
            if c in hist.columns:
                hist[c] = pd.to_numeric(hist[c], errors="coerce")
        hist = hist.sort_values("date").reset_index(drop=True)

    promos = pd.DataFrame([r.model_dump() for r in body.promotions])
    if promos.empty:
        promos = pd.DataFrame(
            columns=[
                "date",
                "promo_type",
                "discount_pct",
                "display_flag",
                "campaign_name",
            ]
        )
    else:
        promos["date"] = pd.to_datetime(promos["date"]).dt.normalize()
        promos["discount_pct"] = pd.to_numeric(
            promos.get("discount_pct", 0), errors="coerce"
        ).fillna(0.0)
        promos["store_id"] = body.store_id
        promos["product_id"] = body.product_id

    if body.weather is None:
        weather_df = pd.DataFrame(columns=["date", "avg_temp", "rainfall_mm"])
    elif isinstance(body.weather, list):
        wrows = [w.model_dump() for w in body.weather]
        weather_df = pd.DataFrame(wrows) if wrows else pd.DataFrame()
        if not weather_df.empty:
            weather_df["date"] = pd.to_datetime(weather_df["date"]).dt.normalize()
            for c in ("avg_temp", "rainfall_mm"):
                if c not in weather_df.columns:
                    weather_df[c] = 0.0
                weather_df[c] = pd.to_numeric(weather_df[c], errors="coerce").fillna(0.0)
        else:
            weather_df = pd.DataFrame(columns=["date", "avg_temp", "rainfall_mm"])
    else:
        weather_df = weather_to_daily_df(body.weather)

    events = pd.DataFrame([r.model_dump() for r in body.events])
    if events.empty:
        events = pd.DataFrame(
            columns=["date", "event_name", "event_type", "impact_level"]
        )
    else:
        events["date"] = pd.to_datetime(events["date"]).dt.normalize()

    city = body.city
    return hist, promos, weather_df, events, city


def get_last_inventory(hist: pd.DataFrame) -> float:
    if hist.empty or "inventory_on_hand" not in hist.columns:
        return 0.0
    last = hist["inventory_on_hand"].dropna()
    if last.empty:
        return 0.0
    return float(last.iloc[-1])


def historical_demand_std(hist: pd.DataFrame) -> float:
    if hist.empty or "units_sold" not in hist.columns:
        return 0.0
    s = hist["units_sold"].dropna()
    if len(s) < 2:
        return 0.0
    v = float(s.std())
    return v if v == v else 0.0


def ensure_sorted_unique_days(df: pd.DataFrame) -> pd.DataFrame:
    return df.sort_values("date").drop_duplicates(subset=["date"], keep="last")


def next_n_calendar_days(last_day: pd.Timestamp, n: int) -> List[pd.Timestamp]:
    out: List[pd.Timestamp] = []
    d = pd.Timestamp(last_day).normalize()
    for _ in range(n):
        d = d + timedelta(days=1)
        out.append(d)
    return out

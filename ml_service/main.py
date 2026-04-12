from __future__ import annotations

from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse

from ml_service.config import (
    DEFAULT_FORECAST_HORIZON,
    DEFAULT_LEAD_TIME_DAYS,
    RISK_SIGMOID_SCALE,
)
from ml_service.forecasting import recursive_multistep_forecast
from ml_service.inventory import recommended_inventory
from ml_service.preprocessing import (
    get_last_inventory,
    historical_demand_std,
    request_to_dataframes,
)
from ml_service.risk import overstock_risk as calc_overstock_risk
from ml_service.risk import stockout_risk as calc_stockout_risk
from ml_service.schemas import ForecastDay, ForecastRequest, ForecastResponse

app = FastAPI(title="Demand Forecasting ML Service", version="1.0.0")

OUTPUT_DIR = Path(__file__).resolve().parents[1] / "outputs"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/forecast", response_model=ForecastResponse)
def forecast(
    body: ForecastRequest,
    save_json: bool = Query(
        True,
        description="If true (default), writes JSON under outputs/ and sets X-Saved-Path. Use false to skip disk.",
    ),
):
    hist, promos, weather_df, events_df, _city = request_to_dataframes(body)
    if hist.empty:
        raise HTTPException(status_code=400, detail="sales_history cannot be empty")

    lead_time = int(body.lead_time_days or DEFAULT_LEAD_TIME_DAYS)

    try:
        preds, _model, _fn = recursive_multistep_forecast(
            hist,
            body.store_id,
            body.product_id,
            promos,
            weather_df,
            events_df,
            horizon=DEFAULT_FORECAST_HORIZON,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    forecast_days = [
        ForecastDay(date=d.strftime("%Y-%m-%d"), predicted_units=round(float(u), 4))
        for d, u in preds
    ]
    total_7d = sum(u for _, u in preds)
    sigma = historical_demand_std(hist)
    rec_inv = recommended_inventory(total_7d, sigma, lead_time)
    inv_on_hand = get_last_inventory(hist)
    so = calc_stockout_risk(total_7d, inv_on_hand, RISK_SIGMOID_SCALE)
    oo = calc_overstock_risk(total_7d, inv_on_hand, RISK_SIGMOID_SCALE)

    response = ForecastResponse(
        forecast=forecast_days,
        recommended_inventory=round(rec_inv, 4),
        stockout_risk=round(min(1.0, max(0.0, so)), 6),
        overstock_risk=round(min(1.0, max(0.0, oo)), 6),
    )

    if save_json:
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        ts = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        stamped = OUTPUT_DIR / f"forecast_{body.store_id}_{body.product_id}_{ts}.json"
        latest = OUTPUT_DIR / "latest_forecast.json"
        payload = response.model_dump_json(indent=2)
        stamped.write_text(payload, encoding="utf-8")
        latest.write_text(payload, encoding="utf-8")
        return JSONResponse(
            content=response.model_dump(),
            headers={
                "X-Saved-Path": str(stamped.resolve()),
                "X-Latest-Path": str(latest.resolve()),
            },
        )

    return response

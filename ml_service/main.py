from __future__ import annotations

from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover
    load_dotenv = None

_ENV_PATH = Path(__file__).resolve().parent / ".env"
if load_dotenv is not None and _ENV_PATH.is_file():
    load_dotenv(dotenv_path=_ENV_PATH, override=False)

from datetime import datetime

from fastapi import APIRouter, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse

from config import (
    DEFAULT_FORECAST_HORIZON,
    DEFAULT_LEAD_TIME_DAYS,
    RISK_SIGMOID_SCALE,
)
from explainability import build_explanation_payload
from forecasting import recursive_multistep_forecast
from inventory import recommended_inventory
from preprocessing import (
    get_last_inventory,
    historical_demand_std,
    request_to_dataframes,
)
from risk import overstock_risk as calc_overstock_risk
from risk import stockout_risk as calc_stockout_risk
from schemas import (
    ForecastDay,
    ForecastRequest,
    ForecastResponse,
    ForecastResponseWithExplanation,
)

app = FastAPI(title="Demand Forecasting ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = Path(__file__).resolve().parents[1] / "outputs"

api = APIRouter()


@api.get("/forecast", response_class=PlainTextResponse)
def forecast_status():
    """Mirrors Express `server/routes/forecastRoutes.js` GET /api/forecast."""
    return "Forecast API working"


def _run_forecast(
    body: ForecastRequest,
    save_json: bool,
    include_explanation: bool = False,
) -> JSONResponse | ForecastResponse | ForecastResponseWithExplanation:
    hist, promos, weather_df, events_df, _city = request_to_dataframes(body)
    if hist.empty:
        raise HTTPException(status_code=400, detail="sales_history cannot be empty")

    lead_time = int(body.lead_time_days or DEFAULT_LEAD_TIME_DAYS)

    try:
        preds, model, feature_names, explain_row = recursive_multistep_forecast(
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
    base_response = ForecastResponse(
        forecast=forecast_days,
        recommended_inventory=round(rec_inv, 4),
        stockout_risk=round(min(1.0, max(0.0, so)), 6),
        overstock_risk=round(min(1.0, max(0.0, oo)), 6),
    )
    response: ForecastResponse | ForecastResponseWithExplanation
    if include_explanation:
        explanation = build_explanation_payload(
            model=model,
            feature_row=explain_row,
            feature_names=feature_names,
            total_predicted_demand=total_7d,
            current_inventory=inv_on_hand,
            recommended_inventory=rec_inv,
            stockout_risk=so,
            overstock_risk=oo,
        )
        response = ForecastResponseWithExplanation(
            **base_response.model_dump(),
            explanation=explanation,
        )
    else:
        response = base_response

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


@api.post("/forecast", response_model=ForecastResponse)
def forecast_post(
    body: ForecastRequest,
    save_json: bool = Query(
        True,
        description="If true (default), writes JSON under outputs/ and sets X-Saved-Path. Use false to skip disk.",
    ),
):
    """
    Primary forecast endpoint — attach the Node server here (e.g. proxy POST /api/forecast
    to this URL on the ML process).
    """
    return _run_forecast(body, save_json, include_explanation=False)


@api.post("/forecast/explain", response_model=ForecastResponseWithExplanation)
def forecast_post_with_explainability(
    body: ForecastRequest,
    save_json: bool = Query(
        True,
        description="If true (default), writes JSON under outputs/ and sets X-Saved-Path. Use false to skip disk.",
    ),
):
    """Forecast endpoint with explainability payload for SHAP + Gemini output."""
    return _run_forecast(body, save_json, include_explanation=True)


app.include_router(api, prefix="/api")


@app.get("/")
def root():
    return {
        "service": app.title,
        "version": app.version,
        "express_alignment": {
            "note": "Express serves GET /api/forecast as a stub; run this ML app separately and point clients or a future proxy to it.",
            "ml_get_status": "GET /api/forecast",
            "ml_run_forecast": "POST /api/forecast",
        },
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/forecast", response_model=ForecastResponse)
def forecast_legacy(
    body: ForecastRequest,
    save_json: bool = Query(
        True,
        description="If true (default), writes JSON under outputs/ and sets X-Saved-Path. Use false to skip disk.",
    ),
):
    """Same as POST /api/forecast (kept for older clients)."""
    return _run_forecast(body, save_json, include_explanation=False)


@app.post("/forecast/explain", response_model=ForecastResponseWithExplanation)
def forecast_legacy_with_explainability(
    body: ForecastRequest,
    save_json: bool = Query(
        True,
        description="If true (default), writes JSON under outputs/ and sets X-Saved-Path. Use false to skip disk.",
    ),
):
    """Legacy path with explainability payload."""
    return _run_forecast(body, save_json, include_explanation=True)

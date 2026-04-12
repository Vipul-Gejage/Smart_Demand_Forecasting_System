from datetime import date
from typing import Any, Dict, List, Optional, Union

from pydantic import BaseModel, Field


class SalesHistoryRow(BaseModel):
    date: str
    units_sold: Optional[float] = None
    inventory_on_hand: Optional[float] = None
    sell_price: Optional[float] = None
    stockout_flag: Optional[bool] = None


class PromotionRow(BaseModel):
    date: str
    promo_type: Optional[str] = None
    discount_pct: Optional[float] = 0.0
    display_flag: Optional[bool] = None
    campaign_name: Optional[str] = None


class WeatherDay(BaseModel):
    date: str
    avg_temp: Optional[float] = 0.0
    rainfall_mm: Optional[float] = 0.0


class EventRow(BaseModel):
    date: str
    event_name: Optional[str] = None
    event_type: Optional[str] = None
    impact_level: Optional[str] = "low"


class ForecastRequest(BaseModel):
    store_id: int
    product_id: int
    sales_history: List[SalesHistoryRow]
    promotions: List[PromotionRow] = Field(default_factory=list)
    weather: Union[List[WeatherDay], Dict[str, Any], None] = None
    events: List[EventRow] = Field(default_factory=list)
    lead_time_days: Optional[int] = None
    city: Optional[str] = None


class ForecastDay(BaseModel):
    date: str
    predicted_units: float


class ForecastResponse(BaseModel):
    forecast: List[ForecastDay]
    recommended_inventory: float
    stockout_risk: float
    overstock_risk: float

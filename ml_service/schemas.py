from typing import Any, Dict, List, Literal, Optional, Union

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class APIModel(BaseModel):
    """Accept snake_case (Python/CSV) and camelCase (Express/Mongo-style JSON)."""

    model_config = ConfigDict(populate_by_name=True)


class SalesHistoryRow(APIModel):
    date: str
    units_sold: Optional[float] = Field(
        default=None,
        validation_alias=AliasChoices("units_sold", "unitsSold"),
    )
    inventory_on_hand: Optional[float] = Field(
        default=None,
        validation_alias=AliasChoices("inventory_on_hand", "inventoryOnHand"),
    )
    sell_price: Optional[float] = Field(
        default=None,
        validation_alias=AliasChoices("sell_price", "sellPrice"),
    )
    stockout_flag: Optional[bool] = Field(
        default=None,
        validation_alias=AliasChoices("stockout_flag", "stockoutFlag"),
    )


class PromotionRow(APIModel):
    date: str
    promo_type: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("promo_type", "promoType"),
    )
    discount_pct: Optional[float] = Field(
        default=0.0,
        validation_alias=AliasChoices("discount_pct", "discountPct"),
    )
    display_flag: Optional[bool] = Field(
        default=None,
        validation_alias=AliasChoices("display_flag", "displayFlag"),
    )
    campaign_name: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("campaign_name", "campaignName"),
    )


class WeatherDay(APIModel):
    date: str
    avg_temp: Optional[float] = Field(
        default=0.0,
        validation_alias=AliasChoices("avg_temp", "avgTemp"),
    )
    rainfall_mm: Optional[float] = Field(
        default=0.0,
        validation_alias=AliasChoices("rainfall_mm", "rainfallMm"),
    )


class EventRow(APIModel):
    date: str
    event_name: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("event_name", "eventName"),
    )
    event_type: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("event_type", "eventType"),
    )
    impact_level: Optional[str] = Field(
        default="low",
        validation_alias=AliasChoices("impact_level", "impactLevel"),
    )


class ForecastRequest(APIModel):
    store_id: int = Field(
        ...,
        validation_alias=AliasChoices("store_id", "storeId"),
    )
    product_id: int = Field(
        ...,
        validation_alias=AliasChoices("product_id", "productId"),
    )
    sales_history: List[SalesHistoryRow] = Field(
        ...,
        validation_alias=AliasChoices("sales_history", "salesHistory"),
    )
    promotions: List[PromotionRow] = Field(default_factory=list)
    weather: Union[List[WeatherDay], Dict[str, Any], None] = None
    events: List[EventRow] = Field(default_factory=list)
    lead_time_days: Optional[int] = Field(
        default=None,
        validation_alias=AliasChoices("lead_time_days", "leadTimeDays"),
    )
    city: Optional[str] = None


class ForecastDay(APIModel):
    date: str
    predicted_units: float


class FeatureContribution(APIModel):
    feature_name: str
    impact: float
    direction: Literal["increases", "decreases"]


class ModelExplanation(APIModel):
    structured_contributions: List[FeatureContribution]
    natural_language_summary: str


class ExplanationPayload(APIModel):
    model_explanation: ModelExplanation
    business_explanation: str


class ForecastResponse(APIModel):
    forecast: List[ForecastDay]
    recommended_inventory: float
    stockout_risk: float
    overstock_risk: float


class ForecastResponseWithExplanation(ForecastResponse):
    explanation: ExplanationPayload

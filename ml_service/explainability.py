from __future__ import annotations

import os
from typing import Any, Dict, List, Sequence

import pandas as pd

from config import GEMINI_MODEL
from schemas import ExplanationPayload, FeatureContribution, ModelExplanation

try:
    import shap
except ImportError:  # pragma: no cover - handled at runtime
    shap = None

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover - handled at runtime
    genai = None


FEATURE_DISPLAY_NAMES: Dict[str, str] = {
    "lag_1": "Previous day demand",
    "lag_7": "Demand from same day last week",
    "rolling_mean_7": "Recent 7-day demand trend",
    "rolling_std_7": "Recent demand volatility",
    "day_of_week": "Day of week",
    "is_weekend": "Weekend effect",
    "promo_flag": "Promotion activity",
    "discount_pct": "Discount level",
    "avg_temp": "Average temperature",
    "rainfall_mm": "Rainfall",
    "event_flag": "Local event activity",
    "impact_level_encoded": "Event impact strength",
    "store_id": "Store profile",
    "product_id": "Product profile",
}


def _fallback_text(message: str) -> str:
    return message.strip()


def compute_shap_contributions(
    model: Any,
    feature_row: pd.DataFrame | None,
    feature_names: Sequence[str],
    top_k: int = 5,
) -> List[FeatureContribution]:
    if model is None or feature_row is None or feature_row.empty or shap is None:
        return []

    aligned = feature_row[list(feature_names)].copy()
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(aligned)

    if hasattr(shap_values, "tolist"):
        values = shap_values[0] if getattr(shap_values, "ndim", 1) > 1 else shap_values
    else:
        values = shap_values

    ranked = sorted(
        zip(feature_names, values),
        key=lambda item: abs(float(item[1])),
        reverse=True,
    )[:top_k]

    contributions: List[FeatureContribution] = []
    for name, value in ranked:
        num = float(value)
        contributions.append(
            FeatureContribution(
                feature_name=FEATURE_DISPLAY_NAMES.get(name, name),
                impact=round(num, 6),
                direction="increases" if num >= 0 else "decreases",
            )
        )
    return contributions


def _gemini_client() -> Any | None:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or genai is None:
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(GEMINI_MODEL)


def _fallback_model_candidates() -> List[str]:
    return [
        GEMINI_MODEL,
        os.environ.get("GEMINI_MODEL") or "",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
    ]


def _list_generate_models() -> List[str]:
    if genai is None:
        return []
    out: List[str] = []
    try:
        for m in genai.list_models():
            methods = getattr(m, "supported_generation_methods", None) or []
            if "generateContent" in methods:
                name = getattr(m, "name", None)
                if name:
                    out.append(str(name).replace("models/", ""))
    except Exception:
        return []
    return out


def _call_gemini_with_model(model_name: str, prompt: str) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or genai is None:
        return _fallback_text("Gemini summary unavailable because GEMINI_API_KEY is not configured.")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(model_name)
    response = model.generate_content(prompt)
    text = getattr(response, "text", "") or ""
    return text.strip()


def _call_gemini(prompt: str) -> str:
    if _gemini_client() is None:
        return _fallback_text("Gemini summary unavailable because GEMINI_API_KEY is not configured.")

    tried: List[str] = []
    last_error: Exception | None = None

    for name in _fallback_model_candidates():
        if not name or name in tried:
            continue
        tried.append(name)
        try:
            text = _call_gemini_with_model(name, prompt)
            if text:
                return text
        except Exception as exc:  # pragma: no cover
            last_error = exc

    for name in _list_generate_models()[:5]:
        if not name or name in tried:
            continue
        tried.append(name)
        try:
            text = _call_gemini_with_model(name, prompt)
            if text:
                return text
        except Exception as exc:  # pragma: no cover
            last_error = exc

    if last_error is not None:
        return _fallback_text(f"Gemini summary unavailable: {last_error}")
    return _fallback_text("Gemini returned an empty explanation.")


def build_model_prompt(
    structured_contributions: Sequence[FeatureContribution],
    total_predicted_demand: float,
) -> str:
    contribution_lines = "\n".join(
        f"- {item.feature_name}: impact={item.impact}, direction={item.direction}"
        for item in structured_contributions
    )
    return (
        "You are explaining a demand forecast to a retail business user.\n"
        "In 2-3 lines, explain why demand is increasing or decreasing.\n"
        "Highlight the main drivers from promotions, weather, events, and recent demand trends when relevant.\n"
        "Use simple business language and avoid technical ML jargon.\n"
        f"Predicted 7-day demand: {round(total_predicted_demand, 4)}\n"
        "Top model drivers:\n"
        f"{contribution_lines}"
    )


def build_business_prompt(
    total_predicted_demand: float,
    current_inventory: float,
    recommended_inventory: float,
    stockout_risk: float,
    overstock_risk: float,
) -> str:
    return (
        "You are advising a retail planner in simple business language.\n"
        "In 2-3 lines, explain the inventory recommendation and whether there is stockout or overstock risk.\n"
        "Keep the explanation concise and practical.\n"
        f"Predicted 7-day demand: {round(total_predicted_demand, 4)}\n"
        f"Current inventory: {round(current_inventory, 4)}\n"
        f"Recommended inventory: {round(recommended_inventory, 4)}\n"
        f"Stockout risk: {round(stockout_risk, 6)}\n"
        f"Overstock risk: {round(overstock_risk, 6)}"
    )


def build_explanation_payload(
    model: Any,
    feature_row: pd.DataFrame | None,
    feature_names: Sequence[str],
    total_predicted_demand: float,
    current_inventory: float,
    recommended_inventory: float,
    stockout_risk: float,
    overstock_risk: float,
) -> ExplanationPayload:
    structured = compute_shap_contributions(model, feature_row, feature_names)

    if structured:
        model_summary = _call_gemini(build_model_prompt(structured, total_predicted_demand))
    else:
        model_summary = _fallback_text(
            "Structured SHAP explanations are unavailable because the trained XGBoost artifact is not active."
        )

    business_summary = _call_gemini(
        build_business_prompt(
            total_predicted_demand=total_predicted_demand,
            current_inventory=current_inventory,
            recommended_inventory=recommended_inventory,
            stockout_risk=stockout_risk,
            overstock_risk=overstock_risk,
        )
    )

    return ExplanationPayload(
        model_explanation=ModelExplanation(
            structured_contributions=structured,
            natural_language_summary=model_summary,
        ),
        business_explanation=business_summary,
    )

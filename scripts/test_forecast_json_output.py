"""
Smoke-test the ML service: POST /api/forecast via FastAPI TestClient (no Node, no uvicorn).

Run from project root:
  python scripts/test_forecast_json_output.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
# ml_service modules use flat imports (config, forecasting, …); load from that folder.
sys.path.insert(0, str(ROOT / "ml_service"))

from fastapi.testclient import TestClient  # noqa: E402

from main import app  # noqa: E402

OUTPUT_DIR = ROOT / "outputs"

SAMPLE_BODY = {
    "storeId": 1,
    "productId": 99,
    "salesHistory": [
        {
            "date": f"2025-01-{i:02d}",
            "unitsSold": 40.0 + (i % 5),
            "inventoryOnHand": 50.0 - i,
            "sellPrice": 19.99,
            "stockoutFlag": False,
        }
        for i in range(1, 15)
    ],
    "promotions": [],
    "events": [],
}


def main() -> None:
    client = TestClient(app)
    r = client.post("/api/forecast", json=SAMPLE_BODY)
    assert r.status_code == 200, f"expected 200, got {r.status_code}: {r.text}"

    data = r.json()
    assert "forecast" in data and len(data["forecast"]) >= 1
    assert "recommended_inventory" in data
    assert "explanation" not in data, "default /api/forecast must keep legacy response shape"

    rex = client.post("/api/forecast/explain", json=SAMPLE_BODY)
    assert rex.status_code == 200, f"expected 200, got {rex.status_code}: {rex.text}"
    explain_data = rex.json()
    assert "explanation" in explain_data
    assert "model_explanation" in explain_data["explanation"]
    assert "business_explanation" in explain_data["explanation"]

    saved = r.headers.get("x-saved-path") or r.headers.get("X-Saved-Path")
    assert saved, "expected X-Saved-Path header when save_json defaults to true"

    stamped = Path(saved)
    latest = OUTPUT_DIR / "latest_forecast.json"
    assert stamped.is_file(), f"missing stamped file: {stamped}"
    assert latest.is_file(), f"missing {latest}"

    with latest.open(encoding="utf-8") as f:
        disk = json.load(f)
    assert disk["forecast"] == data["forecast"]

    print("OK: forecast JSON written under outputs/")
    print(f"  stamped: {stamped}")
    print(f"  latest:  {latest.resolve()}")


if __name__ == "__main__":
    main()

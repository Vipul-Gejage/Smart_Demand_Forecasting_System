"""
Smoke-test the ML service: POST /api/forecast via FastAPI TestClient and verify
JSON files appear under outputs/. Does not use the Node server.

Run from project root:
  python scripts/test_forecast_json_output.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient  # noqa: E402

from ml_service.main import app  # noqa: E402

OUTPUT_DIR = ROOT / "outputs"

# Minimal multi-day history so feature code and mock/real model paths run cleanly.
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

    saved = r.headers.get("x-saved-path") or r.headers.get("X-Saved-Path")
    latest_hdr = r.headers.get("x-latest-path") or r.headers.get("X-Latest-Path")
    assert saved, "expected X-Saved-Path header when save_json defaults to true"
    assert latest_hdr, "expected X-Latest-Path header"

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

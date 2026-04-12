import { useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Forecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    storeId: 1,
    productId: 99,
    salesHistory: [],
    promotions: [],
    weather: [],
    events: [],
    leadTimeDays: 7,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "storeId" || name === "productId" || name === "leadTimeDays"
          ? Number(value)
          : value,
    }));
  };

  const runForecast = async () => {
    setLoading(true);
    setError("");

    try {
      // Get sample sales history from data
      const sampleHistory = [];
      for (let i = 1; i <= 14; i++) {
        sampleHistory.push({
          date: `2025-01-${i.toString().padStart(2, "0")}`,
          unitsSold: 40 + Math.floor(Math.random() * 20),
          inventoryOnHand: 50 - i,
          sellPrice: 19.99,
          stockoutFlag: false,
        });
      }

      const requestData = {
        ...form,
        salesHistory: sampleHistory,
      };

      const res = await API.post("/forecast", requestData);
      setForecast(res.data);
    } catch (err) {
      console.error("Forecast Error:", err);
      setError(err.response?.data?.error || "Error running forecast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <h1 className="text-xl font-bold mb-4">Demand Forecast</h1>

        {/* Form */}
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="font-semibold mb-4">Run Forecast</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Store ID</label>
              <input
                name="storeId"
                type="number"
                value={form.storeId}
                onChange={handleChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Product ID
              </label>
              <input
                name="productId"
                type="number"
                value={form.productId}
                onChange={handleChange}
                className="border p-2 w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Lead Time (Days)
              </label>
              <input
                name="leadTimeDays"
                type="number"
                value={form.leadTimeDays}
                onChange={handleChange}
                className="border p-2 w-full"
              />
            </div>
          </div>

          <button
            onClick={runForecast}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded disabled:bg-gray-400"
          >
            {loading ? "Running Forecast..." : "Run Forecast"}
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Results */}
        {forecast && (
          <div className="space-y-4">
            {/* Forecast Days */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-semibold mb-2">7-Day Forecast</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {forecast.forecast.map((day, i) => (
                  <div key={i} className="border p-3 rounded">
                    <div className="font-medium">{day.date}</div>
                    <div className="text-lg">{day.predicted_units} units</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold">Recommended Stock</h2>
                <p className="text-2xl font-bold mt-2">
                  {forecast.recommended_inventory} units
                </p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold">Stockout Risk</h2>
                <p
                  className={`text-2xl font-bold mt-2 ${forecast.stockout_risk > 0.5 ? "text-red-500" : "text-green-500"}`}
                >
                  {(forecast.stockout_risk * 100).toFixed(1)}%
                </p>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold">Overstock Risk</h2>
                <p
                  className={`text-2xl font-bold mt-2 ${forecast.overstock_risk > 0.5 ? "text-red-500" : "text-green-500"}`}
                >
                  {(forecast.overstock_risk * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

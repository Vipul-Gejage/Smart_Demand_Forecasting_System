import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

const severityClasses = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-blue-100 text-blue-700",
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/alerts");
      setAlerts(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load alerts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.patch(`/alerts/${id}/status`, { status });
      setAlerts((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status } : item))
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update alert status.");
    }
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <h1 className="text-xl font-bold mb-4">Alerts</h1>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="bg-white p-4 rounded shadow space-y-3">
          {loading && <p className="text-gray-500">Loading alerts...</p>}

          {!loading && alerts.length === 0 && (
            <p className="text-gray-500">No alerts yet. Run a forecast to generate alerts.</p>
          )}

          {!loading &&
            alerts.map((a) => (
              <div key={a._id} className="border rounded p-3">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="font-semibold capitalize">{a.type.replace("_", " ")}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${severityClasses[a.severity] || severityClasses.low}`}
                  >
                    {a.severity}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {a.status}
                  </span>
                </div>

                <p className="text-sm">{a.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Store {a.store_id} - Product {a.product_id}
                </p>
                {typeof a.anomaly_score === "number" && a.anomaly_score > 0 && (
                  <p className="text-xs mt-1 text-purple-700">
                    AI anomaly score: {(a.anomaly_score * 100).toFixed(0)}%
                  </p>
                )}
                {a.ai_reason && (
                  <p className="text-xs mt-1 text-gray-600">{a.ai_reason}</p>
                )}

                <div className="flex gap-2 mt-3">
                  {a.status !== "acknowledged" && (
                    <button
                      onClick={() => updateStatus(a._id, "acknowledged")}
                      className="text-xs px-3 py-1 rounded bg-yellow-500 text-white"
                    >
                      Acknowledge
                    </button>
                  )}
                  {a.status !== "resolved" && (
                    <button
                      onClick={() => updateStatus(a._id, "resolved")}
                      className="text-xs px-3 py-1 rounded bg-green-600 text-white"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
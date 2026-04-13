import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  RefreshCw,
  Package,
  Store,
  TrendingUp,
  TrendingDown,
  BrainCircuit
} from "lucide-react";

const severityColors = {
  high: "bg-red-50 text-red-600 border-red-100",
  medium: "bg-orange-50 text-orange-600 border-orange-100",
  low: "bg-blue-50 text-blue-600 border-blue-100",
};

const typeIcons = {
  stockout: <TrendingDown className="h-4 w-4" />,
  overstock: <TrendingUp className="h-4 w-4" />,
  demand_spike: <BrainCircuit className="h-4 w-4" />,
  inventory_gap: <Package className="h-4 w-4" />,
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/alerts");
      setAlerts(res.data);
    } catch (err) {
      console.error("Alerts Fetch Error:", err);
      setError("Failed to synchronize with the intelligence engine.");
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
      console.error("Update Status Error:", err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  return (
    <div className="flex bg-secondary-50 min-h-screen font-sans">
      <Sidebar />

      <div className="p-8 w-full overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest rounded">
                Intelligence Engine
              </span>
            </div>
            <h1 className="text-2xl font-black text-secondary-900 tracking-tighter">
              Operational Anomalies
            </h1>
            <p className="text-[10px] text-secondary-500 mt-1 font-medium uppercase tracking-wider">
              Automated risk identification and inventory health monitoring.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAlerts}
              className="flex items-center gap-2 bg-white border border-secondary-200 text-secondary-900 px-4 py-2 rounded-xl hover:bg-secondary-50 transition-all shadow-sm text-[10px] font-black uppercase tracking-widest active:scale-95"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Synchronize
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-secondary-200 w-fit">
          {["all", "new", "acknowledged", "resolved"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                filter === f
                  ? "bg-secondary-900 text-white shadow-md"
                  : "text-secondary-400 hover:text-secondary-600 hover:bg-secondary-50"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {loading && (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-secondary-100 border-t-primary-600"></div>
              <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                Analyzing data stream...
              </p>
            </div>
          )}

          {!loading && filteredAlerts.length === 0 && (
            <div className="py-32 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-secondary-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-sm font-black text-secondary-900 uppercase tracking-widest">
                All Systems Nominal
              </h3>
              <p className="text-[10px] text-secondary-400 mt-2 font-bold uppercase tracking-widest">
                No active operational risks detected in the current window.
              </p>
            </div>
          )}

          {!loading &&
            filteredAlerts.map((a) => (
              <div
                key={a._id}
                className="bg-white border border-secondary-200 rounded-[24px] p-6 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Status Indicator */}
                  <div className={`p-4 rounded-2xl border h-fit w-fit ${severityColors[a.severity]}`}>
                    {typeIcons[a.type] || <AlertTriangle className="h-5 w-5" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-[10px] font-black text-secondary-900 uppercase tracking-[0.2em]">
                        {a.type.replace("_", " ")}
                      </span>
                      <span
                        className={`text-[8px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest border ${
                          a.severity === "high"
                            ? "bg-red-50 text-red-600 border-red-100"
                            : a.severity === "medium"
                            ? "bg-orange-50 text-orange-600 border-orange-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                      >
                        {a.severity}
                      </span>
                      <span className="text-[8px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest bg-secondary-50 text-secondary-400 border border-secondary-100">
                        {a.status}
                      </span>
                      <span className="text-[8px] text-secondary-300 font-bold ml-auto uppercase tracking-widest">
                        {new Date(a.createdAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-secondary-900 mb-2 tracking-tight">
                      {a.message}
                    </h4>

                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Store className="h-3 w-3 text-secondary-300" />
                        <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest">
                          {a.storeId?.store_name || `Location ${a.numeric_store_id}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-3 w-3 text-secondary-300" />
                        <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest">
                          {a.productId?.product_name || `SKU ${a.numeric_product_id}`}
                        </span>
                      </div>
                    </div>

                    {a.ai_reason && (
                      <div className="bg-secondary-50/50 p-4 rounded-xl border border-secondary-100 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BrainCircuit className="h-3 w-3 text-primary-600" />
                          <span className="text-[9px] font-black text-primary-600 uppercase tracking-[0.15em]">
                            AI Analysis
                          </span>
                        </div>
                        <p className="text-[11px] text-secondary-600 font-medium leading-relaxed">
                          {a.ai_reason}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {a.status !== "acknowledged" && a.status !== "resolved" && (
                        <button
                          onClick={() => updateStatus(a._id, "acknowledged")}
                          className="px-4 py-2 bg-secondary-900 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-secondary-800 transition-all active:scale-95 shadow-lg shadow-secondary-200"
                        >
                          Acknowledge
                        </button>
                      )}
                      {a.status !== "resolved" && (
                        <button
                          onClick={() => updateStatus(a._id, "resolved")}
                          className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-secondary-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">
            Williams Sonoma ITC Hackathon 2026
          </p>
          <p className="text-[11px] font-black text-secondary-900 uppercase tracking-tighter">
            Developed by Team Nexus
          </p>
        </div>
      </div>
    </div>
  );
}
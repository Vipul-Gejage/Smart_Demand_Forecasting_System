import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  BrainCircuit,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  PackageCheck,
  Calendar,
  RefreshCw,
  Search,
} from "lucide-react";

export default function Forecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [form, setForm] = useState({
    storeId: "",
    productId: "",
    leadTimeDays: 7,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, storeRes] = await Promise.all([
          API.get("/inventory/products"),
          API.get("/inventory/stores"),
        ]);
        setProducts(prodRes.data || []);
        setStores(storeRes.data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load products and stores");
      }
    };
    fetchData();
  }, []);

  const runForecast = async () => {
    if (!form.storeId || !form.productId) {
      setError("Please select both a store and a product.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Find the product and store objects to get their numeric IDs
      const selectedProduct = products.find((p) => p._id === form.productId);
      const selectedStore = stores.find((s) => s._id === form.storeId);

      if (!selectedProduct || !selectedStore) {
        setError("Selected product or store not found");
        setLoading(false);
        return;
      }

      // 1. Fetch sales history using MongoDB IDs
      const historyRes = await API.get(
        `/sales/history?productId=${form.productId}&storeId=${form.storeId}`,
      );
      const salesHistory = historyRes.data || [];

      // 2. Run forecast with numeric IDs for ML service
      const requestData = {
        storeId: form.storeId, // Mongo ID
        productId: form.productId, // Mongo ID
        numericStoreId: selectedStore.store_id, // Numeric ID
        numericProductId: selectedProduct.product_id, // Numeric ID
        salesHistory,
        leadTimeDays: form.leadTimeDays,
        promotions: [],
        weather: [],
        events: [],
      };

      console.log("Sending:", requestData);
      const res = await API.post("/forecast", requestData);
      console.log("Received Forecast Data:", res.data);
      if (res.data) {
        setForecast(res.data);
      } else {
        setError("Invalid forecast response from server");
      }
    } catch (err) {
      console.error("Forecast Error:", err);
      setError(
        err.response?.data?.error || err.message || "Error running forecast",
      );
    } finally {
      setLoading(false);
    }
  };

  const InsightCard = ({ title, value, subtitle, icon, color }) => {
    const colors = {
      green: "bg-emerald-50 text-emerald-600 border-emerald-100",
      red: "bg-red-50 text-red-600 border-red-100",
      orange: "bg-orange-50 text-orange-600 border-orange-100",
      blue: "bg-secondary-50 text-secondary-600 border-secondary-100",
    };

    return (
      <div
        className={`p-8 rounded-[32px] border ${colors[color]} bg-white shadow-sm hover:shadow-md transition-all`}
      >
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3 rounded-xl bg-primary-600 text-white shadow-sm`}>
            {icon}
          </div>
        </div>
        <div className="text-2xl font-black text-secondary-900 mb-1 tracking-tight">
          {value}
        </div>
        <div className="text-[10px] font-black text-secondary-900 mb-1 uppercase tracking-widest">
          {title}
        </div>
        <div className="text-[9px] text-secondary-400 font-black uppercase tracking-widest">
          {subtitle}
        </div>
      </div>
    );
  };

  return (
    <div className="flex bg-secondary-50 min-h-screen font-sans">
      <Sidebar />

      <div className="p-8 w-full overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest rounded">
                Predictive Analytics
              </span>
            </div>
            <h1 className="text-2xl font-black text-secondary-900 tracking-tighter flex items-center gap-3">
              AI Demand Forecasting
            </h1>
            <p className="text-[10px] text-secondary-500 mt-1 font-medium uppercase tracking-wider">
              Anticipate future stock requirements using advanced neural network
              models.
            </p>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-primary-600 p-8 rounded-[32px] shadow-xl shadow-primary-200/50 mb-12 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8 text-[9px] font-black text-primary-200 uppercase tracking-[0.2em]">
              <RefreshCw className="h-4 w-4" />
              Model Configuration
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-primary-200 font-black mb-2 ml-1">
                  Target Location
                </label>
                <select
                  name="storeId"
                  value={form.storeId}
                  onChange={(e) =>
                    setForm({ ...form, storeId: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold text-white focus:ring-2 focus:ring-white/30 outline-none transition-all cursor-pointer"
                >
                  <option value="" className="bg-primary-600 text-white">
                    Select Store
                  </option>
                  {stores.map((s) => (
                    <option
                      key={s._id}
                      value={s._id}
                      className="bg-primary-600 text-white"
                    >
                      {s.store_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-primary-200 font-black mb-2 ml-1">
                  Designated SKU
                </label>
                <select
                  name="productId"
                  value={form.productId}
                  onChange={(e) =>
                    setForm({ ...form, productId: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold text-white focus:ring-2 focus:ring-white/30 outline-none transition-all cursor-pointer"
                >
                  <option value="" className="bg-primary-600 text-white">
                    Select Product
                  </option>
                  {products.map((p) => (
                    <option
                      key={p._id}
                      value={p._id}
                      className="bg-primary-600 text-white"
                    >
                      {p.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-primary-200 font-black mb-2 ml-1">
                  Lead Time (Days)
                </label>
                <input
                  name="leadTimeDays"
                  type="number"
                  value={form.leadTimeDays}
                  onChange={(e) =>
                    setForm({ ...form, leadTimeDays: Number(e.target.value) })
                  }
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold text-white focus:ring-2 focus:ring-white/30 outline-none transition-all"
                  min="1"
                  max="30"
                />
              </div>

              <button
                onClick={runForecast}
                disabled={loading}
                className="w-full bg-white text-primary-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-50 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    ANALYZING...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="h-4 w-4" />
                    EXECUTE MODEL
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </div>

        {/* Results Section */}
        {forecast && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Insight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <InsightCard
                title="Recommended Stock"
                value={`${forecast.recommended_inventory} Units`}
                subtitle="Ideal inventory for lead time"
                icon={<PackageCheck className="h-5 w-5" />}
                color="green"
              />
              <InsightCard
                title="Stockout Risk"
                value={`${(forecast.stockout_risk * 100).toFixed(1)}%`}
                subtitle="Probability of depletion"
                icon={<TrendingDown className="h-5 w-5" />}
                color={forecast.stockout_risk > 0.4 ? "red" : "blue"}
              />
              <InsightCard
                title="Overstock Risk"
                value={`${(forecast.overstock_risk * 100).toFixed(1)}%`}
                subtitle="Probability of excess"
                icon={<TrendingUp className="h-5 w-5" />}
                color={forecast.overstock_risk > 0.4 ? "orange" : "blue"}
              />
            </div>

            {/* AI Explanation Section */}
            {forecast.explanation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white p-8 rounded-[32px] border border-primary-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                      <BrainCircuit className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-black text-secondary-900 uppercase tracking-widest">
                      Demand Drivers (SHAP + Gemini)
                    </h3>
                  </div>
                  <p className="text-[11px] text-secondary-600 font-medium leading-relaxed">
                    {forecast.explanation.model_explanation?.natural_language_summary}
                  </p>
                  {forecast.explanation.model_explanation?.structured_contributions?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {forecast.explanation.model_explanation.structured_contributions.slice(0, 3).map((c, idx) => (
                        <span key={idx} className={`text-[8px] px-2 py-1 rounded-md font-black uppercase tracking-widest border ${
                          c.direction === "increases" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                          {c.feature_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 rounded-[32px] border border-secondary-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-secondary-50 rounded-lg text-secondary-600">
                      <PackageCheck className="h-5 w-5" />
                    </div>
                    <h3 className="text-xs font-black text-secondary-900 uppercase tracking-widest">
                      Inventory Advisory
                    </h3>
                  </div>
                  <p className="text-[11px] text-secondary-600 font-medium leading-relaxed">
                    {forecast.explanation.business_explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Main Forecast Chart */}
            <div className="bg-white p-10 rounded-[40px] shadow-sm border border-secondary-200 mb-12">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-xl font-black text-secondary-900 tracking-tight">
                    Demand Projection
                  </h3>
                  <p className="text-[10px] text-secondary-400 font-bold mt-1 uppercase tracking-widest">
                    Expected daily unit sales for the selected lead time period.
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-600"></div>
                    <span className="text-[9px] font-black text-secondary-400 uppercase tracking-widest">
                      Predicted Volume
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-[400px] w-full">
                {forecast.forecast && forecast.forecast.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecast.forecast}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                        dy={15}
                        tickFormatter={(val) =>
                          new Date(val).toLocaleDateString(undefined, {
                            weekday: "short",
                            day: "numeric",
                          })
                        }
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                      />
                      <Tooltip
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          padding: "12px",
                        }}
                        labelStyle={{
                          fontWeight: 900,
                          color: "#0f172a",
                          fontSize: "11px",
                          marginBottom: "4px",
                        }}
                        itemStyle={{ fontSize: "11px", fontWeight: 700 }}
                      />
                      <Bar
                        dataKey="predicted_units"
                        fill="#0ea5e9"
                        radius={[4, 4, 0, 0]}
                        barSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-secondary-400 font-bold text-[10px] uppercase tracking-widest">
                    No forecast data available
                  </div>
                )}
              </div>
            </div>

            {/* Forecast Data Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-secondary-100 overflow-hidden">
              <div className="p-8 border-b border-secondary-50">
                <h3 className="text-xs font-black text-secondary-900 uppercase tracking-widest">
                  Daily Analytical Breakdown
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary-50/50 text-[9px] uppercase tracking-[0.2em] font-black text-secondary-400">
                      <th className="px-8 py-4">Forecast Window</th>
                      <th className="px-8 py-4">Anticipated Demand</th>
                      <th className="px-8 py-4 text-center">Trend Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50">
                    {forecast.forecast?.map((day, i) => (
                      <tr
                        key={i}
                        className="hover:bg-secondary-50/50 transition-colors"
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-3.5 w-3.5 text-secondary-300" />
                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                              {new Date(day.date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-sm font-black text-slate-900">
                            {day.predicted_units}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold ml-1.5 uppercase tracking-widest">
                            Units
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex justify-center">
                            {day.predicted_units > 15 ? (
                              <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                High Volume
                              </div>
                            ) : (
                              <div className="bg-slate-50 text-slate-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                Stable
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!forecast && !loading && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <BrainCircuit className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">
              Ready for Simulation
            </h3>
            <p className="text-slate-400 mt-2 text-[10px] font-black uppercase tracking-widest max-w-xs mx-auto">
              Select target parameters to initiate machine learning demand
              projections.
            </p>
          </div>
        )}

        {/* Footer - Hackathon Branding */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Williams Sonoma ITC Hackathon 2026
          </p>
          <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter">
            Developed by Team Nexus
          </p>
        </div>
      </div>
    </div>
  );
}

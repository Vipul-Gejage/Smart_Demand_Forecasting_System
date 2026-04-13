import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Package,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await API.get("/sales/dashboard");
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError("Failed to connect to real-time analytics engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex bg-secondary-50 min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-secondary-100 border-t-primary-600"></div>
            <p className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">
              Loading Analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-secondary-50 min-h-screen font-sans">
      <Sidebar />

      <div className="p-8 w-full overflow-y-auto">
        {/* Header - Refined & Formal */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest rounded">
                Supply Chain Hub
              </span>
            </div>
            <h1 className="text-2xl font-black text-secondary-900 tracking-tighter">
              Operational Overview
            </h1>
            <p className="text-[10px] text-secondary-500 mt-1 font-medium uppercase tracking-wider">
              Monitoring inventory health and sales performance metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardStats}
              className="flex items-center gap-2 bg-white border border-secondary-200 text-secondary-900 px-4 py-2 rounded-xl hover:bg-secondary-50 transition-all shadow-sm text-[10px] font-black uppercase tracking-widest active:scale-95"
            >
              <RefreshCw
                className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
              Synchronize
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3 shadow-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        )}

        {/* Stats Grid - Reduced Font & Clean */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard
            title="Total Revenue"
            value={`₹${(stats?.summary?.total_revenue || 0).toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend="+12.5%"
            trendUp={true}
          />
          <StatCard
            title="Units Sold"
            value={(stats?.summary?.total_units_sold || 0).toLocaleString()}
            icon={<ShoppingCart className="h-5 w-5" />}
            trend="+8.2%"
            trendUp={true}
          />
          <StatCard
            title="Low Stock"
            value={stats?.inventory?.lowStockCount || 0}
            icon={<Package className="h-5 w-5" />}
            trend={
              stats?.inventory?.outOfStockCount > 0
                ? `${stats?.inventory?.outOfStockCount} Out`
                : "Stable"
            }
            trendUp={false}
          />
          <StatCard
            title="Active Promos"
            value={stats?.promotions?.activeCount || 0}
            icon={<TrendingUp className="h-5 w-5" />}
            trend="Active"
            trendUp={true}
          />
        </div>

        {/* Revenue Trend Chart - Exact Dates */}
        <div className="bg-white p-8 rounded-[24px] shadow-sm border border-secondary-200 relative overflow-hidden mb-12">
          <div className="mb-8">
            <h3 className="text-lg font-black text-secondary-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              Sales Velocity
            </h3>
            <p className="text-[10px] text-secondary-400 font-bold mt-1 uppercase tracking-widest">
              Daily revenue performance tracking
            </p>
          </div>

          <div className="h-[350px] w-full">
            {stats?.trends?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trends}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="_id"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 8, fontWeight: 700 }}
                    dy={15}
                    tickFormatter={(val) => {
                      if (!val) return "";
                      const date = new Date(val);
                      return isNaN(date.getTime())
                        ? val
                        : date.toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                          });
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                    tickFormatter={(val) =>
                      `₹${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
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
                    formatter={(val) => [`₹${val.toLocaleString()}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-secondary-400 font-bold text-[10px] uppercase tracking-widest">
                Insufficient trend data
              </div>
            )}
          </div>
        </div>

        {/* Footer - Hackathon Branding */}
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

function StatCard({ title, value, icon, trend, trendUp }) {
  return (
    <div className="bg-white p-6 rounded-[20px] shadow-sm border border-secondary-200 hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-xl bg-primary-600 text-white group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest ${trendUp ? "text-emerald-600" : "text-orange-600"}`}
        >
          {trendUp ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {trend}
        </div>
      </div>
      <div className="text-2xl font-black text-secondary-900 mb-0.5 tracking-tight">
        {value}
      </div>
      <div className="text-[9px] text-secondary-400 font-black uppercase tracking-widest">
        {title}
      </div>
    </div>
  );
}

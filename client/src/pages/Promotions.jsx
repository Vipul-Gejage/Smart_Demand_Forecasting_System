import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Promotions() {
  const [list, setList] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    campaign_name: "",
    productId: "",
    storeId: "",
    discount_pct: "",
    promo_type: "Discount",
    date: new Date().toISOString().split("T")[0],
    display_flag: true,
  });

  const fetchPromos = async () => {
    try {
      const res = await API.get("/promotions");
      setList(res.data);
    } catch (err) {
      console.error("Promo Error:", err);
      setError("Failed to load promotions");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await API.get("/inventory/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Products Error:", err);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await API.get("/inventory/stores");
      setStores(res.data);
    } catch (err) {
      console.error("Stores Error:", err);
    }
  };

  useEffect(() => {
    fetchPromos();
    fetchProducts();
    fetchStores();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const addPromo = async () => {
    if (
      !form.campaign_name ||
      !form.productId ||
      !form.storeId ||
      !form.discount_pct ||
      !form.date
    ) {
      setError("All required fields must be filled");
      return;
    }

    setLoading(true);
    try {
      await API.post("/promotions", form);
      fetchPromos();
      setForm({
        campaign_name: "",
        productId: "",
        storeId: "",
        discount_pct: "",
        promo_type: "Discount",
        date: new Date().toISOString().split("T")[0],
        display_flag: true,
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error adding promotion");
    } finally {
      setLoading(false);
    }
  };

  const deletePromo = async (id) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await API.delete(`/promotions/${id}`);
      fetchPromos();
    } catch (err) {
      setError("Error deleting promotion");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      <Sidebar />

      <div className="p-8 w-full overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest rounded">
                Campaign Management
              </span>
            </div>
            <h1 className="text-2xl font-black text-secondary-900 tracking-tighter">
              Marketing Initiatives
            </h1>
            <p className="text-[10px] text-secondary-500 mt-1 font-medium uppercase tracking-wider">
              Design and deploy high-impact promotional strategies across global
              locations.
            </p>
          </div>
          <button
            onClick={fetchPromos}
            className="flex items-center gap-2 bg-white border border-secondary-200 text-secondary-900 px-4 py-2 rounded-xl hover:bg-secondary-50 transition-all shadow-sm text-[10px] font-black uppercase tracking-widest active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Data
          </button>
        </div>

        {/* Create Promotion Form */}
        <div className="bg-primary-600 p-8 rounded-[32px] shadow-xl shadow-primary-200/50 mb-12 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xs font-black text-white mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-primary-200"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                  clipRule="evenodd"
                />
              </svg>
              Campaign Deployment Portal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end">
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-[9px] uppercase tracking-widest text-primary-200 font-black mb-2 ml-1">
                  Campaign Identifier
                </label>
                <input
                  name="campaign_name"
                  placeholder="e.g. SUMMER PEAK 2026"
                  value={form.campaign_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold text-white focus:ring-2 focus:ring-white/30 outline-none transition-all placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-primary-200 font-black mb-2 ml-1">
                  Target Product
                </label>
                <select
                  name="productId"
                  value={form.productId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold text-white focus:ring-2 focus:ring-white/30 outline-none transition-all cursor-pointer"
                >
                  <option value="" className="bg-primary-600 text-white">
                    Select SKU
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
                  Operational Store
                </label>
                <select
                  name="storeId"
                  value={form.storeId}
                  onChange={handleChange}
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
                  Initiative Type
                </label>
                <select
                  name="promo_type"
                  value={form.promo_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold text-white focus:ring-2 focus:ring-white/30 outline-none transition-all cursor-pointer"
                >
                  <option
                    value="Discount"
                    className="bg-primary-600 text-white"
                  >
                    Percentage Discount
                  </option>
                  <option value="BOGO" className="bg-primary-600 text-white">
                    Buy One Get One
                  </option>
                  <option
                    value="Seasonal"
                    className="bg-primary-600 text-white"
                  >
                    Seasonal Special
                  </option>
                  <option
                    value="Clearance"
                    className="bg-primary-600 text-white"
                  >
                    Clearance Sale
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-primary-200 font-black mb-2 ml-1">
                  Discount Magnitude (%)
                </label>
                <input
                  name="discount_pct"
                  type="number"
                  placeholder="0"
                  value={form.discount_pct}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold text-white focus:ring-2 focus:ring-white/30 outline-none transition-all placeholder:text-white/30"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-primary-200 font-black mb-2 ml-1">
                  Activation Date
                </label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold text-white focus:ring-2 focus:ring-white/30 outline-none transition-all"
                />
              </div>

              <div className="flex items-center h-12 px-2">
                <label className="flex items-center cursor-pointer group">
                  <input
                    name="display_flag"
                    type="checkbox"
                    checked={form.display_flag}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-white/20 bg-white/10 rounded focus:ring-white/30"
                  />
                  <span className="ml-2 text-[10px] font-black text-primary-200 uppercase tracking-widest group-hover:text-white transition-colors">
                    Visible on Display
                  </span>
                </label>
              </div>

              <button
                onClick={addPromo}
                disabled={loading}
                className="w-full bg-white text-primary-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-50 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
              >
                {loading ? "INITIALIZING..." : "Execute Campaign"}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-4 ml-1">
                {error}
              </p>
            )}
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        </div>

        {/* Promotions List Table */}
        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary-50/50 border-b border-secondary-200">
                  <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-black text-secondary-400">
                    Campaign Details
                  </th>
                  <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-black text-secondary-400">
                    Designated SKU
                  </th>
                  <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-black text-secondary-400">
                    Operational Store
                  </th>
                  <th className="p-6 text-center text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Offer Value
                  </th>
                  <th className="p-6 text-center text-[9px] uppercase tracking-[0.2em] font-black text-secondary-400">
                    Launch Date
                  </th>
                  <th className="p-6 text-center text-[9px] uppercase tracking-[0.2em] font-black text-secondary-400">
                    Status
                  </th>
                  <th className="p-6 text-center text-[9px] uppercase tracking-[0.2em] font-black text-secondary-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {list && list.length > 0 ? (
                  list.map((promo) => {
                    const product = promo.productId || {};
                    const store = promo.storeId || {};
                    return (
                      <tr
                        key={promo._id}
                        className="hover:bg-secondary-50/50 transition-colors"
                      >
                        <td className="p-6">
                          <div className="font-black text-secondary-900 text-sm tracking-tight">
                            {promo.campaign_name}
                          </div>
                          <div className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest mt-0.5">
                            {promo.promo_type}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="text-[11px] font-black text-secondary-900 uppercase tracking-tight">
                            {product.product_name || "Unknown SKU"}
                          </div>
                          <div className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest mt-0.5">
                            {product.brand}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="text-[11px] font-black text-secondary-900 uppercase tracking-tight">
                            {store.store_name || "Global Deployment"}
                          </div>
                        </td>
                        <td className="p-6 text-center">
                          <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                            {promo.discount_pct}% OFF
                          </div>
                        </td>
                        <td className="p-6 text-center text-[10px] text-secondary-500 font-black uppercase tracking-widest">
                          {new Date(promo.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-6 text-center">
                          <span
                            className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                              promo.display_flag
                                ? "bg-primary-600 text-white"
                                : "bg-secondary-100 text-secondary-400"
                            }`}
                          >
                            {promo.display_flag ? "Active" : "Standby"}
                          </span>
                        </td>
                        <td className="p-6 text-center">
                          <button
                            onClick={() => deletePromo(promo._id)}
                            className="text-secondary-300 hover:text-red-600 transition-colors p-2"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-20 text-center">
                      <div className="w-16 h-16 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-secondary-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
                          />
                        </svg>
                      </div>
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        No active campaigns found
                      </p>
                      <button
                        onClick={() => {}}
                        className="mt-4 text-slate-900 hover:underline text-[9px] font-black uppercase tracking-widest"
                      >
                        Launch first initiative
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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

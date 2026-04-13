import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [quantity, setQuantity] = useState("");
  const [setQuantityId, setSetQuantityId] = useState(null);
  const [setQuantityValue, setSetQuantityValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStore, setFilterStore] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchInventory = async () => {
    try {
      const res = await API.get("/inventory");
      setItems(res.data);
    } catch (err) {
      console.error("Inventory Error:", err);
      setError("Failed to load inventory");
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

  const addItem = async () => {
    if (!selectedProduct || !selectedStore || !quantity) {
      setError("All fields required");
      return;
    }

    setLoading(true);
    try {
      await API.post("/inventory", {
        productId: selectedProduct,
        quantity: Number(quantity),
        storeId: selectedStore,
      });
      fetchInventory();
      setSelectedProduct("");
      setSelectedStore("");
      setQuantity("");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Error adding item");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    try {
      await API.put(`/inventory/${id}`, { quantity: Number(newQuantity) });
      fetchInventory();
    } catch (err) {
      setError("Error updating quantity");
    }
  };

  const incrementQuantity = async (id, inc) => {
    try {
      await API.put(`/inventory/${id}`, { increment: inc });
      fetchInventory();
    } catch (err) {
      setError("Error updating quantity");
    }
  };

  const deleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await API.delete(`/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      setError("Error deleting item");
    }
  };

  const filteredItems = items.filter((item) => {
    const product = item.productId || {};
    const store = item.storeId || {};
    const matchesStore = !filterStore || store._id === filterStore;
    const matchesCategory =
      !filterCategory || product.category === filterCategory;
    const matchesSearch =
      !searchTerm ||
      product.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStore && matchesCategory && matchesSearch;
  });

  const uniqueCategories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchStores();
  }, []);

  return (
    <div className="flex bg-secondary-50 min-h-screen font-sans">
      <Sidebar />

      <div className="p-8 w-full overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest rounded">
                Inventory Ledger
              </span>
            </div>
            <h1 className="text-2xl font-black text-secondary-900 tracking-tighter">
              Stock Management
            </h1>
            <p className="text-[10px] text-secondary-500 mt-1 font-medium uppercase tracking-wider">
              Real-time oversight of global SKU distribution and replenishment.
            </p>
          </div>
          <button
            onClick={() => {
              fetchInventory();
              fetchProducts();
              fetchStores();
            }}
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
            Synchronize
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCardSmall
            title="Active SKUs"
            value={filteredItems.length}
            color="text-secondary-900"
            sub="Unique products"
          />
          <StatCardSmall
            title="Total Volume"
            value={filteredItems
              .reduce((sum, item) => sum + item.quantity, 0)
              .toLocaleString()}
            color="text-secondary-900"
            sub="Aggregate units"
          />
          <StatCardSmall
            title="Low Stock"
            value={
              filteredItems.filter(
                (item) => item.quantity > 0 && item.quantity < 10,
              ).length
            }
            color="text-orange-600"
            sub="Needs attention"
          />
          <StatCardSmall
            title="Stockouts"
            value={filteredItems.filter((item) => item.quantity === 0).length}
            color="text-red-600"
            sub="Critical priority"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="SEARCH SKU OR BRAND..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white border border-secondary-200 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none min-w-[240px] shadow-sm"
              />
            </div>

            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="px-4 py-2 bg-white border border-secondary-200 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 outline-none shadow-sm cursor-pointer"
            >
              <option value="">ALL LOCATIONS</option>
              {stores.map((store) => (
                <option key={store._id} value={store._id}>
                  {store.store_name.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-white border border-secondary-200 rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500 outline-none shadow-sm cursor-pointer"
            >
              <option value="">ALL CATEGORIES</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.toUpperCase()}
                </option>
              ))}
            </select>

            {(searchTerm || filterStore || filterCategory) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStore("");
                  setFilterCategory("");
                }}
                className="text-[9px] text-secondary-400 hover:text-secondary-900 font-black uppercase tracking-widest ml-2 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Add Inventory Section */}
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
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Stock Intake Portal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div>
                <label className="block text-[9px] uppercase tracking-widest text-primary-200 font-black mb-2 ml-1">
                  Product Designation
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold text-white focus:ring-2 focus:ring-white/30 outline-none transition-all cursor-pointer"
                >
                  <option value="" className="bg-primary-600 text-white">
                    Select Product
                  </option>
                  {products.map((prod) => (
                    <option
                      key={prod._id}
                      value={prod._id}
                      className="bg-primary-600 text-white"
                    >
                      {prod.product_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-primary-200 font-black mb-2 ml-1">
                  Target Location
                </label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold text-white focus:ring-2 focus:ring-white/30 outline-none transition-all cursor-pointer"
                >
                  <option value="" className="bg-primary-600 text-white">
                    Select Store
                  </option>
                  {stores.map((store) => (
                    <option
                      key={store._id}
                      value={store._id}
                      className="bg-primary-600 text-white"
                    >
                      {store.store_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-widest text-primary-200 font-black mb-2 ml-1">
                  Unit Quantity
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[11px] font-bold text-white focus:ring-2 focus:ring-white/30 outline-none transition-all placeholder:text-white/30"
                  min="0"
                />
              </div>

              <button
                onClick={addItem}
                disabled={loading}
                className="w-full bg-white text-primary-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-50 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
              >
                {loading ? "PROCESSING..." : "Commit to Stock"}
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

        <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-secondary-50/50 border-b border-secondary-100">
                  <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-black text-secondary-400">
                    Product Detail
                  </th>
                  <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-black text-secondary-400">
                    Classification
                  </th>
                  <th className="p-6 text-[9px] uppercase tracking-[0.2em] font-black text-secondary-400">
                    Store Location
                  </th>
                  <th className="p-6 text-center text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Inventory Management
                  </th>
                  <th className="p-6 text-center text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Status
                  </th>
                  <th className="p-6 text-center text-[9px] uppercase tracking-[0.2em] font-black text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filteredItems.map((item) => {
                  const product = item.productId || {};
                  const store = item.storeId || {};
                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-secondary-50/50 transition-colors"
                    >
                      <td className="p-6">
                        <div className="font-black text-secondary-900 text-sm tracking-tight">
                          {product.product_name}
                        </div>
                        <div className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest mt-0.5">
                          {product.brand}
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="bg-primary-600 text-white text-[9px] px-2.5 py-1 rounded font-black uppercase tracking-widest">
                          {product.category || "N/A"}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="text-[11px] font-black text-secondary-900 uppercase tracking-tight">
                          {store.store_name}
                        </div>
                        <div className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest mt-0.5">
                          {store.city}
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div className="flex items-center justify-center space-x-4">
                          <button
                            onClick={() => incrementQuantity(item._id, -1)}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-secondary-200 text-secondary-900 rounded-lg hover:bg-secondary-50 transition-all shadow-sm disabled:opacity-30 active:scale-90"
                            disabled={item.quantity <= 0}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>

                          {setQuantityId === item._id ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={setQuantityValue}
                                onChange={(e) =>
                                  setSetQuantityValue(e.target.value)
                                }
                                className="w-16 border-2 border-secondary-900 rounded-lg px-2 py-1 text-center text-[11px] font-black focus:outline-none"
                                min="0"
                                autoFocus
                              />
                              <button
                                onClick={() => {
                                  updateQuantity(item._id, setQuantityValue);
                                  setSetQuantityId(null);
                                  setSetQuantityValue("");
                                }}
                                className="bg-primary-600 text-white p-1 rounded-lg hover:bg-primary-700 transition-colors"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div
                              className="w-12 text-center cursor-pointer group"
                              onClick={() => {
                                setSetQuantityId(item._id);
                                setSetQuantityValue(item.quantity);
                              }}
                            >
                              <span
                                className={`text-sm font-black tracking-tight ${
                                  item.quantity === 0
                                    ? "text-red-600"
                                    : item.quantity < 10
                                      ? "text-orange-600"
                                      : "text-secondary-900"
                                }`}
                              >
                                {item.quantity}
                              </span>
                              <div className="text-[8px] text-secondary-300 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                Adjust
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => incrementQuantity(item._id, 1)}
                            className="w-7 h-7 flex items-center justify-center bg-white border border-secondary-200 text-secondary-900 rounded-lg hover:bg-secondary-50 transition-all shadow-sm active:scale-90"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <div
                          className={`inline-flex items-center px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                            item.quantity === 0
                              ? "bg-red-50 text-red-600"
                              : item.quantity < 10
                                ? "bg-orange-50 text-orange-600"
                                : "bg-emerald-50 text-emerald-600"
                          }`}
                        >
                          {item.quantity === 0
                            ? "Stockout"
                            : item.quantity < 10
                              ? "Low Stock"
                              : "Healthy"}
                        </div>
                        <div className="text-[8px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest">
                          {new Date(item.lastUpdated).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "short" },
                          )}
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <button
                          onClick={() => deleteItem(item._id)}
                          className="text-slate-300 hover:text-red-600 transition-colors p-2"
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
                })}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-slate-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  {items.length === 0
                    ? "Ledger is currently empty"
                    : "No matching records found"}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStore("");
                    setFilterCategory("");
                  }}
                  className="mt-4 text-slate-900 hover:underline text-[9px] font-black uppercase tracking-widest"
                >
                  Clear all filters
                </button>
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

function StatCardSmall({ title, value, color, sub }) {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-secondary-200 hover:shadow-md transition-all">
      <div className="text-[9px] font-black text-secondary-400 uppercase tracking-widest mb-2">
        {title}
      </div>
      <div className={`text-2xl font-black ${color} tracking-tight mb-1`}>
        {value}
      </div>
      <div className="text-[8px] font-bold text-secondary-300 uppercase tracking-widest">
        {sub}
      </div>
    </div>
  );
}

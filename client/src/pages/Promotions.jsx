import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

export default function Promotions() {
  const [form, setForm] = useState({
    campaign_name: "",
    product_id: "",
    discount_pct: "",
    promo_type: "",
    date: "",
    store_id: 1,
    display_flag: true,
  });

  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addPromo = async () => {
    if (
      !form.campaign_name ||
      !form.product_id ||
      !form.discount_pct ||
      !form.date
    ) {
      return setError("All fields required");
    }

    try {
      await API.post("/promotions", form);
      fetchPromos();
      setForm({
        campaign_name: "",
        product_id: "",
        discount_pct: "",
        promo_type: "",
        date: "",
        store_id: 1,
        display_flag: true,
      });
      setError("");
    } catch (err) {
      setError("Error adding promo");
    }
  };

  const fetchPromos = async () => {
    try {
      const res = await API.get("/promotions");
      setList(res.data);
    } catch (err) {
      console.log("Promo Error:", err);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <h1 className="text-xl font-bold mb-4">Promotions</h1>

        {/* Form */}
        <div className="mb-4">
          <input
            name="campaign_name"
            placeholder="Campaign Name"
            value={form.campaign_name}
            onChange={handleChange}
            className="border p-2 mr-2"
          />

          <input
            name="product_id"
            type="number"
            placeholder="Product ID"
            value={form.product_id}
            onChange={handleChange}
            className="border p-2 mr-2"
          />

          <input
            name="discount_pct"
            type="number"
            placeholder="Discount %"
            value={form.discount_pct}
            onChange={handleChange}
            className="border p-2 mr-2"
          />

          <input
            name="promo_type"
            placeholder="Promo Type"
            value={form.promo_type}
            onChange={handleChange}
            className="border p-2 mr-2"
          />

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="border p-2 mr-2"
          />

          <button
            onClick={addPromo}
            className="bg-green-500 text-white px-4 py-2"
          >
            Add
          </button>
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {/* List */}
        <ul className="bg-white p-4 rounded shadow">
          {list && list.length > 0 ? (
            list.map((p, i) => (
              <li key={i} className="mb-2 pb-2 border-b">
                <strong>{p.campaign_name}</strong> - Product ID: {p.product_id}{" "}
                - {p.discount_pct}% off - {p.promo_type} - {p.date}
              </li>
            ))
          ) : (
            <li className="text-gray-500">No promotions found</li>
          )}
        </ul>
      </div>
    </div>
  );
}

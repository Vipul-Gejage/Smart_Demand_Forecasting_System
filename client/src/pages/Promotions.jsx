import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Promotions() {
  const [form, setForm] = useState({
    product: "",
    discount: "",
    date: "",
  });

  const [list, setList] = useState([]);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addPromo = () => {
    if (!form.product || !form.discount || !form.date) {
      return setError("All fields required");
    }

    if (form.discount <= 0 || form.discount > 100) {
      return setError("Invalid discount %");
    }

    setList([...list, form]);
    setForm({ product: "", discount: "", date: "" });
    setError("");
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <h1 className="text-xl font-bold mb-4">Promotions</h1>

        {/* Form */}
        <div className="mb-4">
          <input
            name="product"
            placeholder="Product"
            value={form.product}
            onChange={handleChange}
            className="border p-2 mr-2"
          />

          <input
            name="discount"
            type="number"
            placeholder="Discount %"
            value={form.discount}
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
          {list.map((p, i) => (
            <li key={i}>
              {p.product} - {p.discount}% - {p.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
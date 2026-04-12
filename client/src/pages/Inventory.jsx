import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [qty, setQty] = useState("");
  const [error, setError] = useState("");

  const addItem = () => {
    // Validation
    if (!name || !qty) {
      return setError("All fields required");
    }

    if (qty <= 0) {
      return setError("Quantity must be positive");
    }

    setItems([...items, { id: Date.now(), name, qty }]);
    setName("");
    setQty("");
    setError("");
  };

  const deleteItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <h1 className="text-xl font-bold mb-4">Inventory</h1>

        {/* Input */}
        <div className="mb-4">
          <input
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mr-2"
          />

          <input
            type="number"
            placeholder="Quantity"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="border p-2 mr-2"
          />

          <button
            onClick={addItem}
            className="bg-blue-500 text-white px-4 py-2"
          >
            Add
          </button>
        </div>

        {/* Error */}
        {error && <p className="text-red-500">{error}</p>}

        {/* Table */}
        <table className="w-full bg-white rounded shadow mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Product</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="text-center">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.qty}</td>
                <td className="p-2">
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="bg-red-500 text-white px-2 py-1"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4">
      <h2 className="text-xl font-bold mb-6">Retail AI</h2>

      <ul className="space-y-4">
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/inventory">Inventory</Link>
        </li>
        <li>
          <Link to="/promotions">Promotions</Link>
        </li>
        <li>
          <Link to="/forecast">Forecast</Link>
        </li>
        <li>
          <Link to="/alerts">Alerts</Link>
        </li>
      </ul>
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        className="mt-6 bg-red-500 p-2 w-full"
      >
        Logout
      </button>
    </div>
  );
}

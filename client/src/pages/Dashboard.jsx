import Sidebar from "../components/Sidebar";
import Card from "../components/Card";

export default function Dashboard() {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Top Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card title="Total Sales" value="₹12,000" />
          <Card title="Low Stock Items" value="5" />
          <Card title="Overstock Items" value="3" />
        </div>

        {/* Chart Placeholder */}
        <div className="mt-6 bg-white p-4 rounded shadow">
          📈 Sales vs Forecast (coming soon)
        </div>

        {/* Alerts */}
        <div className="mt-6 bg-white p-4 rounded shadow">
          ⚠️ Alerts will appear here
        </div>
      </div>
    </div>
  );
}
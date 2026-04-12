import Sidebar from "../components/Sidebar";

export default function Alerts() {
  const alerts = [
    { type: "Low Stock", message: "Product A below threshold" },
    { type: "Overstock", message: "Product B excess inventory" },
    { type: "High Demand", message: "Product C demand spike expected" },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <h1 className="text-xl font-bold mb-4">Alerts</h1>

        <div className="bg-white p-4 rounded shadow">
          {alerts.map((a, i) => (
            <div key={i} className="border-b p-2">
              <span className="font-semibold">{a.type}: </span>
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
import Sidebar from "../components/Sidebar";

export default function Forecast() {
  const dummyData = [
    { day: "Mon", demand: 120 },
    { day: "Tue", demand: 150 },
    { day: "Wed", demand: 90 },
  ];

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />

      <div className="p-6 w-full">
        <h1 className="text-xl font-bold mb-4">Demand Forecast</h1>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2">Next 3 Days Prediction</h2>

          {dummyData.map((d, i) => (
            <div key={i} className="flex justify-between border-b p-2">
              <span>{d.day}</span>
              <span>{d.demand} units</span>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="font-semibold">Recommended Stock</h2>
          <p className="text-lg font-bold mt-2">300 units</p>
        </div>
      </div>
    </div>
  );
}
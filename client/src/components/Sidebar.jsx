import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tag,
  BrainCircuit,
  AlertTriangle,
  LogOut,
  Store,
} from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Inventory",
      path: "/inventory",
      icon: <Package className="h-5 w-5" />,
    },
    {
      name: "Promotions",
      path: "/promotions",
      icon: <Tag className="h-5 w-5" />,
    },
    {
      name: "AI Forecast",
      path: "/forecast",
      icon: <BrainCircuit className="h-5 w-5" />,
    },
    {
      name: "Alerts",
      path: "/alerts",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-secondary-200 flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary-600 p-2 rounded-xl">
          <Store className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-sm font-black text-secondary-900 tracking-tighter uppercase">
          Nexus Supply Chain
        </h2>
      </div>

      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
                      : "text-secondary-500 hover:bg-secondary-50 hover:text-secondary-700"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-secondary-100">
        <div className="mb-6">
          <p className="text-[9px] font-black text-secondary-300 uppercase tracking-widest mb-1">
            Hackathon 2026
          </p>
          <p className="text-[10px] font-black text-secondary-900 uppercase tracking-tighter">
            Williams Sonoma ITC
          </p>
          <p className="text-[10px] font-black text-secondary-900 uppercase tracking-tighter">
            Team Nexus
          </p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 w-full px-4 py-2 text-[11px] font-black uppercase tracking-widest text-secondary-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

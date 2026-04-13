import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Store, ArrowRight, Lock, User, ShieldCheck } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Invalid credentials. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[1100px] bg-white rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        {/* Left Side - Branding & Visual */}
        <div className="w-full md:w-1/2 bg-primary-600 p-12 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-white p-2.5 rounded-2xl">
                <Store className="h-7 w-7 text-primary-600" />
              </div>
              <h2 className="text-xl font-black tracking-tighter uppercase">
                Nexus Supply Chain
              </h2>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl font-black leading-[1.1] tracking-tight">
                Strategic <br />
                <span className="text-primary-200">Inventory</span> <br />
                Management.
              </h1>
              <p className="text-primary-200 text-lg font-medium max-w-md">
                An advanced AI-powered platform for real-time supply chain
                optimization and demand forecasting.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-12">
            <div className="flex items-center gap-4 p-4 bg-white/10 border border-white/20 rounded-2xl backdrop-blur-sm">
              <div className="p-2 bg-accent-400/20 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-accent-300" />
              </div>
              <div>
                <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest">
                  Hackathon Submission
                </p>
                <p className="text-xs font-bold">
                  Williams Sonoma ITC • Team Nexus
                </p>
              </div>
            </div>
          </div>

          {/* Abstract background shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-400/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-400/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-12 lg:p-20 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full">
            <div className="mb-10">
              <h3 className="text-3xl font-black text-secondary-900 mb-2">
                Welcome back
              </h3>
              <p className="text-secondary-500 font-bold text-sm">
                Enter your credentials to access the hub
              </p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-secondary-400 uppercase tracking-widest ml-1">
                  Work Email
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-300" />
                  <input
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-secondary-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-bold text-secondary-900 placeholder:text-secondary-300"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-[10px] font-black text-secondary-400 uppercase tracking-widest">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-300" />
                  <input
                    type="password"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-secondary-50 border-2 border-transparent focus:border-primary-500 focus:bg-white rounded-2xl outline-none transition-all text-sm font-bold text-secondary-900 placeholder:text-secondary-300"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Access Dashboard"}
                {!loading && (
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </form>

            <p className="mt-10 text-center text-secondary-500 text-xs font-bold">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary-600 hover:underline underline-offset-4"
              >
                Request access
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

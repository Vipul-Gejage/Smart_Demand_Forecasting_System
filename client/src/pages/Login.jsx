import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      return setError("All fields required");
    }

    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);

      navigate("/");
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h1 className="text-xl font-bold mb-4">Login</h1>

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="border p-2 w-full mb-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="border p-2 w-full mb-2"
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full p-2 mt-2 text-white ${
            loading ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-2 text-sm">
          Don't have account?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

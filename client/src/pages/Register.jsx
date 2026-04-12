import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      return setError("All fields required");
    }

    if (!form.email.includes("@")) {
      return setError("Enter valid email");
    }

    if (form.password.length < 6) {
      return setError("Password must be 6+ chars");
    }

    setLoading(true);
    setError("");

    try {
      await API.post("/auth/register", form);

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-80">
        <h1 className="text-xl font-bold mb-4">Register</h1>

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          className="border p-2 w-full mb-2"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          className="border p-2 w-full mb-2"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          onKeyDown={(e) => e.key === "Enter" && handleRegister()}
          className="border p-2 w-full mb-2"
        />

        {error && <p className="text-red-500">{error}</p>}

        <button
          onClick={handleRegister}
          disabled={loading}
          className={`w-full p-2 mt-2 text-white ${
            loading ? "bg-gray-400" : "bg-green-500"
          }`}
        >
          {loading ? "Registering..." : "Register"}
        </button>
        <p className="mt-2 text-sm">
          Already have account?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

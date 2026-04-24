import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
    setLoading(false);
  };

  const inp = {
    width: "100%", background: "#f9fafb",
    border: "1px solid #e5e7eb", borderRadius: 10,
    padding: "12px 16px", fontSize: 14,
    color: "#111827", outline: "none",
    transition: "border-color .15s",
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#6b7280", textTransform: "uppercase",
    letterSpacing: ".07em", marginBottom: 6,
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0fdf4 0%,#dcfce7 40%,#f9fafb 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo area */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: "linear-gradient(135deg,#16a34a,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
              <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginBottom: 4 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Sign in to RecipeShare</p>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "36px 32px", position: "relative", overflow: "hidden" }}>
          {/* Top accent */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#16a34a,#22c55e,#4ade80)" }} />

          {error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 10, padding: "12px 16px", fontSize: 13, marginBottom: 20, fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={lbl}>Email address</label>
              <input style={inp} type="email" placeholder="chef@example.com" required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#22c55e")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={lbl}>Password</label>
              <input style={inp} type="password" placeholder="••••••••" required
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#22c55e")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", padding: "13px",
                background: loading ? "#bbf7d0" : "linear-gradient(135deg,#16a34a,#22c55e)",
                color: loading ? "#16a34a" : "#fff",
                border: "none", borderRadius: 10,
                fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity .2s",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            <span style={{ fontSize: 12, color: "#9ca3af" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>

          <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280" }}>
            New to RecipeShare?{" "}
            <Link to="/register" style={{ color: "#16a34a", fontWeight: 700 }}>
              Create free account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

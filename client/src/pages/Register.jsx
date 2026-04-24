import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/register", form);
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
    setLoading(false);
  };

  const inp = {
    width: "100%", background: "#f9fafb",
    border: "1px solid #e5e7eb", borderRadius: 10,
    padding: "12px 16px", fontSize: 14,
    color: "#111827", outline: "none",
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#6b7280", textTransform: "uppercase",
    letterSpacing: ".07em", marginBottom: 6,
  };

  const features = [
    "Share your favourite recipes",
    "AI auto-categorises your dish",
    "Get a free health score",
    "Like and save recipes",
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg,#f0fdf4 0%,#dcfce7 40%,#f9fafb 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 860, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>

        {/* Left — features panel */}
        <div style={{ padding: "32px 24px" }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: "linear-gradient(135deg,#16a34a,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
              <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "#111827", lineHeight: 1.2, marginBottom: 12 }}>
            Join the cooking<br />
            <span style={{ color: "#16a34a" }}>community</span>
          </h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28, lineHeight: 1.7 }}>
            Share recipes, discover new dishes, and let our AI analyse your ingredients — completely free.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 20, padding: "36px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#16a34a,#22c55e,#4ade80)" }} />

          <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111827", marginBottom: 6 }}>Create account</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>It's free, always.</p>

          {error && (
            <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 10, padding: "11px 14px", fontSize: 13, marginBottom: 20, fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Your name</label>
              <input style={inp} type="text" placeholder="Gordon Ramsay" required
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#22c55e")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Email address</label>
              <input style={inp} type="email" placeholder="chef@example.com" required
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#22c55e")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
            <div style={{ marginBottom: 26 }}>
              <label style={lbl}>Password</label>
              <input style={inp} type="password" placeholder="Min 6 characters" required
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
              }}
            >
              {loading ? "Creating account..." : "Create free account"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9ca3af" }}>
            Already a member?{" "}
            <Link to="/login" style={{ color: "#16a34a", fontWeight: 700 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

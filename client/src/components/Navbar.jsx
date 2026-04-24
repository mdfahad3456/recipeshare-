import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) => pathname === path;

  const navLink = (path, label) => (
    <Link
      to={path}
      style={{
        fontSize: 14,
        fontWeight: isActive(path) ? 700 : 500,
        color: isActive(path) ? "#16a34a" : "#374151",
        padding: "4px 0",
        borderBottom: isActive(path) ? "2px solid #16a34a" : "2px solid transparent",
        transition: "all .15s",
        textDecoration: "none",
      }}
    >
      {label}
    </Link>
  );

  return (
    <nav
      style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "0 32px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 200,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Brand */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#16a34a,#22c55e)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
          </svg>
        </div>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#15803d", letterSpacing: "-.4px" }}>
          RecipeShare
        </span>
      </Link>

      {/* Nav links — only shown when logged in */}
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {navLink("/", "Browse")}
          {navLink("/add", "Add Recipe")}
          {navLink("/my-recipes", "My Recipes")}
        </div>
      )}

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user ? (
          <>
            {/* Avatar pill */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: 8,
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 24, padding: "5px 14px 5px 6px",
              }}
            >
              <div
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg,#16a34a,#22c55e)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff",
                }}
              >
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>
                {user.name}
              </span>
            </div>
            <button
              onClick={() => { logout(); navigate("/login"); }}
              style={{
                background: "#fee2e2", border: "1px solid #fca5a5",
                color: "#dc2626", fontSize: 12, fontWeight: 600,
                padding: "7px 16px", borderRadius: 8, cursor: "pointer",
              }}
            >
              Sign out
            </button>
          </>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/login">
              <button style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 8, cursor: "pointer" }}>
                Sign in
              </button>
            </Link>
            <Link to="/register">
              <button style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", border: "none", color: "#fff", fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 8, cursor: "pointer" }}>
                Get started
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

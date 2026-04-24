import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CATS = ["All", "Vegan", "Vegetarian", "Spicy", "Italian", "Asian", "Mexican", "Dessert", "Healthy", "Quick", "Breakfast"];

const EMOJI_MAP = {
  Vegan: "🥗", Vegetarian: "🥦", Spicy: "🌶️", Italian: "🍝",
  Asian: "🍜", Mexican: "🌮", Dessert: "🍰", Healthy: "🥑",
  Quick: "⚡", Breakfast: "🍳", General: "🍽️",
};

const SCORE_COLOR = (s) => {
  if (s >= 70) return { bg: "#dcfce7", text: "#15803d", border: "#bbf7d0" };
  if (s >= 40) return { bg: "#fef9c3", text: "#a16207", border: "#fde68a" };
  return { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" };
};

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("All");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchRecipes = async (q = "", cat = "All") => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.search = q;
      if (cat !== "All") params.category = cat;
      const { data } = await axios.get("http://localhost:5000/api/recipes", { params });
      setRecipes(data);
    } catch {
      setRecipes([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRecipes("", activeCat); }, [activeCat]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchRecipes(search, activeCat);
  };

  const handleLike = async (id, e) => {
    e.stopPropagation();
    if (!user) return navigate("/login");
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/recipes/${id}/like`, {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setRecipes((prev) => prev.map((r) => r._id === id ? { ...r, likes: data.likes } : r));
    } catch { /* silent */ }
  };

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh" }}>

      {/* ── Hero banner ────────────────────────────────── */}
      <div style={{ background: "linear-gradient(135deg,#14532d 0%,#16a34a 55%,#22c55e 100%)", padding: "60px 32px 48px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 12, fontWeight: 600, padding: "5px 16px", borderRadius: 20, marginBottom: 18 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "pulse 2s infinite" }} />
          AI-powered recipe platform
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: "#fff", lineHeight: 1.1, marginBottom: 14 }}>
          Discover & share<br />
          <span style={{ color: "#bbf7d0" }}>amazing recipes</span>
        </h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 32, maxWidth: 480, margin: "0 auto 32px" }}>
          Our built-in AI categorises your recipes, calculates health scores, and suggests names — no API key needed
        </p>
        <button onClick={() => navigate("/add")} style={{ background: "#fff", color: "#16a34a", border: "none", borderRadius: 12, padding: "13px 32px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          + Share your recipe
        </button>

        {/* Search bar — floats over hero */}
        <form onSubmit={handleSearch} style={{ maxWidth: 620, margin: "32px auto 0", display: "flex", gap: 0, background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <div style={{ display: "flex", alignItems: "center", paddingLeft: 18 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes or ingredients..."
            style={{ flex: 1, border: "none", outline: "none", padding: "14px 16px", fontSize: 14, color: "#111827", background: "transparent" }}
          />
          <button type="submit" style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", border: "none", padding: "0 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Search
          </button>
        </form>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── Category pills ─────────────────────────── */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          {CATS.map((c) => (
            <button
              key={c} onClick={() => setActiveCat(c)}
              style={{
                background: activeCat === c ? "linear-gradient(135deg,#16a34a,#22c55e)" : "#fff",
                color: activeCat === c ? "#fff" : "#374151",
                border: activeCat === c ? "none" : "1px solid #e5e7eb",
                borderRadius: 22, padding: "8px 18px",
                fontSize: 13, fontWeight: activeCat === c ? 700 : 500,
                cursor: "pointer", transition: "all .15s",
              }}
            >
              {EMOJI_MAP[c] ? `${EMOJI_MAP[c]} ` : ""}{c}
            </button>
          ))}
        </div>

        {/* ── Recipe grid ────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 44, height: 44, border: "4px solid #dcfce7", borderTop: "4px solid #16a34a", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
            <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🍽️</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#374151", marginBottom: 8 }}>No recipes found</h3>
            <p style={{ color: "#9ca3af", marginBottom: 24 }}>Be the first to share a recipe!</p>
            <button onClick={() => navigate("/add")} style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Add first recipe
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20, fontWeight: 500 }}>
              {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} found
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 22, marginBottom: 48 }}>
              {recipes.map((r) => {
                const sc = SCORE_COLOR(r.aiScore || 0);
                const cat = r.aiCategory || r.category || "General";
                return (
                  <div
                    key={r._id}
                    onClick={() => navigate(`/recipe/${r._id}`)}
                    style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", overflow: "hidden", cursor: "pointer", transition: "transform .15s, box-shadow .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(22,163,74,0.12)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {/* Card image area */}
                    <div style={{ height: 130, background: "linear-gradient(135deg,#dcfce7,#bbf7d0,#d1fae5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 52, position: "relative" }}>
                      {EMOJI_MAP[cat] || "🍽️"}
                      {r.aiScore > 0 && (
                        <div style={{ position: "absolute", top: 10, right: 10, background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>
                          ♥ {r.aiScore}
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div style={{ padding: "16px 18px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1.35, flex: 1 }}>{r.title}</h3>
                        <button
                          onClick={(e) => handleLike(r._id, e)}
                          style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "#d97706", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                          ♥ {r.likes}
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "#6b7280" }}>⏱ {r.cookTime}</span>
                        <span style={{ fontSize: 12, color: "#6b7280" }}>👤 {r.servings} servings</span>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>by {r.authorName}</span>
                      </div>

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {cat && cat !== "General" && (
                          <span style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                            {EMOJI_MAP[cat]} {cat}
                          </span>
                        )}
                        {r.aiSuggested && (
                          <span style={{ background: "#fef9c3", border: "1px solid #fde68a", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>
                            ✦ AI named
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.35} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

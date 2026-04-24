import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const EMOJI_MAP = { Vegan:"🥗",Vegetarian:"🥦",Spicy:"🌶️",Italian:"🍝",Asian:"🍜",Mexican:"🌮",Dessert:"🍰",Healthy:"🥑",Quick:"⚡",Breakfast:"🍳",General:"🍽️" };

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/recipes/user/mine", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then(({ data }) => { setRecipes(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this recipe? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await axios.delete(`http://localhost:5000/api/recipes/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert("Failed to delete recipe.");
    }
    setDeleting(null);
  };

  const totalLikes = recipes.reduce((sum, r) => sum + (r.likes || 0), 0);

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", marginBottom: 4 }}>My recipes</h1>
            <p style={{ fontSize: 14, color: "#6b7280" }}>All recipes you've published</p>
          </div>
          <button
            onClick={() => navigate("/add")}
            style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", border: "none", borderRadius: 10, padding: "11px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            + Add recipe
          </button>
        </div>

        {/* Stats row */}
        {!loading && recipes.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
            {[
              ["Recipes published", recipes.length],
              ["Total likes received", totalLikes],
              ["AI-analysed recipes", recipes.filter((r) => r.aiScore > 0).length],
            ].map(([label, val], i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: "18px 20px" }}>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#16a34a" }}>{val}</div>
              </div>
            ))}
          </div>
        )}

        {/* Recipe list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: 40, height: 40, border: "4px solid #dcfce7", borderTop: "4px solid #16a34a", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
            <p style={{ color: "#9ca3af" }}>Loading your recipes...</p>
          </div>
        ) : recipes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>👨‍🍳</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#374151", marginBottom: 8 }}>No recipes yet</h3>
            <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>Share your cooking knowledge with the community</p>
            <button
              onClick={() => navigate("/add")}
              style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Add first recipe
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {recipes.map((r) => {
              const cat = r.aiCategory || r.category || "General";
              const scoreColor = r.aiScore >= 70 ? "#15803d" : r.aiScore >= 40 ? "#a16207" : "#6b7280";
              const scoreBg = r.aiScore >= 70 ? "#dcfce7" : r.aiScore >= 40 ? "#fef9c3" : "#f3f4f6";
              return (
                <div key={r._id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Emoji block */}
                  <div style={{ width: 60, height: 60, borderRadius: 14, background: "linear-gradient(135deg,#dcfce7,#bbf7d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                    {EMOJI_MAP[cat] || "🍽️"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.title}
                    </h3>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#6b7280" }}>⏱ {r.cookTime}</span>
                      <span style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>♥ {r.likes} likes</span>
                      {r.aiScore > 0 && (
                        <span style={{ background: scoreBg, color: scoreColor, fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>
                          Health {r.aiScore}/100
                        </span>
                      )}
                      {cat && cat !== "General" && (
                        <span style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>
                          {EMOJI_MAP[cat]} {cat}
                        </span>
                      )}
                      {r.aiSuggested && (
                        <span style={{ background: "#fef9c3", border: "1px solid #fde68a", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 20 }}>
                          ✦ AI named
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={() => navigate(`/recipe/${r._id}`)}
                      style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(r._id)}
                      disabled={deleting === r._id}
                      style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: deleting === r._id ? "not-allowed" : "pointer", opacity: deleting === r._id ? 0.6 : 1 }}
                    >
                      {deleting === r._id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const EMOJI_MAP = { Vegan:"🥗",Vegetarian:"🥦",Spicy:"🌶️",Italian:"🍝",Asian:"🍜",Mexican:"🌮",Dessert:"🍰",Healthy:"🥑",Quick:"⚡",Breakfast:"🍳",General:"🍽️" };

export default function RecipeDetail() {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/recipes/${id}`).then(({ data }) => {
      setRecipe(data);
      if (user) setLiked(data.likedBy?.map(String).includes(String(user.id)));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    if (!user) return navigate("/login");
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/recipes/${id}/like`, {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setRecipe((r) => ({ ...r, likes: data.likes }));
      setLiked(data.liked);
    } catch { /* silent */ }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ width: 44, height: 44, border: "4px solid #dcfce7", borderTop: "4px solid #16a34a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!recipe) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p style={{ color: "#9ca3af", fontSize: 16 }}>Recipe not found.</p>
      <button onClick={() => navigate("/")} style={{ marginTop: 16, background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Go home</button>
    </div>
  );

  const steps = recipe.steps?.split("\n").filter((s) => s.trim());
  const ingList = recipe.ingredients?.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const cat = recipe.aiCategory || recipe.category || "General";
  const scoreColor = recipe.aiScore >= 70 ? "#15803d" : recipe.aiScore >= 40 ? "#a16207" : "#b91c1c";
  const scoreBg = recipe.aiScore >= 70 ? "#dcfce7" : recipe.aiScore >= 40 ? "#fef9c3" : "#fee2e2";

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Back button */}
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#16a34a", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back to recipes
        </button>

        {/* Hero card */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb", overflow: "hidden", marginBottom: 20 }}>
          <div style={{ height: 200, background: "linear-gradient(135deg,#dcfce7,#bbf7d0,#d1fae5,#a7f3d0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>
            {EMOJI_MAP[cat] || "🍽️"}
          </div>
          <div style={{ padding: "28px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, color: "#111827", lineHeight: 1.2, marginBottom: 8 }}>{recipe.title}</h1>
                {recipe.description && <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{recipe.description}</p>}
              </div>
              <button
                onClick={handleLike}
                style={{
                  background: liked ? "#fef9c3" : "#f9fafb",
                  border: `2px solid ${liked ? "#f59e0b" : "#e5e7eb"}`,
                  borderRadius: 12, padding: "12px 20px",
                  fontSize: 15, fontWeight: 700,
                  color: liked ? "#d97706" : "#6b7280",
                  cursor: "pointer", flexShrink: 0,
                  transition: "all .15s",
                }}
              >
                {liked ? "♥" : "♡"} {recipe.likes}
              </button>
            </div>

            {/* Meta pills */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              {[["⏱", recipe.cookTime], ["👤", `${recipe.servings} servings`], ["👨‍🍳", recipe.authorName]].map(([icon, val], i) => (
                <span key={i} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 500, color: "#374151" }}>
                  {icon} {val}
                </span>
              ))}
              {recipe.aiScore > 0 && (
                <span style={{ background: scoreBg, border: `1px solid ${scoreBg === "#dcfce7" ? "#bbf7d0" : scoreBg === "#fef9c3" ? "#fde68a" : "#fca5a5"}`, borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 700, color: scoreColor }}>
                  Health {recipe.aiScore}/100
                </span>
              )}
              {cat && cat !== "General" && (
                <span style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 700, color: "#15803d" }}>
                  {EMOJI_MAP[cat]} {cat}
                </span>
              )}
              {recipe.aiSuggested && (
                <span style={{ background: "#fef9c3", border: "1px solid #fde68a", borderRadius: 8, padding: "7px 14px", fontSize: 13, fontWeight: 700, color: "#92400e" }}>
                  ✦ AI named
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb", padding: "28px", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 18 }}>Ingredients</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {ingList.map((ing, i) => (
              <span key={i} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 22, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#15803d" }}>
                {ing}
              </span>
            ))}
          </div>
        </div>

        {/* Cooking steps */}
        <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e5e7eb", padding: "28px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", marginBottom: 22 }}>Cooking steps</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#16a34a,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, paddingTop: 8, fontSize: 15, color: "#374151", lineHeight: 1.7 }}>
                  {step.replace(/^\d+\.\s*/, "")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CATS = ["General", "Italian", "Asian", "Mexican", "Vegan", "Vegetarian", "Healthy", "Spicy", "Quick", "Dessert", "Breakfast"];

export default function AddRecipe() {
  const [form, setForm] = useState({
    title: "", description: "", ingredients: "",
    steps: "", cookTime: "30 mins", servings: "4", category: "General",
  });
  const [ai, setAi] = useState(null);      // { category, healthScore, suggestedName }
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usedAiName, setUsedAiName] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const inp = {
    width: "100%", background: "#f9fafb",
    border: "1px solid #e5e7eb", borderRadius: 10,
    padding: "11px 14px", fontSize: 14,
    color: "#111827", outline: "none",
  };
  const lbl = {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#6b7280", textTransform: "uppercase",
    letterSpacing: ".05em", marginBottom: 7,
  };

  const runAI = async () => {
    if (!form.ingredients.trim()) {
      alert("Please enter at least one ingredient first.");
      return;
    }
    setAiLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/ai/analyse",
        { ingredients: form.ingredients, title: form.title },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setAi(data);
      // Auto-apply the AI category
      setForm((f) => ({ ...f, category: data.category }));
    } catch {
      alert("AI analysis failed. Make sure the server is running.");
    }
    setAiLoading(false);
  };

  const applyAiName = () => {
    if (!ai?.suggestedName) return;
    setForm((f) => ({ ...f, title: ai.suggestedName }));
    setUsedAiName(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert("Please enter a recipe title.");
    if (!form.ingredients.trim()) return alert("Please enter ingredients.");
    if (!form.steps.trim()) return alert("Please enter cooking steps.");
    setSaving(true);
    try {
      await axios.post(
        "http://localhost:5000/api/recipes",
        {
          ...form,
          aiCategory: ai?.category || form.category,
          aiScore: ai?.healthScore || 0,
          aiSuggested: usedAiName,
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate("/");
    } catch {
      alert("Failed to save recipe. Please try again.");
    }
    setSaving(false);
  };

  const scoreColor = (s) => {
    if (s >= 70) return "#15803d";
    if (s >= 40) return "#a16207";
    return "#b91c1c";
  };
  const scoreBg = (s) => {
    if (s >= 70) return "#dcfce7";
    if (s >= 40) return "#fef9c3";
    return "#fee2e2";
  };

  return (
    <div style={{ background: "#f9fafb", minHeight: "100vh", padding: "32px 24px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: "#16a34a", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Back to browse
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", marginBottom: 6 }}>Add new recipe</h1>
          <p style={{ fontSize: 14, color: "#6b7280" }}>Fill in your details, then run the free AI analyser to get a category, health score and name suggestion.</p>
        </div>

        {/* ── Recipe details card ─────────────────────── */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", padding: "28px", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 22, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: 8, background: "#dcfce7", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </span>
            Recipe details
          </h2>

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Recipe title *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inp, flex: 1 }} type="text" placeholder="e.g. Spicy Tomato Pasta"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#22c55e")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
              {ai?.suggestedName && !usedAiName && (
                <button onClick={applyAiName} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d", borderRadius: 10, padding: "0 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Use AI name
                </button>
              )}
            </div>
            {ai?.suggestedName && (
              <p style={{ fontSize: 12, color: "#16a34a", marginTop: 6, fontWeight: 500 }}>
                ✦ AI suggestion: <em>"{ai.suggestedName}"</em>
              </p>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Short description</label>
            <input style={inp} type="text" placeholder="A quick sentence about this dish"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              onFocus={(e) => (e.target.style.borderColor = "#22c55e")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>
            <div>
              <label style={lbl}>Cook time</label>
              <input style={inp} type="text" value={form.cookTime}
                onChange={(e) => setForm({ ...form, cookTime: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#22c55e")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
            <div>
              <label style={lbl}>Servings</label>
              <input style={inp} type="text" value={form.servings}
                onChange={(e) => setForm({ ...form, servings: e.target.value })}
                onFocus={(e) => (e.target.style.borderColor = "#22c55e")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
            <div>
              <label style={lbl}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ ...inp, cursor: "pointer" }}>
                {CATS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 4 }}>
            <label style={lbl}>Ingredients * (one per line or comma-separated)</label>
            <textarea
              value={form.ingredients}
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
              placeholder={"e.g.\nChicken breast, 500g\nGarlic, 3 cloves\nOlive oil, 2 tbsp\nLemon juice"}
              style={{ ...inp, height: 110, resize: "vertical" }}
              onFocus={(e) => (e.target.style.borderColor = "#22c55e")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>
        </div>

        {/* ── AI Analysis card ───────────────────────── */}
        <div style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", border: "2px solid #bbf7d0", borderRadius: 18, padding: "24px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#16a34a,#22c55e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#14532d" }}>Free AI Analyser</div>
              <div style={{ fontSize: 12, color: "#16a34a" }}>No API key • Works offline • 100% free forever</div>
            </div>
          </div>

          <button
            onClick={runAI} disabled={aiLoading}
            style={{
              width: "100%", padding: "13px",
              background: aiLoading ? "#bbf7d0" : "linear-gradient(135deg,#16a34a,#22c55e)",
              color: aiLoading ? "#16a34a" : "#fff",
              border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 700,
              cursor: aiLoading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {aiLoading ? (
              <>
                <div style={{ width: 16, height: 16, border: "2px solid #86efac", borderTop: "2px solid #16a34a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Analysing ingredients...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Analyse ingredients with AI
              </>
            )}
          </button>

          {/* AI results */}
          {ai && (
            <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #bbf7d0", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Category</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#15803d" }}>{ai.category}</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #bbf7d0", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Health score</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: scoreColor(ai.healthScore) }}>
                  {ai.healthScore}
                  <span style={{ fontSize: 13, fontWeight: 500, color: "#9ca3af" }}>/100</span>
                </div>
                <div style={{ height: 4, background: "#e5e7eb", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
                  <div style={{ height: "100%", width: `${ai.healthScore}%`, background: scoreBg(ai.healthScore) === "#dcfce7" ? "#22c55e" : scoreBg(ai.healthScore) === "#fef9c3" ? "#f59e0b" : "#ef4444", borderRadius: 2, transition: "width .8s ease" }} />
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #bbf7d0", padding: "14px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Name idea</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", lineHeight: 1.3 }}>{ai.suggestedName}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Steps card ─────────────────────────────── */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e5e7eb", padding: "28px", marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827", marginBottom: 16 }}>Cooking steps *</h2>
          <textarea
            value={form.steps}
            onChange={(e) => setForm({ ...form, steps: e.target.value })}
            placeholder={"Write your steps:\n1. Boil pasta in salted water for 10 minutes\n2. Sauté garlic in olive oil until golden\n3. Mix pasta with sauce and serve hot"}
            style={{ ...inp, height: 160, resize: "vertical" }}
            onFocus={(e) => (e.target.style.borderColor = "#22c55e")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
        </div>

        {/* ── Action buttons ─────────────────────────── */}
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/")} style={{ flex: 1, padding: "14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: "14px", background: saving ? "#bbf7d0" : "linear-gradient(135deg,#16a34a,#22c55e)", color: saving ? "#16a34a" : "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving recipe..." : "Publish recipe"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

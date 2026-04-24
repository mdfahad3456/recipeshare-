const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const recipeRoutes = require("./routes/recipes");
const aiRoutes = require("./routes/ai");

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => res.json({ message: "RecipeShare API running ✅" }));

app.listen(process.env.PORT || 5000, () =>
  console.log(`✅ Server on http://localhost:${process.env.PORT || 5000}`)
);

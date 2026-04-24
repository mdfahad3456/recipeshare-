const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    ingredients: { type: String, required: true },
    steps: { type: String, required: true },
    cookTime: { type: String, default: "30 mins" },
    servings: { type: String, default: "4" },
    category: { type: String, default: "General" },
    aiCategory: { type: String, default: "" },
    aiScore: { type: Number, default: 0 },
    aiSuggested: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recipe", RecipeSchema);

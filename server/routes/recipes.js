const express = require("express");
const Recipe = require("../models/Recipe");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// GET all recipes (with optional search + category filter)
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { ingredients: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "All") {
      query.$or = query.$or
        ? [...query.$or, { aiCategory: category }, { category }]
        : [{ aiCategory: category }, { category }];
    }
    const recipes = await Recipe.find(query).sort({ createdAt: -1 });
    res.json(recipes);
  } catch {
    res.status(500).json({ message: "Failed to fetch recipes" });
  }
});

// GET single recipe
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(recipe);
  } catch {
    res.status(500).json({ message: "Failed to fetch recipe" });
  }
});

// GET my recipes
router.get("/user/mine", auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.user.id }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch {
    res.status(500).json({ message: "Failed to fetch your recipes" });
  }
});

// POST create recipe
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, ingredients, steps, cookTime, servings, category, aiCategory, aiScore, aiSuggested } = req.body;
    if (!title || !ingredients || !steps)
      return res.status(400).json({ message: "Title, ingredients and steps are required" });
    const recipe = await Recipe.create({
      title, description, ingredients, steps,
      cookTime, servings, category,
      aiCategory: aiCategory || "",
      aiScore: aiScore || 0,
      aiSuggested: aiSuggested || false,
      author: req.user.id,
      authorName: req.user.name,
    });
    res.status(201).json(recipe);
  } catch {
    res.status(500).json({ message: "Failed to create recipe" });
  }
});

// PUT like / unlike
router.put("/:id/like", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    const already = recipe.likedBy.map(String).includes(String(req.user.id));
    if (already) {
      recipe.likedBy = recipe.likedBy.filter((id) => String(id) !== String(req.user.id));
      recipe.likes = Math.max(0, recipe.likes - 1);
    } else {
      recipe.likedBy.push(req.user.id);
      recipe.likes += 1;
    }
    await recipe.save();
    res.json({ likes: recipe.likes, liked: !already });
  } catch {
    res.status(500).json({ message: "Failed to update like" });
  }
});

// DELETE recipe
router.delete("/:id", auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    if (String(recipe.author) !== String(req.user.id))
      return res.status(403).json({ message: "You can only delete your own recipes" });
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "Recipe deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete recipe" });
  }
});

module.exports = router;

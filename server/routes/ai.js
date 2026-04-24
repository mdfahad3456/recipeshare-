const express = require("express");
const auth = require("../middleware/authMiddleware");
const router = express.Router();

// ─── BUILT-IN AI ENGINE ───────────────────────────────────────────────────────
// 100% free. No OpenAI. No Gemini. No API key. Works completely offline.
// Uses keyword-based ingredient analysis to:
//  1. Auto-categorise the recipe (Vegan, Spicy, Dessert, etc.)
//  2. Suggest a recipe name based on key ingredients
//  3. Calculate a health score (0–100)
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_RULES = [
  {
    name: "Vegan",
    keywords: ["tofu", "lentil", "chickpea", "tempeh", "seitan", "soy milk", "almond milk", "oat milk", "vegan", "plant-based", "quinoa", "edamame", "nutritional yeast"],
    excludes: ["chicken", "beef", "pork", "lamb", "fish", "salmon", "tuna", "shrimp", "egg", "milk", "cheese", "butter", "cream", "yogurt", "bacon", "sausage", "meat"],
  },
  {
    name: "Vegetarian",
    keywords: ["mushroom", "spinach", "broccoli", "cauliflower", "paneer", "tofu", "lentil", "chickpea", "bean", "pepper", "zucchini", "aubergine", "eggplant"],
    excludes: ["chicken", "beef", "pork", "lamb", "fish", "salmon", "tuna", "shrimp", "bacon", "sausage"],
  },
  {
    name: "Dessert",
    keywords: ["sugar", "chocolate", "cake", "cookie", "cream", "vanilla", "honey", "caramel", "brownie", "muffin", "pastry", "icing", "frosting", "custard", "pudding", "tart", "pie", "whipped cream", "condensed milk"],
    excludes: [],
  },
  {
    name: "Spicy",
    keywords: ["chilli", "chili", "jalapeño", "jalapeno", "cayenne", "hot sauce", "sriracha", "habanero", "chipotle", "red pepper flakes", "ghost pepper", "scotch bonnet", "paprika", "wasabi", "gochujang"],
    excludes: [],
  },
  {
    name: "Healthy",
    keywords: ["kale", "spinach", "quinoa", "avocado", "salmon", "broccoli", "blueberry", "oats", "flaxseed", "chia seed", "sweet potato", "greek yogurt", "almonds", "walnuts", "olive oil", "turmeric", "ginger", "lemon", "garlic"],
    excludes: ["deep fry", "deep-fry", "fried", "sugar", "butter", "cream", "bacon"],
  },
  {
    name: "Quick",
    keywords: ["quick", "easy", "simple", "fast", "microwave", "instant", "ready", "5 minute", "10 minute", "15 minute", "no-cook", "no cook", "salad", "sandwich", "wrap", "smoothie"],
    excludes: [],
  },
  {
    name: "Italian",
    keywords: ["pasta", "spaghetti", "penne", "fettuccine", "rigatoni", "lasagna", "risotto", "pizza", "basil", "oregano", "mozzarella", "parmesan", "prosciutto", "pancetta", "marinara", "arrabbiata", "carbonara", "bolognese", "pesto"],
    excludes: [],
  },
  {
    name: "Asian",
    keywords: ["soy sauce", "sesame", "ginger", "bok choy", "noodle", "ramen", "udon", "soba", "miso", "dashi", "rice vinegar", "hoisin", "oyster sauce", "fish sauce", "lemongrass", "galangal", "pad thai", "curry paste", "coconut milk", "sriracha", "wonton", "dumpling"],
    excludes: [],
  },
  {
    name: "Mexican",
    keywords: ["tortilla", "salsa", "guacamole", "avocado", "cilantro", "cumin", "lime", "jalapeño", "beans", "corn", "taco", "burrito", "enchilada", "quesadilla", "chipotle", "coriander", "chilli"],
    excludes: [],
  },
  {
    name: "Breakfast",
    keywords: ["egg", "bacon", "oats", "oatmeal", "pancake", "waffle", "toast", "cereal", "granola", "yogurt", "orange juice", "coffee", "maple syrup", "sausage", "hash brown", "omelet", "omelette", "french toast"],
    excludes: [],
  },
];

const HEALTH_KEYWORDS = {
  good: ["spinach", "kale", "broccoli", "salmon", "quinoa", "avocado", "blueberry", "oats", "lemon", "garlic", "ginger", "turmeric", "olive oil", "almond", "walnut", "chia", "flax", "sweet potato", "tomato", "carrot", "beetroot", "cucumber", "celery"],
  bad: ["sugar", "butter", "cream", "bacon", "fried", "deep fry", "chocolate", "cake", "cookie", "oil", "salt", "lard", "margarine", "corn syrup", "white flour"],
};

const NAME_TEMPLATES = {
  Italian: ["Classic ${main} Pasta", "Homemade ${main} Risotto", "Fresh ${main} with Herbs"],
  Asian: ["Stir-fried ${main} Noodles", "Asian ${main} Bowl", "Crispy ${main} Delight"],
  Mexican: ["Spicy ${main} Tacos", "Fresh ${main} Burrito Bowl", "Zesty ${main} Wrap"],
  Dessert: ["Decadent ${main} Delight", "Sweet ${main} Surprise", "Homemade ${main} Treat"],
  Healthy: ["Nutritious ${main} Salad", "Clean ${main} Bowl", "Fresh ${main} Power Bowl"],
  Spicy: ["Fiery ${main} Stir-fry", "Bold ${main} Curry", "Hot & Spicy ${main}"],
  Vegan: ["Plant-based ${main} Bowl", "Wholesome ${main} Stew", "Fresh ${main} Plate"],
  Breakfast: ["Morning ${main} Stack", "Breakfast ${main} Special", "Golden ${main} Start"],
  General: ["Homemade ${main} Dish", "Classic ${main} Recipe", "Chef's ${main} Special"],
};

function analyseIngredients(ingredients, title) {
  const text = (ingredients + " " + (title || "")).toLowerCase();

  // 1. Find best category
  let bestCategory = "General";
  let bestScore = 0;
  for (const rule of CATEGORY_RULES) {
    const hasExclude = rule.excludes.some((ex) => text.includes(ex));
    if (hasExclude) continue;
    const matchCount = rule.keywords.filter((kw) => text.includes(kw)).length;
    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestCategory = rule.name;
    }
  }

  // 2. Health score (0–100)
  const goodCount = HEALTH_KEYWORDS.good.filter((k) => text.includes(k)).length;
  const badCount = HEALTH_KEYWORDS.bad.filter((k) => text.includes(k)).length;
  const rawScore = Math.min(100, Math.max(0, goodCount * 12 - badCount * 10 + 30));
  const healthScore = Math.round(rawScore);

  // 3. Suggest a name from main ingredient
  const ingList = ingredients
    .split(/[,\n]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  // pick the most "interesting" ingredient (skip generic ones)
  const generic = ["salt", "pepper", "water", "oil", "flour", "sugar", "butter", "garlic", "onion", "egg", "eggs"];
  const mainIng = ingList.find((i) => !generic.some((g) => i.includes(g))) || ingList[0] || "mixed";
  const mainWord = mainIng.split(" ").slice(-1)[0]; // last word, e.g. "chicken" from "boneless chicken"
  const capitalMain = mainWord.charAt(0).toUpperCase() + mainWord.slice(1);

  const templates = NAME_TEMPLATES[bestCategory] || NAME_TEMPLATES.General;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const suggestedName = template.replace("${main}", capitalMain);

  return { category: bestCategory, healthScore, suggestedName };
}

// POST /api/ai/analyse
router.post("/analyse", auth, (req, res) => {
  try {
    const { ingredients, title } = req.body;
    if (!ingredients || ingredients.trim() === "") {
      return res.status(400).json({ message: "Ingredients are required" });
    }
    const result = analyseIngredients(ingredients, title);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "AI analysis failed", error: err.message });
  }
});

module.exports = router;

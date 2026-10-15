type CalorieStatus = "calculated" | "estimated" | "needs_details";

export interface CalorieEstimate {
  status: CalorieStatus;
  calories: number | null;
  range: [number, number] | null;
  feedback: string;
}

interface FoodItem {
  name: string;
  cal: number;
  protein: number;
  carbs: number;
  fat: number;
  aliases?: string[];
  servingGrams?: number;
}

const FOODS: FoodItem[] = [
  { name: "White Rice (cooked)", cal: 130, protein: 2.7, carbs: 28, fat: 0.3, aliases: ["white rice", "rice"], servingGrams: 150 },
  { name: "Brown Rice (cooked)", cal: 111, protein: 2.6, carbs: 23, fat: 0.9, aliases: ["brown rice"], servingGrams: 150 },
  { name: "Chicken Breast (cooked)", cal: 165, protein: 31, carbs: 0, fat: 3.6, aliases: ["chicken breast", "chicken"], servingGrams: 120 },
  { name: "Chicken Thigh (cooked)", cal: 209, protein: 26, carbs: 0, fat: 11, aliases: ["chicken thigh"], servingGrams: 120 },
  { name: "Egg (whole)", cal: 155, protein: 13, carbs: 1.1, fat: 11, aliases: ["egg", "eggs", "whole egg"], servingGrams: 50 },
  { name: "Egg White", cal: 52, protein: 11, carbs: 0.7, fat: 0.2, aliases: ["egg white", "egg whites"], servingGrams: 33 },
  { name: "Whole Milk", cal: 61, protein: 3.2, carbs: 4.8, fat: 3.3, aliases: ["whole milk", "milk"], servingGrams: 244 },
  { name: "Banana", cal: 89, protein: 1.1, carbs: 23, fat: 0.3, aliases: ["banana", "bananas"], servingGrams: 118 },
  { name: "Apple", cal: 52, protein: 0.3, carbs: 14, fat: 0.2, aliases: ["apple", "apples"], servingGrams: 182 },
  { name: "Oats (dry)", cal: 389, protein: 17, carbs: 66, fat: 7, aliases: ["oats", "oatmeal"], servingGrams: 40 },
  { name: "Pasta (cooked)", cal: 131, protein: 5, carbs: 25, fat: 1.1, aliases: ["pasta"], servingGrams: 140 },
  { name: "Potato (boiled)", cal: 87, protein: 1.9, carbs: 20, fat: 0.1, aliases: ["potato", "boiled potato"], servingGrams: 150 },
  { name: "Lentils (cooked)", cal: 116, protein: 9, carbs: 20, fat: 0.4, aliases: ["lentils", "lentil"], servingGrams: 150 },
  { name: "Paneer", cal: 265, protein: 18, carbs: 1.2, fat: 20, aliases: ["paneer"], servingGrams: 100 },
  { name: "Chapati / Roti", cal: 297, protein: 8.5, carbs: 55, fat: 4.5, aliases: ["chapati", "roti"], servingGrams: 40 },
  { name: "Dal (cooked)", cal: 120, protein: 8, carbs: 20, fat: 1.5, aliases: ["dal", "daal"], servingGrams: 150 },
  { name: "Idli", cal: 39, protein: 1.9, carbs: 8, fat: 0.2, aliases: ["idli", "idlis"], servingGrams: 40 },
  { name: "Dosa (plain)", cal: 168, protein: 3.9, carbs: 27, fat: 5.4, aliases: ["dosa"], servingGrams: 100 },
  { name: "Almonds", cal: 579, protein: 21, carbs: 22, fat: 50, aliases: ["almonds", "almond"], servingGrams: 28 },
  { name: "Avocado", cal: 160, protein: 2, carbs: 9, fat: 15, aliases: ["avocado"], servingGrams: 100 },
  { name: "Greek Yogurt (plain)", cal: 59, protein: 10, carbs: 3.6, fat: 0.4, aliases: ["greek yogurt"], servingGrams: 170 },
  { name: "Salmon (cooked)", cal: 208, protein: 20, carbs: 0, fat: 13, aliases: ["salmon"], servingGrams: 120 },
  { name: "Broccoli", cal: 34, protein: 2.8, carbs: 7, fat: 0.4, aliases: ["broccoli"], servingGrams: 90 },
  { name: "Olive Oil", cal: 884, protein: 0, carbs: 0, fat: 100, aliases: ["olive oil"], servingGrams: 14 },
  { name: "Peanut Butter", cal: 588, protein: 25, carbs: 20, fat: 50, aliases: ["peanut butter"], servingGrams: 32 },
  { name: "Whole Wheat Bread", cal: 247, protein: 13, carbs: 41, fat: 3.4, aliases: ["whole wheat bread"], servingGrams: 30 },
  { name: "White Bread", cal: 265, protein: 9, carbs: 49, fat: 3.2, aliases: ["white bread", "bread", "toast"], servingGrams: 30 },
  { name: "Bajra (Pearl Millet, dry)", cal: 378, protein: 11, carbs: 73, fat: 5, aliases: ["bajra", "pearl millet"], servingGrams: 50 },
  { name: "Jowar (Sorghum, dry)", cal: 349, protein: 11, carbs: 72, fat: 3.3, aliases: ["jowar", "sorghum"], servingGrams: 50 },
  { name: "Ragi / Finger Millet (dry)", cal: 336, protein: 7.3, carbs: 72, fat: 1.9, aliases: ["ragi", "finger millet"], servingGrams: 50 },
  { name: "Poha (flattened rice)", cal: 110, protein: 2.5, carbs: 23, fat: 0.5, aliases: ["poha"], servingGrams: 150 },
  { name: "Upma (cooked)", cal: 150, protein: 3.5, carbs: 25, fat: 4.5, aliases: ["upma"], servingGrams: 150 },
  { name: "Quinoa (cooked)", cal: 120, protein: 4.4, carbs: 21, fat: 1.9, aliases: ["quinoa"], servingGrams: 150 },
  { name: "Corn / Maize (boiled)", cal: 96, protein: 3.4, carbs: 21, fat: 1.5, aliases: ["corn", "maize"], servingGrams: 100 },
  { name: "Bread (multigrain)", cal: 250, protein: 12, carbs: 43, fat: 4, aliases: ["multigrain bread"], servingGrams: 30 },
  { name: "Rajma (cooked)", cal: 127, protein: 8.7, carbs: 22, fat: 0.5, aliases: ["rajma"], servingGrams: 150 },
  { name: "Chole / Chickpeas (cooked)", cal: 164, protein: 8.9, carbs: 27, fat: 2.6, aliases: ["chole", "chickpeas", "chickpea"], servingGrams: 150 },
  { name: "Moong Dal (cooked)", cal: 105, protein: 7, carbs: 19, fat: 0.4, aliases: ["moong dal"], servingGrams: 150 },
  { name: "Sambar (cooked)", cal: 55, protein: 3, carbs: 8, fat: 1.5, aliases: ["sambar"], servingGrams: 150 },
  { name: "Khichdi (cooked)", cal: 125, protein: 5, carbs: 22, fat: 2.5, aliases: ["khichdi"], servingGrams: 180 },
  { name: "Paratha (plain)", cal: 300, protein: 7, carbs: 45, fat: 10, aliases: ["paratha"], servingGrams: 80 },
  { name: "Puri", cal: 340, protein: 6.5, carbs: 44, fat: 16, aliases: ["puri", "poori"], servingGrams: 40 },
  { name: "Curd / Dahi (full fat)", cal: 98, protein: 3.1, carbs: 3.4, fat: 4.3, aliases: ["curd", "dahi"], servingGrams: 150 },
  { name: "Curd / Dahi (low fat)", cal: 63, protein: 5, carbs: 7, fat: 1.7, aliases: ["low fat curd", "low fat dahi"], servingGrams: 150 },
  { name: "Lassi (plain, salted)", cal: 70, protein: 3.5, carbs: 8, fat: 2.5, aliases: ["lassi"], servingGrams: 250 },
  { name: "Aloo Sabzi (potato curry)", cal: 110, protein: 2, carbs: 18, fat: 3.5, aliases: ["aloo sabzi", "potato curry"], servingGrams: 150 },
  { name: "Palak Paneer", cal: 180, protein: 9, carbs: 7, fat: 13, aliases: ["palak paneer"], servingGrams: 180 },
  { name: "Butter Chicken (gravy)", cal: 150, protein: 12, carbs: 6, fat: 9, aliases: ["butter chicken"], servingGrams: 200 },
  { name: "Tuna (canned in water)", cal: 116, protein: 26, carbs: 0, fat: 1, aliases: ["tuna"], servingGrams: 120 },
  { name: "Mutton / Lamb (cooked)", cal: 258, protein: 25, carbs: 0, fat: 17, aliases: ["mutton", "lamb"], servingGrams: 120 },
  { name: "Egg Yolk", cal: 322, protein: 16, carbs: 3.6, fat: 27, aliases: ["egg yolk", "yolk"], servingGrams: 17 },
  { name: "Prawns / Shrimp (cooked)", cal: 99, protein: 24, carbs: 0, fat: 0.3, aliases: ["prawns", "shrimp"], servingGrams: 100 },
  { name: "Rohu Fish (cooked)", cal: 97, protein: 17, carbs: 0, fat: 2.7, aliases: ["rohu"], servingGrams: 120 },
  { name: "Turkey Breast (cooked)", cal: 135, protein: 30, carbs: 0, fat: 1, aliases: ["turkey breast", "turkey"], servingGrams: 120 },
  { name: "Low-Fat Milk (toned)", cal: 42, protein: 3.5, carbs: 5, fat: 1.5, aliases: ["low fat milk", "toned milk"], servingGrams: 244 },
  { name: "Skimmed Milk", cal: 34, protein: 3.4, carbs: 4.9, fat: 0.1, aliases: ["skimmed milk", "skim milk"], servingGrams: 244 },
  { name: "Cottage Cheese (low fat)", cal: 72, protein: 12, carbs: 2.7, fat: 1, aliases: ["cottage cheese"], servingGrams: 100 },
  { name: "Whey Protein Powder", cal: 400, protein: 80, carbs: 8, fat: 5, aliases: ["whey", "protein powder", "protein shake"], servingGrams: 30 },
  { name: "Butter", cal: 717, protein: 0.9, carbs: 0.1, fat: 81, aliases: ["butter"], servingGrams: 14 },
  { name: "Ghee", cal: 900, protein: 0, carbs: 0, fat: 100, aliases: ["ghee"], servingGrams: 14 },
  { name: "Cheese (cheddar)", cal: 402, protein: 25, carbs: 1.3, fat: 33, aliases: ["cheese", "cheddar"], servingGrams: 30 },
  { name: "Soy Milk (unsweetened)", cal: 33, protein: 3.3, carbs: 1.8, fat: 1.8, aliases: ["soy milk"], servingGrams: 244 },
  { name: "Spinach (raw)", cal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, aliases: ["spinach"], servingGrams: 100 },
  { name: "Cauliflower", cal: 25, protein: 1.9, carbs: 5, fat: 0.3, aliases: ["cauliflower"], servingGrams: 100 },
  { name: "Cabbage", cal: 25, protein: 1.3, carbs: 6, fat: 0.1, aliases: ["cabbage"], servingGrams: 100 },
  { name: "Carrot (raw)", cal: 41, protein: 0.9, carbs: 10, fat: 0.2, aliases: ["carrot", "carrots"], servingGrams: 60 },
  { name: "Tomato (raw)", cal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, aliases: ["tomato", "tomatoes"], servingGrams: 120 },
  { name: "Onion (raw)", cal: 40, protein: 1.1, carbs: 9.3, fat: 0.1, aliases: ["onion", "onions"], servingGrams: 80 },
  { name: "Cucumber", cal: 15, protein: 0.7, carbs: 3.6, fat: 0.1, aliases: ["cucumber"], servingGrams: 100 },
  { name: "Beetroot (boiled)", cal: 44, protein: 1.7, carbs: 10, fat: 0.2, aliases: ["beetroot"], servingGrams: 100 },
  { name: "Sweet Potato (boiled)", cal: 90, protein: 2, carbs: 21, fat: 0.1, aliases: ["sweet potato"], servingGrams: 150 },
  { name: "Green Peas (cooked)", cal: 84, protein: 5.4, carbs: 15, fat: 0.4, aliases: ["green peas", "peas"], servingGrams: 100 },
  { name: "Mushroom (raw)", cal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, aliases: ["mushroom", "mushrooms"], servingGrams: 100 },
  { name: "Capsicum / Bell Pepper", cal: 31, protein: 1, carbs: 6, fat: 0.3, aliases: ["capsicum", "bell pepper"], servingGrams: 100 },
  { name: "Mango", cal: 60, protein: 0.8, carbs: 15, fat: 0.4, aliases: ["mango"], servingGrams: 200 },
  { name: "Papaya", cal: 43, protein: 0.5, carbs: 11, fat: 0.3, aliases: ["papaya"], servingGrams: 150 },
  { name: "Orange", cal: 47, protein: 0.9, carbs: 12, fat: 0.1, aliases: ["orange", "oranges"], servingGrams: 131 },
  { name: "Guava", cal: 68, protein: 2.6, carbs: 14, fat: 1, aliases: ["guava"], servingGrams: 100 },
  { name: "Watermelon", cal: 30, protein: 0.6, carbs: 7.6, fat: 0.2, aliases: ["watermelon"], servingGrams: 250 },
  { name: "Grapes", cal: 69, protein: 0.7, carbs: 18, fat: 0.2, aliases: ["grapes"], servingGrams: 100 },
  { name: "Pomegranate", cal: 83, protein: 1.7, carbs: 19, fat: 1.2, aliases: ["pomegranate"], servingGrams: 100 },
  { name: "Pineapple", cal: 50, protein: 0.5, carbs: 13, fat: 0.1, aliases: ["pineapple"], servingGrams: 150 },
  { name: "Strawberries", cal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, aliases: ["strawberries", "strawberry"], servingGrams: 150 },
  { name: "Walnuts", cal: 654, protein: 15, carbs: 14, fat: 65, aliases: ["walnuts", "walnut"], servingGrams: 28 },
  { name: "Cashews", cal: 553, protein: 18, carbs: 30, fat: 44, aliases: ["cashews", "cashew"], servingGrams: 28 },
  { name: "Peanuts (roasted)", cal: 567, protein: 26, carbs: 16, fat: 49, aliases: ["peanuts", "peanut"], servingGrams: 28 },
  { name: "Chia Seeds", cal: 486, protein: 17, carbs: 42, fat: 31, aliases: ["chia seeds", "chia"], servingGrams: 15 },
  { name: "Flaxseeds", cal: 534, protein: 18, carbs: 29, fat: 42, aliases: ["flaxseeds", "flax seeds"], servingGrams: 15 },
  { name: "Sunflower Seeds", cal: 584, protein: 21, carbs: 20, fat: 51, aliases: ["sunflower seeds"], servingGrams: 15 },
  { name: "Coconut Oil", cal: 862, protein: 0, carbs: 0, fat: 100, aliases: ["coconut oil"], servingGrams: 14 },
  { name: "Mustard Oil", cal: 884, protein: 0, carbs: 0, fat: 100, aliases: ["mustard oil"], servingGrams: 14 },
  { name: "Coconut Water", cal: 19, protein: 0.7, carbs: 3.7, fat: 0.2, aliases: ["coconut water"], servingGrams: 240 },
  { name: "Orange Juice (fresh)", cal: 45, protein: 0.7, carbs: 10, fat: 0.2, aliases: ["orange juice"], servingGrams: 240 },
  { name: "Honey", cal: 304, protein: 0.3, carbs: 82, fat: 0, aliases: ["honey"], servingGrams: 21 },
  { name: "Sugar (white)", cal: 387, protein: 0, carbs: 100, fat: 0, aliases: ["sugar"], servingGrams: 12 },
  { name: "Dark Chocolate (85%)", cal: 598, protein: 12, carbs: 46, fat: 43, aliases: ["dark chocolate", "chocolate"], servingGrams: 30 },
  { name: "Tofu (firm)", cal: 76, protein: 8, carbs: 2, fat: 4.3, aliases: ["tofu"], servingGrams: 100 },
];

const numberWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  half: 0.5,
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toNumber = (value: string | undefined) => {
  if (!value) return 1;
  return numberWords[value.toLowerCase()] ?? Number.parseFloat(value);
};

const getFoodNames = (food: FoodItem) => [food.name, ...(food.aliases ?? [])].sort((a, b) => b.length - a.length);

const findQuantityGrams = (text: string, food: FoodItem) => {
  const names = getFoodNames(food).map(escapeRegExp).join("|");
  const number = "(\\d+(?:\\.\\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|half)";
  const unit = "(g|gram|grams|kg|ml|cup|cups|bowl|bowls|plate|plates|slice|slices|piece|pieces|serving|servings|tbsp|tablespoon|spoon)";
  const before = new RegExp(`${number}\\s*${unit}?\\s*(?:of\\s+)?(?:${names})`, "i");
  const after = new RegExp(`(?:${names}).{0,18}?${number}\\s*${unit}`, "i");
  const match = text.match(before) ?? text.match(after);

  if (!match) return { grams: food.servingGrams ?? 100, exact: false };

  const amount = toNumber(match[1]);
  const unitValue = (match[2] ?? "serving").toLowerCase();
  const serving = food.servingGrams ?? 100;

  if (["g", "gram", "grams", "ml"].includes(unitValue)) return { grams: amount, exact: true };
  if (unitValue === "kg") return { grams: amount * 1000, exact: true };
  if (["cup", "cups", "bowl", "bowls"].includes(unitValue)) return { grams: amount * 150, exact: true };
  if (["plate", "plates"].includes(unitValue)) return { grams: amount * 250, exact: true };
  if (["tbsp", "tablespoon", "spoon"].includes(unitValue)) return { grams: amount * 15, exact: true };
  return { grams: amount * serving, exact: true };
};

export const estimateCaloriesFromFoodDetails = (details: string): CalorieEstimate => {
  const text = details.trim().toLowerCase();

  if (!text) {
    return {
      status: "needs_details",
      calories: null,
      range: null,
      feedback: "Add what you ate today so I can calculate calories from the food database.",
    };
  }

  const matches = FOODS.filter((food) =>
    getFoodNames(food).some((name) => new RegExp(`\\b${escapeRegExp(name.toLowerCase())}\\b`, "i").test(text))
  );

  if (matches.length === 0) {
    return {
      status: "needs_details",
      calories: null,
      range: null,
      feedback: "I need recognizable food names and portions, like 150g rice, 2 eggs, 100g chicken, or 1 bowl dal.",
    };
  }

  const portions = matches.map((food) => ({ food, ...findQuantityGrams(text, food) }));
  const calories = Math.round(portions.reduce((total, item) => total + (item.food.cal * item.grams) / 100, 0));
  const hasExactPortions = portions.every((item) => item.exact);
  const buffer = hasExactPortions ? 0.1 : 0.3;
  const range: [number, number] = [Math.max(20, Math.round(calories * (1 - buffer))), Math.round(calories * (1 + buffer))];
  const labels = portions.map((item) => item.food.name.replace(/\s*\([^)]*\)/g, "")).join(", ");

  return {
    status: hasExactPortions ? "calculated" : "estimated",
    calories,
    range,
    feedback: hasExactPortions
      ? `Calculated from database values per 100g for ${labels}.`
      : `Estimated from database values for ${labels} using common serving sizes. Add grams or pieces for a tighter result.`,
  };
};
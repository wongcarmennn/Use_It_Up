// Spoonacular API — https://spoonacular.com/food-api
const API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_API_KEY ?? '';
const BASE = 'https://api.spoonacular.com';

export interface RecipeSummary {
  id: number;
  title: string;
  image: string;
  usedIngredientCount: number;
  missedIngredientCount: number;
  usedIngredients: { name: string }[];
  missedIngredients: { name: string }[];
}

export interface RecipeDetail {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  extendedIngredients: {
    id: number;
    name: string;
    original: string;
    amount: number;
    unit: string;
  }[];
  analyzedInstructions: {
    steps: {
      number: number;
      step: string;
    }[];
  }[];
}

export const findRecipesByIngredients = async (
  ingredients: string[],
  number = 12
): Promise<RecipeSummary[]> => {
  const list = ingredients.join(',');
  const res = await fetch(
    `${BASE}/recipes/findByIngredients?ingredients=${encodeURIComponent(list)}&number=${number}&ranking=2&ignorePantry=true&apiKey=${API_KEY}`
  );
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  return res.json();
};

export const getRecipeDetail = async (id: number): Promise<RecipeDetail> => {
  const res = await fetch(
    `${BASE}/recipes/${id}/information?includeNutrition=false&apiKey=${API_KEY}`
  );
  if (!res.ok) throw new Error(`Spoonacular error: ${res.status}`);
  return res.json();
};

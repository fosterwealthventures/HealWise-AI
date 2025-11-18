import { ModuleType, RecipeResult, ApiResult } from '../types';

const API_BASE =
  import.meta.env.VITE_API_BASE ??
  (typeof window !== 'undefined' ? window.location.origin : '');
const GEMINI_ENDPOINT = `${API_BASE}/api/gemini/generate`;

type RecommendationResponse = ApiResult[];

interface RecommendationPayload {
  moduleType: ModuleType;
  input: string;
  restrictions: string;
  recipeType?: 'Juice' | 'Smoothie' | 'Tea';
  previousFoods?: string[];
}

interface RecipeVariationPayload {
  originalRecipe: RecipeResult;
  variationRequest: string;
  restrictions: string;
}

interface KidsExplainResponse {
  simplified: string;
}

async function postToGemini<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini API failed: ${response.status} ${message}`);
  }

  return response.json() as Promise<T>;
}

export async function generateRecommendation<T extends RecommendationResponse>(
  moduleType: ModuleType,
  input: string,
  restrictions: string,
  recipeType?: 'Juice' | 'Smoothie' | 'Tea',
  previousFoods?: string[],
): Promise<T> {
  const payload: RecommendationPayload = {
    operation: 'recommendation',
    moduleType,
    input,
    restrictions,
  };

  if (moduleType === ModuleType.Recipe && recipeType) {
    payload.recipeType = recipeType;
  }

  if (moduleType === ModuleType.Food && previousFoods && previousFoods.length) {
    payload.previousFoods = previousFoods;
  }

  return postToGemini<T>(payload);
}

export async function generateRecipeVariation(
  originalRecipe: RecipeResult,
  variationRequest: string,
  restrictions: string
): Promise<RecipeResult> {
  return postToGemini<RecipeResult>({
    operation: 'recipe-variation',
    originalRecipe,
    variationRequest,
    restrictions,
  });
}

export async function explainResultForKids(
  moduleType: ModuleType,
  content: string,
): Promise<string> {
  const response = await postToGemini<KidsExplainResponse>({
    operation: 'kids-explain',
    moduleType,
    content,
  });

  return response.simplified;
}

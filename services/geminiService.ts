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
}

interface RecipeVariationPayload {
  originalRecipe: RecipeResult;
  variationRequest: string;
  restrictions: string;
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
  recipeType?: 'Juice' | 'Smoothie' | 'Tea'
): Promise<T> {
  const payload: Record<string, unknown> = {
    operation: 'recommendation',
    moduleType,
    input,
    restrictions,
  };

  if (moduleType === ModuleType.Recipe && recipeType) {
    payload.recipeType = recipeType;
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

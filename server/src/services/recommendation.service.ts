import { ModuleType } from '../types/common';

interface RecommendationPayload {
  moduleType: ModuleType;
  input: string;
  restrictions?: string;
  recipeType?: 'Juice' | 'Smoothie' | 'Tea';
}

export const generateRecommendation = async ({
  moduleType,
  input,
  restrictions,
  recipeType,
}: RecommendationPayload) => {
  // TODO: Integrate Gemini or other LLM provider here.
  return {
    moduleType,
    input,
    restrictions: restrictions ?? null,
    recipeType: recipeType ?? null,
    results: [
      {
        title: 'Sample recommendation',
        description: 'Replace with live data once Gemini integration is complete.',
      },
    ],
  };
};

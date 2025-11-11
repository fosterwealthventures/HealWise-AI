// Fix: Replaced incorrect file content with the correct type definitions.

export type SubscriptionPlan = 'free' | 'pro' | 'premium';

export enum ModuleType {
  Food = 'Food',
  Herbs = 'Herbs',
  Meds = 'Meds',
  Recipe = 'Recipe',
}

export interface FoodResult {
  name: string;
  description: string;
  studySummary: string;
  stewardshipNote: string;
}

export interface HerbResult {
  name: string;
  benefits: string;
  studyCitation: string;
  youtubeLink?: string;
}

export interface MedsAnalysisResult {
  individualMedications: {
    name: string;
    howItWorks: string;
    commonSideEffects: string[];
  }[];
  interactionAnalysis: {
    medications: string[];
    effectsOnBody: string;
    studySummary: string;
  }[];
  allergyWarnings: {
    medicationName: string;
    conflictingIngredient: string;
    warning: string;
  }[];
}

export interface RecipeResult {
  recipeName: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  recipeType: 'Juice' | 'Smoothie' | 'Tea';
}

export type ApiResult = FoodResult | HerbResult | MedsAnalysisResult | RecipeResult;

export interface PlannerItem {
  id: string;
  savedAt: string;
  moduleType: ModuleType;
  result: ApiResult;
  note: string;
}

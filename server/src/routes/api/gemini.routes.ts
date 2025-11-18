import { Router } from 'express';
import { z } from 'zod';
import { ModuleType } from '../../types/common';
import { generateRecommendations, generateRecipeVariation, explainForKids } from '../../services/gemini.service';

const router = Router();

const recommendationSchema = z.object({
  operation: z.literal('recommendation').default('recommendation'),
  moduleType: z.nativeEnum(ModuleType),
  input: z.string().min(1, 'Input is required'),
  restrictions: z.string().optional(),
  recipeType: z.enum(['Juice', 'Smoothie', 'Tea']).optional(),
  previousFoods: z.array(z.string()).optional(),
});

const recipeSchema = z.object({
  recipeName: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  instructions: z.array(z.string()),
  recipeType: z.enum(['Juice', 'Smoothie', 'Tea']),
});

const variationSchema = z.object({
  operation: z.literal('recipe-variation'),
  originalRecipe: recipeSchema,
  variationRequest: z.string().min(1, 'Variation request is required'),
  restrictions: z.string().optional(),
});

const kidsExplainSchema = z.object({
  operation: z.literal('kids-explain'),
  moduleType: z.nativeEnum(ModuleType),
  content: z.string().min(1, 'Content is required'),
});

router.post('/generate', async (req, res) => {
  try {
    if (req.body?.operation === 'recipe-variation') {
      const payload = variationSchema.parse(req.body);
      const data = await generateRecipeVariation(payload);
      return res.json(data);
    }

    if (req.body?.operation === 'kids-explain') {
      const payload = kidsExplainSchema.parse(req.body);
      const data = await explainForKids({ content: payload.content });
      return res.json(data);
    }

    const payload = recommendationSchema.parse(req.body);
    const data = await generateRecommendations(payload);
    return res.json(data);
  } catch (error: any) {
    const message = error?.message ?? 'Unknown Gemini error';
    res.status(500).json({ error: 'Gemini request failed', detail: message });
  }
});

export default router;

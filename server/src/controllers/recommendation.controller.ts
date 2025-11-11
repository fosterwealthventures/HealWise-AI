import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { generateRecommendation } from '../services/recommendation.service';
import { ModuleType } from '../types/common';

const recommendationSchema = z.object({
  moduleType: z.nativeEnum(ModuleType),
  input: z.string().min(1, 'Input is required'),
  restrictions: z.string().optional(),
  recipeType: z.enum(['Juice', 'Smoothie', 'Tea']).optional(),
});

export const createRecommendation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = recommendationSchema.parse(req.body ?? {});
    const result = await generateRecommendation(payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getProfile, updateProfile, updatePlan } from '../services/profile.service';
import { SubscriptionPlan } from '../types/common';

const profileSchema = z.object({
  displayName: z.string().min(1).optional(),
  restrictions: z.string().optional(),
  onboardingComplete: z.boolean().optional(),
});

const planSchema = z.object({
  plan: z.enum(['free', 'pro', 'premium'] satisfies SubscriptionPlan[]),
});

export const fetchProfile = (_req: Request, res: Response) => {
  res.json(getProfile());
};

export const writeProfile = (req: Request, res: Response, next: NextFunction) => {
  try {
    const updates = profileSchema.parse(req.body ?? {});
    const updated = updateProfile(updates);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const changePlan = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { plan } = planSchema.parse(req.body ?? {});
    const updated = updatePlan(plan);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

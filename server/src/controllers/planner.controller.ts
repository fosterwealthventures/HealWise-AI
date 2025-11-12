import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { addPlannerItem, clearPlanner, deletePlannerItem, listPlannerItems } from '../services/planner.service';
import { ModuleType } from '../types/common';

const plannerItemSchema = z.object({
  moduleType: z.nativeEnum(ModuleType),
  result: z.record(z.string(), z.unknown()),
  note: z.string().max(500).optional(),
});

export const getPlannerItems = (_req: Request, res: Response) => {
  res.json({ items: listPlannerItems() });
};

export const createPlannerItem = (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = plannerItemSchema.parse(req.body ?? {});
    const created = addPlannerItem(payload);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const removePlannerItem = (req: Request, res: Response) => {
  const { id } = req.params;
  const removed = deletePlannerItem(id);
  if (!removed) {
    return res.status(404).json({ error: 'Planner item not found' });
  }
  return res.status(204).send();
};

export const removeAllPlannerItems = (_req: Request, res: Response) => {
  clearPlanner();
  res.status(204).send();
};

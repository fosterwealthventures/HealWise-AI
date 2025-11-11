import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { simplifyMedication } from '../services/meds.service';

const simplifySchema = z.object({
  name: z.string().min(1, 'Medication name is required'),
});

export const simplifyMeds = (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = simplifySchema.parse(req.body ?? {});
    const result = simplifyMedication(payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createCheckoutSession } from '../services/payments.service';

const checkoutSchema = z.object({
  plan: z.enum(['free', 'pro', 'premium']),
});

export const createCheckoutSessionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { plan } = checkoutSchema.parse(req.body ?? {});
    const session = await createCheckoutSession(plan);

    res.status(201).json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};

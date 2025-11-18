import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { createBillingPortalSession, createCheckoutSession } from '../services/payments.service';

const checkoutSchema = z.object({
  plan: z.enum(['pro_month', 'pro_year', 'premium_month', 'premium_year']),
});

const portalSchema = z.object({
  email: z.string().email(),
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

export const createBillingPortalSessionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = portalSchema.parse(req.body ?? {});
    const session = await createBillingPortalSession(email);

    res.status(201).json({
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    next(error);
  }
};

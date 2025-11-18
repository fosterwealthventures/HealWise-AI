import Stripe from 'stripe';
import env from '../config/env';
import { SubscriptionPlan } from '../types/common';
import { logger } from '../utils/logger';
import { HttpError } from '../middleware/errorHandler';

const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: '2022-11-15' as Stripe.StripeConfig['apiVersion'],
    })
  : null;

const priceMap: Partial<Record<SubscriptionPlan, string>> = {
  pro: env.STRIPE_PRICE_ID_PRO,
  premium: env.STRIPE_PRICE_ID_PREMIUM,
};

export const createCheckoutSession = async (plan: SubscriptionPlan) => {
  if (plan === 'free') {
    throw new HttpError(400, 'Free plan does not require checkout');
  }

  if (!stripe) {
    throw new HttpError(500, 'Stripe secret key is not configured');
  }

  const priceId = priceMap[plan];

  if (!priceId) {
    throw new HttpError(500, `No Stripe price configured for ${plan} plan`);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      success_url: `${env.CLIENT_URL}/healwise/dashboard?checkout=success&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CLIENT_URL}/healwise/dashboard?checkout=cancel`,
      automatic_tax: { enabled: true },
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: { plan },
    });

    logger.info('Stripe checkout session created', { plan, sessionId: session.id });

    return session;
  } catch (error) {
    logger.error('Failed to create Stripe checkout session', {
      plan,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    if (error instanceof Error) {
      throw new HttpError(500, error.message);
    }
    throw new HttpError(500, 'Unknown Stripe error');
  }
};

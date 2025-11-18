import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

type PlanKey = 'pro_month' | 'pro_year' | 'premium_month' | 'premium_year';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20' as Stripe.StripeConfig['apiVersion'],
    })
  : null;

const PRICE_MAP: Partial<Record<PlanKey, string>> = {
  pro_month: process.env.STRIPE_PRICE_PRO_MONTH,
  pro_year: process.env.STRIPE_PRICE_PRO_YEAR,
  premium_month: process.env.STRIPE_PRICE_PREMIUM_MONTH,
  premium_year: process.env.STRIPE_PRICE_PREMIUM_YEAR,
};

const planKeyToPlan: Record<PlanKey, 'pro' | 'premium'> = {
  pro_month: 'pro',
  pro_year: 'pro',
  premium_month: 'premium',
  premium_year: 'premium',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!stripe) {
    res.status(500).json({ error: 'Stripe secret key is not configured' });
    return;
  }

  const { plan } = (req.body ?? {}) as { plan?: PlanKey };

  if (!plan || !(plan in PRICE_MAP)) {
    res.status(400).json({ error: 'Invalid plan selected.' });
    return;
  }

  const priceId = PRICE_MAP[plan];
  if (!priceId) {
    res.status(500).json({ error: `No Stripe price configured for ${plan}` });
    return;
  }

  const planName = planKeyToPlan[plan];

  const siteUrl =
    process.env.CLIENT_URL ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    (req.headers.origin as string | undefined) ||
    'http://localhost:5173';

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/healwise/dashboard?checkout=success&plan=${planName}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/healwise/dashboard?checkout=cancel`,
      allow_promotion_codes: true,
      automatic_tax: { enabled: true },
      metadata: { plan: planName, planKey: plan },
    });

    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error (Vercel function):', error);
    res.status(500).json({ error: 'Checkout failed.' });
  }
}


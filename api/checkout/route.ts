import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Map only server-trusted plan -> price IDs (DON’T trust client)
const PLAN_TO_PRICE: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRICE_PRO_MONTH,
  premium: process.env.STRIPE_PRICE_PREMIUM_MONTH,
};

export async function POST(req: Request) {
  try {
    if (!stripeSecret) {
      return jsonResponse({ error: 'Missing STRIPE_SECRET_KEY' }, 500);
    }
    const { plan } = await req.json() as { plan?: 'pro' | 'premium' };

    if (!plan || !PLAN_TO_PRICE[plan]) {
      return jsonResponse({ error: 'Invalid plan' }, 400);
    }

    const stripe = new Stripe(stripeSecret, {
      // Use your account’s default API version, or pin one you’ve enabled:
      // apiVersion: '2024-06-20',
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PLAN_TO_PRICE[plan] as string, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment-cancel`,
      billing_address_collection: 'auto',
      customer_update: { address: 'auto', name: 'auto' },
      metadata: { app: 'HealWise', plan },
    });

    return jsonResponse({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    return jsonResponse({ error: 'Unable to start checkout' }, 500);
  }
}

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

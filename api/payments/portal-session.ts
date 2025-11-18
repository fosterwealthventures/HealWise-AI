import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20' as Stripe.StripeConfig['apiVersion'],
    })
  : null;

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

  const { email } = (req.body ?? {}) as { email?: string };

  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 1 });
    const existingCustomer = customers.data[0];

    const customer =
      existingCustomer ??
      (await stripe.customers.create({
        email,
      }));

    const siteUrl =
      process.env.CLIENT_URL ||
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
      (req.headers.origin as string | undefined) ||
      'http://localhost:5173';

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${siteUrl}/healwise/dashboard`,
    });

    res.status(201).json({ id: session.id, url: session.url });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('Stripe billing portal error (Vercel function):', error);
    res.status(500).json({ error: 'Billing portal failed.' });
  }
}


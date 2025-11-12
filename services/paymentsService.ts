import { SubscriptionPlan } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const CHECKOUT_ENDPOINT = `${API_BASE}/api/payments/checkout-session`;

export interface CheckoutSessionResponse {
  id: string;
  url?: string | null;
}

export async function createCheckoutSession(plan: SubscriptionPlan): Promise<CheckoutSessionResponse> {
  const response = await fetch(CHECKOUT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Unable to start checkout (${response.status}): ${message || 'Unknown error'}`);
  }

  return response.json() as Promise<CheckoutSessionResponse>;
}

export type CheckoutPlanKey = 'pro_month' | 'pro_year' | 'premium_month' | 'premium_year';

export async function startCheckout(planKey: CheckoutPlanKey): Promise<void> {
  const res = await fetch('/api/payments/checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: planKey }),
  });

  if (!res.ok) {
    throw new Error(`Checkout start failed with status ${res.status}`);
  }

  const data = await res.json() as { url?: string };
  if (!data.url) {
    throw new Error('Checkout session did not include a URL');
  }

  window.location.href = data.url;
}

export type CheckoutPlanKey = 'pro_month' | 'pro_year' | 'premium_month' | 'premium_year';

const planKeyToServerPlan: Record<CheckoutPlanKey, 'pro' | 'premium'> = {
  pro_month: 'pro',
  pro_year: 'pro',
  premium_month: 'premium',
  premium_year: 'premium',
};

export async function startCheckout(planKey: CheckoutPlanKey): Promise<void> {
  const serverPlan = planKeyToServerPlan[planKey];

  const res = await fetch('/api/payments/checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan: serverPlan }),
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

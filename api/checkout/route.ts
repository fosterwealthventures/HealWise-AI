// app/api/checkout/route.ts
import Stripe from "stripe";

export const runtime = "nodejs"; // IMPORTANT: Stripe needs Node runtime (not edge)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as Stripe.StripeConfig["apiVersion"],
});

type PlanKey = "pro_month" | "pro_year" | "premium_month" | "premium_year";

const PRICE_MAP: Record<PlanKey, string> = {
  pro_month: process.env.STRIPE_PRICE_PRO_MONTH!,
  pro_year: process.env.STRIPE_PRICE_PRO_YEAR!,
  premium_month: process.env.STRIPE_PRICE_PREMIUM_MONTH!,
  premium_year: process.env.STRIPE_PRICE_PREMIUM_YEAR!,
};

export async function POST(req: Request) {
  try {
    const { plan }: { plan: PlanKey } = await req.json();

    if (!plan || !PRICE_MAP[plan]) {
      return new Response(
        JSON.stringify({ error: "Invalid plan selected." }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: PRICE_MAP[plan], quantity: 1 }],
      success_url: `${siteUrl}/healwise/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/healwise/payment-cancel`,
      allow_promotion_codes: true,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return new Response(JSON.stringify({ error: "Checkout failed." }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

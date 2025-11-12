# HealWise – Wellness Learning Companion

HealWise is a food-first, faith-friendly learning studio that translates reputable wellness sources into approachable cards, planners, and recipe ideas. It is **not** a diagnostic, prescribing, or triage tool. Everything in the product—from copywriting to AI prompts—reinforces that HealWise exists to help people study, reflect, and plan conversations with qualified professionals.

## What HealWise *Is* / *Is Not*

| Is | Isn’t |
| --- | --- |
| Plain-language explainers for foods, herbs, medications, and recipes | A system that diagnoses, treats, prescribes, or predicts outcomes |
| Reflection helpers (planner, journaling notes, grocery inspiration) | A replacement for doctor- or pharmacist-led guidance |
| Ingredient preference tracking and learning-friendly guardrails | A workflow for triage, dosing, or med substitutions |

Whenever a user requests clinical directives (“Should I take…?”, “What dose…?”) the UI blocks the request, reminds them that HealWise is educational only, and points them back to licensed professionals.

## Local Development

```bash
npm install
npm run dev
```

The command above starts Vite for the client and the Express mock API via `npm run dev` (using `concurrently`). By default, the client proxies `/api` calls to `http://localhost:4000`.

### Environment Variables

Create a `.env` file (see `.env.example` if present) with at least:

```
PORT=4000
VITE_API_BASE=http://localhost:4000
VITE_GEMINI_API_KEY=<client key for local-only dev>
GEMINI_API_KEY=<server key if/when backend proxy is wired>
VITE_STRIPE_PUBLISHABLE_KEY=<pk_test_xxx>
STRIPE_SECRET_KEY=<sk_test_xxx>
STRIPE_PRICE_ID_PRO=<price id for the Pro subscription>
STRIPE_PRICE_ID_PREMIUM=<price id for the Premium subscription>
CLIENT_URL=http://localhost:5173
```

> Pro/Premium plans expect Stripe Subscription price IDs. Create them in your Stripe dashboard and paste the IDs above. The `CLIENT_URL` must match the origin that serves the Vite app because Stripe redirects back to `/healwise/dashboard` with query params that the client now reads to show the success/cancel screens.

> **Security note:** Production deployments should never expose real provider API keys to the browser. Use the `server/` project (or the Vercel `api/gemini-proxy.ts` function) to keep secrets server-side.

### Stripe Checkout Flow

- `POST /api/payments/checkout-session` creates a Checkout Session based on the requested plan (free plans short-circuit on the client).
- The response returns the session ID and URL; the client uses `@stripe/stripe-js` to call `redirectToCheckout`.
- Stripe redirects back to `/healwise/dashboard?checkout=success|cancel&plan=pro|premium`, which the app uses to show the success/cancel components and persist the plan preference locally.

## Project Structure

```
components/        React UI for dashboard modules, planner, pricing, onboarding
services/          Front-end Gemini integration (educational prompts + schemas)
server/            Express mock API with health, profile, planner stubs
api/gemini-proxy   Optional Vercel serverless proxy for Gemini
```

## Educational Guardrails in Code

- **Language & UX:** Every surface (headers, CTAs, tooltips) describes HealWise as a “learning companion,” never as treatment or medical advice.
- **AI prompts:** `services/geminiService.ts` ensures generated content cites sources, avoids directive phrasing, and respects ingredient guardrails.
- **Moderation:** `components/ModuleCard.tsx` filters out clinical questions (e.g., “Should I take…?”) and shows a redirect message instead of calling the AI.
- **Persistent Preferences:** Users can log ingredient preferences/avoid lists; no PHI or diagnoses are required or stored.

## Policies & Compliance

- **Terms of Use:** See [`TERMS.md`](TERMS.md) for acceptable use, the “educational only” contract, and user responsibilities.
- **Privacy Policy:** See [`PRIVACY.md`](PRIVACY.md) for details on what limited data HealWise stores locally and how to avoid uploading PHI.
- **Marketplace Notes:** When submitting to app stores or partner marketplaces, reuse the language in this README and the policy docs so reviewers see a consistent, non-clinical positioning.

### Content Moderation Workflow
1. User enters a prompt.
2. Client-side filters look for directive medical phrases and block them with the disclaimer banner.
3. Allowed prompts call Gemini with schemas that demand educational summaries.
4. Result cards reiterate that HealWise is not a medical device and encourage consultation with professionals.

## Contributing

1. Fork and branch from `main`.
2. Follow the linguistic guardrails above.
3. Update tests/docs when changing copy, prompts, or moderation logic.
4. Submit a PR with a short summary plus screenshots (light + dark mode preferred).

Thank you for helping keep HealWise a safe and inspiring learning space.***

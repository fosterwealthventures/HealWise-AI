import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { z } from 'zod';

const rootDir = path.resolve(__dirname, '../../../');
const localEnvPath = path.join(rootDir, '.env.local');
const defaultEnvPath = path.join(rootDir, '.env');

if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
  // eslint-disable-next-line no-console
  console.log('[env] Loaded .env.local for server config');
} else {
  dotenv.config({ path: defaultEnvPath });
  // eslint-disable-next-line no-console
  console.log('[env] Loaded .env for server config');
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(4000),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PRICE_ID_PRO: z.string().optional(),
  STRIPE_PRICE_ID_PREMIUM: z.string().optional(),
});

const env = envSchema.parse(process.env);
// eslint-disable-next-line no-console
console.log('[env] Stripe prices', {
  STRIPE_PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO,
  STRIPE_PRICE_ID_PREMIUM: process.env.STRIPE_PRICE_ID_PREMIUM,
});

export type Env = typeof env;
export default env;

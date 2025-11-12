import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

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

export type Env = typeof env;
export default env;

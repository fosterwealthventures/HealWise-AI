import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(4000),
  GEMINI_API_KEY: z.string().optional(),
});

const env = envSchema.parse(process.env);

export type Env = typeof env;
export default env;

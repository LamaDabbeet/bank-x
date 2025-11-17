import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  UI_ORIGIN: z.string().optional(),
  RATE_LIMIT_RPM: z.coerce.number().default(250),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional()
});

export const env = envSchema.parse(process.env);
export const isProduction = env.NODE_ENV === 'production';


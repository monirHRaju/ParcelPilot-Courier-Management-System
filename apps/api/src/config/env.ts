import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from current directory, apps/api/.env, or root .env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .url('DATABASE_URL must be a valid URL'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required').url('REDIS_URL must be a valid URL'),
  JWT_ACCESS_SECRET: z.string().min(10, 'JWT_ACCESS_SECRET must be at least 10 chars'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET must be at least 10 chars'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(rawEnv: Record<string, unknown> = process.env): Env {
  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    console.error('\n❌ Invalid environment configuration:');
    const fieldErrors = parsed.error.flatten().fieldErrors;
    for (const [key, messages] of Object.entries(fieldErrors)) {
      console.error(`  - ${key}: ${messages?.join(', ')}`);
    }
    console.error('\nPlease check your .env file or environment variables.\n');
    throw new Error(`Environment validation failed: ${JSON.stringify(fieldErrors)}`);
  }

  return parsed.data;
}

export const env = validateEnv(process.env);

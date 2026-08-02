import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().default('postgresql://neondb_owner:npg_wCvgH05XjWht@ep-little-dawn-ayjqxgq8.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require'),
  JWT_SECRET: z.string().default('dev-jwt-secret-change-in-production'),
  JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret-change-in-production'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  CLOUDINARY_CLOUD_NAME: z.string().default('my6yrbch'),
  CLOUDINARY_API_KEY: z.string().default('395316597848578'),
  CLOUDINARY_API_SECRET: z.string().default('hJVBKC1swhaSJskb3TUDEhxrhGc'),
  GEMINI_API_KEY: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

export const env = parsed.success
  ? parsed.data
  : {
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_wCvgH05XjWht@ep-little-dawn-ayjqxgq8.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require',
      JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-change-in-production',
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
      JWT_ACCESS_EXPIRY: '15m',
      JWT_REFRESH_EXPIRY: '7d',
      PORT: '5000',
      NODE_ENV: 'production' as const,
      FRONTEND_URL: 'https://smkrooms.vercel.app',
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'my6yrbch',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '395316597848578',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'hJVBKC1swhaSJskb3TUDEhxrhGc',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    };

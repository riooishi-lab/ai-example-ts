import { resolve } from 'node:path'
import { config } from 'dotenv'

config({ path: resolve(__dirname, '../.env') })
config({ path: resolve(__dirname, '../.env.e2e'), override: true })

/* biome-ignore lint/style/noProcessEnv: CI is a standard env var set by CI runners */
const ci = !!process.env.CI

const DEFAULT_BASE_URL = 'http://localhost:3000'

/* biome-ignore lint/style/noProcessEnv: e2e env vars loaded via dotenv */
const env = process.env

export const e2eEnv = {
  CI: ci,
  BASE_URL: env.BASE_URL ?? DEFAULT_BASE_URL,
  TEST_USER_EMAIL: env.TEST_USER_EMAIL ?? '',
  TEST_USER_PASSWORD: env.TEST_USER_PASSWORD ?? '',
  RESEND_API_KEY: env.RESEND_API_KEY ?? '',
  DATABASE_URL: env.DATABASE_URL ?? '',
  FIREBASE_PROJECT_ID: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  FIREBASE_CLIENT_EMAIL: env.FIREBASE_CLIENT_EMAIL ?? '',
  FIREBASE_PRIVATE_KEY: env.FIREBASE_PRIVATE_KEY ?? '',
  FIREBASE_API_KEY: env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
}

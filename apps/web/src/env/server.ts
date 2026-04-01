import { clientEnv } from './client'

export const serverEnv = {
  ...clientEnv,
  APP_URL: (() => {
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    if (typeof process.env.APP_URL !== 'string') throw new Error('`APP_URL` is not properly set.')
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    return process.env.APP_URL
  })(),

  // Firebase Admin SDK (server-side only)
  FIREBASE_CLIENT_EMAIL: (() => {
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    if (typeof process.env.FIREBASE_CLIENT_EMAIL !== 'string')
      throw new Error('`FIREBASE_CLIENT_EMAIL` is not properly set.')
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    return process.env.FIREBASE_CLIENT_EMAIL
  })(),
  FIREBASE_PRIVATE_KEY: (() => {
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    if (typeof process.env.FIREBASE_PRIVATE_KEY !== 'string')
      throw new Error('`FIREBASE_PRIVATE_KEY` is not properly set.')
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    return process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })(),

  // Google OAuth2
  GOOGLE_CLIENT_ID: (() => {
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    if (typeof process.env.GOOGLE_CLIENT_ID !== 'string') throw new Error('`GOOGLE_CLIENT_ID` is not properly set.')
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    return process.env.GOOGLE_CLIENT_ID
  })(),
  GOOGLE_CLIENT_SECRET: (() => {
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    if (typeof process.env.GOOGLE_CLIENT_SECRET !== 'string')
      throw new Error('`GOOGLE_CLIENT_SECRET` is not properly set.')
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    return process.env.GOOGLE_CLIENT_SECRET
  })(),

  // Resend
  RESEND_API_KEY: (() => {
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    if (typeof process.env.RESEND_API_KEY !== 'string') throw new Error('`RESEND_API_KEY` is not properly set.')
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    return process.env.RESEND_API_KEY
  })(),
}

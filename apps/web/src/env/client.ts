export const clientEnv = {
  // Firebase Client SDK (client-side, exposed via NEXT_PUBLIC_)
  FIREBASE_API_KEY: (() => {
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    if (typeof process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'string')
      throw new Error('`NEXT_PUBLIC_FIREBASE_API_KEY` is not properly set.')
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    return process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  })(),
  FIREBASE_AUTH_DOMAIN: (() => {
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    if (typeof process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN !== 'string')
      throw new Error('`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is not properly set.')
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  })(),
  FIREBASE_PROJECT_ID: (() => {
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    if (typeof process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID !== 'string')
      throw new Error('`NEXT_PUBLIC_FIREBASE_PROJECT_ID` is not properly set.')
    /* biome-ignore lint/style/noProcessEnv: This is the only file where process.env is used */
    return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  })(),
}

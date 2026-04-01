import { google } from 'googleapis'
import { serverEnv } from '../env/server'

export const googleAuthClient = new google.auth.OAuth2({
  clientId: serverEnv.GOOGLE_CLIENT_ID,
  clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
  redirectUri: `${serverEnv.APP_URL}/api/auth/google/callback`,
})

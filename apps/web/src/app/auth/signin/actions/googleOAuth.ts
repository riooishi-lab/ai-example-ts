'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { googleAuthClient } from '../../../../libs/googleapis'

const COOKIE_STATE = 'oauth_state'
const COOKIE_AUTH_TYPE = 'auth_type'

export async function googleOAuthSignIn() {
  const state = crypto.randomUUID() // For CSRF protection
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_STATE, state, { maxAge: 60 * 10, httpOnly: true })
  cookieStore.set(COOKIE_AUTH_TYPE, 'signin', { maxAge: 60 * 10, httpOnly: true })

  const authUrl = googleAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile', 'openid'],
    state,
    prompt: 'select_account',
  })

  redirect(authUrl)
}

'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { googleAuthClient } from '../../../../libs/googleapis'

const COOKIE_STATE = 'oauth_state'
const COOKIE_AUTH_TYPE = 'auth_type'
const COOKIE_INVITATION_TOKEN = 'invitation_token'

export async function googleOAuthSignUp(invitationToken: string) {
  const state = crypto.randomUUID()
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_STATE, state, { maxAge: 60 * 10, httpOnly: true })
  cookieStore.set(COOKIE_AUTH_TYPE, 'signup', { maxAge: 60 * 10, httpOnly: true })
  cookieStore.set(COOKIE_INVITATION_TOKEN, invitationToken, { maxAge: 60 * 10, httpOnly: true })

  const authUrl = googleAuthClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['email', 'profile', 'openid'],
    state,
    prompt: 'select_account',
  })

  redirect(authUrl)
}

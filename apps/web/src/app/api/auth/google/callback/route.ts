import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { googleAuthClient } from '../../../../../libs/googleapis'
import { handleSignIn } from './handleSignIn'
import { handleSignUp } from './handleSignUp'

const COOKIE_STATE = 'oauth_state'
const COOKIE_AUTH_TYPE = 'auth_type'
const COOKIE_INVITATION_TOKEN = 'invitation_token'

export const GoogleUserInfoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.string().optional(),
  verified_email: z.boolean().optional(),
})

async function fetchGoogleUserInfo(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) return null

  const json: unknown = await response.json()
  const result = GoogleUserInfoSchema.safeParse(json)
  return result.success ? result.data : null
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  const cookieStore = await cookies()

  const state = cookieStore.get(COOKIE_STATE)?.value
  const authType = cookieStore.get(COOKIE_AUTH_TYPE)?.value
  const invitationToken = cookieStore.get(COOKIE_INVITATION_TOKEN)?.value

  if (searchParams.get('state') !== state) return redirect('/auth/signin?error=csrf')
  if (searchParams.get('error')) return redirect('/auth/signin?error=oauth_error')

  const code = searchParams.get('code')
  if (!code) return redirect('/auth/signin?error=no_code')

  try {
    const { tokens } = await googleAuthClient.getToken(code)
    if (!tokens.access_token) return redirect('/auth/signin?error=no_token')

    const googleUser = await fetchGoogleUserInfo(tokens.access_token)
    if (!googleUser) return redirect('/auth/signin?error=invalid_user_info')

    let errorCode: string | null = null

    if (authType === 'signup') {
      errorCode = await handleSignUp({ googleUser, invitationToken })
    } else if (authType === 'signin') {
      errorCode = await handleSignIn({ googleUser })
    } else {
      errorCode = 'invalid_auth_type'
    }

    if (errorCode) return redirect(`/auth/signin?error=${errorCode}`)

    cookieStore.delete(COOKIE_STATE)
    cookieStore.delete(COOKIE_AUTH_TYPE)
    cookieStore.delete(COOKIE_INVITATION_TOKEN)
  } catch {
    return redirect('/auth/signin?error=oauth_failed')
  }

  return redirect('/')
}

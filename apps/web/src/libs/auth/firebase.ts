import { z } from 'zod'
import { clientEnv } from '../../env/client'

const SignInWithPasswordResponseSchema = z.object({
  idToken: z.string(),
  email: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
  localId: z.string(),
})

const SignUpResponseSchema = z.object({
  idToken: z.string(),
  email: z.string(),
  refreshToken: z.string(),
  expiresIn: z.string(),
  localId: z.string(),
})

export async function signInWithPassword({ email, password }: { email: string; password: string }) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${clientEnv.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    },
  )

  const data: unknown = await response.json()

  if (!response.ok) {
    throw new Error('Invalid email or password')
  }

  const result = SignInWithPasswordResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Failed to sign in')
  }

  return result.data
}

export async function signUpWithPassword({ email, password }: { email: string; password: string }) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${clientEnv.FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    },
  )

  const data: unknown = await response.json()

  if (!response.ok) {
    throw new Error('Failed to create account')
  }

  const result = SignUpResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Failed to sign up')
  }

  return result.data
}

const ConfirmPasswordResetResponseSchema = z.object({
  email: z.string(),
  requestType: z.literal('PASSWORD_RESET'),
})

export async function confirmPasswordResetViaFirebase({
  oobCode,
  newPassword,
  apiKey,
}: {
  oobCode: string
  newPassword: string
  apiKey: string
}) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      oobCode,
      newPassword,
    }),
  })

  const data: unknown = await response.json()

  if (!response.ok) {
    throw new Error('Failed to reset password')
  }

  const result = ConfirmPasswordResetResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Failed to confirm password reset')
  }

  return result.data
}

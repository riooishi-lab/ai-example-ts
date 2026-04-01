'use server'

import { prisma } from '@monorepo/database/client'
import { redirect } from 'next/navigation'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { signInWithPassword } from '../../../../libs/auth/firebase'
import { createSessionCookie, setSessionCookie } from '../../../../libs/auth/session'
import { SignInFormSchema } from '../components/SignInForm/SignInForm.types'

export type SignInState = {
  error?: {
    message: string[]
  }
}

export async function signIn(_: unknown, formData: FormData) {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = SignInFormSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      error: {
        message: parsed.error.errors.map((e) => e.message),
      },
    }
  }

  const { email, password } = parsed.data

  try {
    const { idToken } = await signInWithPassword({ email, password })

    const sessionCookie = await createSessionCookie(idToken)
    await setSessionCookie(sessionCookie)

    await prisma.user.updateMany({
      where: { email },
      data: { lastSignedInAt: new Date() },
    })
  } catch (error) {
    if (error instanceof Error) {
      return { error: { message: ['メールアドレスとパスワードをご確認ください。'] } }
    }
    return { error: { message: ['An unexpected error occurred'] } }
  }

  redirect(PAGE_PATH.HOME)
}

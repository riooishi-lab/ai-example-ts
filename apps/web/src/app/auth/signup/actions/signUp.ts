'use server'

import { $Enums } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { redirect } from 'next/navigation'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { signUpWithPassword } from '../../../../libs/auth/firebase'
import { createSessionCookie, setSessionCookie } from '../../../../libs/auth/session'
import { adminAuth } from '../../../../libs/firebase/nodeApp'
import { SignUpFormSchema } from '../components/SignUpForm/SignUpForm.types'

export type SignUpState = {
  error?: {
    message: string[]
  }
}

export async function signUp(_: SignUpState | null, formData: FormData): Promise<SignUpState> {
  const rawData = {
    email: formData.get('email'),
    token: formData.get('token'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const parsed = SignUpFormSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      error: {
        message: parsed.error.errors.map((e) => e.message),
      },
    }
  }

  const { token, password } = parsed.data

  try {
    const invitation = await prisma.visibleInvitation.findFirst({
      where: { token, email: parsed.data.email },
    })

    if (!invitation) {
      return { error: { message: ['招待が見つかりません。'] } }
    }

    if (invitation.status !== $Enums.InvitationStatus.PENDING) {
      return { error: { message: ['この招待は既に使用されているか、無効です。'] } }
    }

    if (invitation.expiresAt < new Date()) {
      return { error: { message: ['この招待は期限切れです。'] } }
    }

    const { idToken, localId } = await signUpWithPassword({
      email: invitation.email,
      password,
    })

    await adminAuth.updateUser(localId, {
      displayName: invitation.displayName || `${invitation.firstName} ${invitation.lastName}`,
      emailVerified: true,
    })

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          authProviderId: localId,
          email: invitation.email,
          firstName: invitation.firstName,
          lastName: invitation.lastName,
          displayName: invitation.displayName,
          role: invitation.role,
        },
      })

      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: $Enums.InvitationStatus.ACCEPTED,
          acceptedAt: new Date(),
        },
      })
    })

    const sessionCookie = await createSessionCookie(idToken)
    await setSessionCookie(sessionCookie)
  } catch {
    return { error: { message: ['アカウント作成に失敗しました'] } }
  }

  redirect(PAGE_PATH.HOME)
}

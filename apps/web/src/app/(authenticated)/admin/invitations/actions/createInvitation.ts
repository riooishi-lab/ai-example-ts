'use server'

import { parseWithZod } from '@conform-to/zod'
import { InvitationStatus } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { composeInvitationEmail, SENDER } from '../../../../../constants/email'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { serverEnv } from '../../../../../env/server'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { sendEmail } from '../../../../../libs/email'
import { InvitationFormSchema } from '../components/InvitationForm/InvitationForm.types'
import { INVITATION_EXPIRES_DAYS } from '../constants'

export async function createInvitation(_: unknown, formData: FormData) {
  const adminOrSuperAdmin = await checkIsAdminOrSuperAdmin()
  if (!adminOrSuperAdmin) {
    return {
      status: 'error' as const,
      error: { message: ['この操作を実行する権限がありません'] },
    }
  }

  const submission = parseWithZod(formData, { schema: InvitationFormSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const { email, firstName, lastName, displayName, role } = submission.value

  const existingUser = await prisma.visibleUser.findFirst({
    where: { email },
  })

  if (existingUser) {
    return {
      status: 'error' as const,
      error: { message: ['このメールアドレスは既に登録されています'] },
    }
  }

  const existingInvitation = await prisma.visibleInvitation.findFirst({
    where: {
      email,
      status: InvitationStatus.PENDING,
    },
  })

  if (existingInvitation) {
    return {
      status: 'error' as const,
      error: { message: ['このメールアドレスには既に招待が送信されています'] },
    }
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * INVITATION_EXPIRES_DAYS)

  try {
    await prisma.invitation.create({
      data: {
        token,
        email,
        firstName,
        lastName,
        displayName: displayName || null,
        role,
        expiresAt,
        invitedById: adminOrSuperAdmin.id,
      },
    })

    const signUpPageUrl = new URL(`${serverEnv.APP_URL}${PAGE_PATH.SIGN_UP}`)
    signUpPageUrl.searchParams.append('token', token)
    const signInPageUrl = new URL(`${serverEnv.APP_URL}${PAGE_PATH.SIGN_IN}`)

    await sendEmail({
      to: email,
      from: SENDER,
      subject: '【マイアプリ】招待されました',
      html: composeInvitationEmail({ signUpPageUrl, signInPageUrl }),
    })
  } catch {
    return {
      status: 'error' as const,
      error: { message: ['招待の作成に失敗しました'] },
    }
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)

  return { status: 'success' as const }
}

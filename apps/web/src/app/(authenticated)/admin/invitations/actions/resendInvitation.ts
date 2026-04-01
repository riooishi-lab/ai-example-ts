'use server'

import { InvitationStatus } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { composeInvitationEmail, SENDER } from '../../../../../constants/email'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { serverEnv } from '../../../../../env/server'
import { checkIsAdminOrSuperAdmin, getSession } from '../../../../../libs/auth/session'
import { sendEmail } from '../../../../../libs/email'
import { INVITATION_EXPIRES_DAYS } from '../constants'

export async function resendInvitation(invitationId: number) {
  const session = await getSession()
  if (!session) {
    return { status: 'error' as const, error: { message: ['ログインしてください'] } }
  }

  const adminOrSuperAdmin = await checkIsAdminOrSuperAdmin()
  if (!adminOrSuperAdmin) {
    return { status: 'error' as const, error: { message: ['この操作を実行する権限がありません'] } }
  }

  const invitation = await prisma.visibleInvitation.findFirst({
    where: { id: invitationId },
  })

  if (!invitation) {
    return { status: 'error' as const, error: { message: ['招待が見つかりません'] } }
  }

  if (invitation.status === InvitationStatus.ACCEPTED) {
    return { status: 'error' as const, error: { message: ['この招待は既に承認されています'] } }
  }

  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * INVITATION_EXPIRES_DAYS)

  try {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: {
        token,
        status: InvitationStatus.PENDING,
        expiresAt,
      },
    })

    const signUpPageUrl = new URL(`${serverEnv.APP_URL}${PAGE_PATH.SIGN_UP}`)
    signUpPageUrl.searchParams.append('token', token)
    const signInPageUrl = new URL(`${serverEnv.APP_URL}${PAGE_PATH.SIGN_IN}`)

    await sendEmail({
      to: invitation.email,
      from: SENDER,
      subject: '【マイアプリ】招待されました',
      html: composeInvitationEmail({ signUpPageUrl, signInPageUrl }),
    })
  } catch {
    return { status: 'error' as const, error: { message: ['招待の再送信に失敗しました'] } }
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)

  return { status: 'success' as const }
}

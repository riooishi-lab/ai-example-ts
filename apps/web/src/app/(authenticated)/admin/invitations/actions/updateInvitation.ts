'use server'

import { parseWithZod } from '@conform-to/zod'
import { InvitationStatus } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrManager } from '../../../../../libs/auth/session'
import { InvitationFormSchema } from '../components/InvitationForm/InvitationForm.types'

export async function updateInvitation(_: unknown, formData: FormData) {
  const adminOrSuperAdmin = await checkIsAdminOrManager()
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

  const { id, firstName, lastName, role } = submission.value

  const invitation = await prisma.visibleInvitation.findFirst({
    where: { id },
  })

  if (!invitation) {
    return {
      status: 'error' as const,
      error: { message: ['招待が見つかりません'] },
    }
  }

  if (invitation.status === InvitationStatus.ACCEPTED) {
    return {
      status: 'error' as const,
      error: { message: ['承認済みの招待は編集できません'] },
    }
  }

  try {
    await prisma.invitation.update({
      where: { id },
      data: {
        firstName,
        lastName,
        role,
      },
    })
  } catch {
    return {
      status: 'error' as const,
      error: { message: ['招待の更新に失敗しました'] },
    }
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)

  return { status: 'success' as const }
}

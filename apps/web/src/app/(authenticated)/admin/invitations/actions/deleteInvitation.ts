'use server'

import { InvitationStatus } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'

const DeleteInvitationSchema = z.object({
  id: z.number(),
})

export type DeleteInvitationState = {
  status?: 'success' | 'error'
  error?: {
    message: string[]
  }
}

export async function deleteInvitation(
  _: DeleteInvitationState | null,
  formData: FormData,
): Promise<DeleteInvitationState> {
  const adminOrSuperAdmin = await checkIsAdminOrSuperAdmin()
  if (!adminOrSuperAdmin) {
    return { status: 'error' as const, error: { message: ['この操作を実行する権限がありません'] } }
  }

  const rawData = {
    id: Number(formData.get('id')),
  }

  const parsed = DeleteInvitationSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      status: 'error' as const,
      error: {
        message: parsed.error.errors.map((e) => e.message),
      },
    }
  }

  const { id } = parsed.data

  try {
    const invitation = await prisma.visibleInvitation.findUnique({
      where: { id },
    })

    if (!invitation) {
      return { status: 'error' as const, error: { message: ['招待が見つかりません'] } }
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      return { status: 'error' as const, error: { message: ['承認済みの招待は削除できません'] } }
    }

    await prisma.invitation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    })
  } catch (error) {
    console.error('Delete invitation error:', error)
    return { status: 'error' as const, error: { message: ['招待の削除に失敗しました'] } }
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)

  return { status: 'success' }
}

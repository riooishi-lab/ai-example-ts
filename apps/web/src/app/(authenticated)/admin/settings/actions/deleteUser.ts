'use server'

import { UserRole } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { adminAuth } from '../../../../../libs/firebase/nodeApp'

type ActionResult = {
  status: 'success' | 'error'
  error?: { message: string[] }
}

export type DeleteUserState = ActionResult | null

export async function deleteUser(_: DeleteUserState, formData: FormData): Promise<DeleteUserState> {
  const userId = Number(formData.get('userId'))

  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return { status: 'error', error: { message: ['この操作を実行する権限がありません'] } }
  }

  // Prevent self-deletion
  if (currentUser.id === userId) {
    return { status: 'error', error: { message: ['自分自身を削除することはできません'] } }
  }

  // Prevent regular ADMINs from deleting SUPER_ADMIN users
  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!targetUser) {
    return { status: 'error', error: { message: ['ユーザーが見つかりません'] } }
  }
  if (targetUser.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
    return { status: 'error', error: { message: ['スーパー管理者を削除する権限がありません'] } }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
      },
    })

    await adminAuth.deleteUser(targetUser.authProviderId)
  } catch (error) {
    console.error('Delete user error:', error)
    return { status: 'error', error: { message: ['ユーザーの削除に失敗しました'] } }
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)
  return { status: 'success' }
}

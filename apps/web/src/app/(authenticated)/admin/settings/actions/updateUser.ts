'use server'

import { parseWithZod } from '@conform-to/zod'
import { UserRole } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { UserFormSchema } from '../components/UserForm/UserForm.types'

const errorResult = (message: string) => ({ status: 'error' as const, error: { message: [message] } })
const successResult = () => ({ status: 'success' as const })

export const updateUser = async (_: unknown, formData: FormData) => {
  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const submission = parseWithZod(formData, { schema: UserFormSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const { id, firstName, lastName, displayName, role, isActive } = submission.value

  // Prevent regular ADMINs from editing SUPER_ADMIN users
  const targetUser = await prisma.user.findUnique({ where: { id: Number(id) } })
  if (!targetUser) {
    return errorResult('ユーザーが見つかりません')
  }
  if (targetUser.role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
    return errorResult('スーパー管理者を編集する権限がありません')
  }

  // Prevent ADMINs from promoting other users to SUPER_ADMIN
  if (role === UserRole.SUPER_ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
    return errorResult('ユーザーをスーパー管理者に設定する権限がありません')
  }

  try {
    await prisma.user.update({
      where: { id: Number(id) },
      data: {
        firstName,
        lastName,
        displayName: displayName || null,
        role,
        isActive,
      },
    })
  } catch (error) {
    console.error('Update user error:', error)
    return errorResult('ユーザーの更新に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)
  return successResult()
}

'use server'

import { parseWithZod } from '@conform-to/zod'
import { UserRole } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrManager } from '../../../../../libs/auth/session'
import { UserFormSchema } from '../components/UserForm/UserForm.types'

const errorResult = (message: string) => ({ status: 'error' as const, error: { message: [message] } })
const successResult = () => ({ status: 'success' as const })

export const updateUser = async (_: unknown, formData: FormData) => {
  const currentUser = await checkIsAdminOrManager()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const submission = parseWithZod(formData, { schema: UserFormSchema })

  if (submission.status !== 'success') {
    return submission.reply()
  }

  const { id, firstName, lastName, displayName, role, isActive } = submission.value

  const targetUser = await prisma.visibleUser.findUnique({ where: { id: Number(id) } })
  if (!targetUser) {
    return errorResult('ユーザーが見つかりません')
  }
  if (targetUser.role === UserRole.SYSTEM_ADMIN && currentUser.role !== UserRole.SYSTEM_ADMIN) {
    return errorResult('システム管理者を編集する権限がありません')
  }

  if (role === UserRole.SYSTEM_ADMIN && currentUser.role !== UserRole.SYSTEM_ADMIN) {
    return errorResult('ユーザーをシステム管理者に設定する権限がありません')
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
  } catch {
    return errorResult('ユーザーの更新に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)
  return successResult()
}

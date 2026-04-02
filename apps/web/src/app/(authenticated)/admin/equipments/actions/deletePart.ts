'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrManager } from '../../../../../libs/auth/session'
import { errorResult, successResult } from '../../utils/actionResult'

export type DeletePartState = {
  status: 'success' | 'error'
  error?: { message: string[] }
} | null

export async function deletePart(_: DeletePartState, formData: FormData): Promise<DeletePartState> {
  const currentUser = await checkIsAdminOrManager()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const partId = Number(formData.get('partId'))

  if (!partId) {
    return errorResult('部品IDが無効です')
  }

  try {
    await prisma.part.update({
      where: { id: partId },
      data: { deletedAt: new Date() },
    })
  } catch {
    return errorResult('部品の削除に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_EQUIPMENTS)
  revalidatePath(PAGE_PATH.EQUIPMENTS)
  return successResult()
}

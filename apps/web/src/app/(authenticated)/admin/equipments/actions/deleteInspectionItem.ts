'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrManager } from '../../../../../libs/auth/session'
import { errorResult, successResult } from '../../utils/actionResult'

export type DeleteInspectionItemState = {
  status: 'success' | 'error'
  error?: { message: string[] }
} | null

export async function deleteInspectionItem(
  _: DeleteInspectionItemState,
  formData: FormData,
): Promise<DeleteInspectionItemState> {
  const currentUser = await checkIsAdminOrManager()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const itemId = Number(formData.get('itemId'))

  if (!itemId) {
    return errorResult('点検項目IDが無効です')
  }

  try {
    await prisma.inspectionItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    })
  } catch {
    return errorResult('点検項目の削除に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_EQUIPMENTS)
  return successResult()
}

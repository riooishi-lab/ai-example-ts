'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrManager } from '../../../../../libs/auth/session'
import { errorResult, successResult } from '../../utils/actionResult'

export type DeleteEquipmentState = {
  status: 'success' | 'error'
  error?: { message: string[] }
} | null

export async function deleteEquipment(_: DeleteEquipmentState, formData: FormData): Promise<DeleteEquipmentState> {
  const currentUser = await checkIsAdminOrManager()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const equipmentId = Number(formData.get('equipmentId'))

  if (!equipmentId) {
    return errorResult('設備IDが無効です')
  }

  try {
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { deletedAt: new Date() },
    })
  } catch {
    return errorResult('設備の削除に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_EQUIPMENTS)
  revalidatePath(PAGE_PATH.EQUIPMENTS)
  return successResult()
}

'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrManager } from '../../../../../libs/auth/session'
import { errorResult, successResult } from '../../utils/actionResult'

export async function updateEquipment(_: unknown, formData: FormData) {
  const currentUser = await checkIsAdminOrManager()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const equipmentId = Number(formData.get('equipmentId'))
  const name = formData.get('name') as string | null
  const lineName = formData.get('lineName') as string | null
  const machineNumber = formData.get('machineNumber') as string | null
  const category = formData.get('category') as string | null
  const installedAtRaw = formData.get('installedAt') as string | null

  if (!equipmentId) {
    return errorResult('設備IDが無効です')
  }

  if (!name?.trim()) {
    return errorResult('設備名は必須です')
  }

  if (!lineName?.trim()) {
    return errorResult('ライン名は必須です')
  }

  if (!machineNumber?.trim()) {
    return errorResult('号機は必須です')
  }

  const installedAt = installedAtRaw ? new Date(installedAtRaw) : null

  try {
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        name: name.trim(),
        lineName: lineName.trim(),
        machineNumber: machineNumber.trim(),
        category: category?.trim() || null,
        installedAt,
      },
    })
  } catch {
    return errorResult('設備の更新に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_EQUIPMENTS)
  revalidatePath(PAGE_PATH.EQUIPMENTS)
  return successResult()
}

'use server'

import type { InspectionInputType } from '@monorepo/database'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrManager } from '../../../../../libs/auth/session'
import { errorResult, successResult } from '../../utils/actionResult'

export async function updateInspectionItem(_: unknown, formData: FormData) {
  const currentUser = await checkIsAdminOrManager()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const itemId = Number(formData.get('itemId'))
  const equipmentId = Number(formData.get('equipmentId'))
  const name = formData.get('name') as string | null
  const inputType = formData.get('inputType') as InspectionInputType | null
  const unit = formData.get('unit') as string | null
  const upperLimitRaw = formData.get('upperLimit') as string | null
  const lowerLimitRaw = formData.get('lowerLimit') as string | null
  const sortOrderRaw = formData.get('sortOrder') as string | null

  if (!itemId) {
    return errorResult('点検項目IDが無効です')
  }

  if (!equipmentId) {
    return errorResult('設備を選択してください')
  }

  if (!name?.trim()) {
    return errorResult('点検項目名は必須です')
  }

  if (!inputType || !['NUMERIC', 'TEXT'].includes(inputType)) {
    return errorResult('入力タイプを選択してください')
  }

  const upperLimit = upperLimitRaw ? Number(upperLimitRaw) : null
  const lowerLimit = lowerLimitRaw ? Number(lowerLimitRaw) : null
  const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : 0

  try {
    await prisma.inspectionItem.update({
      where: { id: itemId },
      data: {
        equipmentId,
        name: name.trim(),
        inputType,
        unit: unit?.trim() || null,
        upperLimit,
        lowerLimit,
        sortOrder,
      },
    })
  } catch {
    return errorResult('点検項目の更新に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_EQUIPMENTS)
  return successResult()
}

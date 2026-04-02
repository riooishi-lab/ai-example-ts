'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrManager } from '../../../../../libs/auth/session'
import { errorResult, parsePositiveInt, successResult } from '../../utils/actionResult'

export async function updatePart(_: unknown, formData: FormData) {
  const currentUser = await checkIsAdminOrManager()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const partId = Number(formData.get('partId'))
  const equipmentId = Number(formData.get('equipmentId'))
  const name = formData.get('name') as string | null
  const cycleDaysRaw = formData.get('standardReplaceCycleDays') as string | null
  const lastReplacedAtRaw = formData.get('lastReplacedAt') as string | null

  if (!partId) {
    return errorResult('部品IDが無効です')
  }

  if (!equipmentId) {
    return errorResult('設備を選択してください')
  }

  if (!name?.trim()) {
    return errorResult('部品名は必須です')
  }

  const standardReplaceCycleDays = cycleDaysRaw ? parsePositiveInt(cycleDaysRaw) : null
  const lastReplacedAt = lastReplacedAtRaw ? new Date(lastReplacedAtRaw) : null

  try {
    await prisma.part.update({
      where: { id: partId },
      data: {
        equipmentId,
        name: name.trim(),
        standardReplaceCycleDays,
        lastReplacedAt,
      },
    })
  } catch {
    return errorResult('部品の更新に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_EQUIPMENTS)
  revalidatePath(PAGE_PATH.EQUIPMENTS)
  return successResult()
}

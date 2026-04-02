'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '../../../../../../../libs/auth/session'
import type { ActionState } from '../../../../../admin/utils/actionResult'

export async function submitInspection(_: ActionState, formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser()
  if (!user) {
    return { status: 'error', error: { message: ['ログインしてください'] } }
  }

  const equipmentPublicId = formData.get('equipmentPublicId')
  if (typeof equipmentPublicId !== 'string') {
    return { status: 'error', error: { message: ['設備情報が不正です'] } }
  }

  const equipment = await prisma.visibleEquipment.findUnique({
    where: { publicId: equipmentPublicId },
  })

  if (!equipment) {
    return { status: 'error', error: { message: ['設備が見つかりません'] } }
  }

  const inspectionItems = await prisma.visibleInspectionItem.findMany({
    where: { equipmentId: equipment.id },
    orderBy: { sortOrder: 'asc' },
  })

  if (inspectionItems.length === 0) {
    return { status: 'error', error: { message: ['点検項目が登録されていません'] } }
  }

  const valuesData = inspectionItems.map((item) => {
    const rawValue = formData.get(`item-${item.id}`)
    const stringValue = typeof rawValue === 'string' ? rawValue.trim() : ''

    if (item.inputType === 'NUMERIC') {
      const numericValue = stringValue === '' ? null : Number.parseFloat(stringValue)
      const isAbnormal =
        numericValue !== null &&
        !Number.isNaN(numericValue) &&
        ((item.upperLimit !== null && numericValue > item.upperLimit) ||
          (item.lowerLimit !== null && numericValue < item.lowerLimit))

      return {
        itemId: item.id,
        numericValue: numericValue !== null && !Number.isNaN(numericValue) ? numericValue : null,
        textValue: null,
        isAbnormal,
      }
    }

    return {
      itemId: item.id,
      numericValue: null,
      textValue: stringValue || null,
      isAbnormal: false,
    }
  })

  try {
    await prisma.$transaction(async (tx) => {
      const record = await tx.inspectionRecord.create({
        data: {
          equipmentId: equipment.id,
          inspectorId: user.id,
          inspectedAt: new Date(),
          status: 'COMPLETED',
        },
      })

      await tx.inspectionValue.createMany({
        data: valuesData.map((v) => ({
          recordId: record.id,
          itemId: v.itemId,
          numericValue: v.numericValue,
          textValue: v.textValue,
          isAbnormal: v.isAbnormal,
        })),
      })
    })
  } catch {
    return { status: 'error', error: { message: ['点検記録の保存に失敗しました'] } }
  }

  revalidatePath(`/equipments/${equipmentPublicId}`)

  return { status: 'success' }
}

'use server'

import { parseWithZod } from '@conform-to/zod'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { getCurrentUser } from '../../../../../libs/auth/session'
import { zodFormErrorMap } from '../../../../../utils/libs/zod'
import type { ActionState } from '../../../admin/utils/actionResult'
import { FailureReportFormSchema } from '../components/FailureReportForm.types'

export async function createFailureReport(_: ActionState, formData: FormData): Promise<ActionState> {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return {
      status: 'error',
      error: { message: ['ログインしてください'] },
    }
  }

  const submission = parseWithZod(formData, { schema: FailureReportFormSchema, errorMap: zodFormErrorMap })

  if (submission.status !== 'success') {
    return submission.reply() as ActionState
  }

  const {
    equipmentPublicId,
    partPublicId,
    occurredAt,
    symptom,
    estimatedCause,
    action,
    actionAt,
    responderPublicId,
    note,
  } = submission.value

  const equipment = await prisma.visibleEquipment.findUnique({
    where: { publicId: equipmentPublicId },
  })

  if (!equipment) {
    return {
      status: 'error',
      error: { message: ['指定された設備が見つかりません'] },
    }
  }

  let partId: number | null = null
  if (partPublicId) {
    const part = await prisma.visiblePart.findUnique({
      where: { publicId: partPublicId },
    })
    if (!part) {
      return {
        status: 'error',
        error: { message: ['指定された部品が見つかりません'] },
      }
    }
    partId = part.id
  }

  const responder = await prisma.visibleUser.findUnique({
    where: { publicId: responderPublicId },
  })

  if (!responder) {
    return {
      status: 'error',
      error: { message: ['指定された対応者が見つかりません'] },
    }
  }

  const photoEntries = formData.getAll('photos') as File[]
  const validPhotos = photoEntries.filter((file) => file.size > 0)

  try {
    await prisma.failureReport.create({
      data: {
        equipmentId: equipment.id,
        partId,
        occurredAt: new Date(occurredAt),
        symptom,
        estimatedCause: estimatedCause || null,
        action,
        actionAt: new Date(actionAt),
        reporterId: currentUser.id,
        responderId: responder.id,
        note: note || null,
        photos: {
          create: validPhotos.map((file) => ({
            filePath: file.name,
            uploaderId: currentUser.id,
          })),
        },
      },
    })
  } catch {
    return {
      status: 'error',
      error: { message: ['不具合報告の登録に失敗しました'] },
    }
  }

  revalidatePath(PAGE_PATH.FAILURE_REPORTS)
  redirect(PAGE_PATH.FAILURE_REPORTS)
}

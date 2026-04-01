'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { type ActionState, errorResult, parsePositiveInt, successResult } from '../../utils/actionResult'

export type AddTeamMemberState = ActionState

export async function addTeamMember(_: AddTeamMemberState, formData: FormData): Promise<AddTeamMemberState> {
  const teamId = parsePositiveInt(formData.get('teamId'))
  const userId = parsePositiveInt(formData.get('userId'))
  if (!teamId || !userId) {
    return errorResult('無効なパラメータです')
  }

  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId },
  })

  if (member && member.deletedAt === null) {
    return errorResult('このユーザーは既にチームに所属しています')
  }

  try {
    if (member) {
      await prisma.teamMember.update({
        where: { id: member.id },
        data: { deletedAt: null },
      })
    } else {
      await prisma.teamMember.create({
        data: { teamId, userId },
      })
    }
  } catch {
    return errorResult('メンバーの追加に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)
  return successResult()
}

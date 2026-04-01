'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { type ActionState, errorResult, parsePositiveInt, successResult } from '../../utils/actionResult'

export type DeleteTeamState = ActionState

export async function deleteTeam(_: DeleteTeamState, formData: FormData): Promise<DeleteTeamState> {
  const teamId = parsePositiveInt(formData.get('teamId'))
  if (!teamId) {
    return errorResult('無効なチームIDです')
  }

  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const targetTeam = await prisma.team.findFirst({ where: { id: teamId, deletedAt: null } })
  if (!targetTeam) {
    return errorResult('チームが見つかりません')
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.teamMember.updateMany({
        where: { teamId, deletedAt: null },
        data: { deletedAt: new Date() },
      })
      await tx.team.update({
        where: { id: teamId },
        data: { deletedAt: new Date() },
      })
    })
  } catch {
    return errorResult('チームの削除に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)
  return successResult()
}

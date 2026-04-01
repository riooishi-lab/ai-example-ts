'use server'

import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { type ActionState, errorResult, parsePositiveInt, successResult } from '../../utils/actionResult'

export type RemoveTeamMemberState = ActionState

export async function removeTeamMember(_: RemoveTeamMemberState, formData: FormData): Promise<RemoveTeamMemberState> {
  const teamMemberId = parsePositiveInt(formData.get('teamMemberId'))
  if (!teamMemberId) {
    return errorResult('無効なメンバーIDです')
  }

  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const targetMember = await prisma.teamMember.findFirst({ where: { id: teamMemberId, deletedAt: null } })
  if (!targetMember) {
    return errorResult('メンバーが見つかりません')
  }

  try {
    await prisma.teamMember.update({
      where: { id: teamMemberId },
      data: { deletedAt: new Date() },
    })
  } catch {
    return errorResult('メンバーの削除に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)
  return successResult()
}

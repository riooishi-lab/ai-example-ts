'use server'

import { parseWithZod } from '@conform-to/zod'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { errorResult, parsePositiveInt, successResult } from '../../utils/actionResult'
import { TeamFormSchema } from '../components/TeamForm/TeamForm.types'

export const updateTeam = async (_: unknown, formData: FormData) => {
  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const submission = parseWithZod(formData, { schema: TeamFormSchema })
  if (submission.status !== 'success') {
    return submission.reply()
  }

  const { id, name } = submission.value
  const teamId = parsePositiveInt(id ?? null)
  if (!teamId) {
    return errorResult('チームIDは必須です')
  }

  const targetTeam = await prisma.team.findFirst({ where: { id: teamId, deletedAt: null } })
  if (!targetTeam) {
    return errorResult('チームが見つかりません')
  }

  try {
    await prisma.team.update({
      where: { id: teamId },
      data: { name },
    })
  } catch {
    return errorResult('チームの更新に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)
  return successResult()
}

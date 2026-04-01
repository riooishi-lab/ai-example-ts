'use server'

import { parseWithZod } from '@conform-to/zod'
import { prisma } from '@monorepo/database/client'
import { revalidatePath } from 'next/cache'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { checkIsAdminOrSuperAdmin } from '../../../../../libs/auth/session'
import { errorResult, successResult } from '../../utils/actionResult'
import { TeamFormSchema } from '../components/TeamForm/TeamForm.types'

export const createTeam = async (_: unknown, formData: FormData) => {
  const currentUser = await checkIsAdminOrSuperAdmin()
  if (!currentUser) {
    return errorResult('この操作を実行する権限がありません')
  }

  const submission = parseWithZod(formData, { schema: TeamFormSchema })
  if (submission.status !== 'success') {
    return submission.reply()
  }

  const { name } = submission.value

  try {
    await prisma.team.create({
      data: { name },
    })
  } catch {
    return errorResult('チームの作成に失敗しました')
  }

  revalidatePath(PAGE_PATH.ADMIN_SETTINGS)
  return successResult()
}

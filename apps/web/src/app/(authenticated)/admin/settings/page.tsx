import { prisma } from '@monorepo/database/client'
import { redirect } from 'next/navigation'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { checkIsAdminOrManager } from '../../../../libs/auth/session'
import { searchParamsCache } from '../../../../utils/searchParams'
import { SettingsView } from './components/SettingsView'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: Props) {
  if (!(await checkIsAdminOrManager())) {
    redirect(PAGE_PATH.HOME)
  }

  const { tabIndex, page, pageSize } = await searchParamsCache.parse(searchParams)

  const [users, invitations, invitationCount] = await Promise.all([
    prisma.visibleUser.findMany({
      orderBy: { createdAt: 'desc' },
    }),
    tabIndex === 1
      ? prisma.visibleInvitation.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * pageSize,
          take: pageSize,
        })
      : Promise.resolve([]),
    prisma.visibleInvitation.count(),
  ])

  return <SettingsView users={users} invitations={invitations} invitationCount={invitationCount} tabIndex={tabIndex} />
}

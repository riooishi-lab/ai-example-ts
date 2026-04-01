import { prisma } from '@monorepo/database/client'
import { redirect } from 'next/navigation'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { checkIsAdminOrSuperAdmin } from '../../../../libs/auth/session'
import { searchParamsCache } from '../../../../utils/searchParams'
import { SettingsView } from './components/SettingsView'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function SettingsPage({ searchParams }: Props) {
  if (!(await checkIsAdminOrSuperAdmin())) {
    redirect(PAGE_PATH.HOME)
  }

  const { tabIndex, page, pageSize } = await searchParamsCache.parse(searchParams)

  const [users, invitations, invitationCount, teams, allUsers] = await Promise.all([
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
    tabIndex === 2
      ? prisma.team.findMany({
          where: { deletedAt: null },
          include: {
            _count: { select: { teamMembers: { where: { deletedAt: null } } } },
            teamMembers: {
              where: { deletedAt: null, user: { deletedAt: null } },
              include: {
                user: {
                  select: { id: true, publicId: true, firstName: true, lastName: true, email: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : Promise.resolve([]),
    tabIndex === 2
      ? prisma.visibleUser.findMany({
          select: { id: true, publicId: true, firstName: true, lastName: true, email: true },
          orderBy: { lastName: 'asc' },
        })
      : Promise.resolve([]),
  ])

  return (
    <SettingsView
      users={users}
      invitations={invitations}
      invitationCount={invitationCount}
      teams={teams}
      allUsers={allUsers}
      tabIndex={tabIndex}
    />
  )
}

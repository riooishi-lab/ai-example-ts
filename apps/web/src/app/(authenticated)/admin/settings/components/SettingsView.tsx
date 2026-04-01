import type { VisibleInvitation } from '@monorepo/database'
import { useMemo } from 'react'
import { LiaCogSolid } from 'react-icons/lia'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { PageHeader } from '../../../../../components/common/PageHeader'
import { SearchParamTab } from '../../../../../components/common/SearchParamTab'
import { InvitationList } from '../../invitations/components/InvitationList'
import { TeamsTab } from '../../teams/components/TeamsTab'
import type { TeamUser, TeamWithMembers } from '../../teams/types'
import styles from '../page.module.css'
import type { UserWithTeam } from '../types'
import { CreateUserButton } from './CreateUserButton'
import { UsersTab } from './UsersTab'

type Props = {
  users: UserWithTeam[]
  invitations: VisibleInvitation[]
  invitationCount: number
  teams: TeamWithMembers[]
  allUsers: TeamUser[]
  tabIndex: number
}

export function SettingsView({ users, invitations, invitationCount, teams, allUsers, tabIndex }: Props) {
  const subtitle = (() => {
    switch (tabIndex) {
      case 0:
        return `全 ${users.length} 名`
      case 1:
        return `全 ${invitationCount} 招待状`
      case 2:
        return `全 ${teams.length} チーム`
      default:
        return ''
    }
  })()

  const contents = useMemo(
    () => [
      {
        id: 'users',
        label: `Users (${users.length})`,
        content: <UsersTab users={users} />,
      },
      {
        id: 'invitations',
        label: `Invitations (${invitationCount})`,
        content: <InvitationList invitations={invitations} totalCount={invitationCount} />,
      },
      {
        id: 'teams',
        label: `Teams (${teams.length})`,
        content: <TeamsTab teams={teams} allUsers={allUsers} />,
      },
    ],
    [users, invitations, invitationCount, teams, allUsers],
  )

  return (
    <FlexBox flexDirection='column' gap='1.5rem' className={styles.container}>
      <PageHeader icon={<LiaCogSolid size={32} />} title='Settings' subtitle={subtitle}>
        {(tabIndex === 0 || tabIndex === 1) && <CreateUserButton />}
      </PageHeader>

      <SearchParamTab keyName='tabIndex' selectedIndex={tabIndex} contents={contents} />
    </FlexBox>
  )
}

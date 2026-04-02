import type { VisibleInvitation, VisibleUser } from '@monorepo/database'
import { LiaCogSolid } from 'react-icons/lia'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { PageHeader } from '../../../../../components/common/PageHeader'
import { SearchParamTab } from '../../../../../components/common/SearchParamTab'
import { InvitationList } from '../../invitations/components/InvitationList'
import styles from '../page.module.css'
import { CreateUserButton } from './CreateUserButton'
import { UsersTab } from './UsersTab'

type Props = {
  users: VisibleUser[]
  invitations: VisibleInvitation[]
  invitationCount: number
  tabIndex: number
}

export function SettingsView({ users, invitations, invitationCount, tabIndex }: Props) {
  const subtitle = (() => {
    switch (tabIndex) {
      case 0:
        return `全 ${users.length} 名`
      case 1:
        return `全 ${invitationCount} 招待状`
      default:
        return ''
    }
  })()

  const contents = [
    {
      id: 'users',
      label: `ユーザー (${users.length})`,
      content: <UsersTab users={users} />,
    },
    {
      id: 'invitations',
      label: `招待 (${invitationCount})`,
      content: <InvitationList invitations={invitations} totalCount={invitationCount} />,
    },
  ]

  return (
    <FlexBox flexDirection='column' gap='1.5rem' className={styles.container}>
      <PageHeader icon={<LiaCogSolid size={32} />} title='ユーザー管理' subtitle={subtitle}>
        <CreateUserButton />
      </PageHeader>

      <SearchParamTab keyName='tabIndex' selectedIndex={tabIndex} contents={contents} />
    </FlexBox>
  )
}

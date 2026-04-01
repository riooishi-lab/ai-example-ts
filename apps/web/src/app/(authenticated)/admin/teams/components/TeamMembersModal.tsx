'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import styles from '../../settings/page.module.css'
import { type AddTeamMemberState, addTeamMember } from '../actions/addTeamMember'
import type { TeamUser, TeamWithMembers } from '../types'
import { MemberRow } from './MemberRow'

type Props = {
  team: TeamWithMembers
  allUsers: TeamUser[]
  open: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function TeamMembersModal({ team, allUsers, open, onClose, onSuccess, onError }: Props) {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [addState, addFormAction, addPending] = useActionState<AddTeamMemberState, FormData>(addTeamMember, null)

  const availableUsers = useMemo(() => {
    const memberUserIds = new Set(team.teamMembers.map((m) => m.userId))
    return allUsers.filter((u) => !memberUserIds.has(u.id))
  }, [allUsers, team.teamMembers])

  useEffect(() => {
    if (addState?.status === 'success') {
      setSelectedUserId('')
      onSuccess('メンバーを追加しました')
    }
    if (addState?.status === 'error' && addState.error) {
      onError(addState.error.message[0])
    }
  }, [addState, onSuccess, onError])

  return (
    <Modal open={open} onClose={onClose} title={`${team.name} のメンバー`} width='medium' padding='xl'>
      <FlexBox flexDirection='column' gap='1rem'>
        {team.teamMembers.length === 0 ? (
          <Typography
            size='sm'
            color='var(--color-secondary)'
            className={styles.emptyMembers}
            data-testid='team-members-empty'
          >
            メンバーはいません
          </Typography>
        ) : (
          <div>
            {team.teamMembers.map((member) => (
              <MemberRow key={member.id} member={member} onRemoveSuccess={onSuccess} onRemoveError={onError} />
            ))}
          </div>
        )}

        {availableUsers.length > 0 && (
          <form action={addFormAction} className={styles.addMemberRow}>
            <input type='hidden' name='teamId' value={team.id} />
            <input type='hidden' name='userId' value={selectedUserId} />
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              data-testid='team-member-add-select'
            >
              <option value=''>ユーザーを選択</option>
              {availableUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.lastName} {user.firstName} ({user.email})
                </option>
              ))}
            </select>
            <Button
              type='submit'
              size='md'
              disabled={!selectedUserId}
              isLoading={addPending}
              data-testid='team-member-add-button'
            >
              追加
            </Button>
          </form>
        )}
      </FlexBox>
    </Modal>
  )
}

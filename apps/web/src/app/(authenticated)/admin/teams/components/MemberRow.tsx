'use client'

import { useActionState, useEffect } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Typography } from '../../../../../components/common/Typography'
import styles from '../../settings/page.module.css'
import { type RemoveTeamMemberState, removeTeamMember } from '../actions/removeTeamMember'
import type { TeamMemberWithUser } from '../types'

type Props = {
  member: TeamMemberWithUser
  onRemoveSuccess: (message: string) => void
  onRemoveError: (message: string) => void
}

export function MemberRow({ member, onRemoveSuccess, onRemoveError }: Props) {
  const [state, formAction, pending] = useActionState<RemoveTeamMemberState, FormData>(removeTeamMember, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onRemoveSuccess(`${member.user.lastName} ${member.user.firstName} を削除しました`)
    }
    if (state?.status === 'error' && state.error) {
      onRemoveError(state.error.message[0])
    }
  }, [state, member.user.lastName, member.user.firstName, onRemoveSuccess, onRemoveError])

  return (
    <div className={styles.memberRow} data-testid='team-member-row'>
      <FlexBox alignItems='center' gap='0.75rem'>
        <div className={styles.memberAvatar}>
          <Typography size='xs' weight='bold'>
            {member.user.lastName.charAt(0).toUpperCase()}
          </Typography>
        </div>
        <FlexBox flexDirection='column' gap='0.125rem'>
          <Typography size='sm' weight='semibold'>
            {member.user.lastName} {member.user.firstName}
          </Typography>
          <Typography size='xs' color='var(--color-secondary)'>
            {member.user.email}
          </Typography>
        </FlexBox>
      </FlexBox>
      <form action={formAction}>
        <input type='hidden' name='teamMemberId' value={member.id} />
        <Button
          type='submit'
          variant='ghost'
          size='sm'
          theme='danger'
          isLoading={pending}
          aria-label='メンバーを削除'
          data-testid='team-member-remove-button'
        >
          <FiTrash2 size={16} />
        </Button>
      </form>
    </div>
  )
}

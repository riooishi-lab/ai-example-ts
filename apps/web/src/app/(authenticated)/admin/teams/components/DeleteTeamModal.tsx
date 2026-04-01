'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { MessageBox } from '../../../../../components/common/MessageBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import { type DeleteTeamState, deleteTeam } from '../actions/deleteTeam'
import type { TeamWithMembers } from '../types'

type Props = {
  team: TeamWithMembers
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteTeamModal({ team, open, onClose, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<DeleteTeamState, FormData>(deleteTeam, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Modal open={open} onClose={onClose} title='チームを削除' width='small' padding='xl'>
      <form action={formAction}>
        <input type='hidden' name='teamId' value={team.id} />
        <FlexBox flexDirection='column' gap='1.5rem'>
          {state?.status === 'error' && state.error && (
            <MessageBox theme='error'>
              <FlexBox flexDirection='column' gap='0.5rem'>
                {state.error.message.map((msg) => (
                  <Typography key={msg} size='sm'>
                    • {msg}
                  </Typography>
                ))}
              </FlexBox>
            </MessageBox>
          )}

          <Typography size='md' data-testid='delete-team-message'>
            {`"${team.name}"`} を削除してもよろしいですか？チームメンバーの所属も解除されます。
          </Typography>

          <FlexBox justifyContent='flex-end' gap='0.75rem'>
            <Button
              type='button'
              size='lg'
              theme='secondary'
              variant='outline'
              onClick={onClose}
              data-testid='delete-team-cancel-button'
            >
              キャンセル
            </Button>
            <Button type='submit' size='lg' theme='danger' isLoading={pending} data-testid='delete-team-submit-button'>
              {pending ? '削除中...' : '削除'}
            </Button>
          </FlexBox>
        </FlexBox>
      </form>
    </Modal>
  )
}

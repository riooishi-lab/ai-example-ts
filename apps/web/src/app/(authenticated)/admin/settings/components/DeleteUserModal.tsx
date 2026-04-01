'use client'

import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { MessageBox } from '../../../../../components/common/MessageBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import { type DeleteUserState, deleteUser } from '../actions/deleteUser'
import styles from '../page.module.css'
import type { UserWithTeam } from '../types'

type Props = {
  user: UserWithTeam
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteUserModal({ user, open, onClose, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState<DeleteUserState, FormData>(deleteUser, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Modal open={open} onClose={onClose} title='ユーザーを削除' width='small' padding='xl'>
      <form action={formAction}>
        <input type='hidden' name='userId' value={user.id} />
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

          <Typography size='md'>
            {`"${user.lastName} ${user.firstName}"`} を削除してもよろしいですか？この操作は元に戻せません。
          </Typography>

          <FlexBox justifyContent='flex-end' gap='0.75rem' className={styles.actions}>
            <Button type='button' size='lg' theme='secondary' variant='outline' onClick={onClose}>
              キャンセル
            </Button>
            <Button type='submit' size='lg' theme='danger' isLoading={pending}>
              {pending ? '削除中...' : '削除'}
            </Button>
          </FlexBox>
        </FlexBox>
      </form>
    </Modal>
  )
}

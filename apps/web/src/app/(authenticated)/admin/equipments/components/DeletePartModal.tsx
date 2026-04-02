'use client'

import type { VisiblePart } from '@monorepo/database'
import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import { deletePart } from '../actions/deletePart'
import styles from '../page.module.css'

type Props = {
  part: VisiblePart
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeletePartModal({ part, open, onClose, onSuccess }: Props) {
  const [state, formAction, isPending] = useActionState(deletePart, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Modal open={open} onClose={onClose} title='部品を削除' width='medium' padding='xl'>
      <form action={formAction}>
        <input type='hidden' name='partId' value={part.id} />
        <FlexBox flexDirection='column' gap='1.5rem'>
          <Typography size='md'>{`「${part.name}」を削除しますか？`}</Typography>
          <FlexBox gap='0.75rem' justifyContent='flex-end'>
            <Button type='button' theme='secondary' className={styles.cancelButton} onClick={onClose}>
              キャンセル
            </Button>
            <Button type='submit' theme='danger' className={styles.submitButton} isLoading={isPending}>
              削除
            </Button>
          </FlexBox>
          {state?.status === 'error' && state.error?.message[0] && (
            <Typography size='sm' color='red'>
              {state.error.message[0]}
            </Typography>
          )}
        </FlexBox>
      </form>
    </Modal>
  )
}

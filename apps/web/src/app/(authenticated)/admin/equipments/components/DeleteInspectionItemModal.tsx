'use client'

import type { VisibleInspectionItem } from '@monorepo/database'
import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import { deleteInspectionItem } from '../actions/deleteInspectionItem'
import styles from '../page.module.css'

type Props = {
  item: VisibleInspectionItem
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteInspectionItemModal({ item, open, onClose, onSuccess }: Props) {
  const [state, formAction, isPending] = useActionState(deleteInspectionItem, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Modal open={open} onClose={onClose} title='点検項目を削除' width='medium' padding='xl'>
      <form action={formAction}>
        <input type='hidden' name='itemId' value={item.id} />
        <FlexBox flexDirection='column' gap='1.5rem'>
          <Typography size='md'>{`「${item.name}」を削除しますか？`}</Typography>
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

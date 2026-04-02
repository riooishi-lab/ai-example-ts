'use client'

import type { VisibleEquipment } from '@monorepo/database'
import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Modal } from '../../../../../components/common/Modal'
import { Typography } from '../../../../../components/common/Typography'
import { deleteEquipment } from '../actions/deleteEquipment'
import styles from '../page.module.css'

type Props = {
  equipment: VisibleEquipment
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteEquipmentModal({ equipment, open, onClose, onSuccess }: Props) {
  const [state, formAction, isPending] = useActionState(deleteEquipment, null)

  useEffect(() => {
    if (state?.status === 'success') {
      onSuccess()
    }
  }, [state, onSuccess])

  return (
    <Modal open={open} onClose={onClose} title='設備を削除' width='medium' padding='xl'>
      <form action={formAction}>
        <input type='hidden' name='equipmentId' value={equipment.id} />
        <FlexBox flexDirection='column' gap='1.5rem'>
          <FlexBox flexDirection='column' gap='0.5rem'>
            <Typography size='md'>{`「${equipment.name}」を削除しますか？`}</Typography>
            <Typography size='sm' color='var(--color-secondary)'>
              この操作は取り消せません。関連する部品や点検項目も非表示になります。
            </Typography>
          </FlexBox>
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

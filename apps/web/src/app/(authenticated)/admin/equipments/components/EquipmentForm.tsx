'use client'

import type { VisibleEquipment } from '@monorepo/database'
import { useActionState, useEffect } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Input } from '../../../../../components/common/Input'
import type { ActionState } from '../../utils/actionResult'
import styles from '../page.module.css'

type Props = {
  equipment?: VisibleEquipment
  action: (state: unknown, formData: FormData) => Promise<ActionState>
  onCancel: () => void
  onSuccess: () => void
  onError: (message: string) => void
}

function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

export function EquipmentForm({ equipment, action, onCancel, onSuccess, onError }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)

  useEffect(() => {
    if (!state) return
    if (state.status === 'success') {
      onSuccess()
    }
    if (state.status === 'error' && state.error?.message[0]) {
      onError(state.error.message[0])
    }
  }, [state, onSuccess, onError])

  return (
    <form action={formAction}>
      {equipment && <input type='hidden' name='equipmentId' value={equipment.id} />}
      <FlexBox flexDirection='column' gap='1rem'>
        <div className={styles.inputField}>
          <Input label='設備名' name='name' type='text' defaultValue={equipment?.name ?? ''} required />
        </div>
        <div className={styles.inputField}>
          <Input label='ライン名' name='lineName' type='text' defaultValue={equipment?.lineName ?? ''} required />
        </div>
        <div className={styles.inputField}>
          <Input label='号機' name='machineNumber' type='text' defaultValue={equipment?.machineNumber ?? ''} required />
        </div>
        <div className={styles.inputField}>
          <Input label='カテゴリ' name='category' type='text' defaultValue={equipment?.category ?? ''} />
        </div>
        <div className={styles.inputField}>
          <Input
            label='設置日'
            name='installedAt'
            type='date'
            defaultValue={formatDateForInput(equipment?.installedAt)}
          />
        </div>
        <FlexBox gap='0.75rem' justifyContent='flex-end'>
          <Button type='button' theme='secondary' className={styles.cancelButton} onClick={onCancel}>
            キャンセル
          </Button>
          <Button type='submit' className={styles.submitButton} isLoading={isPending}>
            {equipment ? '更新' : '作成'}
          </Button>
        </FlexBox>
      </FlexBox>
    </form>
  )
}

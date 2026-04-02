'use client'

import type { VisibleEquipment, VisiblePart } from '@monorepo/database'
import { useActionState, useEffect, useState } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Input } from '../../../../../components/common/Input'
import type { SelectOption } from '../../../../../components/common/Select'
import { Select } from '../../../../../components/common/Select'
import type { ActionState } from '../../utils/actionResult'
import styles from '../page.module.css'

type Props = {
  part?: VisiblePart
  equipments: VisibleEquipment[]
  preselectedEquipmentId?: number
  action: (state: unknown, formData: FormData) => Promise<ActionState>
  onCancel: () => void
  onSuccess: () => void
  onError: (message: string) => void
}

function formatDateForInput(date: Date | null | undefined): string {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

export function PartForm({ part, equipments, preselectedEquipmentId, action, onCancel, onSuccess, onError }: Props) {
  const [state, formAction, isPending] = useActionState(action, null)
  const defaultEquipmentId = part?.equipmentId ?? preselectedEquipmentId
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(defaultEquipmentId ? String(defaultEquipmentId) : '')

  useEffect(() => {
    if (!state) return
    if (state.status === 'success') {
      onSuccess()
    }
    if (state.status === 'error' && state.error?.message[0]) {
      onError(state.error.message[0])
    }
  }, [state, onSuccess, onError])

  const equipmentOptions = equipments.map((eq) => ({
    value: String(eq.id),
    label: `${eq.name} (${eq.lineName})`,
  }))

  return (
    <form action={formAction}>
      {part && <input type='hidden' name='partId' value={part.id} />}
      <input type='hidden' name='equipmentId' value={selectedEquipmentId} />
      <FlexBox flexDirection='column' gap='1rem'>
        <Select
          options={equipmentOptions}
          placeholder='設備を選択'
          value={selectedEquipmentId}
          onChange={(option: SelectOption | null) => setSelectedEquipmentId(option?.value ?? '')}
        />
        <div className={styles.inputField}>
          <Input label='部品名' name='name' type='text' defaultValue={part?.name ?? ''} required />
        </div>
        <div className={styles.inputField}>
          <Input
            label='標準交換周期（日）'
            name='standardReplaceCycleDays'
            type='number'
            defaultValue={part?.standardReplaceCycleDays?.toString() ?? ''}
          />
        </div>
        <div className={styles.inputField}>
          <Input
            label='最終交換日'
            name='lastReplacedAt'
            type='date'
            defaultValue={formatDateForInput(part?.lastReplacedAt)}
          />
        </div>
        <FlexBox gap='0.75rem' justifyContent='flex-end'>
          <Button type='button' theme='secondary' className={styles.cancelButton} onClick={onCancel}>
            キャンセル
          </Button>
          <Button type='submit' className={styles.submitButton} isLoading={isPending}>
            {part ? '更新' : '作成'}
          </Button>
        </FlexBox>
      </FlexBox>
    </form>
  )
}

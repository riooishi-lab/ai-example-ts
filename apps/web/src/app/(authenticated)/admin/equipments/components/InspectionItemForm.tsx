'use client'

import type { VisibleEquipment, VisibleInspectionItem } from '@monorepo/database'
import { useActionState, useEffect, useState } from 'react'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Input } from '../../../../../components/common/Input'
import type { SelectOption } from '../../../../../components/common/Select'
import { Select } from '../../../../../components/common/Select'
import type { ActionState } from '../../utils/actionResult'
import styles from '../page.module.css'

type Props = {
  item?: VisibleInspectionItem
  equipments: VisibleEquipment[]
  preselectedEquipmentId?: number
  action: (state: unknown, formData: FormData) => Promise<ActionState>
  onCancel: () => void
  onSuccess: () => void
  onError: (message: string) => void
}

const INPUT_TYPE_OPTIONS = [
  { value: 'NUMERIC', label: '数値' },
  { value: 'TEXT', label: 'テキスト' },
]

export function InspectionItemForm({
  item,
  equipments,
  preselectedEquipmentId,
  action,
  onCancel,
  onSuccess,
  onError,
}: Props) {
  const [state, formAction, isPending] = useActionState(action, null)
  const defaultEquipmentId = item?.equipmentId ?? preselectedEquipmentId
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(defaultEquipmentId ? String(defaultEquipmentId) : '')
  const [selectedInputType, setSelectedInputType] = useState(item?.inputType ?? '')

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
      {item && <input type='hidden' name='itemId' value={item.id} />}
      <input type='hidden' name='equipmentId' value={selectedEquipmentId} />
      <input type='hidden' name='inputType' value={selectedInputType} />
      <FlexBox flexDirection='column' gap='1rem'>
        <Select
          options={equipmentOptions}
          placeholder='設備を選択'
          value={selectedEquipmentId}
          onChange={(option: SelectOption | null) => setSelectedEquipmentId(option?.value ?? '')}
        />
        <div className={styles.inputField}>
          <Input label='点検項目名' name='name' type='text' defaultValue={item?.name ?? ''} required />
        </div>
        <Select
          options={INPUT_TYPE_OPTIONS}
          placeholder='入力タイプを選択'
          value={selectedInputType}
          onChange={(option: SelectOption | null) => setSelectedInputType(option?.value ?? '')}
        />
        <div className={styles.inputField}>
          <Input label='単位' name='unit' type='text' defaultValue={item?.unit ?? ''} />
        </div>
        <FlexBox gap='1rem'>
          <div className={styles.inputField} style={{ flex: 1 }}>
            <Input
              label='下限値'
              name='lowerLimit'
              type='number'
              step='any'
              defaultValue={item?.lowerLimit?.toString() ?? ''}
            />
          </div>
          <div className={styles.inputField} style={{ flex: 1 }}>
            <Input
              label='上限値'
              name='upperLimit'
              type='number'
              step='any'
              defaultValue={item?.upperLimit?.toString() ?? ''}
            />
          </div>
        </FlexBox>
        <div className={styles.inputField}>
          <Input label='表示順' name='sortOrder' type='number' defaultValue={item?.sortOrder?.toString() ?? '0'} />
        </div>
        <FlexBox gap='0.75rem' justifyContent='flex-end'>
          <Button type='button' theme='secondary' className={styles.cancelButton} onClick={onCancel}>
            キャンセル
          </Button>
          <Button type='submit' className={styles.submitButton} isLoading={isPending}>
            {item ? '更新' : '作成'}
          </Button>
        </FlexBox>
      </FlexBox>
    </form>
  )
}

'use client'

import type { InspectionInputType } from '@monorepo/database'
import { useActionState, useCallback, useState } from 'react'
import { Button } from '../../../../../../../components/common/Button'
import { Input } from '../../../../../../../components/common/Input'
import Textarea from '../../../../../../../components/common/Textarea'
import { Typography } from '../../../../../../../components/common/Typography'
import { submitInspection } from '../actions/submitInspection'
import styles from './InspectionForm.module.css'

type InspectionItemData = {
  id: number
  name: string
  inputType: InspectionInputType
  unit: string | null
  upperLimit: number | null
  lowerLimit: number | null
  sortOrder: number
}

type Props = {
  equipmentPublicId: string
  inspectionItems: InspectionItemData[]
}

function getValueStatus(params: {
  value: string
  upperLimit: number | null
  lowerLimit: number | null
}): 'normal' | 'warning' | 'danger' {
  const { value, upperLimit, lowerLimit } = params
  if (value === '') return 'normal'
  const numericValue = Number.parseFloat(value)
  if (Number.isNaN(numericValue)) return 'normal'

  if ((upperLimit !== null && numericValue > upperLimit) || (lowerLimit !== null && numericValue < lowerLimit)) {
    return 'danger'
  }

  const hasUpper = upperLimit !== null
  const hasLower = lowerLimit !== null

  if (hasUpper && hasLower) {
    const range = upperLimit - lowerLimit
    const margin = range * 0.1
    if (numericValue > upperLimit - margin || numericValue < lowerLimit + margin) {
      return 'warning'
    }
  } else if (hasUpper) {
    const margin = Math.abs(upperLimit) * 0.1
    if (numericValue > upperLimit - margin) {
      return 'warning'
    }
  } else if (hasLower) {
    const margin = Math.abs(lowerLimit) * 0.1
    if (numericValue < lowerLimit + margin) {
      return 'warning'
    }
  }

  return 'normal'
}

export function InspectionForm({ equipmentPublicId, inspectionItems }: Readonly<Props>) {
  const [lastResult, formAction, isPending] = useActionState(submitInspection, null)
  const [numericValues, setNumericValues] = useState<Record<number, string>>({})

  const handleNumericChange = useCallback((itemId: number, value: string) => {
    setNumericValues((prev) => ({ ...prev, [itemId]: value }))
  }, [])

  return (
    <form action={formAction} className={styles.form}>
      <input type='hidden' name='equipmentPublicId' value={equipmentPublicId} />

      <div className={styles.itemList}>
        {inspectionItems.map((item) => (
          <InspectionItemField
            key={item.id}
            item={item}
            numericValue={numericValues[item.id] ?? ''}
            onNumericChange={handleNumericChange}
          />
        ))}
      </div>

      {lastResult?.status === 'error' && (
        <Typography size='sm' className={styles.errorMessage}>
          {lastResult.error?.message[0]}
        </Typography>
      )}

      {lastResult?.status === 'success' && (
        <Typography size='sm' className={styles.successMessage}>
          点検記録を保存しました
        </Typography>
      )}

      <div className={styles.actions}>
        <Button type='submit' isLoading={isPending}>
          保存
        </Button>
      </div>
    </form>
  )
}

function InspectionItemField({
  item,
  numericValue,
  onNumericChange,
}: Readonly<{
  item: InspectionItemData
  numericValue: string
  onNumericChange: (itemId: number, value: string) => void
}>) {
  const fieldName = `item-${item.id}`

  if (item.inputType === 'NUMERIC') {
    const valueStatus = getValueStatus({
      value: numericValue,
      upperLimit: item.upperLimit,
      lowerLimit: item.lowerLimit,
    })

    return (
      <div className={styles.itemCard}>
        <div className={styles.itemHeader}>
          <Typography size='md' weight='bold'>
            {item.name}
          </Typography>
          {(item.lowerLimit !== null || item.upperLimit !== null) && (
            <div className={styles.limitInfo}>
              {item.lowerLimit !== null && <span>下限: {item.lowerLimit}</span>}
              {item.upperLimit !== null && <span>上限: {item.upperLimit}</span>}
            </div>
          )}
        </div>
        <div className={styles.numericInputWrapper}>
          <Input
            name={fieldName}
            type='number'
            step='any'
            value={numericValue}
            onChange={(e) => onNumericChange(item.id, e.target.value)}
            error={valueStatus === 'danger'}
            className={valueStatus === 'warning' ? styles.warningInput : undefined}
          />
          {item.unit && <span className={styles.unitLabel}>{item.unit}</span>}
        </div>
        {valueStatus === 'danger' && (
          <Typography size='xs' className={styles.dangerText}>
            基準値の範囲外です
          </Typography>
        )}
        {valueStatus === 'warning' && (
          <Typography size='xs' className={styles.warningText}>
            基準値に近い値です
          </Typography>
        )}
      </div>
    )
  }

  return (
    <div className={styles.itemCard}>
      <Typography size='md' weight='bold'>
        {item.name}
      </Typography>
      <Textarea name={fieldName} rows={3} fullWidth />
    </div>
  )
}

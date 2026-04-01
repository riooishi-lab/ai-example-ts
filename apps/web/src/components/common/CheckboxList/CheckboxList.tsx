'use client'

import classNames from 'classnames'
import { Typography } from '../Typography'
import styles from './CheckboxList.module.css'
import type { CheckboxListProps } from './CheckboxList.types'

export const CheckboxList = <T,>({
  items,
  selectedItems,
  onSelectionChange,
  placeholder = 'アイテムがありません',
  className,
  disabled = false,
}: CheckboxListProps<T>) => {
  const handleItemToggle = (item: (typeof items)[0], isChecked: boolean) => {
    if (disabled) return

    if (isChecked) {
      onSelectionChange([...selectedItems, item])
    } else {
      onSelectionChange(selectedItems.filter((selected) => selected.id !== item.id))
    }
  }

  return (
    <div className={classNames(styles.container, className)}>
      {items.length === 0 ? (
        <Typography size='sm' color='secondary'>
          {placeholder}
        </Typography>
      ) : (
        items.map((item) => {
          const isSelected = selectedItems.some((selected) => selected.id === item.id)
          return (
            <label
              key={item.id}
              className={classNames(styles.item, isSelected && styles.selected, disabled && styles.disabled)}
            >
              <input
                type='checkbox'
                checked={isSelected}
                onChange={(e) => handleItemToggle(item, e.target.checked)}
                className={styles.checkbox}
                disabled={disabled}
              />
              <span className={styles.label}>{item.label}</span>
            </label>
          )
        })
      )}
    </div>
  )
}

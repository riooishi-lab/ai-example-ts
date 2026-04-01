'use client'

import classNames from 'classnames'
import type React from 'react'
import { Typography } from '../Typography'
import { MultiSelect } from './MultiSelect'
import styles from './Select.module.css'
import type { SelectOption, SelectProps } from './Select.types'

export const Select = (props: SelectProps) => {
  const {
    value,
    options,
    placeholder = '選択してください...',
    isClearable = false,
    isLoading = false,
    error = false,
    helpText,
    // biome-ignore lint/correctness/noUnusedVariables: May be used in future
    fullWidth = true,
    className,
    disabled,
    ...restProps
  } = props

  if ('multiple' in props && props.multiple) {
    return <MultiSelect {...props} />
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value

    if (selectedValue === '') {
      event.target.classList.add(styles.placeholder)
    } else {
      event.target.classList.remove(styles.placeholder)
    }

    if (!('onChange' in props)) return

    if (selectedValue === '') {
      props.onChange?.(null)
      return
    }

    const selectedOption = options.find((option) => option.value === selectedValue)
    if (selectedOption) {
      props.onChange?.(selectedOption)
    }
  }

  const resolveSelectValue = (): string => {
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && 'value' in value) return (value as SelectOption).value
    return ''
  }

  const selectValue = resolveSelectValue()

  const selectProps = {
    ...restProps,
    multiple: false as const,
    onChange: handleChange,
    className: classNames(styles.select, error && styles.error, className),
    disabled: disabled || isLoading,
    ...(value !== undefined && { value: selectValue }),
  }

  return (
    <div className={styles.wrapper}>
      <select {...selectProps}>
        {(isClearable || value === undefined || !selectValue) && <option value=''>{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.isDisabled}>
            {option.label}
          </option>
        ))}
      </select>
      {isLoading && <div className={styles.loading} />}
      {helpText && (
        <Typography size='sm' color='secondary' weight='normal'>
          {helpText}
        </Typography>
      )}
    </div>
  )
}

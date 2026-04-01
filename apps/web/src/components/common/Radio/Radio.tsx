import classNames from 'classnames'
import type { FC } from 'react'

import styles from './Radio.module.css'
import type { RadioGroupOption, RadioGroupProps } from './Radio.types'

const resolveOptionKey = (option: RadioGroupOption, index: number) => {
  if (option.key) return option.key
  if (typeof option.inputProps.value !== 'undefined') {
    return String(option.inputProps.value)
  }
  return String(index)
}

export const RadioGroup: FC<RadioGroupProps> = ({ options, className, optionClassName }) => {
  return (
    <div className={classNames(styles.group, className)}>
      {options.map((option, index) => {
        const { inputProps, label, description, isSelected, className: optionClassNameOverride } = option
        const { className: inputClassName, type, ...restInputProps } = inputProps
        return (
          <label
            key={resolveOptionKey(option, index)}
            className={classNames(
              styles.option,
              optionClassName,
              optionClassNameOverride,
              isSelected && styles.optionSelected,
            )}
          >
            <input {...restInputProps} type={type ?? 'radio'} className={classNames(styles.input, inputClassName)} />
            <div className={styles.optionContent}>
              <span className={styles.label}>{label}</span>
              {description ? <span className={styles.description}>{description}</span> : null}
            </div>
          </label>
        )
      })}
    </div>
  )
}

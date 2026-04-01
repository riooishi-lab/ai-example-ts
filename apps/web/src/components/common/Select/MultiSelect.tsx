'use client'

import classNames from 'classnames'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { IoClose } from 'react-icons/io5'
import { Typography } from '../Typography'
import { removeOption, resolveSelectedOptions, toggleOption } from './multiSelectUtils'
import styles from './Select.module.css'
import type { SelectOption, SelectProps } from './Select.types'
import { useDropdownPosition } from './useDropdownPosition'

type MultiSelectProps = Extract<SelectProps, { multiple: true }>

export const MultiSelect = (props: MultiSelectProps) => {
  const {
    value,
    options,
    placeholder = '選択してください...',
    isLoading = false,
    error = false,
    helpText,
    className,
    disabled,
  } = props

  const [isOpen, setIsOpen] = useState(false)
  const { wrapperRef, dropdownRef, dropdownPosition } = useDropdownPosition({ isOpen, onClose: () => setIsOpen(false) })
  const selectedOptions = resolveSelectedOptions(value, options)

  const handleToggle = (option: SelectOption) => {
    const currentValues = Array.isArray(value) ? value : []
    props.onChange?.(toggleOption(currentValues, option, options))
  }

  const handleRemoveTag = (option: SelectOption) => {
    const currentValues = Array.isArray(value) ? value : []
    props.onChange?.(removeOption(currentValues, option, options))
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Custom select component */}
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: Custom select with listbox pattern */}
      <div
        className={classNames(
          styles.multiSelect,
          error && styles.error,
          disabled && styles.disabled,
          isOpen && styles.open,
          className,
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup='listbox'
      >
        <div className={styles.tagsContainer}>
          {selectedOptions.length === 0 ? (
            <span className={styles.placeholder}>{placeholder}</span>
          ) : (
            selectedOptions.map((option) => (
              <span key={option.value} className={styles.tag}>
                {option.label}
                <button
                  type='button'
                  className={styles.tagRemove}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveTag(option)
                  }}
                  disabled={disabled}
                  aria-label={`Remove ${option.label}`}
                >
                  <IoClose />
                </button>
              </span>
            ))
          )}
        </div>
        <div className={styles.indicator}>
          <svg width='20' height='20' viewBox='0 0 20 20' aria-hidden='true'>
            <path d='M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z' />
          </svg>
        </div>
      </div>
      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={dropdownRef}
            className={classNames(styles.dropdown, dropdownPosition === 'top' && styles.dropdownTop)}
          >
            {options.map((option) => {
              const isSelected = selectedOptions.some((v) => v.value === option.value)
              return (
                <button
                  key={option.value}
                  type='button'
                  className={classNames(
                    styles.dropdownOption,
                    isSelected && styles.selected,
                    option.isDisabled && styles.disabled,
                  )}
                  onClick={() => !option.isDisabled && handleToggle(option)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !option.isDisabled) {
                      e.preventDefault()
                      handleToggle(option)
                    }
                  }}
                  disabled={option.isDisabled}
                >
                  <input
                    type='checkbox'
                    checked={isSelected}
                    onChange={() => {}}
                    className={styles.checkbox}
                    tabIndex={-1}
                    aria-hidden='true'
                    disabled={option.isDisabled}
                  />
                  {option.label}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
      {isLoading && <div className={styles.loading} />}
      {helpText && (
        <Typography size='sm' color='secondary' weight='normal'>
          {helpText}
        </Typography>
      )}
    </div>
  )
}

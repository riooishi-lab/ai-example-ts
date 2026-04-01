'use client'

import classNames from 'classnames'
import type { GroupBase } from 'react-select'
import ReactAsyncSelect from 'react-select/async'
import { useClientSideValidatorContext } from '../../../contexts/clientSideValidator.context'
import { Typography } from '../Typography'
import styles from './AsyncSelect.module.css'
import type { AsyncSelectProps } from './AsyncSelect.types'

const AsyncSelect = <
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  error,
  inputId,
  helpText,
  ...props
}: AsyncSelectProps<Option, IsMulti, Group> = {}) => {
  const { isClientSide } = useClientSideValidatorContext()
  if (!isClientSide) return null
  return (
    <>
      <ReactAsyncSelect
        {...props}
        className={classNames(styles.root, error && styles.error, props.className)}
        placeholder={props.placeholder ?? 'Select...'}
        noOptionsMessage={(inputValue) => (props.noOptionsMessage ? props.noOptionsMessage(inputValue) : 'No options')}
        inputId={inputId}
        classNames={{
          ...props.classNames,
          control: (args) => classNames(styles.control, props.classNames?.control?.(args)),
        }}
        menuPortalTarget={props.menuPortalTarget ?? document.body}
        menuPosition={props.menuPosition ?? 'fixed'}
        styles={{
          ...props.styles,
          menuPortal: (base) => ({ ...base, zIndex: 9999, pointerEvents: 'all' }),
        }}
      />
      {helpText && (
        <Typography size='sm' color='secondary' weight='normal' style={{ display: 'block' }}>
          {helpText}
        </Typography>
      )}
    </>
  )
}

export default AsyncSelect

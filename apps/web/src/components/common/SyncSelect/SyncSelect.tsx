'use client'

import classNames from 'classnames'
import type { GroupBase } from 'react-select'
import Select from 'react-select'
import { useClientSideValidatorContext } from '../../../contexts/clientSideValidator.context'
import { Typography } from '../Typography'
import styles from './SyncSelect.module.css'
import type { SyncSelectProps } from './SyncSelect.types'

const SyncSelect = <
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
>({
  error,
  helpText,
  ...props
}: SyncSelectProps<Option, IsMulti, Group> = {}) => {
  const { isClientSide } = useClientSideValidatorContext()
  if (!isClientSide) return null
  return (
    <>
      <Select
        {...props}
        className={classNames(styles.root, error && styles.error, props.className)}
        placeholder={props.placeholder ?? 'Select...'}
        noOptionsMessage={(inputValue) => (props.noOptionsMessage ? props.noOptionsMessage(inputValue) : 'No options')}
        classNames={{
          ...props.classNames,
          control: (args) => classNames(styles.control, props.classNames?.control?.(args)),
        }}
        menuPortalTarget={props.menuPortalTarget ?? document.body}
        menuPosition={props.menuPosition ?? 'fixed'}
        styles={{
          ...props.styles,
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
      {helpText && (
        <Typography size='sm' color='secondary' weight='normal'>
          {helpText}
        </Typography>
      )}
    </>
  )
}

export default SyncSelect

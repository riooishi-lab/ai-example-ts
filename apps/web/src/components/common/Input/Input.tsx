import classNames from 'classnames'
import { forwardRef, memo } from 'react'

import { FlexBox } from '../FlexBox'
import { InputLabel } from '../InputLabel'
import styles from './Input.module.css'
import type { InputProps } from './Input.types'

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    label,
    className,
    theme = 'primary',
    prefix,
    suffix,
    error,
    errorMessage,
    gap = '0.25rem',
    required,
    description,
    fullWidth,
    ...rest
  } = props
  return (
    <InputLabel
      label={label}
      required={required}
      className={classNames(styles[error ? 'error' : theme], className, fullWidth && styles['full-width'])}
    >
      <FlexBox alignItems='center' gap={gap} style={{ width: '100%' }}>
        {prefix && <span>{prefix}</span>}
        <input {...rest} ref={ref} autoComplete='off' autoCorrect='off' autoCapitalize='off' spellCheck='false' />
        {suffix && <span>{suffix}</span>}
      </FlexBox>
      {description && <span className={styles.description}>{description}</span>}
      {errorMessage}
    </InputLabel>
  )
})

const [displayName] = Object.keys(Input)
Input.displayName = displayName

export default memo(Input)

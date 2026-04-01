import classNames from 'classnames'
import { forwardRef, memo } from 'react'

import { FlexBox } from '../FlexBox'
import { InputLabel } from '../InputLabel'
import { Typography } from '../Typography'
import styles from './Textarea.module.css'
import type { TextareaProps } from './Textarea.types'

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((props, ref) => {
  const {
    label,
    className,
    theme = 'primary',
    prefix,
    suffix,
    error,
    gap = '0.25rem',
    required,
    description,
    fullWidth,
    rows = 3,
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
        <textarea
          {...rest}
          rows={rows}
          ref={ref}
          autoComplete='off'
          autoCorrect='off'
          autoCapitalize='off'
          spellCheck='false'
        />
        {suffix && <span>{suffix}</span>}
      </FlexBox>
      {description && <span className={styles.description}>{description}</span>}
      {typeof error === 'string' && (
        <Typography color='#b42c01' weight={400}>
          {error}
        </Typography>
      )}
    </InputLabel>
  )
})

const [displayName] = Object.keys(Textarea)
Textarea.displayName = displayName

export default memo(Textarea)

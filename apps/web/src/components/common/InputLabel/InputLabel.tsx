import classNames from 'classnames'
import type { ElementType } from 'react'

import { Typography } from '../Typography'
import styles from './InputLabel.module.css'
import type { InputLabelProps } from './InputLabel.types'

function InputLabel<T extends ElementType = 'label'>(props: InputLabelProps<T>) {
  const { label, required, children, tag, ...labelProps } = props
  const Tag = tag || 'label'
  return (
    <Tag data-testid={labelProps['data-testid']} className={classNames(labelProps.className, !!label && styles.label)}>
      <div className={styles.container}>
        {typeof label === 'string' || typeof label === 'number' ? (
          <Typography color='#0c0c0c' size='md'>
            {label}
          </Typography>
        ) : (
          label
        )}
        {required && (
          <Typography color='#b42c01' size='md' whiteSpace='nowrap'>
            必須
          </Typography>
        )}
      </div>
      {children}
    </Tag>
  )
}

export default InputLabel

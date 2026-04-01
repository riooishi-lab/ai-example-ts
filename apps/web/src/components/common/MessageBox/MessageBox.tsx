import classNames from 'classnames'

import type { FC } from 'react'
import styles from './MessageBox.module.css'
import type { MessageBoxProps } from './MessageBox.types'

const MessageBox: FC<MessageBoxProps> = ({
  theme = 'primary',
  padding = 'medium',
  fullWidth,
  className,
  children,
  ...restProps
}) => (
  <div
    className={classNames(
      styles.root,
      styles[theme],
      fullWidth && styles['full-width'],
      className,
      styles[`padding-${padding}`],
    )}
    {...restProps}
  >
    {children}
  </div>
)
export default MessageBox

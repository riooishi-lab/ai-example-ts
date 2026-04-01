import classNames from 'classnames'
import styles from './StatusLabel.module.css'
import type { StatusLabelProps } from './StatusLabel.types'

export const StatusLabel = ({ theme, text, className }: StatusLabelProps) => (
  <span className={classNames(styles.label, styles[theme], className)}>{text}</span>
)

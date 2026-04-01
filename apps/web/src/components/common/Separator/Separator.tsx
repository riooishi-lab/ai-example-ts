import classNames from 'classnames'
import styles from './Separator.module.css'
import type { SeparatorProps } from './Separator.types'

const Separator = ({ direction, width, height, className, color }: SeparatorProps) => {
  if (direction === 'horizontal') {
    return (
      <hr className={classNames(className, styles['separator-horizontal'])} style={{ width, backgroundColor: color }} />
    )
  }
  if (direction === 'vertical') {
    return (
      <div className={classNames(className, styles['separator-vertical'])} style={{ height, backgroundColor: color }} />
    )
  }
  return null
}

export default Separator

import classNames from 'classnames'
import type { FC } from 'react'

import styles from './Base.module.css'
import type { BaseProps } from './Base.types'

const Base: FC<BaseProps> = (props) => {
  const {
    className,
    children,
    theme = 'background',
    withShadow = false,
    hoverable = false,
    clickable = false,
    maxHeight,
    minHeight,
    padding,
    style,
    fullWidth,
    onClick,
    outlined = false,
  } = props
  const baseStyle = clickable ? styles.clickable : styles.base
  const paddingStyle = padding && styles[`padding--${padding}`]
  const backgroundStyle = theme && styles[`theme--${theme}`]
  const hoverStyle = hoverable && theme && styles[`hoverable--${theme}`]
  const hightStyle = maxHeight && styles['base-max-hight']
  const shadowStyle = withShadow && styles.shadow
  const widthStyle = fullWidth && styles.fullwidth

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: Base component may be used with onClick handlers
    // biome-ignore lint/a11y/noStaticElementInteractions: Generic container component
    <div
      className={classNames(
        baseStyle,
        backgroundStyle,
        hoverStyle,
        shadowStyle,
        paddingStyle,
        hightStyle,
        widthStyle,
        className,
        !outlined && styles['no-outline'],
      )}
      style={{ ...style, maxHeight, minHeight }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Base

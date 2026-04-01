import classNames from 'classnames'
import { forwardRef } from 'react'

import styles from './FlexBox.module.css'
import type { FlexBoxProps } from './FlexBox.types'

const FlexBox = forwardRef<HTMLDivElement, FlexBoxProps>((props, ref) => {
  const {
    children,
    style,
    className,
    onClick,
    alignContent,
    alignItems,
    width,
    padding,
    overflow,
    justifyContent,
    height,
    gap,
    flexWrap,
    flexShrink,
    flexBasis,
    flexDirection,
    flexGrow,
    fullWidth,
    ...otherProps
  } = props
  const stypeProps = {
    alignContent,
    alignItems,
    width,
    padding,
    overflow,
    justifyContent,
    height,
    gap,
    flexWrap,
    flexShrink,
    flexBasis,
    flexDirection,
    flexGrow,
    fullWidth,
  }
  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: FlexBox component may be used with onClick handlers
    // biome-ignore lint/a11y/noStaticElementInteractions: Generic container component
    <div
      {...otherProps}
      ref={ref}
      className={classNames(styles.flex, className)}
      style={{ ...stypeProps, ...style, ...(fullWidth ? { width: '100%' } : {}) }}
      onClick={onClick}
    >
      {children}
    </div>
  )
})

const [displayName] = Object.keys({ FlexBox })
FlexBox.displayName = displayName

export default FlexBox

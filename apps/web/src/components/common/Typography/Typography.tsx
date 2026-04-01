import classNames from 'classnames'

import styles from './Typography.module.css'
import type { TypographyProps } from './Typography.types'

const Typography = <E extends React.ElementType = 'span'>(props: TypographyProps<E>) => {
  const {
    children,
    size = 'md',
    color,
    style,
    className,
    align,
    weight,
    whiteSpace,
    wordBreak,
    TagName = 'span',
    lineClamp,
    truncate,
    ...otherProps
  } = props
  return (
    <TagName
      className={classNames(styles.common, size && styles[size], className)}
      style={{
        color,
        textAlign: align,
        fontWeight: weight,
        wordBreak: wordBreak ? 'break-all' : undefined,
        whiteSpace,
        ...(lineClamp && {
          display: '-webkit-box',
          WebkitLineClamp: lineClamp,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }),
        ...(truncate && {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }),
        ...style,
      }}
      {...otherProps}
    >
      {children}
    </TagName>
  )
}

export default Typography

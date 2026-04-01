import type { FC } from 'react'
import styles from './Button.module.css'
import type { ButtonProps } from './Button.types'

export const Button: FC<ButtonProps> = ({
  children,
  className,
  theme = 'primary',
  variant = 'solid',
  size = 'md',
  isLoading = false,
  isFullWidth = false,
  disabled,
  ...props
}) => {
  const classNames = [
    styles.button,
    styles[theme],
    styles[variant],
    styles[size],
    isFullWidth && styles.fullWidth,
    isLoading && styles.loading,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classNames} disabled={disabled || isLoading} {...props}>
      {children}
    </button>
  )
}

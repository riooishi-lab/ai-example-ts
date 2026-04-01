import type { ComponentPropsWithoutRef } from 'react'

export type ButtonTheme = 'primary' | 'secondary' | 'danger'
export type ButtonVariant = 'solid' | 'outline' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export type ButtonProps = ComponentPropsWithoutRef<'button'> & {
  theme?: ButtonTheme
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  isFullWidth?: boolean
}

import type { CSSProperties, JSX, MouseEventHandler, ReactNode } from 'react'

export type BaseProps = {
  className?: string
  children: ReactNode
  theme?: 'background' | 'brand' | 'error' | 'disabled'
  padding?: 'xl' | 'l' | 'm' | 's' | 'xs' | null
  withShadow?: boolean
  hoverable?: boolean
  clickable?: boolean
  maxHeight?: CSSProperties['maxHeight']
  minHeight?: CSSProperties['minHeight']
  style?: JSX.IntrinsicElements['div']['style']
  onClick?: MouseEventHandler
  fullWidth?: boolean
  outlined?: boolean
}

import type { JSX, ReactNode } from 'react'

export type StatusLabelProps = {
  theme: 'disabled' | 'warn' | 'success' | 'danger'
  text?: ReactNode
  className?: JSX.IntrinsicElements['span']['className']
}

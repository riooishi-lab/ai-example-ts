import type { JSX } from 'react'

export type MessageBoxProps = {
  theme?: 'error' | 'success' | 'primary'
  padding?: 'medium' | 'small' | 'large' | 'none'
  fullWidth?: boolean
} & JSX.IntrinsicElements['div']

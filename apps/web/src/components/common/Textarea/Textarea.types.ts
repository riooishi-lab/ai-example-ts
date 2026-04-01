import type { JSX, ReactNode } from 'react'

import type { FlexBoxProps } from '../FlexBox/FlexBox.types'

export type TextareaProps = JSX.IntrinsicElements['textarea'] & {
  /**
   * Number of rows to display.
   * @default 3
   */
  rows?: number
  label?: ReactNode
  theme?: 'brand' | 'primary'
  prefix?: ReactNode
  suffix?: ReactNode
  gap?: FlexBoxProps['gap']
  error?: string | boolean
  required?: boolean
  description?: ReactNode
  fullWidth?: boolean
}

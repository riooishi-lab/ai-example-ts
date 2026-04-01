import type { JSX, ReactNode } from 'react'

import type { FlexBoxProps } from '../FlexBox/FlexBox.types'

export type InputProps = JSX.IntrinsicElements['input'] & {
  label?: ReactNode
  theme?: 'brand' | 'primary'
  prefix?: ReactNode
  suffix?: ReactNode
  gap?: FlexBoxProps['gap']
  error?: boolean
  errorMessage?: ReactNode
  required?: boolean
  description?: ReactNode
  fullWidth?: boolean
}

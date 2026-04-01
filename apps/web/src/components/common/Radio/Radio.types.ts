import type { InputHTMLAttributes, ReactNode } from 'react'

export type RadioGroupOption = {
  key?: string
  label: ReactNode
  description?: ReactNode
  inputProps: InputHTMLAttributes<HTMLInputElement>
  isSelected?: boolean
  className?: string
}

export type RadioGroupProps = {
  options: RadioGroupOption[]
  className?: string
  optionClassName?: string
}

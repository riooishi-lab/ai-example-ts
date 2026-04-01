import type { SelectHTMLAttributes } from 'react'

export type SelectOption = {
  value: string
  label: string
  isDisabled?: boolean
}

export type SelectProps = {
  options: SelectOption[]
  placeholder?: string
  isClearable?: boolean
  isLoading?: boolean
  error?: boolean
  helpText?: string
  fullWidth?: boolean
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange' | 'multiple'> &
  (
    | {
        multiple?: false
        value?: SelectOption | SelectOption['value'] | null
        onChange?: (newValue: SelectOption | null) => void
      }
    | {
        multiple: true
        value?: SelectOption[] | SelectOption['value'][] | null
        onChange?: (newValue: SelectOption[]) => void
      }
  )

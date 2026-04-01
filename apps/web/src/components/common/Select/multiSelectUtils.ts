import type { SelectOption } from './Select.types'

export function resolveOptionValue(v: SelectOption | string): string {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object' && 'value' in v) return v.value
  return ''
}

export function toSelectOption(v: SelectOption | string, options: SelectOption[]): SelectOption {
  if (typeof v === 'object' && 'value' in v) return v
  return options.find((opt) => opt.value === v) || { value: v, label: v }
}

export function resolveSelectedOptions(
  value: SelectOption[] | string[] | null | undefined,
  options: SelectOption[],
): SelectOption[] {
  if (!Array.isArray(value)) return []
  return value.map((v) => {
    if (typeof v === 'object' && v !== null && 'value' in v && 'label' in v) {
      return v as SelectOption
    }
    const compareValue = typeof v === 'string' ? v : ''
    return options.find((opt) => opt.value === compareValue) || { value: compareValue, label: compareValue }
  })
}

export function toggleOption(
  currentValues: (SelectOption | string)[],
  option: SelectOption,
  options: SelectOption[],
): SelectOption[] {
  const isSelected = currentValues.some((v) => resolveOptionValue(v) === option.value)

  if (isSelected) {
    return currentValues.filter((v) => resolveOptionValue(v) !== option.value).map((v) => toSelectOption(v, options))
  }

  return [...currentValues.map((v) => toSelectOption(v, options)), option]
}

export function removeOption(
  currentValues: (SelectOption | string)[],
  optionToRemove: SelectOption,
  options: SelectOption[],
): SelectOption[] {
  return currentValues
    .filter((v) => resolveOptionValue(v) !== optionToRemove.value)
    .map((v) => toSelectOption(v, options))
}

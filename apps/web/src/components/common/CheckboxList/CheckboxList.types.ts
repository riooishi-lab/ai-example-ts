export type CheckboxListItem<T = unknown> = {
  id: string
  label: string
  value: T
}

export type CheckboxListProps<T = unknown> = {
  items: CheckboxListItem<T>[]
  selectedItems: CheckboxListItem<T>[]
  onSelectionChange: (selectedItems: CheckboxListItem<T>[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

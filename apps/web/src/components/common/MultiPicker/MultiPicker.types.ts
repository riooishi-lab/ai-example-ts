import type { IconType } from 'react-icons'

export type MultiPickerItem = {
  id: number
  name: string
  [key: string]: unknown
}

export type MultiPickerTabData<T extends MultiPickerItem = MultiPickerItem> = {
  data: T[]
  count: number
}

export type MultiPickerTab<TId extends string = string> = {
  id: TId
  label: string
  icon: IconType
  placeholder?: string
}

export type SelectedPickerItem<TCategory extends string = string> = {
  id: number
  name: string
  category: TCategory
}

export type MultiPickerProps<TId extends string = string> = {
  tabs: MultiPickerTab<TId>[]
  data: Record<TId, MultiPickerTabData> | null
  selectedItems: SelectedPickerItem<TId>[]
  onSelect: (item: SelectedPickerItem<TId>) => void
  onSearch: (query: string) => void
  trigger?: React.ReactNode
  renderSubLabel?: (item: MultiPickerItem, tab: TId) => React.ReactNode
  emptyLabel?: string
}

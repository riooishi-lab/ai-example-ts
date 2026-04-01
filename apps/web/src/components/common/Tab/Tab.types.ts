import type { ReactNode } from 'react'

export type TabContent = {
  id: string
  label: ReactNode
  content: ReactNode
}

export type TabProps = {
  contents: readonly TabContent[]
  onChange?: (selectIndex: number) => void
  selectedIndex?: number
  defaultIndex?: number
}

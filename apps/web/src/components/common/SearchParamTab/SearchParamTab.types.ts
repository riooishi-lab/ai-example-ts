import type { TabProps } from '../Tab/Tab.types'

export type SearchParamTabProps = Pick<TabProps, 'selectedIndex' | 'contents'> & {
  keyName?: string
  prefetch?: boolean
  resetKeys?: string[]
}

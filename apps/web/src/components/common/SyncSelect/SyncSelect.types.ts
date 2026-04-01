import type { GroupBase, Props } from 'react-select'

export type SyncSelectProps<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = Props<Option, IsMulti, Group> & {
  error?: boolean
  helpText?: string
}

import type { GroupBase } from 'react-select'
import type { AsyncProps } from 'react-select/async'

export type AsyncSelectProps<
  Option = unknown,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>,
> = AsyncProps<Option, IsMulti, Group> & {
  error?: boolean
  inputId?: string
  helpText?: string
}

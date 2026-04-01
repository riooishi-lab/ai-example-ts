import type { MouseEventHandler, ReactNode } from 'react'

import type { PopoverProps } from '../Popover/Popover.types'

export type DropDownContent = {
  id: string | number
  label: ReactNode
  onClick?: MouseEventHandler<HTMLButtonElement>
  icon?: ReactNode
}

export type DropDownProps = {
  contents: DropDownContent[]
  position?: PopoverProps['position']
  anchorEl?: ReactNode
}

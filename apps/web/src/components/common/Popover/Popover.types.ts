import type { PopoverContentProps } from '@radix-ui/react-popover'

import type { ReactNode } from 'react'

export type PopoverProps = {
  children?: ReactNode
  position?: PopoverContentProps['side']
  anchorEl: ReactNode
  withTriangle?: boolean
  open?: boolean
  onClose?: () => void
  onOpen?: () => void
  syncTriggerWidth?: boolean
} & Omit<PopoverContentProps, 'side'>

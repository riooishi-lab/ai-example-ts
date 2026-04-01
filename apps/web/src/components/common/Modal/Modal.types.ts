import type { ReactNode } from 'react'

export type ModalProps = {
  open?: boolean
  onClose?: () => void
  onOpen?: () => void
  triggerEl?: ReactNode
  children?: ReactNode
  padding?: 'xl' | 'l' | 'm' | 's' | 'xs' | null
  title?: string | ReactNode
  width?: 'small' | 'medium' | 'large' | 'full' | 'auto'
  preventOutsideClickBreakpoint?: number
}

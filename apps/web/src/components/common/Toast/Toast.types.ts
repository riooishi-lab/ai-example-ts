import type { ReactNode } from 'react'

export type ToastProps = {
  title?: ReactNode
  children?: ReactNode
  action?: {
    altText: string
    el: ReactNode
  }
  theme?: 'primary' | 'error' | 'success'
  open?: boolean
  onOpen?: () => void
  onClose?: () => void
  duration?: number
}

'use client'

import { useCallback, useState } from 'react'
import type { ToastProps } from './Toast.types'

type ToastTheme = NonNullable<ToastProps['theme']>

export function useToast() {
  const [state, setState] = useState<Pick<ToastProps, 'open' | 'title' | 'theme'>>({
    open: false,
    title: '',
    theme: 'success',
  })

  const showToast = useCallback((title: string, theme: ToastTheme = 'success') => {
    setState({ open: true, title, theme })
  }, [])

  const closeToast = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }))
  }, [])

  const toastProps: Pick<ToastProps, 'open' | 'title' | 'theme' | 'onClose'> = {
    ...state,
    onClose: closeToast,
  }

  return { showToast, closeToast, toastProps }
}

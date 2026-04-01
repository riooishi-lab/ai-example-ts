'use client'
import * as Dialog from '@radix-ui/react-dialog'
import classNames from 'classnames'
import type React from 'react'
import { useEffect, useState } from 'react'
import { MdClose } from 'react-icons/md'
import { useClientSideValidatorContext } from '../../../contexts/clientSideValidator.context'
import styles from './Modal.module.css'
import type { ModalProps } from './Modal.types'

const Modal: React.FC<ModalProps> = ({
  open,
  title,
  onClose,
  onOpen,
  children,
  padding = 'm',
  width = 'auto',
  triggerEl,
  preventOutsideClickBreakpoint = 1024,
}) => {
  const { isClientSide } = useClientSideValidatorContext()
  const [preventOutsideClick, setPreventOutsideClick] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${preventOutsideClickBreakpoint}px)`)
    const checkScreenSize = () => {
      setPreventOutsideClick(mediaQuery.matches)
    }

    checkScreenSize()
    mediaQuery.addEventListener('change', checkScreenSize)
    return () => mediaQuery.removeEventListener('change', checkScreenSize)
  }, [preventOutsideClickBreakpoint])

  if (!isClientSide) return null

  return (
    <Dialog.Root open={open} onOpenChange={(open) => (open ? onOpen?.() : onClose?.())}>
      {triggerEl && <Dialog.Trigger>{triggerEl}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className={classNames(styles.backdrop)} />
        <Dialog.Content
          onPointerDownOutside={(e) => preventOutsideClick && e.preventDefault()}
          className={classNames(styles.modal, padding ? styles[`padding--${padding}`] : undefined, styles[width])}
        >
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          <div className={styles['content-style']}>{children}</div>
          <Dialog.Close className={styles['close-icon']}>
            <MdClose size={20} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal

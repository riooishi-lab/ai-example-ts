import * as RadixToast from '@radix-ui/react-toast'
import classNames from 'classnames'
import styles from './Toast.module.css'
import type { ToastProps } from './Toast.types'

const Toast = ({ title, children, action, open, onOpen, onClose, duration, theme = 'primary' }: ToastProps) => (
  <RadixToast.Provider swipeDirection='right'>
    <RadixToast.Root
      duration={duration}
      className={classNames(styles.root, styles[theme])}
      open={open}
      onOpenChange={(open) => (open ? onOpen?.() : onClose?.())}
    >
      {title && <RadixToast.Title className={styles.title}>{title}</RadixToast.Title>}
      {children && <RadixToast.Description className={styles.description}>{children}</RadixToast.Description>}
      {action && (
        <RadixToast.Action altText={action.altText} asChild className={styles.action}>
          {action.el}
        </RadixToast.Action>
      )}
    </RadixToast.Root>
    <RadixToast.Viewport className={styles['toast-viewport']} />
  </RadixToast.Provider>
)

export default Toast

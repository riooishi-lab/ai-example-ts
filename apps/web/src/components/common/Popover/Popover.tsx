import * as RadixPopover from '@radix-ui/react-popover'
import classNames from 'classnames'

import type { FC } from 'react'
import { useClientSideValidatorContext } from '../../../contexts/clientSideValidator.context'
import styles from './Popover.module.css'
import type { PopoverProps } from './Popover.types'

const Popover: FC<PopoverProps> = ({
  anchorEl,
  open,
  onOpen,
  onClose,
  children,
  position = 'bottom' as const,
  withTriangle,
  syncTriggerWidth,
  ...contentProps
}) => {
  const { isClientSide } = useClientSideValidatorContext()
  if (!isClientSide) return null

  return (
    <RadixPopover.Root open={open} onOpenChange={(open) => (open ? onOpen?.() : onClose?.())}>
      <RadixPopover.Trigger>{anchorEl}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          {...contentProps}
          side={position}
          className={classNames(styles.content, syncTriggerWidth && styles['sync-trigger-width'])}
        >
          {children}
          {withTriangle && <RadixPopover.Arrow className={styles.triangle} />}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}
export default Popover

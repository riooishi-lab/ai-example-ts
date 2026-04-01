import type { FC } from 'react'
import { useCallback, useState } from 'react'

import { TbDotsVertical } from 'react-icons/tb'
import { Popover } from '../Popover'
import { Typography } from '../Typography'
import styles from './DropDown.module.css'
import type { DropDownProps } from './DropDown.types'

const DropDown: FC<DropDownProps> = ({ contents, position = 'left', anchorEl }) => {
  const [isShown, setIsShown] = useState(false)

  const onEachContentClicked = (
    event: React.MouseEvent<HTMLButtonElement>,
    onClick: DropDownProps['contents'][number]['onClick'],
  ) => {
    event.preventDefault()
    onClick?.(event)
    setIsShown(false)
  }
  const popoverOnOpen = useCallback(() => {
    setIsShown(true)
  }, [])
  const popoverOnClose = useCallback(() => {
    setIsShown(false)
  }, [])
  return (
    <Popover
      open={isShown}
      onOpen={popoverOnOpen}
      onClose={popoverOnClose}
      anchorEl={
        anchorEl || (
          <TbDotsVertical
            onClick={(e) => {
              e.preventDefault()
              popoverOnOpen()
            }}
          />
        )
      }
      position={position}
    >
      {contents.map((content) => (
        <button
          type='button'
          className={styles['menu-button']}
          key={content.id}
          onClick={(event) => onEachContentClicked(event, content.onClick)}
        >
          <Typography>{content.label}</Typography>
          {content.icon}
        </button>
      ))}
    </Popover>
  )
}
export default DropDown

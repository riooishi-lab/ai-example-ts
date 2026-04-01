import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'

type UseDropdownPositionParams = {
  isOpen: boolean
  onClose: () => void
}

export function useDropdownPosition({ isOpen, onClose }: UseDropdownPositionParams) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')

  useCloseOnOutsideInteraction({ isOpen, onClose, wrapperRef })
  usePositionUpdate({ isOpen, wrapperRef, dropdownRef, setDropdownPosition })

  return { wrapperRef, dropdownRef, dropdownPosition }
}

function useCloseOnOutsideInteraction({
  isOpen,
  onClose,
  wrapperRef,
}: {
  isOpen: boolean
  onClose: () => void
  wrapperRef: RefObject<HTMLDivElement | null>
}) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleScroll = () => {
      if (isOpen) onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, onClose, wrapperRef])
}

function usePositionUpdate({
  isOpen,
  wrapperRef,
  dropdownRef,
  setDropdownPosition,
}: {
  isOpen: boolean
  wrapperRef: RefObject<HTMLDivElement | null>
  dropdownRef: RefObject<HTMLDivElement | null>
  setDropdownPosition: (position: 'bottom' | 'top') => void
}) {
  useEffect(() => {
    if (!isOpen || !wrapperRef.current || !dropdownRef.current) return

    const updatePosition = () => {
      if (!wrapperRef.current || !dropdownRef.current) return

      const rect = wrapperRef.current.getBoundingClientRect()
      const dropdownHeight = 250

      if (window.innerHeight - rect.bottom < dropdownHeight && rect.top > dropdownHeight) {
        setDropdownPosition('top')
        dropdownRef.current.style.top = 'auto'
        dropdownRef.current.style.bottom = `${window.innerHeight - rect.top + 5}px`
      } else {
        setDropdownPosition('bottom')
        dropdownRef.current.style.bottom = 'auto'
        dropdownRef.current.style.top = `${rect.bottom + 5}px`
      }

      dropdownRef.current.style.left = `${rect.left}px`
      dropdownRef.current.style.width = `${rect.width}px`

      setTimeout(() => {
        if (!dropdownRef.current) return
        const dropdownRect = dropdownRef.current.getBoundingClientRect()
        if (dropdownRect.right > window.innerWidth) {
          dropdownRef.current.style.left = `${window.innerWidth - dropdownRect.width - 10}px`
        }
      }, 0)
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    return () => window.removeEventListener('resize', updatePosition)
  }, [isOpen, wrapperRef, dropdownRef, setDropdownPosition])
}

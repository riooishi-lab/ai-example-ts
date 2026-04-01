import type { IconType } from 'react-icons'

export type NavItem = {
  id: string
  label: string
  href: string
  icon: IconType
}

export type NavBarProps = {
  className?: string
}

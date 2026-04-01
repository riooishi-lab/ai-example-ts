import { FiHome } from 'react-icons/fi'
import { PAGE_PATH } from '../../../constants/pagePath'
import type { NavItem } from './NavBar.types'

export const NAV_ITEMS: NavItem[] = [{ id: 'dashboard', label: 'Dashboard', href: PAGE_PATH.HOME, icon: FiHome }]

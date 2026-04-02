import { FiAlertTriangle, FiHome, FiList, FiSettings } from 'react-icons/fi'
import { PAGE_PATH } from '../../../constants/pagePath'
import type { NavItem } from './NavBar.types'

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'ダッシュボード', href: PAGE_PATH.HOME, icon: FiHome },
  { id: 'equipments', label: '設備一覧', href: PAGE_PATH.EQUIPMENTS, icon: FiList },
  { id: 'failure-reports', label: '不具合報告', href: PAGE_PATH.FAILURE_REPORTS, icon: FiAlertTriangle },
  { id: 'admin-settings', label: '管理', href: PAGE_PATH.ADMIN_SETTINGS, icon: FiSettings },
]

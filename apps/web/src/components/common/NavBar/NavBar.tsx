import Link from 'next/link'
import { LuSettings } from 'react-icons/lu'
import { PAGE_PATH } from '../../../constants/pagePath'
import { NavLink } from './components/NavLink'
import { SignOutButton } from './components/SignOutButton'
import { NAV_ITEMS } from './NavBar.constants'
import styles from './NavBar.module.css'
import type { NavBarProps } from './NavBar.types'

export function NavBar({ className }: Readonly<NavBarProps>) {
  return (
    <nav className={`${styles.navbar} ${className ?? ''}`}>
      <div className={styles.logo}>C</div>

      <div className={styles.navItems}>
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.id} href={item.href}>
            <item.icon className={styles.navItemIcon} />
            {item.label}
          </NavLink>
        ))}
      </div>

      <div className={styles.actions}>
        <Link href={PAGE_PATH.ADMIN_SETTINGS} className={styles.actionButton}>
          <LuSettings className={styles.actionButtonIcon} />
        </Link>
        <SignOutButton />
      </div>
    </nav>
  )
}

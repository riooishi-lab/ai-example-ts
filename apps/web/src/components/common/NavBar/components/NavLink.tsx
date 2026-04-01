'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { PAGE_PATH } from '../../../../constants/pagePath'
import styles from '../NavBar.module.css'

type NavLinkProps = {
  href: string
  children: ReactNode
}

export function NavLink({ href, children }: Readonly<NavLinkProps>) {
  const pathname = usePathname()

  const isActive = () => {
    if (href === PAGE_PATH.HOME) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <Link href={href} className={`${styles.navItem} ${isActive() ? styles.active : ''}`}>
      {children}
    </Link>
  )
}

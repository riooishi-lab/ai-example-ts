import { UserRole } from '@monorepo/database'
import { useMemo } from 'react'
import styles from '../page.module.css'
import type { UserWithTeam } from '../types'

type UserStatsGridProps = {
  users: UserWithTeam[]
}

export function UserStatsGrid({ users }: UserStatsGridProps) {
  const { activeCount, adminManagerCount, salesRepCount } = useMemo(() => {
    const adminManagerRoles: Set<UserRole> = new Set([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER])
    return users.reduce(
      (acc, user) => {
        if (user.isActive) acc.activeCount += 1
        if (adminManagerRoles.has(user.role)) acc.adminManagerCount += 1
        if (user.role === UserRole.SALES_REP) acc.salesRepCount += 1
        return acc
      },
      { activeCount: 0, adminManagerCount: 0, salesRepCount: 0 },
    )
  }, [users])

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statLabel}>有効なユーザー</div>
        <div className={styles.statValue}>{activeCount}</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statLabel}>管理者/マネージャー</div>
        <div className={styles.statValue}>{adminManagerCount}</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statLabel}>営業担当</div>
        <div className={styles.statValue}>{salesRepCount}</div>
      </div>
    </div>
  )
}

import type { VisibleUser } from '@monorepo/database'
import { UserRole } from '@monorepo/database'
import styles from '../page.module.css'

type UserStatsGridProps = {
  users: VisibleUser[]
}

export function UserStatsGrid({ users }: UserStatsGridProps) {
  const adminRoles: Set<UserRole> = new Set([UserRole.SYSTEM_ADMIN, UserRole.MANAGER])
  const { activeCount, adminCount, maintenanceCount, fieldWorkerCount } = users.reduce(
    (acc, user) => ({
      activeCount: acc.activeCount + (user.isActive ? 1 : 0),
      adminCount: acc.adminCount + (adminRoles.has(user.role) ? 1 : 0),
      maintenanceCount: acc.maintenanceCount + (user.role === UserRole.MAINTENANCE ? 1 : 0),
      fieldWorkerCount: acc.fieldWorkerCount + (user.role === UserRole.FIELD_WORKER ? 1 : 0),
    }),
    { activeCount: 0, adminCount: 0, maintenanceCount: 0, fieldWorkerCount: 0 },
  )

  return (
    <div className={styles.statsGrid}>
      <div className={styles.statCard}>
        <div className={styles.statLabel}>有効なユーザー</div>
        <div className={styles.statValue}>{activeCount}</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statLabel}>管理者</div>
        <div className={styles.statValue}>{adminCount}</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statLabel}>保全担当</div>
        <div className={styles.statValue}>{maintenanceCount}</div>
      </div>
      <div className={styles.statCard}>
        <div className={styles.statLabel}>現場作業員</div>
        <div className={styles.statValue}>{fieldWorkerCount}</div>
      </div>
    </div>
  )
}

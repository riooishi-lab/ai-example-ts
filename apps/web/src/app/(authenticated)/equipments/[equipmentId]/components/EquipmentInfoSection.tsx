import type { VisibleEquipment } from '@monorepo/database'
import { formatDate } from '../../../../../libs/dayjs'
import styles from '../page.module.css'

type Props = {
  equipment: VisibleEquipment
}

export function EquipmentInfoSection({ equipment }: Props) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>設備情報</div>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>設備名</span>
          <span className={styles.infoValue}>{equipment.name}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>ライン名</span>
          <span className={styles.infoValue}>{equipment.lineName}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>号機</span>
          <span className={styles.infoValue}>{equipment.machineNumber}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>カテゴリ</span>
          <span className={styles.infoValue}>
            {equipment.category ? <span className={styles.categoryBadge}>{equipment.category}</span> : '---'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>設置日</span>
          <span className={styles.infoValue}>
            {equipment.installedAt ? formatDate(equipment.installedAt, 'YYYY/MM/DD') : '---'}
          </span>
        </div>
      </div>
    </div>
  )
}

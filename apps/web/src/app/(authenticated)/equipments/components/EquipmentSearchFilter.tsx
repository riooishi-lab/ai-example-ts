'use client'

import { FiSearch } from 'react-icons/fi'
import styles from '../page.module.css'

type Props = {
  search: string
  onSearchChange: (value: string) => void
}

export function EquipmentSearchFilter({ search, onSearchChange }: Props) {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.searchRow}>
        <div className={styles.searchInput}>
          <FiSearch size={20} className={styles.searchIcon} />
          <input
            type='search'
            placeholder='ライン名で検索...'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

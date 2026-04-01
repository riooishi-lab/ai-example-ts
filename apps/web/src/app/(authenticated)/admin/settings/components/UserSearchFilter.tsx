'use client'

import type { UserRole } from '@monorepo/database'
import { FiSearch } from 'react-icons/fi'
import { GoDotFill } from 'react-icons/go'
import { IoClose } from 'react-icons/io5'
import { RiEqualizerLine } from 'react-icons/ri'
import { Button } from '../../../../../components/common/Button'
import { Checkbox } from '../../../../../components/common/Checkbox'
import { Typography } from '../../../../../components/common/Typography'
import { includes } from '../../../../../utils/array'
import { ROLE_OPTIONS } from '../../invitations/constants/invitation'
import styles from '../page.module.css'

type UserSearchFilterProps = {
  search: string
  onSearchChange: (value: string) => void
  filterOpen: boolean
  onFilterToggle: () => void
  selectedRoles: UserRole[]
  onRoleToggle: (role: UserRole) => void
  onClearFilter: () => void
}

export function UserSearchFilter({
  search,
  onSearchChange,
  filterOpen,
  onFilterToggle,
  selectedRoles,
  onRoleToggle,
  onClearFilter,
}: UserSearchFilterProps) {
  return (
    <div className={styles.filterContainer}>
      <div className={styles.searchRow}>
        <div className={styles.searchInput}>
          <FiSearch size={20} className={styles.searchIcon} />
          <input
            type='search'
            placeholder='ユーザーを検索...'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button theme='secondary' size='lg' className={styles.filterButton} onClick={onFilterToggle}>
          {selectedRoles.length > 0 && (
            <div className={styles.hasFilters}>
              <Typography size='sm'>
                <GoDotFill size={18} />
              </Typography>
            </div>
          )}
          <RiEqualizerLine size={18} />
          フィルター
        </Button>
        {filterOpen && (
          <div className={styles.filterPanel}>
            <div className={styles.roleFilterHeading}>役割</div>
            <div className={styles.roleFilterContent}>
              <div className={styles.roleFilterGrid}>
                {ROLE_OPTIONS.map((opt) => (
                  <Checkbox
                    id={opt.value}
                    key={opt.value}
                    label={opt.label}
                    checked={includes(selectedRoles, opt.value)}
                    onChange={() => onRoleToggle(opt.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        {selectedRoles.length > 0 && (
          <Button type='button' theme='secondary' className={styles.clearFilter} onClick={onClearFilter}>
            <IoClose size={18} /> フィルターをクリア
          </Button>
        )}
      </div>
    </div>
  )
}

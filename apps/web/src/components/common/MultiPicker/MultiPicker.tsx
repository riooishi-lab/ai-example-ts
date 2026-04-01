'use client'

import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import { FiPlus, FiSearch, FiUser } from 'react-icons/fi'
import { Button } from '../Button'
import { Input } from '../Input'
import Popover from '../Popover/Popover'
import { Typography } from '../Typography'
import styles from './MultiPicker.module.css'
import type { MultiPickerItem, MultiPickerProps } from './MultiPicker.types'

export function MultiPicker<TId extends string>({
  tabs,
  data,
  selectedItems,
  onSelect,
  onSearch,
  trigger,
  renderSubLabel,
  emptyLabel = '該当なし',
}: Readonly<MultiPickerProps<TId>>) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TId | undefined>(tabs[0]?.id)
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    onSearch(search)
  }, [open, search, onSearch])

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus())
    }
  }, [open])

  const handleSelect = (item: MultiPickerItem, category: TId) => {
    if (selectedItems.some((s) => s.id === item.id && s.category === category)) return
    onSelect({ id: item.id, name: item.name, category })
    setOpen(false)
    setSearch('')
  }

  const selectedIds = new Set(selectedItems.map((s) => `${s.category}-${s.id}`))
  const currentItems = activeTab ? (data?.[activeTab]?.data ?? []) : []
  const filteredItems = currentItems.filter((item) => !selectedIds.has(`${activeTab}-${item.id}`))
  const activeTabConfig = activeTab ? tabs.find((t) => t.id === activeTab) : undefined
  const TabIcon = activeTabConfig?.icon ?? FiUser
  const placeholder = activeTabConfig?.placeholder ?? '検索...'

  const triggerEl = trigger ?? (
    <Typography size='sm' className={styles.trigger}>
      <FiPlus size={12} />
      追加
    </Typography>
  )

  return (
    <Popover
      anchorEl={triggerEl}
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      style={{ zIndex: 1001 }}
    >
      <div className={styles.popoverContent}>
        <div className={styles.tabs}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <Button
                key={tab.id}
                type='button'
                variant='ghost'
                className={classNames(styles.tab, isActive && styles.tabActive)}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSearch('')
                }}
              >
                <Icon size={14} />
                {tab.label}
                <span className={classNames(styles.tabCount, isActive && styles.tabCountActive)}>
                  {data?.[tab.id]?.count ?? 0}
                </span>
              </Button>
            )
          })}
        </div>

        <div className={styles.searchWrapper}>
          <FiSearch size={14} className={styles.searchIcon} />
          <Input
            ref={searchRef}
            type='text'
            className={styles.searchInput}
            placeholder={placeholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.itemList}>
          {filteredItems.length === 0 && <div className={styles.emptyState}>{emptyLabel}</div>}

          {filteredItems.map((item) => (
            <Button
              key={item.id}
              type='button'
              variant='ghost'
              className={styles.item}
              onClick={() => activeTab && handleSelect(item, activeTab)}
            >
              <TabIcon size={16} className={styles.itemIcon} />
              <span className={styles.itemLabel}>{item.name}</span>
              {activeTab && renderSubLabel?.(item, activeTab)}
            </Button>
          ))}
        </div>
      </div>
    </Popover>
  )
}

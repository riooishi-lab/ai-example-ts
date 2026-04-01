'use client'

import * as Tabs from '@radix-ui/react-tabs'
import styles from './Tab.module.css'
import type { TabProps } from './Tab.types'

const Tab = ({ contents, onChange, selectedIndex, defaultIndex }: TabProps) => (
  <Tabs.Root
    onValueChange={(value) => onChange?.(Number(value))}
    value={selectedIndex !== undefined ? String(selectedIndex) : undefined}
    defaultValue={defaultIndex !== undefined ? String(defaultIndex) : '0'}
    className={styles.root}
  >
    <Tabs.List className={styles.primary}>
      {contents.map(({ id, label }, index) => (
        <Tabs.TabsTrigger className={styles.trigger} value={String(index)} key={id}>
          {label}
        </Tabs.TabsTrigger>
      ))}
    </Tabs.List>
    {contents.map(({ id, content }, index) => (
      <Tabs.Content key={id} value={String(index)} className={styles.content}>
        {content}
      </Tabs.Content>
    ))}
  </Tabs.Root>
)

export default Tab

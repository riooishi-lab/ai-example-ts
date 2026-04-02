'use client'

import type { VisibleEquipment } from '@monorepo/database'
import { useMemo, useState } from 'react'
import { FlexBox } from '../../../../components/common/FlexBox'
import { Table } from '../../../../components/common/Table'
import type { CellProps } from '../../../../components/common/Table/Table.types'
import { Typography } from '../../../../components/common/Typography'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { formatDate } from '../../../../libs/dayjs'
import styles from '../page.module.css'
import { EquipmentSearchFilter } from './EquipmentSearchFilter'

type Props = {
  equipments: VisibleEquipment[]
}

const NameCell = ({ row }: { row: VisibleEquipment }) => (
  <Typography size='md' weight='bold'>
    {row.name}
  </Typography>
)

const LineNameCell = ({ row }: { row: VisibleEquipment }) => <Typography size='md'>{row.lineName}</Typography>

const MachineNumberCell = ({ row }: { row: VisibleEquipment }) => <Typography size='md'>{row.machineNumber}</Typography>

const CategoryCell = ({ row }: { row: VisibleEquipment }) => (
  <span>{row.category ? <span className={styles.categoryBadge}>{row.category}</span> : '---'}</span>
)

const InstalledAtCell = ({ row }: { row: VisibleEquipment }) => (
  <Typography size='md'>{row.installedAt ? formatDate(row.installedAt, 'YYYY/MM/DD') : '---'}</Typography>
)

export function EquipmentList({ equipments }: Props) {
  const [search, setSearch] = useState('')

  const filteredEquipments = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return equipments
    return equipments.filter((eq) => eq.lineName.toLowerCase().includes(query))
  }, [equipments, search])

  const columns: CellProps<VisibleEquipment>[] = useMemo(
    () => [
      { label: '設備名', Component: NameCell },
      { label: 'ライン名', Component: LineNameCell },
      { label: '号機', Component: MachineNumberCell },
      { label: 'カテゴリ', Component: CategoryCell },
      { label: '設置日', Component: InstalledAtCell },
    ],
    [],
  )

  const handleRowClick = (row: VisibleEquipment) => {
    window.location.href = `${PAGE_PATH.EQUIPMENTS}/${row.publicId}`
  }

  return (
    <FlexBox flexDirection='column' gap='1.5rem' data-testid='equipment-list-container'>
      <EquipmentSearchFilter search={search} onSearchChange={setSearch} />

      <Table
        rows={filteredEquipments}
        uniqueKey='id'
        noRowsMessage='設備が登録されていません'
        columns={columns}
        rowProps={{ onClick: handleRowClick, style: { cursor: 'pointer' } }}
      />
    </FlexBox>
  )
}

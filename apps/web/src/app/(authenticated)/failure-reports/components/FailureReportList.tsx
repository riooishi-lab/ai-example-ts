'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { CellProps } from '../../../../components/common/Table'
import { Table } from '../../../../components/common/Table'
import styles from '../page.module.css'

type FailureReportRow = {
  publicId: string
  equipmentName: string
  symptom: string
  occurredAt: string
  reporterName: string
  actionAt: string
}

type Props = {
  rows: FailureReportRow[]
}

const columns: CellProps<FailureReportRow>[] = [
  {
    id: 'equipmentName',
    label: '設備名',
    Component: ({ row }) => (
      <Link href={`/failure-reports/${row.publicId}`} className={styles.linkCell}>
        {row.equipmentName}
      </Link>
    ),
  },
  {
    id: 'symptom',
    label: '症状',
    style: { maxWidth: '300px' },
  },
  {
    id: 'occurredAt',
    label: '発生日時',
  },
  {
    id: 'reporterName',
    label: '報告者',
  },
  {
    id: 'actionAt',
    label: '対応日時',
  },
]

export function FailureReportList({ rows }: Props) {
  const router = useRouter()

  return (
    <Table
      rows={rows}
      columns={columns}
      uniqueKey='publicId'
      rowProps={{
        onClick: (row) => router.push(`/failure-reports/${row.publicId}`),
      }}
      noRowsMessage='不具合報告がありません'
    />
  )
}

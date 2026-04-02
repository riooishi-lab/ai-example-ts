import type { InspectionStatus, VisibleInspectionRecord } from '@monorepo/database'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Typography } from '../../../../../components/common/Typography'
import { formatDate } from '../../../../../libs/dayjs'
import styles from '../page.module.css'

type InspectionRecordWithInspector = VisibleInspectionRecord & {
  inspectorName: string
}

type Props = {
  records: InspectionRecordWithInspector[]
}

const INSPECTION_STATUS_LABELS: Record<InspectionStatus, string> = {
  IN_PROGRESS: '進行中',
  COMPLETED: '完了',
}

const DateCell = ({ row }: { row: InspectionRecordWithInspector }) => (
  <Typography size='md'>{formatDate(row.inspectedAt, 'YYYY/MM/DD HH:mm')}</Typography>
)

const InspectorCell = ({ row }: { row: InspectionRecordWithInspector }) => (
  <Typography size='md'>{row.inspectorName}</Typography>
)

const StatusCell = ({ row }: { row: InspectionRecordWithInspector }) => {
  const isCompleted = row.status === 'COMPLETED'
  return (
    <span className={`${styles.statusBadge} ${isCompleted ? styles.statusCompleted : styles.statusInProgress}`}>
      {INSPECTION_STATUS_LABELS[row.status]}
    </span>
  )
}

const columns: CellProps<InspectionRecordWithInspector>[] = [
  { label: '点検日時', Component: DateCell },
  { label: '点検者', Component: InspectorCell },
  { label: 'ステータス', Component: StatusCell },
]

export function InspectionRecordsSection({ records }: Props) {
  return (
    <div className={styles.section}>
      <FlexBox flexDirection='column' gap='1rem'>
        <div className={styles.sectionTitle}>最近の点検記録</div>
        <Table rows={records} uniqueKey='id' columns={columns} noRowsMessage='点検記録がありません' />
      </FlexBox>
    </div>
  )
}

export type { InspectionRecordWithInspector }

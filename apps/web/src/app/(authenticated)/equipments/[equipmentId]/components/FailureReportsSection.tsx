import type { VisibleFailureReport } from '@monorepo/database'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Typography } from '../../../../../components/common/Typography'
import { formatDate } from '../../../../../libs/dayjs'
import styles from '../page.module.css'

type FailureReportWithReporter = VisibleFailureReport & {
  reporterName: string
}

type Props = {
  reports: FailureReportWithReporter[]
}

const OccurredAtCell = ({ row }: { row: FailureReportWithReporter }) => (
  <Typography size='md'>{formatDate(row.occurredAt, 'YYYY/MM/DD HH:mm')}</Typography>
)

const SymptomCell = ({ row }: { row: FailureReportWithReporter }) => (
  <Typography size='md' truncate>
    {row.symptom}
  </Typography>
)

const ReporterCell = ({ row }: { row: FailureReportWithReporter }) => (
  <Typography size='md'>{row.reporterName}</Typography>
)

const ActionCell = ({ row }: { row: FailureReportWithReporter }) => (
  <Typography size='md' truncate>
    {row.action}
  </Typography>
)

const columns: CellProps<FailureReportWithReporter>[] = [
  { label: '発生日時', Component: OccurredAtCell },
  { label: '症状', Component: SymptomCell },
  { label: '報告者', Component: ReporterCell },
  { label: '対応内容', Component: ActionCell },
]

export function FailureReportsSection({ reports }: Props) {
  return (
    <div className={styles.section}>
      <FlexBox flexDirection='column' gap='1rem'>
        <div className={styles.sectionTitle}>最近の不具合報告</div>
        <Table rows={reports} uniqueKey='id' columns={columns} noRowsMessage='不具合報告がありません' />
      </FlexBox>
    </div>
  )
}

export type { FailureReportWithReporter }

import type { VisiblePart } from '@monorepo/database'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Typography } from '../../../../../components/common/Typography'
import { formatDate } from '../../../../../libs/dayjs'
import styles from '../page.module.css'

type Props = {
  parts: VisiblePart[]
}

const NameCell = ({ row }: { row: VisiblePart }) => <Typography size='md'>{row.name}</Typography>

const CycleCell = ({ row }: { row: VisiblePart }) => (
  <Typography size='md'>{row.standardReplaceCycleDays ? `${row.standardReplaceCycleDays} 日` : '---'}</Typography>
)

const LastReplacedCell = ({ row }: { row: VisiblePart }) => (
  <Typography size='md'>{row.lastReplacedAt ? formatDate(row.lastReplacedAt, 'YYYY/MM/DD') : '---'}</Typography>
)

const columns: CellProps<VisiblePart>[] = [
  { label: '部品名', Component: NameCell },
  { label: '標準交換周期', Component: CycleCell },
  { label: '最終交換日', Component: LastReplacedCell },
]

export function PartsSection({ parts }: Props) {
  return (
    <div className={styles.section}>
      <FlexBox flexDirection='column' gap='1rem'>
        <div className={styles.sectionTitle}>部品一覧</div>
        <Table rows={parts} uniqueKey='id' columns={columns} noRowsMessage='部品が登録されていません' />
      </FlexBox>
    </div>
  )
}

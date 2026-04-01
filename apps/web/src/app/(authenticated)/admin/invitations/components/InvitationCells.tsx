import type { VisibleInvitation } from '@monorepo/database'
import { InvitationStatus } from '@monorepo/database'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { MdSend } from 'react-icons/md'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { StatusLabel } from '../../../../../components/common/StatusLabel'
import { Typography } from '../../../../../components/common/Typography'
import { RoleLabels } from '../constants'
import styles from '../page.module.css'

const getInitial = (lastName: string) => {
  if (!lastName) return '—'
  return lastName.charAt(0).toUpperCase()
}

export const UserCell = ({ row }: { row: VisibleInvitation }) => (
  <FlexBox alignItems='center' gap='0.75rem'>
    <div className={styles.avatar}>
      <Typography size='sm' weight='bold'>
        {getInitial(row.lastName)}
      </Typography>
    </div>
    <FlexBox flexDirection='column' gap='0.25rem'>
      <Typography size='md'>
        {row.lastName} {row.firstName}
      </Typography>
      <Typography size='sm' color='var(--color-secondary)'>
        {row.publicId}
      </Typography>
    </FlexBox>
  </FlexBox>
)

export const EmailCell = ({ row }: { row: VisibleInvitation }) => <Typography size='md'>{row.email}</Typography>

export const RoleCell = ({ row }: { row: VisibleInvitation }) => (
  <Typography size='md'>{RoleLabels[row.role]}</Typography>
)

const statusDisplay = {
  PENDING: { text: '保留中', theme: 'warn' as const },
  ACCEPTED: { text: 'アクティブ', theme: 'success' as const },
  EXPIRED: { text: '無効', theme: 'danger' as const },
  REVOKED: { text: '無効', theme: 'disabled' as const },
}

export const StatusCell = ({ row }: { row: VisibleInvitation }) => {
  const display = statusDisplay[row.status]
  return <StatusLabel theme={display.theme} text={display.text} />
}

export const createActionCell = (
  onResend: (id: number) => void,
  onEdit: (invitation: VisibleInvitation) => void,
  onDelete: (invitation: VisibleInvitation) => void,
  isResending: boolean,
) => {
  const ActionCell = ({ row }: { row: VisibleInvitation }) => {
    if (row.status === InvitationStatus.ACCEPTED) {
      return (
        <Typography size='sm' color='var(--color-secondary)'>
          —
        </Typography>
      )
    }

    return (
      <FlexBox gap='0.25rem' justifyContent='flex-start'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          disabled={isResending}
          onClick={(e) => {
            e.stopPropagation()
            onResend(row.id)
          }}
          aria-label='再送信'
        >
          <MdSend size={20} />
        </Button>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          onClick={(e) => {
            e.stopPropagation()
            onEdit(row)
          }}
          aria-label='編集'
        >
          <FiEdit2 size={20} />
        </Button>
        <Button
          type='button'
          theme='danger'
          size='sm'
          onClick={(e) => {
            e.stopPropagation()
            onDelete(row)
          }}
          aria-label='削除'
        >
          <FiTrash2 size={20} />
        </Button>
      </FlexBox>
    )
  }
  return ActionCell
}

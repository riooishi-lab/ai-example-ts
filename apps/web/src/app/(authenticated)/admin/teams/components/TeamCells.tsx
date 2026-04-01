import { FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi'
import { HiOutlineUserGroup } from 'react-icons/hi2'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Typography } from '../../../../../components/common/Typography'
import { formatDate } from '../../../../../libs/dayjs'
import styles from '../../settings/page.module.css'
import type { TeamWithMembers } from '../types'

export const TeamNameCell = ({ row }: { row: TeamWithMembers }) => (
  <FlexBox alignItems='center' gap='0.75rem' data-testid='team-name-cell'>
    <div className={styles.teamIcon}>
      <HiOutlineUserGroup size={20} />
    </div>
    <FlexBox flexDirection='column' gap='0.25rem'>
      <Typography size='md' weight='semibold' data-testid='team-name-text'>
        {row.name}
      </Typography>
      <Typography size='sm' color='var(--color-secondary)'>
        {row.publicId}
      </Typography>
    </FlexBox>
  </FlexBox>
)

export const MemberCountCell = ({ row }: { row: TeamWithMembers }) => (
  <Typography size='md'>{row._count.teamMembers} 名</Typography>
)

export const CreatedAtCell = ({ row }: { row: TeamWithMembers }) => (
  <Typography size='md'>{formatDate(row.createdAt)}</Typography>
)

export const createActionCell = (
  onEdit: (team: TeamWithMembers) => void,
  onDelete: (team: TeamWithMembers) => void,
  onManageMembers: (team: TeamWithMembers) => void,
) => {
  const ActionCell = ({ row }: { row: TeamWithMembers }) => (
    <FlexBox gap='0.25rem' justifyContent='flex-start'>
      <Button
        type='button'
        variant='ghost'
        size='sm'
        onClick={(e) => {
          e.stopPropagation()
          onManageMembers(row)
        }}
        aria-label='メンバー管理'
        data-testid='team-members-button'
      >
        <FiUsers size={20} />
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
        data-testid='team-edit-button'
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
        data-testid='team-delete-button'
      >
        <FiTrash2 size={20} />
      </Button>
    </FlexBox>
  )
  return ActionCell
}

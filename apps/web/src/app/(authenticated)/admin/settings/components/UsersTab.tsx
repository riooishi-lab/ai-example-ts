'use client'

import type { UserRole } from '@monorepo/database'
import { useCallback, useMemo, useState } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Modal } from '../../../../../components/common/Modal'
import { StatusLabel } from '../../../../../components/common/StatusLabel'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Toast, useToast } from '../../../../../components/common/Toast'
import { Typography } from '../../../../../components/common/Typography'
import { formatDate } from '../../../../../libs/dayjs'
import { includes } from '../../../../../utils/array'
import { RoleLabels } from '../../invitations/constants/invitation'
import { updateUser } from '../actions/updateUser'
import styles from '../page.module.css'
import type { UserWithTeam } from '../types'
import { DeleteUserModal } from './DeleteUserModal'
import { UserForm } from './UserForm/UserForm'
import { UserSearchFilter } from './UserSearchFilter'
import { UserStatsGrid } from './UserStatsGrid'

type Props = {
  users: UserWithTeam[]
}

const getInitial = (name: string) => {
  if (name) return name.charAt(0).toUpperCase()
  return '—'
}

const UserCell = ({ row }: { row: UserWithTeam }) => (
  <FlexBox alignItems='center' gap='0.75rem'>
    <div className={styles.avatar}>
      <Typography size='sm' weight='bold'>
        {getInitial(`${row.lastName} ${row.firstName}`)}
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

const EmailCell = ({ row }: { row: UserWithTeam }) => <Typography size='md'>{row.email}</Typography>

const RoleCell = ({ row }: { row: UserWithTeam }) => <Typography size='md'>{RoleLabels[row.role]}</Typography>

const StatusCell = ({ row }: { row: UserWithTeam }) => (
  <StatusLabel theme={row.isActive ? 'success' : 'disabled'} text={row.isActive ? 'Active' : 'Inactive'} />
)

const LastSignedInAtCell = ({ row }: { row: UserWithTeam }) => (
  <Typography size='md'>{row.lastSignedInAt ? formatDate(row.lastSignedInAt) : '—'}</Typography>
)

const createActionCell = (onEdit: (user: UserWithTeam) => void, onDelete: (user: UserWithTeam) => void) => {
  const ActionCell = ({ row }: { row: UserWithTeam }) => (
    <FlexBox gap='0.25rem' justifyContent='flex-start'>
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
  return ActionCell
}

export function UsersTab({ users }: Props) {
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([])
  const [editingUser, setEditingUser] = useState<UserWithTeam | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserWithTeam | null>(null)
  const { showToast, toastProps } = useToast()

  const filteredUsers = useMemo(() => {
    let list = users
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          `${u.lastName} ${u.firstName}`.toLowerCase().includes(q) ||
          u.publicId.toLowerCase().includes(q),
      )
    }
    if (selectedRoles.length > 0) {
      list = list.filter((u) => includes(selectedRoles, u.role))
    }
    return list
  }, [users, search, selectedRoles])

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((prev) => (includes(prev, role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  const handleEdit = useCallback((user: UserWithTeam) => setEditingUser(user), [])
  const handleDelete = useCallback((user: UserWithTeam) => setDeletingUser(user), [])

  const columns: CellProps<UserWithTeam>[] = useMemo(
    () => [
      { label: 'ユーザー', Component: UserCell },
      { label: 'メールアドレス', Component: EmailCell },
      { label: '役割', Component: RoleCell },
      { label: 'ステータス', Component: StatusCell },
      { label: '最終サインイン日時', Component: LastSignedInAtCell },
      { label: 'アクション', Component: createActionCell(handleEdit, handleDelete) },
    ],
    [handleEdit, handleDelete],
  )

  return (
    <FlexBox flexDirection='column' gap='1.5rem'>
      <UserStatsGrid users={users} />

      <UserSearchFilter
        search={search}
        onSearchChange={setSearch}
        filterOpen={filterOpen}
        onFilterToggle={() => setFilterOpen((prev) => !prev)}
        selectedRoles={selectedRoles}
        onRoleToggle={toggleRole}
        onClearFilter={() => setSelectedRoles([])}
      />

      <Table rows={filteredUsers} uniqueKey='id' noRowsMessage='ユーザーはありません' columns={columns} />

      <Modal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        title='ユーザーを編集'
        width='medium'
        padding='xl'
      >
        {editingUser && (
          <UserForm
            user={editingUser}
            action={updateUser}
            onCancel={() => setEditingUser(null)}
            onSuccess={() => {
              setEditingUser(null)
              showToast('ユーザーを更新しました', 'success')
            }}
            onError={(message) => showToast(message, 'error')}
          />
        )}
      </Modal>

      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          open={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onSuccess={() => {
            setDeletingUser(null)
            showToast('ユーザーを削除しました', 'success')
          }}
        />
      )}

      <Toast {...toastProps} />
    </FlexBox>
  )
}

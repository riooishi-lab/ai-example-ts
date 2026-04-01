'use client'

import type { VisibleInvitation } from '@monorepo/database'
import { useQueryStates } from 'nuqs'
import { useCallback, useMemo, useState, useTransition } from 'react'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Pagination } from '../../../../../components/common/Pagination'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Toast, useToast } from '../../../../../components/common/Toast'
import { Typography } from '../../../../../components/common/Typography'
import { returnFirstElement } from '../../../../../utils/array'
import { paginationSearchParams } from '../../../../../utils/searchParams'
import { resendInvitation } from '../actions/resendInvitation'
import { DeleteInvitationModal } from './DeleteInvitationModal'
import { EditInvitationModal } from './EditInvitationModal'
import { createActionCell, EmailCell, RoleCell, StatusCell, UserCell } from './InvitationCells'

type Props = {
  invitations: VisibleInvitation[]
  totalCount: number
}

export function InvitationList({ invitations, totalCount }: Props) {
  const [isResending, startTransition] = useTransition()
  const [editingInvitation, setEditingInvitation] = useState<VisibleInvitation | null>(null)
  const [deletingInvitation, setDeletingInvitation] = useState<VisibleInvitation | null>(null)
  const { showToast, toastProps } = useToast()
  const [{ page, pageSize }, setPagination] = useQueryStates(paginationSearchParams, { shallow: false })

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const handleResend = useCallback(
    (id: number) => {
      startTransition(async () => {
        const result = await resendInvitation(id)
        if (result.status === 'success') {
          showToast('招待を再送信しました', 'success')
        }
        if (result.status === 'error') {
          showToast(returnFirstElement(result.error.message, '招待の再送信に失敗しました'), 'error')
        }
      })
    },
    [showToast],
  )

  const handleEdit = useCallback((invitation: VisibleInvitation) => setEditingInvitation(invitation), [])
  const handleDelete = useCallback((invitation: VisibleInvitation) => setDeletingInvitation(invitation), [])

  const columns: CellProps<VisibleInvitation>[] = useMemo(
    () => [
      { label: 'ユーザー', Component: UserCell },
      { label: 'メールアドレス', Component: EmailCell },
      { label: '役割', Component: RoleCell },
      { label: 'ステータス', Component: StatusCell },
      { label: 'アクション', Component: createActionCell(handleResend, handleEdit, handleDelete, isResending) },
    ],
    [handleResend, handleEdit, handleDelete, isResending],
  )

  if (totalCount === 0) {
    return (
      <FlexBox flexDirection='column' gap='1rem'>
        <Typography size='lg' weight='semibold'>
          招待一覧
        </Typography>
        <Typography size='sm' color='secondary' style={{ textAlign: 'center', padding: '2rem' }}>
          招待はありません
        </Typography>
      </FlexBox>
    )
  }

  return (
    <>
      <FlexBox flexDirection='column' gap='1rem' padding='1.5rem 0'>
        <Table rows={invitations} uniqueKey='id' noRowsMessage='招待はありません' columns={columns} />
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPagination({ page: p })}
          pageSize={pageSize}
          onPageSizeChange={(size) => setPagination({ pageSize: size, page: 1 })}
        />
      </FlexBox>

      {editingInvitation && (
        <EditInvitationModal
          invitation={editingInvitation}
          open={!!editingInvitation}
          onClose={() => setEditingInvitation(null)}
          onSuccess={() => {
            setEditingInvitation(null)
            showToast('招待を更新しました', 'success')
          }}
        />
      )}

      {deletingInvitation && (
        <DeleteInvitationModal
          invitation={deletingInvitation}
          open={!!deletingInvitation}
          onClose={() => setDeletingInvitation(null)}
          onSuccess={() => {
            setDeletingInvitation(null)
            showToast('招待を削除しました', 'success')
          }}
        />
      )}

      <Toast {...toastProps} />
    </>
  )
}

'use client'

import type { VisibleEquipment, VisiblePart } from '@monorepo/database'
import { useCallback, useMemo, useState } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Modal } from '../../../../../components/common/Modal'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Toast, useToast } from '../../../../../components/common/Toast'
import { Typography } from '../../../../../components/common/Typography'
import { formatDate } from '../../../../../libs/dayjs'
import { createPart } from '../actions/createPart'
import { updatePart } from '../actions/updatePart'
import { DeletePartModal } from './DeletePartModal'
import { PartForm } from './PartForm'

type Props = {
  parts: VisiblePart[]
  equipments: VisibleEquipment[]
}

const NameCell = ({ row }: { row: VisiblePart }) => (
  <Typography size='md' weight='bold'>
    {row.name}
  </Typography>
)

const CycleCell = ({ row }: { row: VisiblePart }) => (
  <Typography size='md'>{row.standardReplaceCycleDays ? `${row.standardReplaceCycleDays} 日` : '---'}</Typography>
)

const LastReplacedCell = ({ row }: { row: VisiblePart }) => (
  <Typography size='md'>{row.lastReplacedAt ? formatDate(row.lastReplacedAt, 'YYYY/MM/DD') : '---'}</Typography>
)

const createActionCell = (onEdit: (part: VisiblePart) => void, onDelete: (part: VisiblePart) => void) => {
  const ActionCell = ({ row }: { row: VisiblePart }) => (
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

export function PartsTab({ parts, equipments }: Props) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingPart, setEditingPart] = useState<VisiblePart | null>(null)
  const [deletingPart, setDeletingPart] = useState<VisiblePart | null>(null)
  const { showToast, toastProps } = useToast()

  const handleEdit = useCallback((part: VisiblePart) => setEditingPart(part), [])
  const handleDelete = useCallback((part: VisiblePart) => setDeletingPart(part), [])

  const equipmentNameMap = useMemo(() => new Map(equipments.map((eq) => [eq.id, eq.name])), [equipments])

  const EquipmentCell = useMemo(() => {
    const Cell = ({ row }: { row: VisiblePart }) => (
      <Typography size='md'>{equipmentNameMap.get(row.equipmentId) ?? '---'}</Typography>
    )
    return Cell
  }, [equipmentNameMap])

  const columns: CellProps<VisiblePart>[] = useMemo(
    () => [
      { label: '部品名', Component: NameCell },
      { label: '設備', Component: EquipmentCell },
      { label: '標準交換周期', Component: CycleCell },
      { label: '最終交換日', Component: LastReplacedCell },
      { label: 'アクション', Component: createActionCell(handleEdit, handleDelete) },
    ],
    [EquipmentCell, handleEdit, handleDelete],
  )

  return (
    <FlexBox flexDirection='column' gap='1.5rem'>
      <FlexBox justifyContent='flex-end'>
        <Button onClick={() => setIsCreating(true)}>部品を追加</Button>
      </FlexBox>

      <Table rows={parts} uniqueKey='id' noRowsMessage='部品が登録されていません' columns={columns} />

      <Modal open={isCreating} onClose={() => setIsCreating(false)} title='部品を追加' width='medium' padding='xl'>
        <PartForm
          equipments={equipments}
          action={createPart}
          onCancel={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false)
            showToast('部品を作成しました', 'success')
          }}
          onError={(message) => showToast(message, 'error')}
        />
      </Modal>

      <Modal open={!!editingPart} onClose={() => setEditingPart(null)} title='部品を編集' width='medium' padding='xl'>
        {editingPart && (
          <PartForm
            part={editingPart}
            equipments={equipments}
            action={updatePart}
            onCancel={() => setEditingPart(null)}
            onSuccess={() => {
              setEditingPart(null)
              showToast('部品を更新しました', 'success')
            }}
            onError={(message) => showToast(message, 'error')}
          />
        )}
      </Modal>

      {deletingPart && (
        <DeletePartModal
          part={deletingPart}
          open={!!deletingPart}
          onClose={() => setDeletingPart(null)}
          onSuccess={() => {
            setDeletingPart(null)
            showToast('部品を削除しました', 'success')
          }}
        />
      )}

      <Toast {...toastProps} />
    </FlexBox>
  )
}

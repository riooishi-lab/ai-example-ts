'use client'

import type { InspectionInputType, VisibleEquipment, VisibleInspectionItem } from '@monorepo/database'
import { useCallback, useMemo, useState } from 'react'
import { FiEdit2, FiTrash2 } from 'react-icons/fi'
import { Button } from '../../../../../components/common/Button'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { Modal } from '../../../../../components/common/Modal'
import { Table } from '../../../../../components/common/Table'
import type { CellProps } from '../../../../../components/common/Table/Table.types'
import { Toast, useToast } from '../../../../../components/common/Toast'
import { Typography } from '../../../../../components/common/Typography'
import { createInspectionItem } from '../actions/createInspectionItem'
import { updateInspectionItem } from '../actions/updateInspectionItem'
import { DeleteInspectionItemModal } from './DeleteInspectionItemModal'
import { InspectionItemForm } from './InspectionItemForm'

type Props = {
  inspectionItems: VisibleInspectionItem[]
  equipments: VisibleEquipment[]
}

const INPUT_TYPE_LABELS: Record<InspectionInputType, string> = {
  NUMERIC: '数値',
  TEXT: 'テキスト',
}

const NameCell = ({ row }: { row: VisibleInspectionItem }) => (
  <Typography size='md' weight='bold'>
    {row.name}
  </Typography>
)

const InputTypeCell = ({ row }: { row: VisibleInspectionItem }) => (
  <Typography size='md'>{INPUT_TYPE_LABELS[row.inputType]}</Typography>
)

const UnitCell = ({ row }: { row: VisibleInspectionItem }) => <Typography size='md'>{row.unit ?? '---'}</Typography>

const LimitsCell = ({ row }: { row: VisibleInspectionItem }) => {
  const lower = row.lowerLimit !== null ? row.lowerLimit : '---'
  const upper = row.upperLimit !== null ? row.upperLimit : '---'
  return <Typography size='md'>{`${lower} ~ ${upper}`}</Typography>
}

const SortOrderCell = ({ row }: { row: VisibleInspectionItem }) => <Typography size='md'>{row.sortOrder}</Typography>

const createActionCell = (
  onEdit: (item: VisibleInspectionItem) => void,
  onDelete: (item: VisibleInspectionItem) => void,
) => {
  const ActionCell = ({ row }: { row: VisibleInspectionItem }) => (
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

export function InspectionItemsTab({ inspectionItems, equipments }: Props) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingItem, setEditingItem] = useState<VisibleInspectionItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<VisibleInspectionItem | null>(null)
  const { showToast, toastProps } = useToast()

  const handleEdit = useCallback((item: VisibleInspectionItem) => setEditingItem(item), [])
  const handleDelete = useCallback((item: VisibleInspectionItem) => setDeletingItem(item), [])

  const equipmentNameMap = useMemo(() => new Map(equipments.map((eq) => [eq.id, eq.name])), [equipments])

  const EquipmentCell = useMemo(() => {
    const Cell = ({ row }: { row: VisibleInspectionItem }) => (
      <Typography size='md'>{equipmentNameMap.get(row.equipmentId) ?? '---'}</Typography>
    )
    return Cell
  }, [equipmentNameMap])

  const columns: CellProps<VisibleInspectionItem>[] = useMemo(
    () => [
      { label: '項目名', Component: NameCell },
      { label: '設備', Component: EquipmentCell },
      { label: '入力タイプ', Component: InputTypeCell },
      { label: '単位', Component: UnitCell },
      { label: '範囲', Component: LimitsCell },
      { label: '順序', Component: SortOrderCell },
      { label: 'アクション', Component: createActionCell(handleEdit, handleDelete) },
    ],
    [EquipmentCell, handleEdit, handleDelete],
  )

  return (
    <FlexBox flexDirection='column' gap='1.5rem'>
      <FlexBox justifyContent='flex-end'>
        <Button onClick={() => setIsCreating(true)}>点検項目を追加</Button>
      </FlexBox>

      <Table rows={inspectionItems} uniqueKey='id' noRowsMessage='点検項目が登録されていません' columns={columns} />

      <Modal open={isCreating} onClose={() => setIsCreating(false)} title='点検項目を追加' width='medium' padding='xl'>
        <InspectionItemForm
          equipments={equipments}
          action={createInspectionItem}
          onCancel={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false)
            showToast('点検項目を作成しました', 'success')
          }}
          onError={(message) => showToast(message, 'error')}
        />
      </Modal>

      <Modal
        open={!!editingItem}
        onClose={() => setEditingItem(null)}
        title='点検項目を編集'
        width='medium'
        padding='xl'
      >
        {editingItem && (
          <InspectionItemForm
            item={editingItem}
            equipments={equipments}
            action={updateInspectionItem}
            onCancel={() => setEditingItem(null)}
            onSuccess={() => {
              setEditingItem(null)
              showToast('点検項目を更新しました', 'success')
            }}
            onError={(message) => showToast(message, 'error')}
          />
        )}
      </Modal>

      {deletingItem && (
        <DeleteInspectionItemModal
          item={deletingItem}
          open={!!deletingItem}
          onClose={() => setDeletingItem(null)}
          onSuccess={() => {
            setDeletingItem(null)
            showToast('点検項目を削除しました', 'success')
          }}
        />
      )}

      <Toast {...toastProps} />
    </FlexBox>
  )
}

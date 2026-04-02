'use client'

import type { VisibleEquipment } from '@monorepo/database'
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
import { createEquipment } from '../actions/createEquipment'
import { updateEquipment } from '../actions/updateEquipment'
import styles from '../page.module.css'
import { DeleteEquipmentModal } from './DeleteEquipmentModal'
import { EquipmentForm } from './EquipmentForm'

type Props = {
  equipments: VisibleEquipment[]
}

const NameCell = ({ row }: { row: VisibleEquipment }) => (
  <Typography size='md' weight='bold'>
    {row.name}
  </Typography>
)

const LineNameCell = ({ row }: { row: VisibleEquipment }) => <Typography size='md'>{row.lineName}</Typography>

const MachineNumberCell = ({ row }: { row: VisibleEquipment }) => <Typography size='md'>{row.machineNumber}</Typography>

const CategoryCell = ({ row }: { row: VisibleEquipment }) => (
  <span>{row.category ? <span className={styles.categoryBadge}>{row.category}</span> : '---'}</span>
)

const InstalledAtCell = ({ row }: { row: VisibleEquipment }) => (
  <Typography size='md'>{row.installedAt ? formatDate(row.installedAt, 'YYYY/MM/DD') : '---'}</Typography>
)

const createActionCell = (
  onEdit: (equipment: VisibleEquipment) => void,
  onDelete: (equipment: VisibleEquipment) => void,
) => {
  const ActionCell = ({ row }: { row: VisibleEquipment }) => (
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

export function EquipmentTab({ equipments }: Props) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<VisibleEquipment | null>(null)
  const [deletingEquipment, setDeletingEquipment] = useState<VisibleEquipment | null>(null)
  const { showToast, toastProps } = useToast()

  const handleEdit = useCallback((equipment: VisibleEquipment) => setEditingEquipment(equipment), [])
  const handleDelete = useCallback((equipment: VisibleEquipment) => setDeletingEquipment(equipment), [])

  const columns: CellProps<VisibleEquipment>[] = useMemo(
    () => [
      { label: '設備名', Component: NameCell },
      { label: 'ライン名', Component: LineNameCell },
      { label: '号機', Component: MachineNumberCell },
      { label: 'カテゴリ', Component: CategoryCell },
      { label: '設置日', Component: InstalledAtCell },
      { label: 'アクション', Component: createActionCell(handleEdit, handleDelete) },
    ],
    [handleEdit, handleDelete],
  )

  return (
    <FlexBox flexDirection='column' gap='1.5rem'>
      <FlexBox justifyContent='flex-end'>
        <Button onClick={() => setIsCreating(true)}>設備を追加</Button>
      </FlexBox>

      <Table rows={equipments} uniqueKey='id' noRowsMessage='設備が登録されていません' columns={columns} />

      <Modal open={isCreating} onClose={() => setIsCreating(false)} title='設備を追加' width='medium' padding='xl'>
        <EquipmentForm
          action={createEquipment}
          onCancel={() => setIsCreating(false)}
          onSuccess={() => {
            setIsCreating(false)
            showToast('設備を作成しました', 'success')
          }}
          onError={(message) => showToast(message, 'error')}
        />
      </Modal>

      <Modal
        open={!!editingEquipment}
        onClose={() => setEditingEquipment(null)}
        title='設備を編集'
        width='medium'
        padding='xl'
      >
        {editingEquipment && (
          <EquipmentForm
            equipment={editingEquipment}
            action={updateEquipment}
            onCancel={() => setEditingEquipment(null)}
            onSuccess={() => {
              setEditingEquipment(null)
              showToast('設備を更新しました', 'success')
            }}
            onError={(message) => showToast(message, 'error')}
          />
        )}
      </Modal>

      {deletingEquipment && (
        <DeleteEquipmentModal
          equipment={deletingEquipment}
          open={!!deletingEquipment}
          onClose={() => setDeletingEquipment(null)}
          onSuccess={() => {
            setDeletingEquipment(null)
            showToast('設備を削除しました', 'success')
          }}
        />
      )}

      <Toast {...toastProps} />
    </FlexBox>
  )
}

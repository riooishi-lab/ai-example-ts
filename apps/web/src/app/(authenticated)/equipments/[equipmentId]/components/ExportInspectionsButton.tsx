'use client'

import { useTransition } from 'react'
import { Button } from '../../../../../components/common/Button'

type Props = {
  equipmentPublicId: string
}

export function ExportInspectionsButton({ equipmentPublicId }: Props) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(() => {
      window.open(`/api/export/inspections?equipmentId=${equipmentPublicId}`, '_blank')
    })
  }

  return (
    <Button variant='outline' onClick={handleClick} disabled={isPending}>
      {isPending ? 'エクスポート中...' : 'CSVエクスポート'}
    </Button>
  )
}

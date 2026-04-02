'use client'

import { Button } from '../../../../components/common/Button'

export function ExportFailureReportsButton() {
  const handleClick = () => {
    window.open('/api/export/failure-reports', '_blank')
  }

  return (
    <Button variant='outline' onClick={handleClick}>
      CSVエクスポート
    </Button>
  )
}

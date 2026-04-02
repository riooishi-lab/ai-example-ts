import { prisma } from '@monorepo/database/client'
import { notFound, redirect } from 'next/navigation'
import { PageHeader } from '../../../../../../components/common/PageHeader'
import { Typography } from '../../../../../../components/common/Typography'
import { PAGE_PATH } from '../../../../../../constants/pagePath'
import { getCurrentUser } from '../../../../../../libs/auth/session'
import { InspectionForm } from './components/InspectionForm'
import styles from './page.module.css'

type PageProps = {
  params: Promise<{ equipmentId: string }>
}

export default async function Page({ params }: PageProps) {
  const user = await getCurrentUser()
  if (!user) {
    redirect(PAGE_PATH.SIGN_IN)
  }

  const { equipmentId } = await params

  const equipment = await prisma.visibleEquipment.findUnique({
    where: { publicId: equipmentId },
  })

  if (!equipment) {
    notFound()
  }

  const inspectionItems = await prisma.visibleInspectionItem.findMany({
    where: { equipmentId: equipment.id },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className={styles.container}>
      <PageHeader icon={<span>📋</span>} title='点検入力' subtitle={equipment.name} />

      {inspectionItems.length === 0 ? (
        <div className={styles.emptyState}>
          <Typography size='md'>点検項目が登録されていません</Typography>
        </div>
      ) : (
        <InspectionForm
          equipmentPublicId={equipment.publicId}
          inspectionItems={inspectionItems.map((item) => ({
            id: item.id,
            name: item.name,
            inputType: item.inputType,
            unit: item.unit,
            upperLimit: item.upperLimit,
            lowerLimit: item.lowerLimit,
            sortOrder: item.sortOrder,
          }))}
        />
      )}
    </div>
  )
}

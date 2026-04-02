import { prisma } from '@monorepo/database/client'
import { redirect } from 'next/navigation'
import { FlexBox } from '../../../../components/common/FlexBox'
import { PageHeader } from '../../../../components/common/PageHeader'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { getCurrentUser } from '../../../../libs/auth/session'
import { createFailureReport } from './actions/createFailureReport'
import { FailureReportForm } from './components/FailureReportForm'
import styles from './page.module.css'

export default async function Page() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect(PAGE_PATH.SIGN_IN)
  }

  const [equipments, parts, users] = await Promise.all([
    prisma.visibleEquipment.findMany({
      select: { publicId: true, name: true, lineName: true },
      orderBy: { lineName: 'asc' },
    }),
    prisma.part.findMany({
      where: { deletedAt: null },
      select: {
        publicId: true,
        equipmentId: true,
        name: true,
        equipment: { select: { publicId: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.visibleUser.findMany({
      select: { publicId: true, firstName: true, lastName: true },
      orderBy: { lastName: 'asc' },
    }),
  ])

  const partOptions = parts.map((p) => ({
    publicId: p.publicId,
    equipmentId: p.equipmentId,
    name: p.name,
    equipmentPublicId: p.equipment.publicId,
  }))

  return (
    <div className={styles.container}>
      <FlexBox flexDirection='column' gap='1.5rem'>
        <PageHeader icon={<span>📝</span>} title='不具合報告 新規登録' />
        <FailureReportForm equipments={equipments} parts={partOptions} users={users} action={createFailureReport} />
      </FlexBox>
    </div>
  )
}

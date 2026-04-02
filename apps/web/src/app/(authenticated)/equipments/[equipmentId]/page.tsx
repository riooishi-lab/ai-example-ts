import { prisma } from '@monorepo/database/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MdArrowBack, MdBuild, MdShowChart } from 'react-icons/md'
import { Button } from '../../../../components/common/Button'
import { FlexBox } from '../../../../components/common/FlexBox'
import { PageHeader } from '../../../../components/common/PageHeader'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { EquipmentInfoSection } from './components/EquipmentInfoSection'
import { ExportInspectionsButton } from './components/ExportInspectionsButton'
import type { FailureReportWithReporter } from './components/FailureReportsSection'
import { FailureReportsSection } from './components/FailureReportsSection'
import type { InspectionRecordWithInspector } from './components/InspectionRecordsSection'
import { InspectionRecordsSection } from './components/InspectionRecordsSection'
import { PartsSection } from './components/PartsSection'
import styles from './page.module.css'

type PageProps = {
  params: Promise<{ equipmentId: string }>
}

export default async function Page({ params }: PageProps) {
  const { equipmentId } = await params

  const equipment = await prisma.visibleEquipment.findUnique({
    where: { publicId: equipmentId },
  })

  if (!equipment) {
    notFound()
  }

  const [parts, inspectionRecords, failureReports] = await Promise.all([
    prisma.visiblePart.findMany({
      where: { equipmentId: equipment.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.visibleInspectionRecord.findMany({
      where: { equipmentId: equipment.id },
      orderBy: { inspectedAt: 'desc' },
      take: 10,
    }),
    prisma.visibleFailureReport.findMany({
      where: { equipmentId: equipment.id },
      orderBy: { occurredAt: 'desc' },
      take: 10,
    }),
  ])

  const inspectorIds = [...new Set(inspectionRecords.map((r) => r.inspectorId))]
  const reporterIds = [...new Set(failureReports.map((r) => r.reporterId))]
  const allUserIds = [...new Set([...inspectorIds, ...reporterIds])]

  const users = await prisma.visibleUser.findMany({
    where: { id: { in: allUserIds } },
    select: { id: true, firstName: true, lastName: true },
  })

  const userNameMap = new Map(users.map((u) => [u.id, `${u.lastName} ${u.firstName}`]))

  const recordsWithInspector: InspectionRecordWithInspector[] = inspectionRecords.map((r) => ({
    ...r,
    inspectorName: userNameMap.get(r.inspectorId) ?? '---',
  }))

  const reportsWithReporter: FailureReportWithReporter[] = failureReports.map((r) => ({
    ...r,
    reporterName: userNameMap.get(r.reporterId) ?? '---',
  }))

  return (
    <FlexBox flexDirection='column' gap='1.5rem' className={styles.container}>
      <Link href={PAGE_PATH.EQUIPMENTS} className={styles.backLink}>
        <MdArrowBack size={16} />
        設備一覧に戻る
      </Link>

      <PageHeader
        icon={<MdBuild size={32} />}
        title={equipment.name}
        subtitle={`${equipment.lineName} / ${equipment.machineNumber}`}
      >
        <FlexBox gap='0.5rem'>
          <ExportInspectionsButton equipmentPublicId={equipment.publicId} />
          <Link href={`${PAGE_PATH.EQUIPMENTS}/${equipment.publicId}/trend`}>
            <Button variant='outline'>
              <FlexBox alignItems='center' gap='0.375rem'>
                <MdShowChart size={18} />
                トレンドグラフ
              </FlexBox>
            </Button>
          </Link>
          <Link href={`${PAGE_PATH.EQUIPMENTS}/${equipment.publicId}/inspections/new`}>
            <Button>新規点検を開始</Button>
          </Link>
        </FlexBox>
      </PageHeader>

      <EquipmentInfoSection equipment={equipment} />
      <PartsSection parts={parts} />
      <InspectionRecordsSection records={recordsWithInspector} />
      <FailureReportsSection reports={reportsWithReporter} />
    </FlexBox>
  )
}

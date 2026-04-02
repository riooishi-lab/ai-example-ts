import { prisma } from '@monorepo/database/client'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '../../../components/common/Button'
import { FlexBox } from '../../../components/common/FlexBox'
import { PageHeader } from '../../../components/common/PageHeader'
import { PAGE_PATH } from '../../../constants/pagePath'
import { getCurrentUser } from '../../../libs/auth/session'
import { ExportFailureReportsButton } from './components/ExportFailureReportsButton'
import { FailureReportList } from './components/FailureReportList'
import styles from './page.module.css'

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function Page() {
  if (!(await getCurrentUser())) {
    redirect(PAGE_PATH.SIGN_IN)
  }

  const reports = await prisma.failureReport.findMany({
    where: { deletedAt: null },
    include: {
      equipment: { select: { name: true, lineName: true } },
      reporter: { select: { firstName: true, lastName: true } },
    },
    orderBy: { occurredAt: 'desc' },
  })

  const rows = reports.map((report) => ({
    publicId: report.publicId,
    equipmentName: `${report.equipment.lineName} - ${report.equipment.name}`,
    symptom: report.symptom,
    occurredAt: formatDateTime(report.occurredAt),
    reporterName: `${report.reporter.lastName} ${report.reporter.firstName}`,
    actionAt: formatDateTime(report.actionAt),
  }))

  return (
    <div className={styles.container}>
      <FlexBox flexDirection='column' gap='1.5rem'>
        <PageHeader icon={<span>📋</span>} title='不具合報告一覧'>
          <FlexBox gap='0.5rem'>
            <ExportFailureReportsButton />
            <Link href={PAGE_PATH.FAILURE_REPORTS_NEW}>
              <Button className={styles.newButton}>新規登録</Button>
            </Link>
          </FlexBox>
        </PageHeader>
        <FailureReportList rows={rows} />
      </FlexBox>
    </div>
  )
}

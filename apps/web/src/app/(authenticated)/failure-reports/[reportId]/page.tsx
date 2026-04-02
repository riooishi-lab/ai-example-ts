import { prisma } from '@monorepo/database/client'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { FlexBox } from '../../../../components/common/FlexBox'
import { PageHeader } from '../../../../components/common/PageHeader'
import { Typography } from '../../../../components/common/Typography'
import { PAGE_PATH } from '../../../../constants/pagePath'
import { getCurrentUser } from '../../../../libs/auth/session'
import styles from './page.module.css'

type PageProps = {
  params: Promise<{ reportId: string }>
}

function formatDateTime(date: Date): string {
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <FlexBox gap='1rem' alignItems='flex-start'>
      <Typography size='md' className={styles.fieldLabel}>
        {label}
      </Typography>
      <Typography size='md' className={styles.fieldValue}>
        {children}
      </Typography>
    </FlexBox>
  )
}

export default async function Page({ params }: PageProps) {
  if (!(await getCurrentUser())) {
    redirect(PAGE_PATH.SIGN_IN)
  }

  const { reportId } = await params

  const report = await prisma.failureReport.findFirst({
    where: {
      publicId: reportId,
      deletedAt: null,
    },
    include: {
      equipment: { select: { name: true, lineName: true, machineNumber: true } },
      part: { select: { name: true } },
      reporter: { select: { firstName: true, lastName: true } },
      responder: { select: { firstName: true, lastName: true } },
      photos: {
        select: { publicId: true, filePath: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!report) {
    notFound()
  }

  return (
    <div className={styles.container}>
      <FlexBox flexDirection='column' gap='1.5rem'>
        <Link href={PAGE_PATH.FAILURE_REPORTS} className={styles.backLink}>
          ← 不具合報告一覧に戻る
        </Link>

        <PageHeader icon={<span>📄</span>} title='不具合報告 詳細' />

        <div className={styles.detailCard}>
          <FlexBox flexDirection='column' gap='1rem'>
            <DetailRow label='設備'>
              {report.equipment.lineName} - {report.equipment.name}（{report.equipment.machineNumber}）
            </DetailRow>

            {report.part && <DetailRow label='部品'>{report.part.name}</DetailRow>}

            <hr className={styles.separator} />

            <DetailRow label='発生日時'>{formatDateTime(report.occurredAt)}</DetailRow>

            <DetailRow label='症状'>{report.symptom}</DetailRow>

            {report.estimatedCause && <DetailRow label='推定原因'>{report.estimatedCause}</DetailRow>}

            <hr className={styles.separator} />

            <DetailRow label='対応内容'>{report.action}</DetailRow>

            <DetailRow label='対応日時'>{formatDateTime(report.actionAt)}</DetailRow>

            <DetailRow label='対応者'>
              {report.responder.lastName} {report.responder.firstName}
            </DetailRow>

            <hr className={styles.separator} />

            <DetailRow label='報告者'>
              {report.reporter.lastName} {report.reporter.firstName}
            </DetailRow>

            {report.note && <DetailRow label='備考'>{report.note}</DetailRow>}

            <DetailRow label='登録日時'>{formatDateTime(report.createdAt)}</DetailRow>

            {report.photos.length > 0 && (
              <>
                <hr className={styles.separator} />
                <Typography size='md' className={styles.fieldLabel}>
                  写真
                </Typography>
                <div className={styles.photoGrid}>
                  {report.photos.map((photo) => (
                    <div key={photo.publicId} className={styles.photoThumbnail}>
                      <Typography size='sm' className={styles.photoFileName}>
                        {photo.filePath}
                      </Typography>
                    </div>
                  ))}
                </div>
              </>
            )}
          </FlexBox>
        </div>
      </FlexBox>
    </div>
  )
}

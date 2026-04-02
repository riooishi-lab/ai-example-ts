import { prisma } from '@monorepo/database/client'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MdArrowBack, MdShowChart } from 'react-icons/md'
import { FlexBox } from '../../../../../components/common/FlexBox'
import { PageHeader } from '../../../../../components/common/PageHeader'
import { PAGE_PATH } from '../../../../../constants/pagePath'
import { formatDate } from '../../../../../libs/dayjs'
import { InspectionTrendChart } from './components/InspectionTrendChart'
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

  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const [inspectionItems, inspectionRecords] = await Promise.all([
    prisma.visibleInspectionItem.findMany({
      where: { equipmentId: equipment.id },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.inspectionRecord.findMany({
      where: {
        equipmentId: equipment.id,
        deletedAt: null,
        inspectedAt: { gte: ninetyDaysAgo },
      },
      include: { values: true },
      orderBy: { inspectedAt: 'asc' },
    }),
  ])

  const numericItems = inspectionItems.filter((item) => item.inputType === 'NUMERIC')

  const numericItemMap = new Map(numericItems.map((item) => [item.id, item]))

  const chartData = inspectionRecords.map((record) => {
    const dateStr = formatDate(record.inspectedAt, 'YYYY/MM/DD')
    const entry: Record<string, string | number | null> = { date: dateStr }
    record.values.forEach((value) => {
      const item = numericItemMap.get(value.itemId)
      if (item) {
        entry[item.name] = value.numericValue
      }
    })
    return entry
  })

  const chartItems = numericItems.map((item) => ({
    id: item.id,
    name: item.name,
    unit: item.unit,
    upperLimit: item.upperLimit,
    lowerLimit: item.lowerLimit,
  }))

  return (
    <FlexBox flexDirection='column' gap='1.5rem' className={styles.container}>
      <Link href={`${PAGE_PATH.EQUIPMENTS}/${equipment.publicId}`} className={styles.backLink}>
        <MdArrowBack size={16} />
        設備詳細に戻る
      </Link>

      <PageHeader
        icon={<MdShowChart size={32} />}
        title='トレンドグラフ'
        subtitle={`${equipment.name} / ${equipment.lineName}`}
      />

      <div className={styles.chartSection}>
        <h2 className={styles.sectionTitle}>点検値推移（過去90日間）</h2>
        {numericItems.length === 0 && <p className={styles.emptyMessage}>数値型の点検項目がありません</p>}
        {numericItems.length > 0 && chartData.length === 0 && (
          <p className={styles.emptyMessage}>過去90日間の点検記録がありません</p>
        )}
        {numericItems.length > 0 && chartData.length > 0 && (
          <InspectionTrendChart data={chartData} items={chartItems} />
        )}
      </div>
    </FlexBox>
  )
}

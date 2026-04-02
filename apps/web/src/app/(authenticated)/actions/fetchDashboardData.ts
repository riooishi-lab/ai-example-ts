import { prisma } from '@monorepo/database/client'

export function buildMonthlyFailureData(reports: { occurredAt: Date }[], monthCount: number) {
  const now = new Date()
  const months = Array.from({ length: monthCount }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - i), 1)
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: `${d.getMonth() + 1}月`,
    }
  })

  const countMap = reports.reduce<Record<string, number>>((acc, r) => {
    const key = `${r.occurredAt.getFullYear()}-${String(r.occurredAt.getMonth() + 1).padStart(2, '0')}`
    return { ...acc, [key]: (acc[key] ?? 0) + 1 }
  }, {})

  return months.map(({ key, label }) => ({ month: label, count: countMap[key] ?? 0 }))
}

export function buildDailyInspectionData(records: { inspectedAt: Date }[], dayCount: number) {
  const days = Array.from({ length: dayCount }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (dayCount - 1 - i))
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
    }
  })

  const countMap = records.reduce<Record<string, number>>((acc, r) => {
    const key = `${r.inspectedAt.getFullYear()}-${String(r.inspectedAt.getMonth() + 1).padStart(2, '0')}-${String(r.inspectedAt.getDate()).padStart(2, '0')}`
    return { ...acc, [key]: (acc[key] ?? 0) + 1 }
  }, {})

  return days.map(({ key, label }) => ({ date: label, count: countMap[key] ?? 0 }))
}

function createDateRange() {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)
  fourteenDaysAgo.setHours(0, 0, 0, 0)

  return { todayStart, todayEnd, sixMonthsAgo, fourteenDaysAgo }
}

export async function fetchDashboardData() {
  const { todayStart, todayEnd, sixMonthsAgo, fourteenDaysAgo } = createDateRange()

  const [
    equipmentCount,
    todayInspectionCount,
    failureReportCount,
    recentAbnormalCount,
    recentFailureReports,
    recentInspectionRecords,
    allEquipment,
    inspectedTodayRecords,
    failureReportsForChart,
    inspectionRecordsForChart,
  ] = await Promise.all([
    prisma.visibleEquipment.count(),
    prisma.visibleInspectionRecord.count({
      where: {
        status: 'COMPLETED',
        inspectedAt: { gte: todayStart, lte: todayEnd },
      },
    }),
    prisma.visibleFailureReport.count(),
    prisma.inspectionValue.count({
      where: {
        isAbnormal: true,
        record: { deletedAt: null },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.failureReport.findMany({
      where: { deletedAt: null },
      include: {
        equipment: { select: { name: true } },
      },
      orderBy: { occurredAt: 'desc' },
      take: 5,
    }),
    prisma.inspectionRecord.findMany({
      where: { deletedAt: null },
      include: {
        equipment: { select: { name: true } },
        inspector: { select: { firstName: true, lastName: true } },
      },
      orderBy: { inspectedAt: 'desc' },
      take: 5,
    }),
    prisma.visibleEquipment.findMany({
      select: { id: true, name: true, lineName: true },
    }),
    prisma.inspectionRecord.findMany({
      where: {
        deletedAt: null,
        inspectedAt: { gte: todayStart, lte: todayEnd },
      },
      select: { equipmentId: true },
      distinct: ['equipmentId'],
    }),
    prisma.failureReport.findMany({
      where: {
        deletedAt: null,
        occurredAt: { gte: sixMonthsAgo },
      },
      select: { occurredAt: true },
    }),
    prisma.inspectionRecord.findMany({
      where: {
        deletedAt: null,
        inspectedAt: { gte: fourteenDaysAgo },
      },
      select: { inspectedAt: true },
    }),
  ])

  const inspectedEquipmentIds = new Set(inspectedTodayRecords.map((r) => r.equipmentId))
  const uninspectedEquipment = allEquipment.filter((eq) => !inspectedEquipmentIds.has(eq.id))

  const lastInspectionByEquipment =
    uninspectedEquipment.length > 0
      ? await prisma.inspectionRecord.groupBy({
          by: ['equipmentId'],
          where: {
            deletedAt: null,
            equipmentId: { in: uninspectedEquipment.map((eq) => eq.id) },
          },
          _max: { inspectedAt: true },
        })
      : []

  const lastInspectionMap = new Map(lastInspectionByEquipment.map((r) => [r.equipmentId, r._max.inspectedAt]))

  const uninspectedWithLastDate = uninspectedEquipment.map((eq) => ({
    ...eq,
    lastInspectedAt: lastInspectionMap.get(eq.id) ?? null,
  }))

  return {
    equipmentCount,
    todayInspectionCount,
    failureReportCount,
    recentAbnormalCount,
    recentFailureReports,
    recentInspectionRecords,
    uninspectedEquipment: uninspectedWithLastDate,
    monthlyFailureData: buildMonthlyFailureData(failureReportsForChart, 6),
    dailyInspectionData: buildDailyInspectionData(inspectionRecordsForChart, 14),
  }
}

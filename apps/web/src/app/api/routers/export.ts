import { prisma } from '@monorepo/database/client'
import { Hono } from 'hono'
import { formatDate } from '../../../libs/dayjs'
import type { AppEnv } from '../middleware'
import { authMiddleware } from '../middleware'

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function buildCsvContent(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCsvValue).join(',')
  const dataLines = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n')
  return `\uFEFF${headerLine}\n${dataLines}`
}

function formatDateForFilename(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

const INSPECTION_STATUS_LABELS: Record<string, string> = {
  IN_PROGRESS: '進行中',
  COMPLETED: '完了',
}

const exportRouter = new Hono<AppEnv>()

exportRouter.use('*', authMiddleware)

exportRouter.get('/inspections', async (c) => {
  const equipmentPublicId = c.req.query('equipmentId')
  const from = c.req.query('from')
  const to = c.req.query('to')

  const equipmentWhere = equipmentPublicId
    ? { equipment: { publicId: equipmentPublicId, deletedAt: null } }
    : { equipment: { deletedAt: null } }

  const dateFilter: { inspectedAt?: { gte?: Date; lte?: Date } } = {}
  if (from || to) {
    dateFilter.inspectedAt = {}
    if (from) dateFilter.inspectedAt.gte = new Date(from)
    if (to) dateFilter.inspectedAt.lte = new Date(to)
  }

  const records = await prisma.inspectionRecord.findMany({
    where: {
      deletedAt: null,
      ...equipmentWhere,
      ...dateFilter,
    },
    include: {
      equipment: { select: { name: true, lineName: true } },
      inspector: { select: { firstName: true, lastName: true } },
      values: {
        include: {
          item: { select: { name: true, sortOrder: true } },
        },
        orderBy: { item: { sortOrder: 'asc' } },
      },
    },
    orderBy: { inspectedAt: 'desc' },
  })

  const allItemNames = [...new Set(records.flatMap((record) => record.values.map((v) => v.item.name)))]

  const baseHeaders = ['点検日', '設備名', 'ライン名', '点検者', 'ステータス']
  const headers = [...baseHeaders, ...allItemNames]

  const rows = records.map((record) => {
    const valueMap = new Map(
      record.values.map((v) => [v.item.name, v.numericValue !== null ? v.numericValue : v.textValue]),
    )

    return [
      formatDate(record.inspectedAt, 'YYYY/MM/DD HH:mm'),
      record.equipment.name,
      record.equipment.lineName,
      `${record.inspector.lastName} ${record.inspector.firstName}`,
      INSPECTION_STATUS_LABELS[record.status] ?? record.status,
      ...allItemNames.map((name) => valueMap.get(name) ?? null),
    ]
  })

  const csvContent = buildCsvContent(headers, rows)
  const filename = `inspections_${formatDateForFilename()}.csv`

  return c.body(csvContent, 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
  })
})

exportRouter.get('/failure-reports', async (c) => {
  const from = c.req.query('from')
  const to = c.req.query('to')

  const dateFilter: { occurredAt?: { gte?: Date; lte?: Date } } = {}
  if (from || to) {
    dateFilter.occurredAt = {}
    if (from) dateFilter.occurredAt.gte = new Date(from)
    if (to) dateFilter.occurredAt.lte = new Date(to)
  }

  const reports = await prisma.failureReport.findMany({
    where: {
      deletedAt: null,
      ...dateFilter,
    },
    include: {
      equipment: { select: { name: true, lineName: true, machineNumber: true } },
      part: { select: { name: true } },
      reporter: { select: { firstName: true, lastName: true } },
      responder: { select: { firstName: true, lastName: true } },
    },
    orderBy: { occurredAt: 'desc' },
  })

  const headers = [
    '報告日',
    '設備名',
    'ライン名',
    '号機',
    '部品名',
    '症状',
    '推定原因',
    '対応内容',
    '対応日',
    '報告者',
    '対応者',
  ]

  const rows = reports.map((report) => [
    formatDate(report.occurredAt, 'YYYY/MM/DD HH:mm'),
    report.equipment.name,
    report.equipment.lineName,
    report.equipment.machineNumber,
    report.part?.name ?? '',
    report.symptom,
    report.estimatedCause,
    report.action,
    formatDate(report.actionAt, 'YYYY/MM/DD HH:mm'),
    `${report.reporter.lastName} ${report.reporter.firstName}`,
    `${report.responder.lastName} ${report.responder.firstName}`,
  ])

  const csvContent = buildCsvContent(headers, rows)
  const filename = `failure-reports_${formatDateForFilename()}.csv`

  return c.body(csvContent, 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
  })
})

export { exportRouter as csvExport }

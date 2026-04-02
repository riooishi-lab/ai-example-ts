'use client'

import { useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FlexBox } from '../../../../../../components/common/FlexBox'
import styles from './InspectionTrendChart.module.css'

const CHART_COLORS = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#d97706',
  '#7c3aed',
  '#0891b2',
  '#be185d',
  '#4f46e5',
  '#059669',
  '#ea580c',
]

type InspectionItemInfo = {
  id: number
  name: string
  unit: string | null
  upperLimit: number | null
  lowerLimit: number | null
}

type TrendChartProps = {
  data: Record<string, string | number | null>[]
  items: InspectionItemInfo[]
}

function getColor(index: number) {
  return CHART_COLORS[index % CHART_COLORS.length]
}

export function InspectionTrendChart({ data, items }: Readonly<TrendChartProps>) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(() => new Set(items.map((item) => item.name)))

  const handleToggle = (itemName: string) => {
    setVisibleItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemName)) {
        next.delete(itemName)
      } else {
        next.add(itemName)
      }
      return next
    })
  }

  const referenceLines = items.flatMap((item, index) => {
    if (!visibleItems.has(item.name)) return []
    const color = getColor(index)
    return [
      ...(item.upperLimit !== null
        ? [
            {
              key: `${item.name}-upper`,
              value: item.upperLimit,
              color,
              label: `${item.name} 上限`,
            },
          ]
        : []),
      ...(item.lowerLimit !== null
        ? [
            {
              key: `${item.name}-lower`,
              value: item.lowerLimit,
              color,
              label: `${item.name} 下限`,
            },
          ]
        : []),
    ]
  })

  return (
    <FlexBox flexDirection='column' gap='1rem'>
      <div className={styles.toggleContainer}>
        {items.map((item, index) => {
          const isActive = visibleItems.has(item.name)
          return (
            <button
              key={item.id}
              type='button'
              className={[styles.toggleButton, isActive ? styles.toggleButtonActive : styles.toggleButtonInactive].join(
                ' ',
              )}
              onClick={() => handleToggle(item.name)}
            >
              <span className={styles.colorDot} style={{ backgroundColor: getColor(index) }} />
              {item.name}
              {item.unit && <span className={styles.unitLabel}>({item.unit})</span>}
            </button>
          )
        })}
      </div>

      <div className={styles.chartContainer}>
        <ResponsiveContainer width='100%' height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            {items.map((item, index) =>
              visibleItems.has(item.name) ? (
                <Line
                  key={item.id}
                  type='monotone'
                  dataKey={item.name}
                  stroke={getColor(index)}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ) : null,
            )}
            {referenceLines.map((ref) => (
              <ReferenceLine
                key={ref.key}
                y={ref.value}
                stroke={ref.color}
                strokeDasharray='5 5'
                strokeOpacity={0.6}
                label={{ value: ref.label, fontSize: 10, fill: ref.color }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </FlexBox>
  )
}

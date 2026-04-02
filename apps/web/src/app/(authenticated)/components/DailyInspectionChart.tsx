'use client'

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styles from './DailyInspectionChart.module.css'

type DailyInspectionChartProps = {
  data: { date: string; count: number }[]
}

export function DailyInspectionChart({ data }: DailyInspectionChartProps) {
  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width='100%' height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' vertical={false} />
          <XAxis dataKey='date' tick={{ fontSize: 13 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
          <Tooltip />
          <Line
            type='monotone'
            dataKey='count'
            name='件数'
            stroke='#3b82f6'
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

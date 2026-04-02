'use client'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import styles from './MonthlyFailureChart.module.css'

type MonthlyFailureChartProps = {
  data: { month: string; count: number }[]
}

export function MonthlyFailureChart({ data }: MonthlyFailureChartProps) {
  return (
    <div className={styles.wrapper}>
      <ResponsiveContainer width='100%' height={280}>
        <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray='3 3' vertical={false} />
          <XAxis dataKey='month' tick={{ fontSize: 13 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
          <Tooltip />
          <Bar dataKey='count' name='件数' fill='#e85d3a' radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

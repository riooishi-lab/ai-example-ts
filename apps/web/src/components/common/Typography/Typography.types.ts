import type React from 'react'
import type { CSSProperties, ReactNode } from 'react'

type Props<E extends React.ElementType> = {
  children: ReactNode
  size?: 'xxxl' | 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | 'xxs' | null
  color?: string | null
  align?: CSSProperties['textAlign']
  weight?: CSSProperties['fontWeight']
  whiteSpace?: CSSProperties['whiteSpace']
  wordBreak?: boolean
  className?: string
  TagName?: E
  /**
   * テキストの最大行数を指定します
   * 指定した行数を超えた場合は省略記号（...）で表示されます
   */
  lineClamp?: number
  /**
   * テキストを省略表示にするかどうか
   * trueの場合、overflow: hidden; text-overflow: ellipsis が適用されます
   */
  truncate?: boolean
}

export type TypographyProps<E extends React.ElementType> = Props<E> & Omit<React.ComponentProps<E>, keyof Props<E>>

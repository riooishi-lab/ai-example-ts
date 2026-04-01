export type SeparatorProps =
  | {
      direction: 'horizontal'
      width?: string
      height?: never
      className?: string
      color?: string
    }
  | {
      direction: 'vertical'
      width?: never
      height?: string
      className?: string
      color?: string
    }

export type SliderProps = {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  className?: string
  trackClassName?: string
  rangeClassName?: string
  thumbClassName?: string
  showVerticalLine?: boolean
  middleSeekThumb?: boolean
  verticalLineClassName?: string
}

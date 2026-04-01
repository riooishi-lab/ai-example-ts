import { Range, Root, Thumb, Track } from '@radix-ui/react-slider'
import type React from 'react'
import styles from './Slider.module.css'
import type { SliderProps } from './Slider.types'

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 0.001,
  disabled = false,
  className,
  trackClassName,
  rangeClassName,
  thumbClassName,
  showVerticalLine = false,
  verticalLineClassName,
}) => {
  return (
    <Root
      className={`${styles.sliderRoot} ${className || ''}`}
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
    >
      <Track className={`${styles.sliderTrack} ${trackClassName || ''}`}>
        <Range className={`${styles.sliderRange} ${rangeClassName || ''}`} />
      </Track>
      <Thumb
        className={`${styles.sliderThumb} ${thumbClassName || ''}`}
        style={showVerticalLine ? { left: `${(value[0] / max) * 100}%` } : undefined}
      >
        {showVerticalLine && <div className={`${styles.verticalLine} ${verticalLineClassName || ''}`} />}
      </Thumb>
    </Root>
  )
}

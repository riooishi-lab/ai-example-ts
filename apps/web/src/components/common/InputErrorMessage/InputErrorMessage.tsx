import { Typography } from '../Typography'
import type { InputErrorMessageProps } from './InputErrorMessage.types'

export function InputErrorMessage({ children, ...props }: InputErrorMessageProps) {
  return (
    <Typography color='#b42c01' weight={400} {...props}>
      {children}
    </Typography>
  )
}

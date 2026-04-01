import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

export type InputLabelProps<T extends ElementType> = {
  tag?: T
  label: ReactNode
  required?: boolean
  children?: ReactNode
  'data-testid'?: string
} & Omit<ComponentPropsWithoutRef<T>, 'tag'>

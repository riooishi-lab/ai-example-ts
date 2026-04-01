import type { ReactNode } from 'react'
import { FlexBox } from '../FlexBox'
import { Typography } from '../Typography'
import styles from './PageHeader.module.css'

type Props = {
  icon: ReactNode
  title: string
  subtitle?: string
  children?: ReactNode
}

export function PageHeader({ icon, title, subtitle, children }: Readonly<Props>) {
  return (
    <FlexBox className={styles.header}>
      <FlexBox flexDirection='column' gap='0.25rem'>
        <FlexBox alignItems='flex-start' gap='0.5rem'>
          {icon}
          <FlexBox flexDirection='column' gap='0.25rem'>
            <Typography size='xxl' weight='bold'>
              {title}
            </Typography>
            {subtitle && (
              <Typography size='md' color='var(--color-secondary)'>
                {subtitle}
              </Typography>
            )}
          </FlexBox>
        </FlexBox>
      </FlexBox>
      {children}
    </FlexBox>
  )
}

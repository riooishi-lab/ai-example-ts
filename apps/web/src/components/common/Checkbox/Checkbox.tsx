import type { ComponentPropsWithoutRef } from 'react'
import styles from './Checkbox.module.css'

type Props = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  label?: string
}

export function Checkbox({ id, label, className, ...props }: Readonly<Props>) {
  return (
    <div className={styles.container}>
      <input type='checkbox' id={id} className={`${styles.checkbox} ${className ?? ''}`} {...props} />
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
    </div>
  )
}

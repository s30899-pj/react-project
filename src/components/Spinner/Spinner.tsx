import styles from './Spinner.module.scss'

export interface SpinnerProps {
  size?: number
  label?: string
}

export function Spinner({ size = 24, label }: SpinnerProps) {
  return (
    <span className={styles.wrap} role="status" aria-live="polite">
      <span
        className={styles.spinner}
        style={{ width: size, height: size, borderWidth: Math.max(2, size / 8) }}
      />
      {label && <span className={styles.label}>{label}</span>}
    </span>
  )
}

Spinner.displayName = 'Spinner'

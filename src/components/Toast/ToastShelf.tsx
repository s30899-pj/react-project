import { createPortal } from 'react-dom'
import type { Toast } from '@/types'
import { CheckIcon, CloseIcon, InfoIcon, WarningIcon } from '@/components/icons'
import styles from './ToastShelf.module.scss'

const ICONS: Record<Toast['kind'], JSX.Element> = {
  success: <CheckIcon size={13} />,
  error: <CloseIcon size={13} />,
  info: <InfoIcon size={13} />,
  warning: <WarningIcon size={13} />,
}

export interface ToastShelfProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastShelf({ toasts, onDismiss }: ToastShelfProps) {
  if (toasts.length === 0) return null
  const host = document.getElementById('overlay-root') ?? document.body

  return createPortal(
    <div className={styles.shelf} role="region" aria-label="Powiadomienia">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          className={`${styles.toast} ${styles[toast.kind]}`}
          onClick={() => onDismiss(toast.id)}
        >
          <span className={styles.icon}>{ICONS[toast.kind]}</span>
          <span>{toast.message}</span>
        </button>
      ))}
    </div>,
    host,
  )
}

ToastShelf.displayName = 'ToastShelf'

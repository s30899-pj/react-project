import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './Tooltip.module.scss'

export interface TooltipProps {
  label: ReactNode
  children: ReactNode
}

export function Tooltip({ label, children }: TooltipProps) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)

  const show = () => {
    const rect = ref.current?.getBoundingClientRect()
    if (rect) setCoords({ x: rect.left + rect.width / 2, y: rect.top })
  }
  const hide = () => setCoords(null)

  const host = document.getElementById('overlay-root') ?? document.body

  return (
    <span
      ref={ref}
      className={styles.trigger}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {coords &&
        createPortal(
          <span className={styles.tip} style={{ left: coords.x, top: coords.y }} role="tooltip">
            {label}
          </span>,
          host,
        )}
    </span>
  )
}

Tooltip.displayName = 'Tooltip'

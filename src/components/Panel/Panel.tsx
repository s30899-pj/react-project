import { useState, type ReactNode } from 'react'
import styles from './Panel.module.scss'

export interface PanelProps {
  title: string
  icon?: ReactNode
  actions?: ReactNode
  children: ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

export function Panel({
  title,
  icon,
  actions,
  children,
  collapsible = false,
  defaultOpen = true,
  className = '',
}: PanelProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className={`${styles.panel} ${className}`}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.heading}
          onClick={() => collapsible && setOpen((v) => !v)}
          aria-expanded={collapsible ? open : undefined}
          disabled={!collapsible}
        >
          {collapsible && <span className={`${styles.chevron} ${open ? styles.up : ''}`}>▸</span>}
          {icon && <span className={styles.icon}>{icon}</span>}
          <span>{title}</span>
        </button>
        {actions && <div className={styles.actions}>{actions}</div>}
      </header>
      {open && <div className={styles.body}>{children}</div>}
    </section>
  )
}

export interface PanelSectionProps {
  label?: string
  children: ReactNode
}

function PanelSection({ label, children }: PanelSectionProps) {
  return (
    <div className={styles.section}>
      {label && <span className={styles.sectionLabel}>{label}</span>}
      {children}
    </div>
  )
}

Panel.Section = PanelSection

Panel.displayName = 'Panel'
PanelSection.displayName = 'Panel.Section'

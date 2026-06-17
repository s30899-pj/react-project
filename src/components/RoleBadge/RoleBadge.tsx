import type { UserRole } from '@/types'
import styles from './RoleBadge.module.scss'

const LABELS: Record<UserRole, string> = {
  creator: 'Twórca',
  tester: 'Tester',
  admin: 'Administrator',
}

export interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  return <span className={`${styles.badge} ${styles[role]}`}>{LABELS[role]}</span>
}

RoleBadge.displayName = 'RoleBadge'

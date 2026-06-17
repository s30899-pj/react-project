import type { ComponentType } from 'react'
import type { UserRole } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import styles from './withRole.module.scss'

export function withRole<P extends object>(
  Wrapped: ComponentType<P>,
  allowedRoles: UserRole[],
) {
  function WithRole(props: P) {
    const { user } = useAuth()

    if (!user || !allowedRoles.includes(user.role)) {
      return (
        <div className={styles.denied} role="note">
          🔒 Ta funkcja wymaga roli: <strong>{allowedRoles.join(' / ')}</strong>
        </div>
      )
    }

    return <Wrapped {...props} />
  }

  WithRole.displayName = `withRole(${Wrapped.displayName ?? Wrapped.name ?? 'Component'})`
  return WithRole
}

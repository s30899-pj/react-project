import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import type { Toast, ToastKind } from '@/types'
import { uid } from '@/lib/ids'
import { ToastShelf } from '@/components/Toast/ToastShelf'

export interface ToastContextValue {
  toasts: Toast[]
  notify: (kind: ToastKind, message: string) => void
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (kind: ToastKind, message: string) => {
      const toast: Toast = { id: uid('toast'), kind, message }
      setToasts((prev) => [...prev, toast])
      setTimeout(() => dismiss(toast.id), 3500)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, notify, dismiss }),
    [toasts, notify, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastShelf toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

ToastProvider.displayName = 'ToastProvider'

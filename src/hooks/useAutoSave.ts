import { useEffect, useRef, useState } from 'react'

export function useAutoSave(onSave: () => void, enabled: boolean, intervalMs = 15000) {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const savedRef = useRef(onSave)
  savedRef.current = onSave

  useEffect(() => {
    if (!enabled) return
    const timer = setInterval(() => {
      savedRef.current()
      setLastSavedAt(new Date().toLocaleTimeString('pl-PL'))
    }, intervalMs)
    return () => clearInterval(timer)
  }, [enabled, intervalMs])

  return lastSavedAt
}

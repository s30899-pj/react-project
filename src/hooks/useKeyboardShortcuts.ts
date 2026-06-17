import { useEffect } from 'react'

export type ShortcutMap = Record<string, (event: KeyboardEvent) => void>

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || target.isContentEditable
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return
    const handler = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return
      const parts: string[] = []
      if (event.ctrlKey || event.metaKey) parts.push('mod')
      if (event.shiftKey) parts.push('shift')
      parts.push(event.key.toLowerCase())
      const combo = parts.join('+')
      const action = shortcuts[combo] ?? shortcuts[event.key.toLowerCase()]
      if (action) {
        event.preventDefault()
        action(event)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts, enabled])
}

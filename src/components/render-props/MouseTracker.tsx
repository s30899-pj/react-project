import { useState, type ReactNode } from 'react'

export interface MousePosition {
  x: number
  y: number
  inside: boolean
}

export interface MouseTrackerProps {
  children: (position: MousePosition) => ReactNode
  className?: string
}

export function MouseTracker({ children, className }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0, inside: false })

  return (
    <div
      className={className}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        setPosition({
          x: Math.round(event.clientX - rect.left),
          y: Math.round(event.clientY - rect.top),
          inside: true,
        })
      }}
      onMouseLeave={() => setPosition((p) => ({ ...p, inside: false }))}
    >
      {children(position)}
    </div>
  )
}

MouseTracker.displayName = 'MouseTracker'

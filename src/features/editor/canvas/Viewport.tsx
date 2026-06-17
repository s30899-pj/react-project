import { useRef, type ReactNode } from 'react'
import { useEditor } from '@/hooks/useEditor'
import { useCanvasCamera } from './useCanvasCamera'
import styles from './Viewport.module.scss'

export function Viewport({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const { state } = useEditor()
  const { camera } = state.project
  useCanvasCamera(ref)

  const transform = [
    `translate(${camera.x}px, ${camera.y}px)`,
    `scale(${camera.zoom})`,
    `rotate(${camera.rotation}deg)`,
    camera.projection === 'iso' ? 'rotateX(55deg)' : '',
  ].join(' ')

  return (
    <div ref={ref} className={styles.viewport}>
      <div className={styles.stage} style={{ transform }}>
        {children}
      </div>
    </div>
  )
}

Viewport.displayName = 'Viewport'

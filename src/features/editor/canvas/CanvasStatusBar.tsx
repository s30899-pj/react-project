import { useEditor } from '@/hooks/useEditor'
import { TOOLS } from '../tools/ToolPalette'
import { LayerTypeIcon, ToolIcon } from '@/components/icons'
import type { MousePosition } from '@/components/render-props/MouseTracker'
import styles from './CanvasStatusBar.module.scss'

export function CanvasStatusBar({ position }: { position: MousePosition }) {
  const { state, activeLayer } = useEditor()
  const tool = TOOLS.find((t) => t.id === state.tool)

  return (
    <div className={styles.bar}>
      <span className={styles.item}>
        <ToolIcon tool={state.tool} size={14} /> {tool?.label}
      </span>
      <span className={styles.sep}>·</span>
      <span className={styles.item}>
        Warstwa:{' '}
        {activeLayer ? (
          <strong className={styles.item}>
            <LayerTypeIcon type={activeLayer.type} size={13} /> {activeLayer.name}
          </strong>
        ) : (
          <strong>—</strong>
        )}
      </span>
      <span className={styles.spacer} />
      {position.inside && (
        <span className={styles.coords}>
          kursor: {position.x}, {position.y} px
        </span>
      )}
      <span className={styles.sep}>·</span>
      <span className={styles.coords}>
        {state.project.map.width}×{state.project.map.height}
      </span>
    </div>
  )
}

CanvasStatusBar.displayName = 'CanvasStatusBar'

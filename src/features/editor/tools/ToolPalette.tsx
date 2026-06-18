import { useEditor } from '@/hooks/useEditor'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { ToolIcon } from '@/components/icons'
import type { ToolId } from '@/types'
import styles from './ToolPalette.module.scss'

interface ToolDef {
  id: ToolId
  label: string
}

export const TOOLS: ToolDef[] = [
  { id: 'brush', label: 'Pędzel' },
  { id: 'erase', label: 'Gumka' },
  { id: 'line', label: 'Linia' },
  { id: 'rect', label: 'Prostokąt' },
  { id: 'circle', label: 'Koło' },
  { id: 'fill', label: 'Wypełnianie' },
  { id: 'clone', label: 'Klonowanie' },
  { id: 'pan', label: 'Przesuwanie (rączka)' },
]

export function ToolPalette() {
  const { state, dispatch } = useEditor()

  return (
    <div className={styles.palette} role="toolbar" aria-label="Narzędzia">
      {TOOLS.map((t) => (
        <Tooltip key={t.id} label={t.label}>
          <button
            className={`${styles.tool} ${state.tool === t.id ? styles.active : ''}`}
            onClick={() => dispatch({ type: 'SET_TOOL', tool: t.id })}
            aria-pressed={state.tool === t.id}
            aria-label={t.label}
          >
            <ToolIcon tool={t.id} size={20} />
          </button>
        </Tooltip>
      ))}
    </div>
  )
}

ToolPalette.displayName = 'ToolPalette'

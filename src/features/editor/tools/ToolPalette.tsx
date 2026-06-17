import { useEditor } from '@/hooks/useEditor'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { ToolIcon } from '@/components/icons'
import type { ToolId } from '@/types'
import styles from './ToolPalette.module.scss'

interface ToolDef {
  id: ToolId
  label: string
  shortcut: string
}

export const TOOLS: ToolDef[] = [
  { id: 'brush', label: 'Pędzel', shortcut: 'B' },
  { id: 'erase', label: 'Gumka', shortcut: 'E' },
  { id: 'line', label: 'Linia', shortcut: 'L' },
  { id: 'rect', label: 'Prostokąt', shortcut: 'R' },
  { id: 'circle', label: 'Koło', shortcut: 'C' },
  { id: 'fill', label: 'Wypełnianie', shortcut: 'G' },
  { id: 'clone', label: 'Klonowanie', shortcut: 'K' },
  { id: 'pan', label: 'Przesuwanie (rączka)', shortcut: 'H' },
]

export function ToolPalette() {
  const { state, dispatch } = useEditor()

  return (
    <div className={styles.palette} role="toolbar" aria-label="Narzędzia">
      {TOOLS.map((t) => (
        <Tooltip key={t.id} label={`${t.label} (${t.shortcut})`}>
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

import { useEditor } from '@/hooks/useEditor'
import { Button } from '@/components/Button/Button'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import {
  UndoIcon,
  RedoIcon,
  ZoomOutIcon,
  ZoomInIcon,
  RotateIcon,
  IsoIcon,
  CenterIcon,
  FullscreenIcon,
  SnapshotIcon,
  SaveIcon,
} from '@/components/icons'
import styles from './EditorToolbar.module.scss'

export interface EditorToolbarProps {
  onSave: () => void
  onSnapshot: () => void
  onToggleFullscreen: () => void
  lastSaved: string | null
}

export function EditorToolbar({ onSave, onSnapshot, onToggleFullscreen, lastSaved }: EditorToolbarProps) {
  const { state, dispatch, canUndo, canRedo } = useEditor()
  const { camera, map } = state.project

  const zoomBy = (factor: number) => {
    const zoom = Math.min(4, Math.max(0.3, camera.zoom * factor))
    dispatch({ type: 'SET_CAMERA', camera: { zoom: Number(zoom.toFixed(2)) } })
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.group}>
        <span className={styles.mapName}>{map.name}</span>
        {state.dirty && <span className={styles.dirty} title="Niezapisane zmiany" />}
      </div>

      <div className={styles.group}>
        <Tooltip label="Cofnij (Ctrl+Z)">
          <button disabled={!canUndo} onClick={() => dispatch({ type: 'UNDO' })}>
            <UndoIcon size={16} />
          </button>
        </Tooltip>
        <Tooltip label="Ponów (Ctrl+Y)">
          <button disabled={!canRedo} onClick={() => dispatch({ type: 'REDO' })}>
            <RedoIcon size={16} />
          </button>
        </Tooltip>
      </div>

      <div className={styles.group}>
        <Tooltip label="Pomniejsz">
          <button onClick={() => zoomBy(1 / 1.2)}>
            <ZoomOutIcon size={16} />
          </button>
        </Tooltip>
        <span className={styles.zoom}>{Math.round(camera.zoom * 100)}%</span>
        <Tooltip label="Powiększ">
          <button onClick={() => zoomBy(1.2)}>
            <ZoomInIcon size={16} />
          </button>
        </Tooltip>
        <Tooltip label="Obróć widok">
          <button onClick={() => dispatch({ type: 'SET_CAMERA', camera: { rotation: camera.rotation + 15 } })}>
            <RotateIcon size={16} />
          </button>
        </Tooltip>
        <Tooltip label={camera.projection === 'iso' ? 'Widok ortograficzny' : 'Widok izometryczny'}>
          <button
            className={camera.projection === 'iso' ? styles.on : ''}
            onClick={() =>
              dispatch({
                type: 'SET_CAMERA',
                camera: { projection: camera.projection === 'iso' ? 'ortho' : 'iso' },
              })
            }
          >
            <IsoIcon size={16} />
          </button>
        </Tooltip>
        <Tooltip label="Wyśrodkuj widok">
          <button onClick={() => dispatch({ type: 'RESET_CAMERA' })}>
            <CenterIcon size={16} />
          </button>
        </Tooltip>
        <Tooltip label="Pełny ekran">
          <button onClick={onToggleFullscreen}>
            <FullscreenIcon size={16} />
          </button>
        </Tooltip>
      </div>

      <div className={styles.spacer} />

      <div className={styles.group}>
        {lastSaved && <span className={styles.saved}>Autozapis: {lastSaved}</span>}
        <Button variant="secondary" size="sm" onClick={onSnapshot} icon={<SnapshotIcon size={15} />}>
          Kopia wersji
        </Button>
        <Button variant="primary" size="sm" onClick={onSave} icon={<SaveIcon size={15} />}>
          Zapisz
        </Button>
      </div>
    </div>
  )
}

EditorToolbar.displayName = 'EditorToolbar'

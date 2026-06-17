import { useState } from 'react'
import { useEditor } from '@/hooks/useEditor'
import { LAYER_TYPES, LAYER_TYPE_MAP } from '@/data/palette'
import type { LayerType } from '@/types'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import {
  LayerTypeIcon,
  PlusIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UnlockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DuplicateIcon,
  MergeIcon,
  ClearIcon,
  TrashIcon,
  FlipHorizontalIcon,
  FlipVerticalIcon,
  RotateLayerIcon,
} from '@/components/icons'
import styles from './LayersPanel.module.scss'

export function LayersPanel() {
  const { state, dispatch, activeLayer } = useEditor()
  const { layers } = state.project
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newType, setNewType] = useState<LayerType>('object')

  const ordered = [...layers].reverse()

  return (
    <div className={styles.wrap}>
      <div className={styles.addRow}>
        <select value={newType} onChange={(e) => setNewType(e.target.value as LayerType)}>
          {LAYER_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          className={styles.addBtn}
          onClick={() => dispatch({ type: 'ADD_LAYER', layerType: newType })}
        >
          <PlusIcon size={14} />
          Dodaj
        </button>
      </div>

      <ul className={styles.list}>
        {ordered.map((layer) => {
          const def = LAYER_TYPE_MAP[layer.type]
          const isActive = layer.id === state.activeLayerId
          return (
            <li
              key={layer.id}
              className={`${styles.item} ${isActive ? styles.active : ''}`}
              onClick={() => dispatch({ type: 'SET_ACTIVE_LAYER', layerId: layer.id })}
            >
              <button
                className={styles.iconBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  dispatch({ type: 'TOGGLE_LAYER_VISIBLE', layerId: layer.id })
                }}
                aria-label="Widoczność"
              >
                {layer.visible ? <EyeIcon size={15} /> : <EyeOffIcon size={15} />}
              </button>
              <button
                className={styles.iconBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  dispatch({ type: 'TOGGLE_LAYER_LOCK', layerId: layer.id })
                }}
                aria-label="Blokada"
              >
                {layer.locked ? <LockIcon size={15} /> : <UnlockIcon size={15} />}
              </button>
              <span className={styles.typeIcon} title={def.hint}>
                <LayerTypeIcon type={layer.type} size={15} />
              </span>
              {editingId === layer.id ? (
                <input
                  className={styles.rename}
                  autoFocus
                  defaultValue={layer.name}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => {
                    dispatch({ type: 'RENAME_LAYER', layerId: layer.id, name: e.target.value })
                    setEditingId(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                  }}
                />
              ) : (
                <span
                  className={styles.name}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    setEditingId(layer.id)
                  }}
                >
                  {layer.name}
                </span>
              )}
              <span className={styles.count}>{Object.keys(layer.cells).length}</span>
            </li>
          )
        })}
      </ul>

      {activeLayer && (
        <div className={styles.controls}>
          <label className={styles.opacity}>
            Krycie: {Math.round(activeLayer.opacity * 100)}%
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={activeLayer.opacity}
              onChange={(e) =>
                dispatch({
                  type: 'SET_LAYER_OPACITY',
                  layerId: activeLayer.id,
                  opacity: Number(e.target.value),
                })
              }
            />
          </label>

          <div className={styles.actions}>
            <Tooltip label="W górę">
              <button onClick={() => dispatch({ type: 'MOVE_LAYER', layerId: activeLayer.id, direction: 'up' })}>
                <ArrowUpIcon size={15} />
              </button>
            </Tooltip>
            <Tooltip label="W dół">
              <button onClick={() => dispatch({ type: 'MOVE_LAYER', layerId: activeLayer.id, direction: 'down' })}>
                <ArrowDownIcon size={15} />
              </button>
            </Tooltip>
            <Tooltip label="Duplikuj">
              <button onClick={() => dispatch({ type: 'DUPLICATE_LAYER', layerId: activeLayer.id })}>
                <DuplicateIcon size={15} />
              </button>
            </Tooltip>
            <Tooltip label="Scal w dół">
              <button onClick={() => dispatch({ type: 'MERGE_LAYER_DOWN', layerId: activeLayer.id })}>
                <MergeIcon size={15} />
              </button>
            </Tooltip>
            <Tooltip label="Wyczyść">
              <button onClick={() => dispatch({ type: 'CLEAR_LAYER', layerId: activeLayer.id })}>
                <ClearIcon size={15} />
              </button>
            </Tooltip>
            <Tooltip label="Usuń">
              <button
                className={styles.danger}
                onClick={() => dispatch({ type: 'REMOVE_LAYER', layerId: activeLayer.id })}
              >
                <TrashIcon size={15} />
              </button>
            </Tooltip>
          </div>

          <div className={styles.actions}>
            <Tooltip label="Odbij w poziomie">
              <button onClick={() => dispatch({ type: 'TRANSFORM_LAYER', layerId: activeLayer.id, transform: 'mirrorX' })}>
                <FlipHorizontalIcon size={15} />
              </button>
            </Tooltip>
            <Tooltip label="Odbij w pionie">
              <button onClick={() => dispatch({ type: 'TRANSFORM_LAYER', layerId: activeLayer.id, transform: 'mirrorY' })}>
                <FlipVerticalIcon size={15} />
              </button>
            </Tooltip>
            <Tooltip label="Obróć 90°">
              <button onClick={() => dispatch({ type: 'TRANSFORM_LAYER', layerId: activeLayer.id, transform: 'rotate' })}>
                <RotateLayerIcon size={15} />
              </button>
            </Tooltip>
          </div>
        </div>
      )}
    </div>
  )
}

LayersPanel.displayName = 'LayersPanel'

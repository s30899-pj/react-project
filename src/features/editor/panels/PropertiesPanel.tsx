import { useEditor } from '@/hooks/useEditor'
import { Panel } from '@/components/Panel/Panel'
import { SettingsIcon } from '@/components/icons'
import { Field, formStyles } from '@/components/form/Field'
import { Toggle } from '@/components/form/Toggle'
import styles from './PropertiesPanel.module.scss'

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pl-PL')
}

export function PropertiesPanel() {
  const { state, dispatch } = useEditor()
  const map = state.project.map

  return (
    <Panel title="Właściwości mapy" icon={<SettingsIcon size={16} />} collapsible>
      <Panel.Section label="Podstawowe">
        <Field label="Nazwa mapy" htmlFor="map-name">
          <input
            id="map-name"
            className={formStyles.input}
            type="text"
            value={map.name}
            onChange={(e) => dispatch({ type: 'UPDATE_MAP', map: { name: e.target.value } })}
          />
        </Field>
      </Panel.Section>

      <Panel.Section label="Wymiary i siatka">
        <div className={styles.row}>
          <Field label="Szerokość" htmlFor="map-width" hint="4–60">
            <input
              id="map-width"
              className={formStyles.input}
              type="number"
              min={4}
              max={60}
              value={map.width}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_MAP', map: { width: clamp(e.target.valueAsNumber, 4, 60) } })
              }
            />
          </Field>
          <Field label="Wysokość" htmlFor="map-height" hint="4–60">
            <input
              id="map-height"
              className={formStyles.input}
              type="number"
              min={4}
              max={60}
              value={map.height}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_MAP',
                  map: { height: clamp(e.target.valueAsNumber, 4, 60) },
                })
              }
            />
          </Field>
        </div>

        <Field label="Rozmiar kafelka" htmlFor="map-tile-size">
          <div className={styles.rangeRow}>
            <input
              id="map-tile-size"
              className={styles.range}
              type="range"
              min={16}
              max={48}
              step={1}
              value={map.tileSize}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_MAP', map: { tileSize: e.target.valueAsNumber } })
              }
            />
            <span className={styles.value}>{map.tileSize} px</span>
          </div>
        </Field>

        <Field label="Skala podglądu" htmlFor="map-scale">
          <div className={styles.rangeRow}>
            <input
              id="map-scale"
              className={styles.range}
              type="range"
              min={0.5}
              max={2}
              step={0.5}
              value={map.scale}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_MAP', map: { scale: e.target.valueAsNumber } })
              }
            />
            <span className={styles.value}>{map.scale.toFixed(1)}×</span>
          </div>
        </Field>

        <div className={styles.toggles}>
          <Toggle
            checked={map.showGrid}
            onChange={(showGrid) => dispatch({ type: 'UPDATE_MAP', map: { showGrid } })}
            label="Pokaż siatkę"
          />
          <Toggle
            checked={map.snapToGrid}
            onChange={(snapToGrid) => dispatch({ type: 'UPDATE_MAP', map: { snapToGrid } })}
            label="Przyciągaj do siatki"
          />
        </div>
      </Panel.Section>

      <Panel.Section label="Fizyka świata">
        <Field label="Grawitacja" htmlFor="map-gravity">
          <div className={styles.rangeRow}>
            <input
              id="map-gravity"
              className={styles.range}
              type="range"
              min={0}
              max={20}
              step={0.1}
              value={map.physics.gravity}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_MAP',
                  map: { physics: { ...map.physics, gravity: e.target.valueAsNumber } },
                })
              }
            />
            <span className={styles.value}>{map.physics.gravity.toFixed(1)}</span>
          </div>
        </Field>

        <div className={styles.toggles}>
          <Toggle
            checked={map.physics.collisions}
            onChange={(collisions) =>
              dispatch({
                type: 'UPDATE_MAP',
                map: { physics: { ...map.physics, collisions } },
              })
            }
            label="Kolizje"
          />
        </div>
      </Panel.Section>

      <Panel.Section label="Metadane">
        <Field label="Opis" htmlFor="map-description">
          <textarea
            id="map-description"
            className={formStyles.textarea}
            value={map.meta.description}
            placeholder="Krótki opis mapy…"
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_MAP',
                map: { meta: { ...map.meta, description: e.target.value } },
              })
            }
          />
        </Field>

        <Field label="Tagi" htmlFor="map-tags" hint="Oddziel przecinkami">
          <input
            id="map-tags"
            className={formStyles.input}
            type="text"
            value={map.meta.tags.join(', ')}
            placeholder="np. las, jaskinia, pvp"
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_MAP',
                map: {
                  meta: {
                    ...map.meta,
                    tags: e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean),
                  },
                },
              })
            }
          />
        </Field>

        <dl className={styles.timestamps}>
          <div className={styles.timestamp}>
            <dt>Utworzono</dt>
            <dd>{formatDate(map.meta.createdAt)}</dd>
          </div>
          <div className={styles.timestamp}>
            <dt>Zaktualizowano</dt>
            <dd>{formatDate(map.meta.updatedAt)}</dd>
          </div>
        </dl>
      </Panel.Section>
    </Panel>
  )
}

PropertiesPanel.displayName = 'PropertiesPanel'

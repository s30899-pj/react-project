import { useMemo, useState } from 'react'
import { useEditor } from '@/hooks/useEditor'
import { useToast } from '@/hooks/useToast'
import { Panel } from '@/components/Panel/Panel'
import { Button } from '@/components/Button/Button'
import { Field, formStyles } from '@/components/form/Field'
import { REGIONS, REGION_MAP } from '@/data/palette'
import { CollisionIcon, TrashIcon } from '@/components/icons'
import { validateProject } from '@/features/editor/engine/validation'
import { uid } from '@/lib/ids'
import type { LayerType, RegionType, TriggerType } from '@/types'
import styles from './CollisionPanel.module.scss'

const TRIGGER_TYPES: TriggerType[] = [
  'Wyzwalacz wydarzenia',
  'Skrypt',
  'Ścieżka NPC',
  'Punkt interakcji',
]

export function CollisionPanel() {
  const { state, dispatch } = useEditor()
  const { notify } = useToast()

  const triggers = state.project.triggers
  const [name, setName] = useState('')
  const [type, setType] = useState<TriggerType>(TRIGGER_TYPES[0])

  const stats = useMemo(() => {
    const layers = state.project.layers
    let collisionCells = 0
    const regionCounts: Record<RegionType, number> = {
      spawn: 0,
      teleport: 0,
      trap: 0,
      speed: 0,
      checkpoint: 0,
    }
    for (const layer of layers) {
      if (layer.type === 'collision') {
        for (const cell of Object.values(layer.cells)) {
          if (cell.solid) collisionCells += 1
        }
      } else if (layer.type === 'logic') {
        for (const cell of Object.values(layer.cells)) {
          if (cell.region) regionCounts[cell.region] += 1
        }
      }
    }
    return { collisionCells, regionCounts }
  }, [state.project.layers])

  function focusLayer(layerType: LayerType) {
    const layer = state.project.layers.find((l) => l.type === layerType)
    if (layer) {
      dispatch({ type: 'SET_ACTIVE_LAYER', layerId: layer.id })
      dispatch({ type: 'SET_TOOL', tool: 'brush' })
    } else {
      dispatch({ type: 'ADD_LAYER', layerType })
      notify(
        'info',
        layerType === 'collision'
          ? 'Dodano warstwę kolizji'
          : 'Dodano warstwę logiki',
      )
    }
  }

  function addTrigger() {
    const trimmed = name.trim()
    if (!trimmed) return
    dispatch({ type: 'ADD_TRIGGER', trigger: { id: uid('trigger'), name: trimmed, type } })
    setName('')
  }

  function removeTrigger(id: string) {
    dispatch({ type: 'REMOVE_TRIGGER', triggerId: id })
  }

  function testMovement() {
    const report = validateProject(state.project)
    notify('info', 'Osiągalność: ' + report.stats.reachablePercent + '%')
  }

  return (
    <Panel title="Kolizje i logika mapy" icon={<CollisionIcon size={16} />}>
      <Panel.Section label="Szybki dostęp">
        <div className={styles.quickAccess}>
          <Button
            variant="secondary"
            size="sm"
            icon="⛔"
            fullWidth
            onClick={() => focusLayer('collision')}
          >
            Edytuj kolizje
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon="🧩"
            fullWidth
            onClick={() => focusLayer('logic')}
          >
            Edytuj logikę/regiony
          </Button>
        </div>
      </Panel.Section>

      <Panel.Section label="Statystyki">
        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>
              <span className={styles.statIcon}>⛔</span>
              Pola kolizji
            </span>
            <span className={styles.statValue}>{stats.collisionCells}</span>
          </div>
          {REGIONS.map((region) => (
            <div key={region.id} className={styles.statRow}>
              <span className={styles.statLabel}>
                <span className={styles.statIcon}>{REGION_MAP[region.id].icon}</span>
                {REGION_MAP[region.id].label}
              </span>
              <span className={styles.statValue}>
                {stats.regionCounts[region.id]}
              </span>
            </div>
          ))}
        </div>
      </Panel.Section>

      <Panel.Section label="Wyzwalacze i skrypty">
        <div className={styles.triggerForm}>
          <Field label="Nazwa" htmlFor="trigger-name">
            <input
              id="trigger-name"
              className={formStyles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Otwórz bramę"
            />
          </Field>
          <Field label="Typ" htmlFor="trigger-type">
            <select
              id="trigger-type"
              className={formStyles.select}
              value={type}
              onChange={(e) => setType(e.target.value as TriggerType)}
            >
              {TRIGGER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Button
            variant="primary"
            size="sm"
            icon="➕"
            fullWidth
            disabled={!name.trim()}
            onClick={addTrigger}
          >
            Dodaj
          </Button>
        </div>

        {triggers.length === 0 ? (
          <p className={styles.empty}>Brak zdefiniowanych wyzwalaczy.</p>
        ) : (
          <ul className={styles.triggerList}>
            {triggers.map((trigger) => (
              <li key={trigger.id} className={styles.triggerItem}>
                <span className={styles.triggerInfo}>
                  <span className={styles.triggerName}>{trigger.name}</span>
                  <span className={styles.triggerType}>{trigger.type}</span>
                </span>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => removeTrigger(trigger.id)}
                  aria-label={`Usuń wyzwalacz ${trigger.name}`}
                >
                  <TrashIcon size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel.Section>

      <Panel.Section label="Test poruszania">
        <Button variant="ghost" size="sm" icon="🚶" fullWidth onClick={testMovement}>
          Testuj poruszanie
        </Button>
      </Panel.Section>
    </Panel>
  )
}

CollisionPanel.displayName = 'CollisionPanel'

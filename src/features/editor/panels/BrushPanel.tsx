import { useEditor } from '@/hooks/useEditor'
import { REGIONS, TERRAINS } from '@/data/palette'
import { Panel } from '@/components/Panel/Panel'
import { PaletteIcon, SquareIcon, CircleIcon } from '@/components/icons'
import styles from './BrushPanel.module.scss'

export function BrushPanel() {
  const { state, dispatch, activeLayer } = useEditor()
  const { brush } = state
  const setBrush = (patch: Partial<typeof brush>) => dispatch({ type: 'SET_BRUSH', brush: patch })

  return (
    <Panel title="Pędzel" icon={<PaletteIcon size={16} />}>
      <Panel.Section label="Rozmiar i kształt">
        <div className={styles.row}>
          <input
            type="range"
            min={1}
            max={6}
            value={brush.size}
            onChange={(e) => setBrush({ size: Number(e.target.value) })}
          />
          <span className={styles.value}>{brush.size}</span>
        </div>
        <div className={styles.shapes}>
          <button
            className={brush.shape === 'square' ? styles.active : ''}
            onClick={() => setBrush({ shape: 'square' })}
          >
            <SquareIcon size={14} /> Kwadrat
          </button>
          <button
            className={brush.shape === 'circle' ? styles.active : ''}
            onClick={() => setBrush({ shape: 'circle' })}
          >
            <CircleIcon size={14} /> Koło
          </button>
        </div>
      </Panel.Section>

      {activeLayer?.type === 'terrain' && (
        <Panel.Section label="Typ podłoża">
          <div className={styles.swatches}>
            {TERRAINS.map((terrain) => (
              <button
                key={terrain.id}
                className={`${styles.swatch} ${brush.terrain === terrain.id ? styles.active : ''}`}
                style={{ background: terrain.color }}
                onClick={() => setBrush({ terrain: terrain.id })}
                title={terrain.label}
              >
                <span>{terrain.icon}</span>
              </button>
            ))}
          </div>
          <label className={styles.heightLabel}>
            Wysokość terenu: <strong>{brush.height}</strong>
            <input
              type="range"
              min={0}
              max={9}
              value={brush.height}
              onChange={(e) => setBrush({ height: Number(e.target.value) })}
            />
          </label>
        </Panel.Section>
      )}

      {activeLayer?.type === 'object' && (
        <Panel.Section label="Wybrany obiekt">
          <div className={styles.objectPreview}>
            <span className={styles.objectIcon}>{brush.objectIcon ?? '❔'}</span>
            <span className={styles.hint}>Wybierz obiekt w zakładce „Obiekty”.</span>
          </div>
          <label className={styles.heightLabel}>
            Skala obiektu: <strong>{brush.objectScale.toFixed(1)}×</strong>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.1}
              value={brush.objectScale}
              onChange={(e) => setBrush({ objectScale: Number(e.target.value) })}
            />
          </label>
        </Panel.Section>
      )}

      {activeLayer?.type === 'logic' && (
        <Panel.Section label="Region specjalny">
          <div className={styles.regions}>
            {REGIONS.map((region) => (
              <button
                key={region.id}
                className={`${styles.region} ${brush.region === region.id ? styles.active : ''}`}
                onClick={() => setBrush({ region: region.id })}
              >
                <span style={{ color: region.color }}>{region.icon}</span> {region.label}
              </button>
            ))}
          </div>
        </Panel.Section>
      )}

      {activeLayer?.type === 'effect' && (
        <Panel.Section label="Kolor efektu">
          <input
            type="color"
            className={styles.color}
            value={brush.color}
            onChange={(e) => setBrush({ color: e.target.value })}
          />
        </Panel.Section>
      )}

      {activeLayer?.type === 'collision' && (
        <Panel.Section>
          <p className={styles.hint}>Maluj obszary nieprzechodzące. Gumką usuwasz kolizje.</p>
        </Panel.Section>
      )}
    </Panel>
  )
}

BrushPanel.displayName = 'BrushPanel'

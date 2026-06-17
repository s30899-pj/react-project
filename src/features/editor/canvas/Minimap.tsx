import { useMemo } from 'react'
import { useEditor } from '@/hooks/useEditor'
import { TERRAIN_MAP } from '@/data/palette'
import styles from './Minimap.module.scss'

const WIDTH = 168

export function Minimap() {
  const { state, dispatch } = useEditor()
  const { map, layers, camera } = state.project
  const scale = WIDTH / map.width
  const height = map.height * scale

  const dots = useMemo(() => {
    const terrain = layers.filter((l) => l.type === 'terrain' && l.visible)
    const collected: { key: string; x: number; y: number; color: string }[] = []
    for (const layer of terrain) {
      for (const [key, cell] of Object.entries(layer.cells)) {
        if (!cell.terrain) continue
        const [x, y] = key.split(',').map(Number)
        collected.push({ key: `${layer.id}-${key}`, x, y, color: TERRAIN_MAP[cell.terrain].color })
      }
    }
    return collected
  }, [layers])

  const recenter = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const cx = (event.clientX - rect.left) / scale
    const cy = (event.clientY - rect.top) / scale
    dispatch({
      type: 'SET_CAMERA',
      camera: {
        x: (map.width / 2 - cx) * map.tileSize * camera.zoom,
        y: (map.height / 2 - cy) * map.tileSize * camera.zoom,
      },
    })
  }

  return (
    <div className={styles.minimap}>
      <div className={styles.surface} style={{ width: WIDTH, height }} onClick={recenter}>
        {dots.map((dot) => (
          <span
            key={dot.key}
            style={{
              left: dot.x * scale,
              top: dot.y * scale,
              width: Math.ceil(scale),
              height: Math.ceil(scale),
              background: dot.color,
            }}
          />
        ))}
      </div>
      <span className={styles.caption}>
        {map.width}×{map.height} · zoom {Math.round(camera.zoom * 100)}%
      </span>
    </div>
  )
}

Minimap.displayName = 'Minimap'

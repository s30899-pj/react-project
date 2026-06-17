import { memo } from 'react'
import type { CellData, LayerType } from '@/types'
import { REGION_MAP, TERRAIN_MAP } from '@/data/palette'
import styles from './Tile.module.scss'

export interface TileProps {
  x: number
  y: number
  size: number
  layerType: LayerType
  cell: CellData
}

function TileComponent({ x, y, size, layerType, cell }: TileProps) {
  const base: React.CSSProperties = {
    left: x * size,
    top: y * size,
    width: size,
    height: size,
  }

  if (layerType === 'terrain' && cell.terrain) {
    const def = TERRAIN_MAP[cell.terrain]
    const height = cell.height ?? 0
    return (
      <div
        className={`${styles.tile} ${def.liquid ? styles.liquid : ''}`}
        style={{ ...base, background: def.color, filter: `brightness(${1 + (height - 3) * 0.05})` }}
      >
        {height > 0 && <span className={styles.height}>{height}</span>}
      </div>
    )
  }

  if (layerType === 'object' && cell.objectIcon) {
    return (
      <div className={styles.tile} style={base}>
        <span className={styles.object} style={{ fontSize: size * 0.72 * (cell.scale ?? 1) }}>
          {cell.objectIcon}
        </span>
      </div>
    )
  }

  if (layerType === 'collision' && cell.solid) {
    return <div className={`${styles.tile} ${styles.collision}`} style={base} />
  }

  if (layerType === 'logic' && cell.region) {
    const def = REGION_MAP[cell.region]
    return (
      <div
        className={`${styles.tile} ${styles.region}`}
        style={{ ...base, background: `${def.color}33`, boxShadow: `inset 0 0 0 2px ${def.color}` }}
      >
        <span className={styles.regionIcon} style={{ fontSize: size * 0.5 }}>
          {def.icon}
        </span>
      </div>
    )
  }

  if (layerType === 'effect' && cell.color) {
    return (
      <div className={`${styles.tile} ${styles.effect}`} style={{ ...base, background: cell.color }} />
    )
  }

  return null
}

export const Tile = memo(TileComponent)
Tile.displayName = 'Tile'

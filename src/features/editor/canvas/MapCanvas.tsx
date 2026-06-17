import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useEditor } from '@/hooks/useEditor'
import { useToast } from '@/hooks/useToast'
import type { CellData } from '@/types'
import { cellKey } from '@/lib/ids'
import { buildCellData, cellSignature } from '../engine/cellData'
import {
  brushFootprint,
  circleCells,
  clampPoints,
  floodFill,
  lineCells,
  pointsToKeys,
  rectCells,
  type Point,
} from '../engine/tools'
import { Tile } from './Tile'
import styles from './MapCanvas.module.scss'

export function MapCanvas() {
  const { state, dispatch, activeLayer } = useEditor()
  const { map, layers, camera } = state.project
  const { tool, brush } = state
  const tile = map.tileSize
  const { notify } = useToast()

  const [hover, setHover] = useState<Point | null>(null)
  const [preview, setPreview] = useState<Point[]>([])
  const painting = useRef(false)
  const shapeStart = useRef<Point | null>(null)
  const cloneData = useRef<CellData | null>(null)

  const getCell = (event: ReactPointerEvent): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    const zoom = camera.zoom || 1
    return {
      x: Math.floor((event.clientX - rect.left) / zoom / tile),
      y: Math.floor((event.clientY - rect.top) / zoom / tile),
    }
  }

  const paintData = (): CellData | null => {
    if (!activeLayer) return null
    if (tool === 'erase') return null
    if (tool === 'clone') return cloneData.current
    return buildCellData(activeLayer.type, brush)
  }

  const stamp = (point: Point) => {
    const footprint = clampPoints(
      brushFootprint(point.x, point.y, brush.size, brush.shape),
      map.width,
      map.height,
    )
    dispatch({ type: 'STROKE_PAINT', keys: pointsToKeys(footprint), data: paintData() })
  }

  const previewFor = (start: Point, end: Point): Point[] => {
    if (tool === 'line') return lineCells(start.x, start.y, end.x, end.y)
    if (tool === 'rect') return rectCells(start.x, start.y, end.x, end.y, true)
    if (tool === 'circle') {
      const radius = Math.round(Math.hypot(end.x - start.x, end.y - start.y))
      return circleCells(start.x, start.y, radius, true)
    }
    return []
  }

  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.button !== 0 || tool === 'pan') return
    if (!activeLayer) return
    if (activeLayer.locked) {
      notify('warning', `Warstwa „${activeLayer.name}” jest zablokowana`)
      return
    }
    if (!activeLayer.visible) {
      notify('warning', `Warstwa „${activeLayer.name}” jest ukryta`)
      return
    }
    const cell = getCell(event)

    if (tool === 'fill') {
      const found = floodFill(cell, map.width, map.height, (key) =>
        cellSignature(activeLayer.cells[key], activeLayer.type),
      )
      dispatch({ type: 'APPLY_CELLS', keys: pointsToKeys(found), data: buildCellData(activeLayer.type, brush) })
      return
    }

    if (tool === 'line' || tool === 'rect' || tool === 'circle') {
      shapeStart.current = cell
      setPreview([cell])
      return
    }

    if (tool === 'clone') {
      cloneData.current = activeLayer.cells[cellKey(cell.x, cell.y)] ?? null
      if (!cloneData.current) {
        notify('info', 'Kliknij pole ze źródłem, potem maluj kopię')
        return
      }
    }

    dispatch({ type: 'STROKE_START' })
    painting.current = true
    stamp(cell)
  }

  const onPointerMove = (event: ReactPointerEvent) => {
    const cell = getCell(event)
    setHover(cell)
    if (painting.current) {
      stamp(cell)
    } else if (shapeStart.current) {
      setPreview(clampPoints(previewFor(shapeStart.current, cell), map.width, map.height))
    }
  }

  const finishStroke = () => {
    if (painting.current) {
      painting.current = false
      dispatch({ type: 'STROKE_END' })
    }
    if (shapeStart.current && activeLayer && !activeLayer.locked) {
      dispatch({
        type: 'APPLY_CELLS',
        keys: pointsToKeys(preview),
        data: buildCellData(activeLayer.type, brush),
      })
    }
    shapeStart.current = null
    setPreview([])
  }

  const hoverFootprint =
    hover && !painting.current && ['brush', 'erase', 'clone'].includes(tool)
      ? clampPoints(brushFootprint(hover.x, hover.y, brush.size, brush.shape), map.width, map.height)
      : []

  return (
    <div
      className={`${styles.board} ${map.showGrid ? styles.grid : ''}`}
      style={{
        width: map.width * tile,
        height: map.height * tile,
        ['--tile' as string]: `${tile}px`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishStroke}
      onPointerLeave={() => {
        setHover(null)
        finishStroke()
      }}
    >
      {layers.map((layer) =>
        layer.visible ? (
          <div key={layer.id} className={styles.layer} style={{ opacity: layer.opacity }}>
            {Object.entries(layer.cells).map(([key, cell]) => {
              const [x, y] = key.split(',').map(Number)
              return <Tile key={key} x={x} y={y} size={tile} layerType={layer.type} cell={cell} />
            })}
          </div>
        ) : null,
      )}

      {preview.map((point) => (
        <div
          key={`pv-${point.x}-${point.y}`}
          className={styles.preview}
          style={{ left: point.x * tile, top: point.y * tile, width: tile, height: tile }}
        />
      ))}

      {hoverFootprint.map((point) => (
        <div
          key={`hv-${point.x}-${point.y}`}
          className={styles.hover}
          style={{ left: point.x * tile, top: point.y * tile, width: tile, height: tile }}
        />
      ))}
    </div>
  )
}

MapCanvas.displayName = 'MapCanvas'

import type { BrushShape } from '@/types'
import { cellKey } from '@/lib/ids'

export interface Point {
  x: number
  y: number
}

export function inBounds(p: Point, width: number, height: number): boolean {
  return p.x >= 0 && p.y >= 0 && p.x < width && p.y < height
}

export function clampPoints(points: Point[], width: number, height: number): Point[] {
  return points.filter((p) => inBounds(p, width, height))
}

// Ślad pędzla wokół punktu (rozmiar = promień + 1).
export function brushFootprint(cx: number, cy: number, size: number, shape: BrushShape): Point[] {
  const radius = size - 1
  const points: Point[] = []
  for (let dy = -radius; dy <= radius; dy += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      if (shape === 'circle' && dx * dx + dy * dy > radius * radius + radius * 0.5) continue
      points.push({ x: cx + dx, y: cy + dy })
    }
  }
  return points
}

// Algorytm Bresenhama — linia między dwoma punktami siatki.
export function lineCells(x0: number, y0: number, x1: number, y1: number): Point[] {
  const points: Point[] = []
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  let x = x0
  let y = y0
  for (;;) {
    points.push({ x, y })
    if (x === x1 && y === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x += sx
    }
    if (e2 <= dx) {
      err += dx
      y += sy
    }
  }
  return points
}

export function rectCells(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  filled: boolean,
): Point[] {
  const minX = Math.min(x0, x1)
  const maxX = Math.max(x0, x1)
  const minY = Math.min(y0, y1)
  const maxY = Math.max(y0, y1)
  const points: Point[] = []
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const onEdge = x === minX || x === maxX || y === minY || y === maxY
      if (filled || onEdge) points.push({ x, y })
    }
  }
  return points
}

export function circleCells(
  cx: number,
  cy: number,
  radius: number,
  filled: boolean,
): Point[] {
  const points: Point[] = []
  const r = Math.max(0, radius)
  for (let dy = -r; dy <= r; dy += 1) {
    for (let dx = -r; dx <= r; dx += 1) {
      const dist = Math.sqrt(dx * dx + dy * dy)
      const inside = dist <= r + 0.4
      const onRing = Math.abs(dist - r) <= 0.6
      if (filled ? inside : onRing) points.push({ x: cx + dx, y: cy + dy })
    }
  }
  return points
}

export function floodFill(
  start: Point,
  width: number,
  height: number,
  signatureAt: (key: string) => string,
): Point[] {
  if (!inBounds(start, width, height)) return []
  const startSig = signatureAt(cellKey(start.x, start.y))
  const visited = new Set<string>([cellKey(start.x, start.y)])
  const queue: Point[] = [start]
  const result: Point[] = []
  let head = 0

  while (head < queue.length) {
    const point = queue[head]
    head += 1
    result.push(point)
    const neighbours: Point[] = [
      { x: point.x + 1, y: point.y },
      { x: point.x - 1, y: point.y },
      { x: point.x, y: point.y + 1 },
      { x: point.x, y: point.y - 1 },
    ]
    for (const next of neighbours) {
      if (!inBounds(next, width, height)) continue
      const key = cellKey(next.x, next.y)
      if (visited.has(key) || signatureAt(key) !== startSig) continue
      visited.add(key)
      queue.push(next)
    }
  }
  return result
}

export function pointsToKeys(points: Point[]): string[] {
  return points.map((p) => cellKey(p.x, p.y))
}

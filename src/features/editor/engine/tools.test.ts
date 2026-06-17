import { describe, it, expect } from 'vitest'
import {
  brushFootprint,
  circleCells,
  clampPoints,
  floodFill,
  inBounds,
  lineCells,
  pointsToKeys,
  rectCells,
} from './tools'

describe('inBounds / clampPoints', () => {
  it('rozpoznaje punkty w granicach mapy', () => {
    expect(inBounds({ x: 0, y: 0 }, 4, 4)).toBe(true)
    expect(inBounds({ x: 4, y: 0 }, 4, 4)).toBe(false)
    expect(inBounds({ x: -1, y: 2 }, 4, 4)).toBe(false)
  })

  it('odfiltrowuje punkty poza mapą', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
    ]
    expect(clampPoints(points, 4, 4)).toEqual([{ x: 0, y: 0 }])
  })
})

describe('brushFootprint', () => {
  it('rozmiar 1 to pojedyncze pole', () => {
    expect(brushFootprint(3, 3, 1, 'square')).toEqual([{ x: 3, y: 3 }])
  })

  it('kwadrat 2 daje siatkę 3x3', () => {
    expect(brushFootprint(0, 0, 2, 'square')).toHaveLength(9)
  })

  it('koło 2 jest mniejsze niż kwadrat 2', () => {
    expect(brushFootprint(0, 0, 2, 'circle').length).toBeLessThan(9)
  })
})

describe('lineCells (Bresenham)', () => {
  it('rysuje przekątną', () => {
    expect(lineCells(0, 0, 2, 2)).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ])
  })
})

describe('rectCells', () => {
  it('obrys 3x3 pomija środek', () => {
    expect(rectCells(0, 0, 2, 2, false)).toHaveLength(8)
  })

  it('wypełniony 3x3 ma 9 pól', () => {
    expect(rectCells(0, 0, 2, 2, true)).toHaveLength(9)
  })
})

describe('circleCells', () => {
  it('promień 0 to jedno pole', () => {
    expect(circleCells(2, 2, 0, true)).toEqual([{ x: 2, y: 2 }])
  })
})

describe('floodFill', () => {
  it('wypełnia spójny obszar o tej samej sygnaturze', () => {
    const signatureAt = () => 'grass'
    const filled = floodFill({ x: 0, y: 0 }, 3, 3, signatureAt)
    expect(filled).toHaveLength(9)
  })

  it('nie przekracza bariery o innej sygnaturze', () => {
    const wall = new Set(['1,0', '1,1', '1,2'])
    const signatureAt = (key: string) => (wall.has(key) ? 'wall' : 'grass')
    const filled = floodFill({ x: 0, y: 0 }, 3, 3, signatureAt)
    expect(filled).toHaveLength(3)
    expect(pointsToKeys(filled).sort()).toEqual(['0,0', '0,1', '0,2'])
  })
})

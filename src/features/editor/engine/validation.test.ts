import { describe, it, expect } from 'vitest'
import { createProject } from '@/lib/factory'
import { validateProject } from './validation'

describe('validateProject', () => {
  it('zgłasza błąd dla pustej mapy', () => {
    const report = validateProject(createProject({ width: 4, height: 4 }))
    expect(report.stats.totalCells).toBe(16)
    expect(report.stats.paintedCells).toBe(0)
    expect(report.issues.some((i) => i.severity === 'error')).toBe(true)
  })

  it('liczy 100% osiągalności gdy teren jest spójny i ma spawn', () => {
    const project = createProject({ width: 3, height: 1 })
    const terrain = project.layers.find((l) => l.type === 'terrain')!
    terrain.cells = {
      '0,0': { terrain: 'grass' },
      '1,0': { terrain: 'grass' },
      '2,0': { terrain: 'grass' },
    }
    const logic = project.layers.find((l) => l.type === 'logic')!
    logic.cells = { '0,0': { region: 'spawn' } }

    const report = validateProject(project)
    expect(report.stats.reachablePercent).toBe(100)
    expect(report.issues.some((i) => i.severity === 'error')).toBe(false)
  })

  it('wykrywa nieosiągalne pola za barierą kolizji', () => {
    const project = createProject({ width: 3, height: 1 })
    const terrain = project.layers.find((l) => l.type === 'terrain')!
    terrain.cells = {
      '0,0': { terrain: 'grass' },
      '1,0': { terrain: 'grass' },
      '2,0': { terrain: 'grass' },
    }
    const collision = project.layers.find((l) => l.type === 'collision')!
    collision.cells = { '1,0': { solid: true } }
    const logic = project.layers.find((l) => l.type === 'logic')!
    logic.cells = { '0,0': { region: 'spawn' } }

    const report = validateProject(project)
    expect(report.stats.reachablePercent).toBeLessThan(100)
    expect(report.issues.some((i) => i.title.includes('Nieosiągalne'))).toBe(true)
  })
})

import { describe, it, expect } from 'vitest'
import { createProject } from '@/lib/factory'
import { exportProject, fileExtension, importJSON } from './serialize'

describe('serialize', () => {
  const project = createProject({ name: 'Testowa', width: 5, height: 5 })

  it('JSON eksportuje i importuje w obie strony', () => {
    const json = exportProject(project, 'json')
    const result = importJSON(json)
    expect(result.ok).toBe(true)
    expect(result.project?.map.id).toBe(project.map.id)
    expect(result.project?.map.name).toBe('Testowa')
  })

  it('XML zawiera znacznik mapy', () => {
    expect(exportProject(project, 'xml')).toContain('<map')
  })

  it('wyzwalacze przetrwają eksport i import JSON', () => {
    const withTrigger = {
      ...project,
      triggers: [{ id: 't1', name: 'Pułapka', type: 'Skrypt' as const }],
    }
    const result = importJSON(exportProject(withTrigger, 'json'))
    expect(result.project?.triggers).toHaveLength(1)
    expect(result.project?.triggers[0].name).toBe('Pułapka')
  })

  it('format własny ma nagłówek MAPFORGE', () => {
    expect(exportProject(project, 'custom')).toContain('MAPFORGE')
  })

  it('rozszerzenia plików są poprawne', () => {
    expect(fileExtension('json')).toBe('json')
    expect(fileExtension('custom')).toBe('mfmap')
  })

  it('import błędnego JSON zwraca błąd', () => {
    const result = importJSON('to nie jest json')
    expect(result.ok).toBe(false)
    expect(result.error).toBeTruthy()
  })
})

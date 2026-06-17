import type { CellData, MapProject } from '@/types'

export type ExportFormat = 'json' | 'xml' | 'custom'

export function exportJSON(project: MapProject): string {
  return JSON.stringify(project, null, 2)
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function cellAttributes(cell: CellData): string {
  return Object.entries(cell)
    .map(([key, value]) => `${key}="${escapeXml(String(value))}"`)
    .join(' ')
}

export function exportXML(project: MapProject): string {
  const { map, layers, triggers = [] } = project
  const lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>']
  lines.push(
    `<map name="${escapeXml(map.name)}" width="${map.width}" height="${map.height}" tileSize="${map.tileSize}" scale="${map.scale}">`,
  )
  lines.push(`  <physics gravity="${map.physics.gravity}" collisions="${map.physics.collisions}" />`)
  for (const layer of layers) {
    lines.push(
      `  <layer id="${layer.id}" name="${escapeXml(layer.name)}" type="${layer.type}" visible="${layer.visible}" opacity="${layer.opacity}">`,
    )
    for (const [key, cell] of Object.entries(layer.cells)) {
      const [x, y] = key.split(',')
      lines.push(`    <cell x="${x}" y="${y}" ${cellAttributes(cell)} />`)
    }
    lines.push('  </layer>')
  }
  if (triggers.length) {
    lines.push('  <triggers>')
    for (const trigger of triggers) {
      lines.push(
        `    <trigger id="${escapeXml(trigger.id)}" name="${escapeXml(trigger.name)}" type="${escapeXml(trigger.type)}" />`,
      )
    }
    lines.push('  </triggers>')
  }
  lines.push('</map>')
  return lines.join('\n')
}

// Własny, zwarty format tekstowy „.mfmap”.
export function exportCustom(project: MapProject): string {
  const { map, layers, triggers = [] } = project
  const lines: string[] = ['MAPFORGE;v=1']
  lines.push(`MAP;${map.name};${map.width};${map.height};${map.tileSize};${map.scale}`)
  for (const layer of layers) {
    lines.push(`LAYER;${layer.type};${layer.name};${layer.visible ? 1 : 0};${layer.opacity}`)
    for (const [key, cell] of Object.entries(layer.cells)) {
      const props = Object.entries(cell)
        .map(([k, v]) => `${k}=${v}`)
        .join(',')
      lines.push(`C;${key};${props}`)
    }
  }
  for (const trigger of triggers) {
    lines.push(`T;${trigger.id};${trigger.name};${trigger.type}`)
  }
  return lines.join('\n')
}

export function exportProject(project: MapProject, format: ExportFormat): string {
  if (format === 'xml') return exportXML(project)
  if (format === 'custom') return exportCustom(project)
  return exportJSON(project)
}

export function fileExtension(format: ExportFormat): string {
  return format === 'custom' ? 'mfmap' : format
}

export interface ImportResult {
  ok: boolean
  project?: MapProject
  error?: string
}

export function importJSON(text: string): ImportResult {
  try {
    const parsed = JSON.parse(text) as MapProject
    if (!parsed.map || !Array.isArray(parsed.layers)) {
      return { ok: false, error: 'Nieprawidłowa struktura: brak pól „map” lub „layers”.' }
    }
    return { ok: true, project: parsed }
  } catch (error) {
    return { ok: false, error: `Błąd parsowania JSON: ${(error as Error).message}` }
  }
}

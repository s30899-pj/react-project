import type { BrushSettings, CellData, LayerType } from '@/types'

export function buildCellData(layerType: LayerType, brush: BrushSettings): CellData {
  switch (layerType) {
    case 'terrain':
      return { terrain: brush.terrain, height: brush.height }
    case 'object':
      return { objectId: brush.objectId, objectIcon: brush.objectIcon, scale: brush.objectScale }
    case 'collision':
      return { solid: true }
    case 'logic':
      return { region: brush.region }
    case 'effect':
      return { color: brush.color }
    default:
      return {}
  }
}

export function cellSignature(cell: CellData | undefined, layerType: LayerType): string {
  if (!cell) return 'empty'
  switch (layerType) {
    case 'terrain':
      return cell.terrain ?? 'empty'
    case 'object':
      return cell.objectId ?? 'empty'
    case 'collision':
      return cell.solid ? 'solid' : 'empty'
    case 'logic':
      return cell.region ?? 'empty'
    case 'effect':
      return cell.color ?? 'empty'
    default:
      return 'empty'
  }
}

import type { LayerType, RegionType, TerrainType } from '@/types'

export interface TerrainDef {
  id: TerrainType
  label: string
  color: string
  icon: string
  liquid?: boolean
}

export const TERRAINS: TerrainDef[] = [
  { id: 'grass', label: 'Trawa', color: '#5bb24a', icon: '🌿' },
  { id: 'water', label: 'Woda', color: '#3a8ee6', icon: '💧', liquid: true },
  { id: 'sand', label: 'Piasek', color: '#e3cd7b', icon: '🏖️' },
  { id: 'stone', label: 'Kamień', color: '#8a8f99', icon: '🪨' },
  { id: 'snow', label: 'Śnieg', color: '#e8eef6', icon: '❄️' },
  { id: 'lava', label: 'Lawa', color: '#e25b32', icon: '🌋', liquid: true },
  { id: 'dirt', label: 'Ziemia', color: '#8a5a36', icon: '🟫' },
  { id: 'void', label: 'Pustka', color: '#1a1b25', icon: '⬛' },
]

export const TERRAIN_MAP: Record<TerrainType, TerrainDef> = TERRAINS.reduce(
  (acc, t) => {
    acc[t.id] = t
    return acc
  },
  {} as Record<TerrainType, TerrainDef>,
)

export interface RegionDef {
  id: RegionType
  label: string
  color: string
  icon: string
}

export const REGIONS: RegionDef[] = [
  { id: 'spawn', label: 'Punkt startowy', color: '#2ecc71', icon: '🚩' },
  { id: 'teleport', label: 'Teleport', color: '#9b59b6', icon: '🌀' },
  { id: 'trap', label: 'Pułapka', color: '#e74c3c', icon: '☠️' },
  { id: 'speed', label: 'Przyspieszenie', color: '#f1c40f', icon: '⚡' },
  { id: 'checkpoint', label: 'Checkpoint', color: '#1abc9c', icon: '🏁' },
]

export const REGION_MAP: Record<RegionType, RegionDef> = REGIONS.reduce(
  (acc, r) => {
    acc[r.id] = r
    return acc
  },
  {} as Record<RegionType, RegionDef>,
)

export interface LayerTypeDef {
  id: LayerType
  label: string
  icon: string
  hint: string
}

export const LAYER_TYPES: LayerTypeDef[] = [
  { id: 'terrain', label: 'Teren', icon: '🗺️', hint: 'Podłoże, wysokość i ciecze' },
  { id: 'object', label: 'Obiekty', icon: '🌳', hint: 'Dekoracje i elementy gry' },
  { id: 'collision', label: 'Kolizje', icon: '⛔', hint: 'Obszary nieprzechodzące' },
  { id: 'effect', label: 'Efekty', icon: '✨', hint: 'Warstwa efektów wizualnych' },
  { id: 'logic', label: 'Logika', icon: '🧩', hint: 'Regiony, wyzwalacze i skrypty' },
]

export const LAYER_TYPE_MAP: Record<LayerType, LayerTypeDef> = LAYER_TYPES.reduce(
  (acc, l) => {
    acc[l.id] = l
    return acc
  },
  {} as Record<LayerType, LayerTypeDef>,
)

import type { Camera, GameMap, Layer, LayerType, MapProject } from '@/types'
import { uid } from './ids'

export function createLayer(type: LayerType, name?: string): Layer {
  return {
    id: uid('layer'),
    name: name ?? defaultLayerName(type),
    type,
    visible: true,
    locked: false,
    opacity: 1,
    cells: {},
  }
}

function defaultLayerName(type: LayerType): string {
  const names: Record<LayerType, string> = {
    terrain: 'Teren',
    object: 'Obiekty',
    collision: 'Kolizje',
    effect: 'Efekty',
    logic: 'Logika',
  }
  return names[type]
}

export function createDefaultCamera(): Camera {
  return { x: 0, y: 0, zoom: 1, rotation: 0, projection: 'ortho' }
}

export interface NewMapInput {
  name: string
  width: number
  height: number
  tileSize: number
  scale: number
  showGrid: boolean
  snapToGrid: boolean
  gravity: number
  collisions: boolean
  author: string
  description: string
  tags: string[]
}

export function createMap(input: Partial<NewMapInput> = {}): GameMap {
  const now = new Date().toISOString()
  return {
    id: uid('map'),
    name: input.name ?? 'Nowa mapa',
    width: input.width ?? 24,
    height: input.height ?? 16,
    tileSize: input.tileSize ?? 28,
    scale: input.scale ?? 1,
    showGrid: input.showGrid ?? true,
    snapToGrid: input.snapToGrid ?? true,
    physics: {
      gravity: input.gravity ?? 9.8,
      collisions: input.collisions ?? true,
    },
    meta: {
      author: input.author ?? 'anonim',
      description: input.description ?? '',
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    },
  }
}

export function createProject(input: Partial<NewMapInput> = {}): MapProject {
  return {
    map: createMap(input),
    layers: [
      createLayer('terrain'),
      createLayer('object'),
      createLayer('collision'),
      createLayer('logic'),
    ],
    triggers: [],
    camera: createDefaultCamera(),
    version: 1,
  }
}

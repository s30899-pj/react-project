export type UserRole = 'creator' | 'tester' | 'admin'

export type ThemeMode = 'dark' | 'light'

export interface UserPreferences {
  theme: ThemeMode
  showGrid: boolean
  snapToGrid: boolean
  autosave: boolean
}

export interface User {
  id: string
  email: string
  displayName: string
  avatar: string
  bio: string
  role: UserRole
  preferences: UserPreferences
}

export type LayerType = 'terrain' | 'object' | 'collision' | 'effect' | 'logic'

export type TerrainType =
  | 'grass'
  | 'water'
  | 'sand'
  | 'stone'
  | 'snow'
  | 'lava'
  | 'dirt'
  | 'void'

export type RegionType = 'teleport' | 'trap' | 'speed' | 'spawn' | 'checkpoint'

export interface CellData {
  terrain?: TerrainType
  height?: number
  objectId?: string
  objectIcon?: string
  scale?: number
  rotation?: number
  solid?: boolean
  region?: RegionType
  color?: string
}

export type CellMap = Record<string, CellData>

export interface Layer {
  id: string
  name: string
  type: LayerType
  visible: boolean
  locked: boolean
  opacity: number
  cells: CellMap
}

export type TriggerType =
  | 'Wyzwalacz wydarzenia'
  | 'Skrypt'
  | 'Ścieżka NPC'
  | 'Punkt interakcji'

export interface Trigger {
  id: string
  name: string
  type: TriggerType
}

export type Projection = 'ortho' | 'iso'

export interface Camera {
  x: number
  y: number
  zoom: number
  rotation: number
  projection: Projection
}

export interface WorldPhysics {
  gravity: number
  collisions: boolean
}

export interface MapMeta {
  author: string
  description: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface GameMap {
  id: string
  name: string
  width: number
  height: number
  tileSize: number
  scale: number
  showGrid: boolean
  snapToGrid: boolean
  physics: WorldPhysics
  meta: MapMeta
}

export interface MapProject {
  map: GameMap
  layers: Layer[]
  triggers: Trigger[]
  camera: Camera
  version: number
}

export interface ProjectSnapshot {
  id: string
  projectId: string
  label: string
  savedAt: string
  data: MapProject
}

export interface ProjectSummary {
  id: string
  name: string
  width: number
  height: number
  updatedAt: string
  layerCount: number
}

export type ToolId =
  | 'brush'
  | 'erase'
  | 'rect'
  | 'line'
  | 'circle'
  | 'fill'
  | 'clone'
  | 'pan'
  | 'select'
  | 'region'
  | 'path'

export type BrushShape = 'square' | 'circle'

export interface BrushSettings {
  size: number
  shape: BrushShape
  terrain: TerrainType
  height: number
  region: RegionType
  color: string
  opacity: number
  objectId?: string
  objectIcon?: string
  objectScale: number
}

export interface AssetCategory {
  id: string
  name: string
  icon: string
}

export interface GameAsset {
  id: string
  name: string
  icon: string
  categoryId: string
  tags: string[]
  layer: LayerType
}

export interface MapTemplate {
  id: string
  name: string
  description: string
  width: number
  height: number
  preview: string
}

export interface Tileset {
  id: string
  name: string
  terrains: TerrainType[]
}

export type ValidationSeverity = 'error' | 'warning' | 'info'

export interface ValidationIssue {
  id: string
  severity: ValidationSeverity
  title: string
  detail: string
  suggestion?: string
}

export interface ValidationStats {
  totalCells: number
  paintedCells: number
  collisionCells: number
  objectCount: number
  estimatedMemoryKb: number
  reachablePercent: number
}

export interface ValidationReport {
  issues: ValidationIssue[]
  stats: ValidationStats
}

export type ToastKind = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  kind: ToastKind
  message: string
}

import { createContext, useReducer, useMemo, type ReactNode } from 'react'
import type {
  BrushSettings,
  Camera,
  CellData,
  GameMap,
  Layer,
  LayerType,
  MapProject,
  ToolId,
  Trigger,
} from '@/types'
import { createLayer, createProject } from '@/lib/factory'
import { uid } from '@/lib/ids'

export interface EditorState {
  project: MapProject
  activeLayerId: string
  tool: ToolId
  brush: BrushSettings
  past: MapProject[]
  future: MapProject[]
  dirty: boolean
}

export type EditorAction =
  | { type: 'LOAD_PROJECT'; project: MapProject }
  | { type: 'SET_TOOL'; tool: ToolId }
  | { type: 'SET_BRUSH'; brush: Partial<BrushSettings> }
  | { type: 'SET_ACTIVE_LAYER'; layerId: string }
  | { type: 'STROKE_START' }
  | { type: 'STROKE_PAINT'; keys: string[]; data: CellData | null }
  | { type: 'STROKE_END' }
  | { type: 'APPLY_CELLS'; keys: string[]; data: CellData | null }
  | { type: 'ADD_LAYER'; layerType: LayerType }
  | { type: 'REMOVE_LAYER'; layerId: string }
  | { type: 'RENAME_LAYER'; layerId: string; name: string }
  | { type: 'TOGGLE_LAYER_VISIBLE'; layerId: string }
  | { type: 'TOGGLE_LAYER_LOCK'; layerId: string }
  | { type: 'SET_LAYER_OPACITY'; layerId: string; opacity: number }
  | { type: 'MOVE_LAYER'; layerId: string; direction: 'up' | 'down' }
  | { type: 'DUPLICATE_LAYER'; layerId: string }
  | { type: 'MERGE_LAYER_DOWN'; layerId: string }
  | { type: 'CLEAR_LAYER'; layerId: string }
  | { type: 'TRANSFORM_LAYER'; layerId: string; transform: 'mirrorX' | 'mirrorY' | 'rotate' }
  | { type: 'ADD_TRIGGER'; trigger: Trigger }
  | { type: 'REMOVE_TRIGGER'; triggerId: string }
  | { type: 'SET_CAMERA'; camera: Partial<Camera> }
  | { type: 'RESET_CAMERA' }
  | { type: 'UPDATE_MAP'; map: Partial<GameMap> }
  | { type: 'UNDO' }
  | { type: 'REDO' }

const HISTORY_LIMIT = 50

export const DEFAULT_BRUSH: BrushSettings = {
  size: 1,
  shape: 'square',
  terrain: 'grass',
  height: 0,
  region: 'spawn',
  color: '#6c5ce7',
  opacity: 1,
  objectId: 'a-tree',
  objectIcon: '🌳',
  objectScale: 1,
}

export function createInitialState(project?: MapProject): EditorState {
  const base = project ?? createProject()
  const proj: MapProject = { ...base, triggers: base.triggers ?? [] }
  return {
    project: proj,
    activeLayerId: proj.layers[0]?.id ?? '',
    tool: 'brush',
    brush: { ...DEFAULT_BRUSH },
    past: [],
    future: [],
    dirty: false,
  }
}

function touch(project: MapProject): MapProject {
  return {
    ...project,
    map: { ...project.map, meta: { ...project.map.meta, updatedAt: new Date().toISOString() } },
  }
}

function withProject(state: EditorState, project: MapProject, snapshot = true): EditorState {
  if (!snapshot) {
    return { ...state, project: touch(project), dirty: true }
  }
  return {
    ...state,
    project: touch(project),
    past: [...state.past, state.project].slice(-HISTORY_LIMIT),
    future: [],
    dirty: true,
  }
}

function mapLayers(project: MapProject, fn: (layer: Layer) => Layer): MapProject {
  return { ...project, layers: project.layers.map(fn) }
}

function paintCells(layer: Layer, keys: string[], data: CellData | null): Layer {
  const cells = { ...layer.cells }
  for (const key of keys) {
    if (data === null) {
      delete cells[key]
    } else {
      cells[key] = { ...cells[key], ...data }
    }
  }
  return { ...layer, cells }
}

function transformCells(
  layer: Layer,
  width: number,
  height: number,
  transform: 'mirrorX' | 'mirrorY' | 'rotate',
): Layer {
  const next: Record<string, CellData> = {}
  for (const [key, value] of Object.entries(layer.cells)) {
    const [x, y] = key.split(',').map(Number)
    let nx = x
    let ny = y
    if (transform === 'mirrorX') nx = width - 1 - x
    else if (transform === 'mirrorY') ny = height - 1 - y
    else {
      nx = height - 1 - y
      ny = x
    }
    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
      next[`${nx},${ny}`] = value
    }
  }
  return { ...layer, cells: next }
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'LOAD_PROJECT':
      return {
        ...createInitialState(action.project),
        tool: state.tool,
        brush: state.brush,
      }

    case 'SET_TOOL':
      return { ...state, tool: action.tool }

    case 'SET_BRUSH':
      return { ...state, brush: { ...state.brush, ...action.brush } }

    case 'SET_ACTIVE_LAYER':
      return { ...state, activeLayerId: action.layerId }

    case 'STROKE_START':
      return { ...state, past: [...state.past, state.project].slice(-HISTORY_LIMIT), future: [] }

    case 'STROKE_PAINT': {
      const layer = state.project.layers.find((l) => l.id === state.activeLayerId)
      if (!layer || layer.locked) return state
      const project = mapLayers(state.project, (l) =>
        l.id === state.activeLayerId ? paintCells(l, action.keys, action.data) : l,
      )
      return withProject(state, project, false)
    }

    case 'STROKE_END':
      return state

    case 'APPLY_CELLS': {
      const layer = state.project.layers.find((l) => l.id === state.activeLayerId)
      if (!layer || layer.locked) return state
      const project = mapLayers(state.project, (l) =>
        l.id === state.activeLayerId ? paintCells(l, action.keys, action.data) : l,
      )
      return withProject(state, project)
    }

    case 'ADD_LAYER': {
      const layer = createLayer(action.layerType)
      const project = { ...state.project, layers: [...state.project.layers, layer] }
      return { ...withProject(state, project), activeLayerId: layer.id }
    }

    case 'REMOVE_LAYER': {
      if (state.project.layers.length <= 1) return state
      const layers = state.project.layers.filter((l) => l.id !== action.layerId)
      const project = { ...state.project, layers }
      const activeLayerId =
        state.activeLayerId === action.layerId ? layers[layers.length - 1].id : state.activeLayerId
      return { ...withProject(state, project), activeLayerId }
    }

    case 'RENAME_LAYER':
      return withProject(
        state,
        mapLayers(state.project, (l) => (l.id === action.layerId ? { ...l, name: action.name } : l)),
      )

    case 'TOGGLE_LAYER_VISIBLE':
      return withProject(
        state,
        mapLayers(state.project, (l) =>
          l.id === action.layerId ? { ...l, visible: !l.visible } : l,
        ),
        false,
      )

    case 'TOGGLE_LAYER_LOCK':
      return withProject(
        state,
        mapLayers(state.project, (l) => (l.id === action.layerId ? { ...l, locked: !l.locked } : l)),
        false,
      )

    case 'SET_LAYER_OPACITY':
      return withProject(
        state,
        mapLayers(state.project, (l) =>
          l.id === action.layerId ? { ...l, opacity: action.opacity } : l,
        ),
        false,
      )

    case 'MOVE_LAYER': {
      const layers = [...state.project.layers]
      const index = layers.findIndex((l) => l.id === action.layerId)
      const target = action.direction === 'up' ? index + 1 : index - 1
      if (index < 0 || target < 0 || target >= layers.length) return state
      ;[layers[index], layers[target]] = [layers[target], layers[index]]
      return withProject(state, { ...state.project, layers })
    }

    case 'DUPLICATE_LAYER': {
      const index = state.project.layers.findIndex((l) => l.id === action.layerId)
      if (index < 0) return state
      const source = state.project.layers[index]
      const copy: Layer = {
        ...source,
        id: uid('layer'),
        name: `${source.name} (kopia)`,
        cells: { ...source.cells },
      }
      const layers = [...state.project.layers]
      layers.splice(index + 1, 0, copy)
      return { ...withProject(state, { ...state.project, layers }), activeLayerId: copy.id }
    }

    case 'MERGE_LAYER_DOWN': {
      const index = state.project.layers.findIndex((l) => l.id === action.layerId)
      if (index <= 0) return state
      const upper = state.project.layers[index]
      const lower = state.project.layers[index - 1]
      if (upper.type !== lower.type) return state
      const merged: Layer = { ...lower, cells: { ...lower.cells, ...upper.cells } }
      const layers = [...state.project.layers]
      layers.splice(index - 1, 2, merged)
      return { ...withProject(state, { ...state.project, layers }), activeLayerId: merged.id }
    }

    case 'CLEAR_LAYER':
      return withProject(
        state,
        mapLayers(state.project, (l) => (l.id === action.layerId ? { ...l, cells: {} } : l)),
      )

    case 'TRANSFORM_LAYER':
      return withProject(
        state,
        mapLayers(state.project, (l) =>
          l.id === action.layerId
            ? transformCells(l, state.project.map.width, state.project.map.height, action.transform)
            : l,
        ),
      )

    case 'ADD_TRIGGER':
      return withProject(state, {
        ...state.project,
        triggers: [...state.project.triggers, action.trigger],
      })

    case 'REMOVE_TRIGGER':
      return withProject(state, {
        ...state.project,
        triggers: state.project.triggers.filter((t) => t.id !== action.triggerId),
      })

    case 'SET_CAMERA':
      return {
        ...state,
        project: { ...state.project, camera: { ...state.project.camera, ...action.camera } },
      }

    case 'RESET_CAMERA':
      return {
        ...state,
        project: {
          ...state.project,
          camera: { x: 0, y: 0, zoom: 1, rotation: 0, projection: 'ortho' },
        },
      }

    case 'UPDATE_MAP':
      return withProject(state, { ...state.project, map: { ...state.project.map, ...action.map } })

    case 'UNDO': {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        ...state,
        project: previous,
        past: state.past.slice(0, -1),
        future: [state.project, ...state.future].slice(0, HISTORY_LIMIT),
        dirty: true,
      }
    }

    case 'REDO': {
      if (state.future.length === 0) return state
      const next = state.future[0]
      return {
        ...state,
        project: next,
        past: [...state.past, state.project].slice(-HISTORY_LIMIT),
        future: state.future.slice(1),
        dirty: true,
      }
    }

    default:
      return state
  }
}

export interface EditorContextValue {
  state: EditorState
  dispatch: React.Dispatch<EditorAction>
  activeLayer: Layer | undefined
  canUndo: boolean
  canRedo: boolean
}

export const EditorContext = createContext<EditorContextValue | null>(null)

interface EditorProviderProps {
  children: ReactNode
  initialProject?: MapProject
}

export function EditorProvider({ children, initialProject }: EditorProviderProps) {
  const [state, dispatch] = useReducer(editorReducer, initialProject, createInitialState)

  const activeLayer = useMemo(
    () => state.project.layers.find((l) => l.id === state.activeLayerId),
    [state.project.layers, state.activeLayerId],
  )

  const value = useMemo<EditorContextValue>(
    () => ({
      state,
      dispatch,
      activeLayer,
      canUndo: state.past.length > 0,
      canRedo: state.future.length > 0,
    }),
    [state, activeLayer],
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

EditorProvider.displayName = 'EditorProvider'

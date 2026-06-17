import { describe, it, expect } from 'vitest'
import { createInitialState, editorReducer } from './EditorContext'

const activeCells = (state: ReturnType<typeof createInitialState>) =>
  state.project.layers.find((l) => l.id === state.activeLayerId)?.cells ?? {}

describe('editorReducer', () => {
  it('startuje z pędzlem i pierwszą warstwą aktywną', () => {
    const state = createInitialState()
    expect(state.tool).toBe('brush')
    expect(state.activeLayerId).toBe(state.project.layers[0].id)
    expect(state.past).toHaveLength(0)
  })

  it('APPLY_CELLS maluje pola i zapisuje historię', () => {
    const state = createInitialState()
    const next = editorReducer(state, {
      type: 'APPLY_CELLS',
      keys: ['0,0', '1,0'],
      data: { terrain: 'grass' },
    })
    expect(activeCells(next)['0,0'].terrain).toBe('grass')
    expect(Object.keys(activeCells(next))).toHaveLength(2)
    expect(next.past).toHaveLength(1)
    expect(next.dirty).toBe(true)
  })

  it('UNDO i REDO przywracają stan', () => {
    const state = createInitialState()
    const painted = editorReducer(state, { type: 'APPLY_CELLS', keys: ['2,2'], data: { terrain: 'sand' } })
    const undone = editorReducer(painted, { type: 'UNDO' })
    expect(Object.keys(activeCells(undone))).toHaveLength(0)
    expect(undone.future).toHaveLength(1)
    const redone = editorReducer(undone, { type: 'REDO' })
    expect(activeCells(redone)['2,2'].terrain).toBe('sand')
  })

  it('nie maluje na zablokowanej warstwie', () => {
    let state = createInitialState()
    state = editorReducer(state, { type: 'TOGGLE_LAYER_LOCK', layerId: state.activeLayerId })
    const next = editorReducer(state, { type: 'APPLY_CELLS', keys: ['0,0'], data: { terrain: 'grass' } })
    expect(Object.keys(activeCells(next))).toHaveLength(0)
  })

  it('ADD_LAYER dodaje warstwę i ustawia ją aktywną', () => {
    const state = createInitialState()
    const before = state.project.layers.length
    const next = editorReducer(state, { type: 'ADD_LAYER', layerType: 'effect' })
    expect(next.project.layers).toHaveLength(before + 1)
    expect(next.activeLayerId).toBe(next.project.layers[next.project.layers.length - 1].id)
  })

  it('DUPLICATE_LAYER kopiuje pola warstwy', () => {
    let state = createInitialState()
    state = editorReducer(state, { type: 'APPLY_CELLS', keys: ['0,0'], data: { terrain: 'stone' } })
    const next = editorReducer(state, { type: 'DUPLICATE_LAYER', layerId: state.activeLayerId })
    const copy = next.project.layers.find((l) => l.id === next.activeLayerId)
    expect(copy?.cells['0,0'].terrain).toBe('stone')
  })

  it('ADD_TRIGGER i REMOVE_TRIGGER zapisują wyzwalacze w projekcie', () => {
    const state = createInitialState()
    const trigger = { id: 't1', name: 'Otwórz bramę', type: 'Skrypt' as const }
    const added = editorReducer(state, { type: 'ADD_TRIGGER', trigger })
    expect(added.project.triggers).toHaveLength(1)
    expect(added.dirty).toBe(true)
    const removed = editorReducer(added, { type: 'REMOVE_TRIGGER', triggerId: 't1' })
    expect(removed.project.triggers).toHaveLength(0)
  })

  it('SET_BRUSH łączy ustawienia pędzla', () => {
    const state = createInitialState()
    const next = editorReducer(state, { type: 'SET_BRUSH', brush: { size: 4 } })
    expect(next.brush.size).toBe(4)
    expect(next.brush.shape).toBe(state.brush.shape)
  })
})

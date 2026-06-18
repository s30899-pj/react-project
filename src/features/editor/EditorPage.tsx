import { Profiler, Suspense, lazy, memo, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { MapProject } from '@/types'
import { EditorProvider } from '@/context/EditorContext'
import { useEditor } from '@/hooks/useEditor'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { useAutoSave } from '@/hooks/useAutoSave'
import { createSnapshot, loadProject, saveProject } from '@/api/projectStore'
import { Spinner } from '@/components/Spinner/Spinner'
import { Button } from '@/components/Button/Button'
import { Tabs } from '@/components/Tabs/Tabs'
import { MouseTracker } from '@/components/render-props/MouseTracker'
import { Viewport } from './canvas/Viewport'
import { MapCanvas } from './canvas/MapCanvas'
import { Minimap } from './canvas/Minimap'
import { CanvasStatusBar } from './canvas/CanvasStatusBar'
import { ToolPalette } from './tools/ToolPalette'
import { BrushPanel } from './panels/BrushPanel'
import { LayersPanel } from './panels/LayersPanel'
import { EditorToolbar } from './EditorToolbar'
import {
  LayersIcon,
  ObjectsIcon,
  LogicIcon,
  SettingsIcon,
  ValidateIcon,
  ExportIcon,
} from '@/components/icons'
import styles from './EditorPage.module.scss'

// Cięższe panele dzielone na osobne paczki (React.lazy + dynamic import).
const ObjectsPanel = lazy(() =>
  import('./panels/ObjectsPanel').then((m) => ({ default: m.ObjectsPanel })),
)
const PropertiesPanel = lazy(() =>
  import('./panels/PropertiesPanel').then((m) => ({ default: m.PropertiesPanel })),
)
const CollisionPanel = lazy(() =>
  import('./panels/CollisionPanel').then((m) => ({ default: m.CollisionPanel })),
)
const ValidationPanel = lazy(() =>
  import('./panels/ValidationPanel').then((m) => ({ default: m.ValidationPanel })),
)
const ExportImportPanel = lazy(() =>
  import('./panels/ExportImportPanel').then((m) => ({ default: m.ExportImportPanel })),
)

function onCanvasRender(id: string, phase: string, actualDuration: number) {
  if (import.meta.env.DEV) {
    console.debug(`[Profiler] ${id} (${phase}) ${actualDuration.toFixed(1)}ms`)
  }
}

function PanelFallback() {
  return (
    <div className={styles.panelFallback}>
      <Spinner size={22} label="Ładowanie panelu…" />
    </div>
  )
}

// Memoizacja izoluje kanwę od częstych przerysowań kursora (MouseTracker).
const CanvasArea = memo(function CanvasArea() {
  return (
    <>
      <Profiler id="map-canvas" onRender={onCanvasRender}>
        <Viewport>
          <MapCanvas />
        </Viewport>
      </Profiler>
      <div className={styles.minimap}>
        <Minimap />
      </div>
    </>
  )
})

function EditorWorkspace() {
  const { state } = useEditor()
  const { user } = useAuth()
  const { notify } = useToast()
  const rootRef = useRef<HTMLDivElement>(null)
  const projectId = state.project.map.id

  const save = useMemo(
    () => () => {
      saveProject(state.project)
      notify('success', 'Projekt zapisany')
    },
    [state.project, notify],
  )

  const lastSaved = useAutoSave(
    () => saveProject(state.project),
    user?.preferences.autosave ?? true,
  )

  const snapshot = () => {
    createSnapshot(projectId, `Wersja ${new Date().toLocaleString('pl-PL')}`, state.project)
    notify('info', 'Utworzono kopię wersji')
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) rootRef.current?.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  return (
    <div className={styles.workspace} ref={rootRef}>
      <EditorToolbar
        onSave={save}
        onSnapshot={snapshot}
        onToggleFullscreen={toggleFullscreen}
        lastSaved={lastSaved}
      />

      <div className={styles.body}>
        <aside className={styles.left}>
          <ToolPalette />
          <BrushPanel />
        </aside>

        <MouseTracker className={styles.stage}>
          {(position) => (
            <>
              <CanvasArea />
              <CanvasStatusBar position={position} />
            </>
          )}
        </MouseTracker>

        <aside className={styles.right}>
          <Tabs defaultTab="layers" className={styles.tabs}>
            <Tabs.List>
              <Tabs.Tab id="layers">
                <LayersIcon size={15} /> Warstwy
              </Tabs.Tab>
              <Tabs.Tab id="objects">
                <ObjectsIcon size={15} /> Obiekty
              </Tabs.Tab>
              <Tabs.Tab id="logic">
                <LogicIcon size={15} /> Logika
              </Tabs.Tab>
              <Tabs.Tab id="props">
                <SettingsIcon size={15} /> Mapa
              </Tabs.Tab>
              <Tabs.Tab id="validate">
                <ValidateIcon size={15} /> Walidacja
              </Tabs.Tab>
              <Tabs.Tab id="export">
                <ExportIcon size={15} /> Eksport
              </Tabs.Tab>
            </Tabs.List>
            <div className={styles.tabBody}>
              <Tabs.Panel id="layers">
                <LayersPanel />
              </Tabs.Panel>
              <Suspense fallback={<PanelFallback />}>
                <Tabs.Panel id="objects">
                  <ObjectsPanel />
                </Tabs.Panel>
                <Tabs.Panel id="logic">
                  <CollisionPanel />
                </Tabs.Panel>
                <Tabs.Panel id="props">
                  <PropertiesPanel />
                </Tabs.Panel>
                <Tabs.Panel id="validate">
                  <ValidationPanel />
                </Tabs.Panel>
                <Tabs.Panel id="export">
                  <ExportImportPanel />
                </Tabs.Panel>
              </Suspense>
            </div>
          </Tabs>
        </aside>
      </div>
    </div>
  )
}

export default function EditorPage() {
  const { projectId } = useParams()
  const [project, setProject] = useState<MapProject | null | undefined>(undefined)

  useEffect(() => {
    setProject(projectId ? loadProject(projectId) : null)
  }, [projectId])

  if (project === undefined) {
    return (
      <div className={styles.center}>
        <Spinner size={40} label="Wczytywanie projektu…" />
      </div>
    )
  }

  if (project === null) {
    return (
      <div className={styles.center}>
        <h2>Nie znaleziono projektu</h2>
        <p>Ten projekt nie istnieje lub został usunięty.</p>
        <Link to="/">
          <Button>← Wróć do projektów</Button>
        </Link>
      </div>
    )
  }

  return (
    <EditorProvider initialProject={project}>
      <EditorWorkspace />
    </EditorProvider>
  )
}

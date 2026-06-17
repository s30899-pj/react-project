import type { MapProject, ProjectSnapshot, ProjectSummary } from '@/types'
import { uid } from '@/lib/ids'

const PROJECTS_KEY = 'mapforge:projects'
const SNAPSHOTS_KEY = 'mapforge:snapshots'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

type ProjectMap = Record<string, MapProject>

export function listProjects(): ProjectSummary[] {
  const projects = read<ProjectMap>(PROJECTS_KEY, {})
  return Object.values(projects)
    .map((project) => ({
      id: project.map.id,
      name: project.map.name,
      width: project.map.width,
      height: project.map.height,
      updatedAt: project.map.meta.updatedAt,
      layerCount: project.layers.length,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function loadProject(id: string): MapProject | null {
  const projects = read<ProjectMap>(PROJECTS_KEY, {})
  return projects[id] ?? null
}

export function saveProject(project: MapProject): void {
  const projects = read<ProjectMap>(PROJECTS_KEY, {})
  projects[project.map.id] = project
  write(PROJECTS_KEY, projects)
}

export function deleteProject(id: string): void {
  const projects = read<ProjectMap>(PROJECTS_KEY, {})
  delete projects[id]
  write(PROJECTS_KEY, projects)
}

type SnapshotMap = Record<string, ProjectSnapshot[]>

export function listSnapshots(projectId: string): ProjectSnapshot[] {
  const all = read<SnapshotMap>(SNAPSHOTS_KEY, {})
  return (all[projectId] ?? []).slice().sort((a, b) => b.savedAt.localeCompare(a.savedAt))
}

export function createSnapshot(projectId: string, label: string, data: MapProject): ProjectSnapshot {
  const all = read<SnapshotMap>(SNAPSHOTS_KEY, {})
  const snapshot: ProjectSnapshot = {
    id: uid('snap'),
    projectId,
    label,
    savedAt: new Date().toISOString(),
    data,
  }
  const list = [snapshot, ...(all[projectId] ?? [])].slice(0, 10)
  all[projectId] = list
  write(SNAPSHOTS_KEY, all)
  return snapshot
}

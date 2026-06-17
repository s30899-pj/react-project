import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProjectSummary } from '@/types'
import { deleteProject, listProjects } from '@/api/projectStore'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/Button/Button'
import { OpenIcon, PlusIcon, TrashIcon } from '@/components/icons'
import styles from './ProjectsPage.module.scss'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pl-PL')
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const { notify } = useToast()

  const refresh = useCallback(() => {
    setProjects(listProjects())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const handleDelete = (project: ProjectSummary) => {
    deleteProject(project.id)
    refresh()
    notify('info', `Usunięto mapę „${project.name}”`)
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Twoje projekty</h1>
          <p className={styles.subtitle}>Zarządzaj zapisanymi mapami i twórz nowe światy.</p>
        </div>
        <Link to="/projects/new" className={styles.newLink}>
          <Button icon={<PlusIcon size={16} />}>Nowa mapa</Button>
        </Link>
      </header>

      {projects.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon} aria-hidden="true">
            🗺️
          </span>
          <p className={styles.emptyTitle}>Nie masz jeszcze żadnych map</p>
          <p className={styles.emptyText}>
            Stwórz swoją pierwszą mapę i zacznij budować świat gry.
          </p>
          <Link to="/projects/new">
            <Button icon={<PlusIcon size={16} />}>Nowa mapa</Button>
          </Link>
        </div>
      ) : (
        <ul className={styles.grid}>
          {projects.map((project) => (
            <li key={project.id} className={styles.card}>
              <div className={styles.cardBody}>
                <h2 className={styles.cardName} title={project.name}>
                  {project.name}
                </h2>
                <dl className={styles.meta}>
                  <div className={styles.metaRow}>
                    <dt className={styles.metaLabel}>Wymiary</dt>
                    <dd className={styles.metaValue}>
                      {project.width}×{project.height}
                    </dd>
                  </div>
                  <div className={styles.metaRow}>
                    <dt className={styles.metaLabel}>Warstwy</dt>
                    <dd className={styles.metaValue}>{project.layerCount}</dd>
                  </div>
                  <div className={styles.metaRow}>
                    <dt className={styles.metaLabel}>Zmodyfikowano</dt>
                    <dd className={styles.metaValue}>{formatDate(project.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
              <div className={styles.cardActions}>
                <Link to={`/editor/${project.id}`} className={styles.openLink}>
                  <Button variant="secondary" size="sm" fullWidth icon={<OpenIcon size={15} />}>
                    Otwórz
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(project)}
                  aria-label={`Usuń mapę ${project.name}`}
                  icon={<TrashIcon size={15} />}
                >
                  Usuń
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

ProjectsPage.displayName = 'ProjectsPage'

import { useMemo } from 'react'
import { Panel } from '@/components/Panel/Panel'
import { useEditor } from '@/hooks/useEditor'
import { validateProject } from '@/features/editor/engine/validation'
import type { ValidationIssue, ValidationSeverity } from '@/types'
import { FlaskIcon, CloseIcon, WarningIcon, InfoIcon } from '@/components/icons'
import styles from './ValidationPanel.module.scss'

const SEVERITY_ICON: Record<ValidationSeverity, JSX.Element> = {
  error: <CloseIcon size={14} />,
  warning: <WarningIcon size={14} />,
  info: <InfoIcon size={14} />,
}

export function ValidationPanel() {
  const { state } = useEditor()
  const { project } = state
  const report = useMemo(() => validateProject(project), [project])
  const { stats } = report
  const fillRatio =
    stats.totalCells > 0 ? Math.round((stats.paintedCells / stats.totalCells) * 100) : 0

  return (
    <Panel title="Testowanie i walidacja" icon={<FlaskIcon size={16} />}>
          <Panel.Section label="Statystyki">
            <div className={styles.statsGrid}>
              <div className={styles.stat}>
                <span className={styles.statValue}>{stats.totalCells}</span>
                <span className={styles.statLabel}>Wszystkie pola</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{stats.paintedCells}</span>
                <span className={styles.statLabel}>Pomalowane</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{stats.collisionCells}</span>
                <span className={styles.statLabel}>Kolizje</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{stats.objectCount}</span>
                <span className={styles.statLabel}>Obiekty</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{stats.estimatedMemoryKb} KB</span>
                <span className={styles.statLabel}>Szac. pamięć</span>
              </div>
            </div>
          </Panel.Section>

          <Panel.Section label="Wskaźniki">
            <div className={styles.meter}>
              <div className={styles.meterHead}>
                <span>Osiągalność</span>
                <span className={styles.meterValue}>{stats.reachablePercent}%</span>
              </div>
              <progress
                className={styles.progress}
                max={100}
                value={stats.reachablePercent}
                aria-label="Osiągalność pól"
              />
            </div>
            <div className={styles.meter}>
              <div className={styles.meterHead}>
                <span>Wypełnienie</span>
                <span className={styles.meterValue}>{fillRatio}%</span>
              </div>
              <progress
                className={styles.progress}
                max={100}
                value={fillRatio}
                aria-label="Wypełnienie mapy"
              />
            </div>
          </Panel.Section>

          <Panel.Section label={`Problemy (${report.issues.length})`}>
            <ul className={styles.issues}>
              {report.issues.map((issue: ValidationIssue) => (
                <li
                  key={issue.id}
                  className={`${styles.issue} ${styles[issue.severity]}`}
                >
                  <span className={styles.dot} aria-hidden="true">
                    {SEVERITY_ICON[issue.severity]}
                  </span>
                  <div className={styles.issueBody}>
                    <span className={styles.issueTitle}>{issue.title}</span>
                    <span className={styles.issueDetail}>{issue.detail}</span>
                    {issue.suggestion && (
                      <span className={styles.issueSuggestion}>{issue.suggestion}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Panel.Section>
    </Panel>
  )
}

ValidationPanel.displayName = 'ValidationPanel'

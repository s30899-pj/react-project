import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useEditor } from '@/hooks/useEditor'
import { useToast } from '@/hooks/useToast'
import { Panel } from '@/components/Panel/Panel'
import { Modal } from '@/components/Modal/Modal'
import { Button } from '@/components/Button/Button'
import { Field, formStyles } from '@/components/form/Field'
import { downloadText } from '@/lib/download'
import {
  exportProject,
  fileExtension,
  importJSON,
  type ExportFormat,
} from '@/features/editor/engine/serialize'
import { createSnapshot, listSnapshots } from '@/api/projectStore'
import { SaveIcon, DownloadIcon, EyeIcon, SnapshotIcon } from '@/components/icons'
import type { ProjectSnapshot } from '@/types'
import styles from './ExportImportPanel.module.scss'

const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
  { value: 'json', label: 'JSON' },
  { value: 'xml', label: 'XML' },
  { value: 'custom', label: 'Format własny (.mfmap)' },
]

const FORMAT_MIME: Record<ExportFormat, string> = {
  json: 'application/json',
  xml: 'application/xml',
  custom: 'text/plain',
}

export function ExportImportPanel() {
  const { state, dispatch } = useEditor()
  const { notify } = useToast()
  const projectId = state.project.map.id

  const [fmt, setFmt] = useState<ExportFormat>('json')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [pasted, setPasted] = useState('')
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setSnapshots(listSnapshots(projectId))
  }, [projectId])

  const handleDownload = () => {
    const content = exportProject(state.project, fmt)
    const filename = `${state.project.map.name}.${fileExtension(fmt)}`
    downloadText(filename, content, FORMAT_MIME[fmt])
    notify('success', 'Plik został pobrany.')
  }

  const applyImport = (text: string) => {
    const res = importJSON(text)
    if (res.ok && res.project) {
      dispatch({ type: 'LOAD_PROJECT', project: res.project })
      notify('success', 'Projekt został wczytany.')
    } else {
      notify('error', res.error ?? 'Nie udało się wczytać projektu.')
    }
  }

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      applyImport(String(reader.result ?? ''))
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.onerror = () => {
      notify('error', 'Nie udało się odczytać pliku.')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  const handlePasteImport = () => {
    if (!pasted.trim()) {
      notify('warning', 'Wklej najpierw zawartość JSON.')
      return
    }
    applyImport(pasted)
  }

  const handleSnapshot = () => {
    const label = `Wersja ${new Date().toLocaleString('pl-PL')}`
    createSnapshot(projectId, label, state.project)
    setSnapshots(listSnapshots(projectId))
    notify('success', 'Zapisano kopię projektu.')
  }

  const handleRestore = (snap: ProjectSnapshot) => {
    dispatch({ type: 'LOAD_PROJECT', project: snap.data })
    notify('info', `Przywrócono: ${snap.label}`)
  }

  return (
    <Panel title="Eksport / Import / Wersje" icon={<SaveIcon size={16} />} collapsible>
      <Panel.Section label="Eksport">
        <Field label="Format" htmlFor="export-format">
          <select
            id="export-format"
            className={formStyles.select}
            value={fmt}
            onChange={(e) => setFmt(e.target.value as ExportFormat)}
          >
            {FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
        <div className={styles.buttonRow}>
          <Button variant="primary" size="sm" icon={<DownloadIcon size={15} />} onClick={handleDownload}>
            Pobierz plik
          </Button>
          <Button variant="secondary" size="sm" icon={<EyeIcon size={15} />} onClick={() => setPreviewOpen(true)}>
            Podgląd
          </Button>
        </div>
      </Panel.Section>

      <Panel.Section label="Import">
        <Field
          label="Wczytaj z pliku"
          htmlFor="import-file"
          hint="Import w natywnym formacie .json (eksport JSON tej aplikacji)"
        >
          <input
            id="import-file"
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className={formStyles.input}
            onChange={handleFile}
          />
        </Field>
        <Field label="Wklej JSON" htmlFor="import-text">
          <textarea
            id="import-text"
            className={formStyles.textarea}
            rows={5}
            placeholder='{ "map": { ... }, "layers": [ ... ] }'
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
          />
        </Field>
        <Button variant="secondary" size="sm" fullWidth onClick={handlePasteImport}>
          Wczytaj z tekstu
        </Button>
      </Panel.Section>

      <Panel.Section label="Historia wersji">
        <Button variant="primary" size="sm" icon={<SnapshotIcon size={15} />} fullWidth onClick={handleSnapshot}>
          Zapisz kopię
        </Button>
        {snapshots.length === 0 ? (
          <p className={styles.empty}>Brak zapisanych wersji.</p>
        ) : (
          <ul className={styles.snapshotList}>
            {snapshots.map((snap) => (
              <li key={snap.id} className={styles.snapshot}>
                <div className={styles.snapshotInfo}>
                  <span className={styles.snapshotLabel}>{snap.label}</span>
                  <span className={styles.snapshotDate}>
                    {new Date(snap.savedAt).toLocaleString('pl-PL')}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRestore(snap)}>
                  Przywróć
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Panel.Section>

      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Podgląd eksportu — ${FORMAT_OPTIONS.find((o) => o.value === fmt)?.label}`}
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
            Zamknij
          </Button>
        }
      >
        <pre className={styles.preview}>{exportProject(state.project, fmt)}</pre>
      </Modal>
    </Panel>
  )
}

ExportImportPanel.displayName = 'ExportImportPanel'

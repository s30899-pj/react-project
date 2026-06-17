import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useTemplates } from '@/api/queries'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import { createProject, type NewMapInput } from '@/lib/factory'
import { saveProject } from '@/api/projectStore'
import type { MapTemplate } from '@/types'
import { Field, formStyles } from '@/components/form/Field'
import { Toggle } from '@/components/form/Toggle'
import { Button } from '@/components/Button/Button'
import { Spinner } from '@/components/Spinner/Spinner'
import styles from './NewProjectPage.module.scss'

interface FormValues {
  name: string
  width: number
  height: number
  tileSize: number
  scale: number
  gravity: number
  showGrid: boolean
  snapToGrid: boolean
  collisions: boolean
  description: string
  tags: string
  author: string
}

export default function NewProjectPage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const { user } = useAuth()
  const templatesQuery = useTemplates()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      width: 24,
      height: 16,
      tileSize: 28,
      scale: 1,
      gravity: 9.8,
      showGrid: true,
      snapToGrid: true,
      collisions: true,
      description: '',
      tags: '',
      author: user?.displayName ?? '',
    },
  })

  const tileSize = watch('tileSize')
  const scale = watch('scale')
  const showGrid = watch('showGrid')
  const snapToGrid = watch('snapToGrid')
  const collisions = watch('collisions')

  function applyTemplate(tpl: MapTemplate) {
    setSelectedTemplate(tpl.id)
    setValue('width', tpl.width)
    setValue('height', tpl.height)
  }

  const onSubmit = handleSubmit((values) => {
    const tags = values.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    const input: Partial<NewMapInput> = {
      name: values.name,
      width: Number(values.width),
      height: Number(values.height),
      tileSize: Number(values.tileSize),
      scale: Number(values.scale),
      gravity: Number(values.gravity),
      showGrid: values.showGrid,
      snapToGrid: values.snapToGrid,
      collisions: values.collisions,
      author: values.author,
      description: values.description,
      tags,
    }

    const project = createProject(input)
    saveProject(project)
    notify('success', 'Mapa utworzona')
    navigate('/editor/' + project.map.id)
  })

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1>Nowa mapa</h1>
        <p>Skonfiguruj parametry świata i wybierz szablon startowy.</p>
      </header>

      <section className={styles.templates} aria-label="Szablony map">
        <h2>Szablon startowy</h2>
        {templatesQuery.isLoading && <Spinner label="Wczytywanie szablonów…" />}
        {templatesQuery.isError && (
          <p className={styles.errorNote} role="alert">
            Nie udało się wczytać szablonów.
          </p>
        )}
        {templatesQuery.data && (
          <div className={styles.templateGrid}>
            {templatesQuery.data.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className={`${styles.templateCard} ${
                  selectedTemplate === tpl.id ? styles.selected : ''
                }`}
                onClick={() => applyTemplate(tpl)}
                aria-pressed={selectedTemplate === tpl.id}
              >
                <span className={styles.preview} aria-hidden="true">
                  {tpl.preview}
                </span>
                <span className={styles.templateName}>{tpl.name}</span>
                <span className={styles.templateDesc}>{tpl.description}</span>
                <span className={styles.dims}>
                  {tpl.width} × {tpl.height}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <div className={styles.columns}>
          <div className={styles.column}>
            <Field label="Nazwa mapy" htmlFor="name" error={errors.name?.message}>
              <input
                id="name"
                className={`${formStyles.input} ${errors.name ? formStyles.invalid : ''}`}
                placeholder="np. Dolina Cieni"
                {...register('name', { required: 'Nazwa jest wymagana' })}
              />
            </Field>

            <div className={styles.row}>
              <Field label="Szerokość" htmlFor="width" error={errors.width?.message}>
                <input
                  id="width"
                  type="number"
                  className={`${formStyles.input} ${errors.width ? formStyles.invalid : ''}`}
                  {...register('width', {
                    valueAsNumber: true,
                    required: 'Wymagane',
                    min: { value: 4, message: 'Min. 4' },
                    max: { value: 60, message: 'Maks. 60' },
                  })}
                />
              </Field>

              <Field label="Wysokość" htmlFor="height" error={errors.height?.message}>
                <input
                  id="height"
                  type="number"
                  className={`${formStyles.input} ${errors.height ? formStyles.invalid : ''}`}
                  {...register('height', {
                    valueAsNumber: true,
                    required: 'Wymagane',
                    min: { value: 4, message: 'Min. 4' },
                    max: { value: 60, message: 'Maks. 60' },
                  })}
                />
              </Field>
            </div>

            <Field label={`Rozmiar kafelka: ${tileSize}px`} htmlFor="tileSize">
              <input
                id="tileSize"
                type="range"
                min={16}
                max={48}
                step={1}
                className={styles.range}
                {...register('tileSize', { valueAsNumber: true })}
              />
            </Field>

            <Field label={`Skala: ${scale}×`} htmlFor="scale">
              <input
                id="scale"
                type="range"
                min={0.5}
                max={2}
                step={0.5}
                className={styles.range}
                {...register('scale', { valueAsNumber: true })}
              />
            </Field>

            <Field label="Grawitacja" htmlFor="gravity" error={errors.gravity?.message}>
              <input
                id="gravity"
                type="number"
                step={0.1}
                className={`${formStyles.input} ${errors.gravity ? formStyles.invalid : ''}`}
                {...register('gravity', { valueAsNumber: true })}
              />
            </Field>
          </div>

          <div className={styles.column}>
            <div className={styles.toggles}>
              <Toggle
                checked={showGrid}
                onChange={(v) => setValue('showGrid', v)}
                label="Pokaż siatkę"
              />
              <Toggle
                checked={snapToGrid}
                onChange={(v) => setValue('snapToGrid', v)}
                label="Przyciągaj do siatki"
              />
              <Toggle
                checked={collisions}
                onChange={(v) => setValue('collisions', v)}
                label="Kolizje świata"
              />
            </div>

            <Field label="Opis" htmlFor="description">
              <textarea
                id="description"
                className={formStyles.textarea}
                placeholder="Krótki opis mapy…"
                {...register('description')}
              />
            </Field>

            <Field
              label="Tagi"
              htmlFor="tags"
              hint="Oddziel przecinkami, np. las, pvp, sezonowa"
            >
              <input
                id="tags"
                className={formStyles.input}
                placeholder="las, pvp, sezonowa"
                {...register('tags')}
              />
            </Field>

            <Field label="Autor" htmlFor="author">
              <input id="author" className={formStyles.input} {...register('author')} />
            </Field>
          </div>
        </div>

        <div className={styles.actions}>
          <Button type="button" variant="ghost" onClick={() => navigate('/')}>
            Anuluj
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Utwórz mapę
          </Button>
        </div>
      </form>
    </div>
  )
}

NewProjectPage.displayName = 'NewProjectPage'

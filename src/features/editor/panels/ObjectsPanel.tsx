import { useDeferredValue, useState } from 'react'
import { useAssetCategories, useAssets } from '@/api/assetQueries'
import { useEditor } from '@/hooks/useEditor'
import { useToast } from '@/hooks/useToast'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { Panel } from '@/components/Panel/Panel'
import { ObjectsIcon } from '@/components/icons'
import { Spinner } from '@/components/Spinner/Spinner'
import type { GameAsset } from '@/types'
import { formStyles } from '@/components/form/Field'
import styles from './ObjectsPanel.module.scss'

export function ObjectsPanel() {
  const { state, dispatch } = useEditor()
  const { notify } = useToast()

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)

  const debouncedSearch = useDebouncedValue(search, 250)
  const deferredSearch = useDeferredValue(debouncedSearch)

  const categoriesQuery = useAssetCategories()
  const assetsQuery = useAssets(categoryId, deferredSearch)

  const categories = categoriesQuery.data?.assetCategories ?? []
  const assets = assetsQuery.data?.assets ?? []

  const selectAsset = (asset: GameAsset) => {
    const active = state.project.layers.find((l) => l.id === state.activeLayerId)
    if (active?.type !== 'object') {
      const objectLayer = state.project.layers.find((l) => l.type === 'object')
      if (!objectLayer) {
        notify('warning', 'Dodaj najpierw warstwę obiektów.')
        return
      }
      dispatch({ type: 'SET_ACTIVE_LAYER', layerId: objectLayer.id })
    }
    dispatch({ type: 'SET_BRUSH', brush: { objectId: asset.id, objectIcon: asset.icon } })
    dispatch({ type: 'SET_TOOL', tool: 'brush' })
    notify('info', 'Wybrano: ' + asset.name)
  }

  return (
    <Panel title="Biblioteka obiektów" icon={<ObjectsIcon size={16} />}>
      <Panel.Section>
        <input
          type="search"
          className={formStyles.input}
          placeholder="Szukaj obiektów…"
          aria-label="Szukaj obiektów"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Panel.Section>

      <Panel.Section label="Kategoria">
        <div className={styles.chips}>
          <button
            type="button"
            className={`${styles.chip} ${categoryId === undefined ? styles.active : ''}`}
            onClick={() => setCategoryId(undefined)}
          >
            Wszystkie
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`${styles.chip} ${categoryId === category.id ? styles.active : ''}`}
              onClick={() => setCategoryId(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </Panel.Section>

      <Panel.Section>
        {assetsQuery.loading ? (
          <div className={styles.center}>
            <Spinner label="Ładowanie obiektów…" />
          </div>
        ) : assetsQuery.error ? (
          <p className={styles.error}>Nie udało się wczytać obiektów.</p>
        ) : assets.length === 0 ? (
          <p className={styles.empty}>Brak obiektów spełniających kryteria.</p>
        ) : (
          <div className={styles.grid}>
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className={`${styles.asset} ${
                  state.brush.objectId === asset.id ? styles.active : ''
                }`}
                onClick={() => selectAsset(asset)}
                title={asset.name}
                aria-pressed={state.brush.objectId === asset.id}
              >
                <span className={styles.assetIcon} aria-hidden="true">
                  {asset.icon}
                </span>
                <span className={styles.assetName}>{asset.name}</span>
              </button>
            ))}
          </div>
        )}
      </Panel.Section>
    </Panel>
  )
}

ObjectsPanel.displayName = 'ObjectsPanel'

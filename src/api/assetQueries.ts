import { gql, useQuery } from '@apollo/client'
import type { AssetCategory, GameAsset } from '@/types'

export const ASSET_CATEGORIES_QUERY = gql`
  query AssetCategories {
    assetCategories {
      id
      name
      icon
    }
  }
`

export const ASSETS_QUERY = gql`
  query Assets($categoryId: ID, $search: String) {
    assets(categoryId: $categoryId, search: $search) {
      id
      name
      icon
      categoryId
      tags
      layer
    }
  }
`

export function useAssetCategories() {
  return useQuery<{ assetCategories: AssetCategory[] }>(ASSET_CATEGORIES_QUERY)
}

export function useAssets(categoryId?: string, search?: string) {
  return useQuery<{ assets: GameAsset[] }>(ASSETS_QUERY, {
    variables: { categoryId: categoryId ?? null, search: search ?? '' },
  })
}

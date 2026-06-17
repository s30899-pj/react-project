import { useQuery } from '@tanstack/react-query'
import type { MapTemplate, Tileset } from '@/types'
import { api } from './client'

async function fetchTemplates(): Promise<MapTemplate[]> {
  const { data } = await api.get<MapTemplate[]>('/templates')
  return data
}

async function fetchTilesets(): Promise<Tileset[]> {
  const { data } = await api.get<Tileset[]>('/tilesets')
  return data
}

export function useTemplates() {
  return useQuery({ queryKey: ['templates'], queryFn: fetchTemplates })
}

export function useTilesets() {
  return useQuery({ queryKey: ['tilesets'], queryFn: fetchTilesets })
}

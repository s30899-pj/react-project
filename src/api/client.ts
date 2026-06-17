import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import type { MapTemplate, Tileset } from '@/types'

// Klient HTTP (axios) — w realnej aplikacji wskazywałby na backend.
export const api = axios.create({ baseURL: '/api', timeout: 5000 })

// Atrapa backendu: przechwytuje żądania i zwraca dane z opóźnieniem,
// dzięki czemu zapytania są poprawne, ale nie wymagają serwera ani bazy danych.
const mock = new MockAdapter(api, { delayResponse: 500 })

const TEMPLATES: MapTemplate[] = [
  {
    id: 'tpl-blank',
    name: 'Pusta plansza',
    description: 'Czysta mapa bez elementów — pełna swoboda.',
    width: 24,
    height: 16,
    preview: '⬜',
  },
  {
    id: 'tpl-forest',
    name: 'Leśna kraina',
    description: 'Trawiasty teren z miejscem na drzewa i ścieżki.',
    width: 32,
    height: 24,
    preview: '🌲',
  },
  {
    id: 'tpl-dungeon',
    name: 'Lochy',
    description: 'Kamienne korytarze z gęstą siatką kolizji.',
    width: 28,
    height: 28,
    preview: '🏰',
  },
  {
    id: 'tpl-island',
    name: 'Wyspa',
    description: 'Mapa otoczona wodą z piaszczystym brzegiem.',
    width: 36,
    height: 24,
    preview: '🏝️',
  },
]

const TILESETS: Tileset[] = [
  { id: 'ts-overworld', name: 'Świat zewnętrzny', terrains: ['grass', 'water', 'sand', 'dirt'] },
  { id: 'ts-cave', name: 'Jaskinia', terrains: ['stone', 'lava', 'void', 'dirt'] },
  { id: 'ts-arctic', name: 'Arktyka', terrains: ['snow', 'water', 'stone', 'void'] },
]

mock.onGet('/templates').reply(200, TEMPLATES)
mock.onGet('/tilesets').reply(200, TILESETS)
mock.onGet(/\/templates\/.+/).reply((config) => {
  const id = config.url?.split('/').pop()
  const found = TEMPLATES.find((t) => t.id === id)
  return found ? [200, found] : [404, { message: 'Nie znaleziono szablonu' }]
})

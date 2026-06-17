import type { CellMap, Layer, LayerType, MapProject, ValidationIssue, ValidationReport } from '@/types'
import { uid, parseCellKey } from '@/lib/ids'

function collectKeys(layers: Layer[], type: LayerType, predicate?: (cell: CellMap[string]) => boolean) {
  const keys = new Set<string>()
  for (const layer of layers) {
    if (layer.type !== type) continue
    for (const [key, cell] of Object.entries(layer.cells)) {
      if (!predicate || predicate(cell)) keys.add(key)
    }
  }
  return keys
}

function reachableFrom(start: string, walkable: Set<string>): Set<string> {
  const visited = new Set<string>()
  const queue = [start]
  while (queue.length > 0) {
    const key = queue.shift() as string
    if (visited.has(key) || !walkable.has(key)) continue
    visited.add(key)
    const { x, y } = parseCellKey(key)
    queue.push(`${x + 1},${y}`, `${x - 1},${y}`, `${x},${y + 1}`, `${x},${y - 1}`)
  }
  return visited
}

export function validateProject(project: MapProject): ValidationReport {
  const { layers, map } = project
  const issues: ValidationIssue[] = []

  const terrainKeys = collectKeys(layers, 'terrain', (c) => Boolean(c.terrain) && c.terrain !== 'void')
  const collisionKeys = collectKeys(layers, 'collision', (c) => Boolean(c.solid))
  const objectKeys = collectKeys(layers, 'object', (c) => Boolean(c.objectId))
  const spawnKeys = [...collectKeys(layers, 'logic', (c) => c.region === 'spawn')]

  const painted = new Set<string>()
  for (const layer of layers) {
    for (const key of Object.keys(layer.cells)) painted.add(key)
  }

  const walkable = new Set<string>([...terrainKeys].filter((k) => !collisionKeys.has(k)))

  let reachablePercent = 100
  if (walkable.size > 0) {
    if (spawnKeys.length === 0) {
      issues.push({
        id: uid('issue'),
        severity: 'warning',
        title: 'Brak punktu startowego',
        detail: 'Mapa nie ma zdefiniowanego regionu „spawn”, więc nie można policzyć osiągalności.',
        suggestion: 'Dodaj region „Punkt startowy” na warstwie logiki.',
      })
      reachablePercent = 0
    } else {
      const reachable = reachableFrom(
        spawnKeys.find((k) => walkable.has(k)) ?? spawnKeys[0],
        walkable,
      )
      reachablePercent = Math.round((reachable.size / walkable.size) * 100)
      const unreachable = walkable.size - reachable.size
      if (unreachable > 0) {
        issues.push({
          id: uid('issue'),
          severity: 'warning',
          title: `Nieosiągalne pola: ${unreachable}`,
          detail: `${unreachable} pól terenu jest odciętych od punktu startowego przez kolizje.`,
          suggestion: 'Usuń kolizje blokujące przejście lub dodaj kolejny punkt startowy.',
        })
      }
    }
  }

  if (painted.size === 0) {
    issues.push({
      id: uid('issue'),
      severity: 'error',
      title: 'Mapa jest pusta',
      detail: 'Żadna warstwa nie zawiera danych — nie ma czego eksportować.',
      suggestion: 'Namaluj teren pędzlem lub wczytaj szablon.',
    })
  }

  const objectsWithoutGround = [...objectKeys].filter((k) => !terrainKeys.has(k))
  if (objectsWithoutGround.length > 0) {
    issues.push({
      id: uid('issue'),
      severity: 'warning',
      title: `Obiekty bez podłoża: ${objectsWithoutGround.length}`,
      detail: 'Niektóre obiekty stoją na pustce — w grze mogą „wisieć” bez tekstury podłoża.',
      suggestion: 'Domaluj teren pod obiektami lub przenieś je na istniejące podłoże.',
    })
  }

  const collidingObjects = [...objectKeys].filter((k) => collisionKeys.has(k))
  if (collidingObjects.length > 0) {
    issues.push({
      id: uid('issue'),
      severity: 'info',
      title: `Obiekty na kolizjach: ${collidingObjects.length}`,
      detail: 'Obiekty pokrywają się z polami kolizji — sprawdź, czy to zamierzone.',
    })
  }

  const fillRatio = painted.size / (map.width * map.height)
  if (fillRatio > 0.85) {
    issues.push({
      id: uid('issue'),
      severity: 'info',
      title: 'Gęsta mapa',
      detail: `Wypełnienie wynosi ${Math.round(fillRatio * 100)}%. Duże mapy mogą obciążać renderowanie.`,
      suggestion: 'Rozważ podział na mniejsze sekcje lub łączenie warstw.',
    })
  }

  if (issues.length === 0) {
    issues.push({
      id: uid('issue'),
      severity: 'info',
      title: 'Brak problemów',
      detail: 'Mapa przeszła walidację bez błędów. Gotowa do eksportu.',
    })
  }

  return {
    issues,
    stats: {
      totalCells: map.width * map.height,
      paintedCells: painted.size,
      collisionCells: collisionKeys.size,
      objectCount: objectKeys.size,
      estimatedMemoryKb: Math.round((painted.size * 0.08 + objectKeys.size * 0.05) * 100) / 100,
      reachablePercent,
    },
  }
}

import type { User } from '@/types'

const KEY = 'mapforge:users'

type UserRegistry = Record<string, User>

function read(): UserRegistry {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as UserRegistry) : {}
  } catch {
    return {}
  }
}

export function registerKnownUser(user: User): void {
  const registry = read()
  registry[user.email] = user
  localStorage.setItem(KEY, JSON.stringify(registry))
}

export function listKnownUsers(): User[] {
  return Object.values(read())
}

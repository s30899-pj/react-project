import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { SchemaLink } from '@apollo/client/link/schema'
import { makeExecutableSchema } from '@graphql-tools/schema'
import type { AssetCategory, GameAsset } from '@/types'

// Schemat GraphQL biblioteki obiektów gry.
const typeDefs = gql`
  type AssetCategory {
    id: ID!
    name: String!
    icon: String!
  }

  type GameAsset {
    id: ID!
    name: String!
    icon: String!
    categoryId: ID!
    tags: [String!]!
    layer: String!
  }

  type Query {
    assetCategories: [AssetCategory!]!
    assets(categoryId: ID, search: String): [GameAsset!]!
  }
`

const CATEGORIES: AssetCategory[] = [
  { id: 'nature', name: 'Natura', icon: '🌳' },
  { id: 'buildings', name: 'Budynki', icon: '🏠' },
  { id: 'decor', name: 'Dekoracje', icon: '🏺' },
  { id: 'npc', name: 'Postacie / NPC', icon: '🧙' },
  { id: 'items', name: 'Przedmioty', icon: '💎' },
]

const ASSETS: GameAsset[] = [
  { id: 'a-tree', name: 'Drzewo', icon: '🌳', categoryId: 'nature', tags: ['las', 'roślina'], layer: 'object' },
  { id: 'a-pine', name: 'Sosna', icon: '🌲', categoryId: 'nature', tags: ['las', 'iglak'], layer: 'object' },
  { id: 'a-rock', name: 'Skała', icon: '🪨', categoryId: 'nature', tags: ['kamień'], layer: 'object' },
  { id: 'a-bush', name: 'Krzak', icon: '🌿', categoryId: 'nature', tags: ['roślina'], layer: 'object' },
  { id: 'a-flower', name: 'Kwiat', icon: '🌸', categoryId: 'nature', tags: ['roślina', 'dekoracja'], layer: 'object' },
  { id: 'a-cactus', name: 'Kaktus', icon: '🌵', categoryId: 'nature', tags: ['pustynia'], layer: 'object' },
  { id: 'a-house', name: 'Dom', icon: '🏠', categoryId: 'buildings', tags: ['budynek'], layer: 'object' },
  { id: 'a-castle', name: 'Zamek', icon: '🏰', categoryId: 'buildings', tags: ['budynek', 'twierdza'], layer: 'object' },
  { id: 'a-tower', name: 'Wieża', icon: '🗼', categoryId: 'buildings', tags: ['budynek'], layer: 'object' },
  { id: 'a-tent', name: 'Namiot', icon: '⛺', categoryId: 'buildings', tags: ['obóz'], layer: 'object' },
  { id: 'a-barrel', name: 'Beczka', icon: '🛢️', categoryId: 'decor', tags: ['rekwizyt'], layer: 'object' },
  { id: 'a-chest', name: 'Skrzynia', icon: '🧰', categoryId: 'decor', tags: ['skarb'], layer: 'object' },
  { id: 'a-sign', name: 'Drogowskaz', icon: '🪧', categoryId: 'decor', tags: ['nawigacja'], layer: 'object' },
  { id: 'a-torch', name: 'Pochodnia', icon: '🔥', categoryId: 'decor', tags: ['światło'], layer: 'effect' },
  { id: 'a-knight', name: 'Rycerz', icon: '🤺', categoryId: 'npc', tags: ['wróg'], layer: 'object' },
  { id: 'a-wizard', name: 'Mag', icon: '🧙', categoryId: 'npc', tags: ['sojusznik'], layer: 'object' },
  { id: 'a-slime', name: 'Szlam', icon: '🟢', categoryId: 'npc', tags: ['wróg', 'potwór'], layer: 'object' },
  { id: 'a-coin', name: 'Moneta', icon: '🪙', categoryId: 'items', tags: ['nagroda'], layer: 'object' },
  { id: 'a-gem', name: 'Klejnot', icon: '💎', categoryId: 'items', tags: ['skarb'], layer: 'object' },
  { id: 'a-key', name: 'Klucz', icon: '🗝️', categoryId: 'items', tags: ['zagadka'], layer: 'object' },
  { id: 'a-potion', name: 'Mikstura', icon: '🧪', categoryId: 'items', tags: ['eliksir'], layer: 'object' },
]

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const resolvers = {
  Query: {
    assetCategories: async () => {
      await delay(300)
      return CATEGORIES
    },
    assets: async (_root: unknown, args: { categoryId?: string; search?: string }) => {
      await delay(300)
      const search = args.search?.trim().toLowerCase()
      return ASSETS.filter((asset) => {
        const byCategory = !args.categoryId || asset.categoryId === args.categoryId
        const bySearch =
          !search ||
          asset.name.toLowerCase().includes(search) ||
          asset.tags.some((tag) => tag.includes(search))
        return byCategory && bySearch
      })
    },
  },
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

export const apolloClient = new ApolloClient({
  link: new SchemaLink({ schema }),
  cache: new InMemoryCache(),
})

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ApolloProvider } from '@apollo/client'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import App from '@/App'
import { apolloClient } from '@/api/apollo'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'
import { createProject } from '@/lib/factory'
import type { User } from '@/types'

function renderApp(route: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <MemoryRouter initialEntries={[route]}>
                <App />
              </MemoryRouter>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ApolloProvider>,
  )
}

const seedUser = (): User => {
  const user: User = {
    id: 'u1',
    email: 'twojca@example.com',
    displayName: 'Tester',
    avatar: '🦊',
    bio: '',
    role: 'creator',
    preferences: { theme: 'dark', showGrid: true, snapToGrid: true, autosave: false },
  }
  localStorage.setItem('mapforge:user', JSON.stringify(user))
  return user
}

describe('smoke: aplikacja renderuje główne trasy', () => {
  beforeEach(() => localStorage.clear())

  it('strona logowania montuje się bez błędów', async () => {
    renderApp('/login')
    expect(await screen.findAllByText(/MapForge/i)).not.toHaveLength(0)
  })

  it('lista projektów renderuje się dla zalogowanego użytkownika', async () => {
    seedUser()
    renderApp('/')
    expect(await screen.findByText(/Twoje projekty/i)).toBeInTheDocument()
  })

  it('edytor montuje się dla istniejącego projektu', async () => {
    seedUser()
    const project = createProject({ name: 'Mapa Dymna', width: 8, height: 6 })
    localStorage.setItem('mapforge:projects', JSON.stringify({ [project.map.id]: project }))
    renderApp(`/editor/${project.map.id}`)
    expect(await screen.findByText('Mapa Dymna')).toBeInTheDocument()
  })

  it('nieznana trasa pokazuje stronę 404', async () => {
    renderApp('/nie-ma-takiej-strony')
    expect(await screen.findByText(/404/)).toBeInTheDocument()
  })
})

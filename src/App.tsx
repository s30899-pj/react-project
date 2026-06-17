import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary/ErrorBoundary'
import { Spinner } from '@/components/Spinner/Spinner'
import { AppLayout } from '@/layout/AppLayout'
import { useAuth } from '@/hooks/useAuth'
import type { ReactNode } from 'react'

// Strony ładowane leniwie (React.lazy) — code-splitting na poziomie tras.
const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'))
const ProfilePage = lazy(() => import('@/features/auth/ProfilePage'))
const ProjectsPage = lazy(() => import('@/features/projects/ProjectsPage'))
const NewProjectPage = lazy(() => import('@/features/projects/NewProjectPage'))
const EditorPage = lazy(() => import('@/features/editor/EditorPage'))
const NotFoundPage = lazy(() => import('@/features/misc/NotFoundPage'))

function PageLoader() {
  return (
    <div style={{ flex: 1, display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <Spinner size={40} label="Wczytywanie…" />
    </div>
  )
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<NewProjectPage />} />
            <Route path="/editor/:projectId" element={<EditorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

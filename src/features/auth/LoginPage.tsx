import { type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button/Button'
import { DiscordIcon, GithubIcon, GoogleIcon } from '@/components/icons'
import { Field, formStyles } from '@/components/form/Field'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import styles from './LoginPage.module.scss'

interface LoginForm {
  email: string
  password: string
}

type Provider = 'google' | 'github' | 'discord'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const PROVIDERS: { id: Provider; label: string; icon: ReactNode }[] = [
  { id: 'google', label: 'Google', icon: <GoogleIcon size={18} /> },
  { id: 'github', label: 'GitHub', icon: <GithubIcon size={18} /> },
  { id: 'discord', label: 'Discord', icon: <DiscordIcon size={18} /> },
]

export default function LoginPage() {
  const { user, loading, login, loginWithProvider } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ defaultValues: { email: '', password: '' } })

  if (user) return <Navigate to="/" replace />

  const onSubmit = handleSubmit(async ({ email, password }) => {
    await login(email, password)
    notify('success', 'Zalogowano')
    navigate('/')
  })

  const onProvider = async (provider: Provider) => {
    await loginWithProvider(provider)
    notify('success', 'Zalogowano')
    navigate('/')
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.brand}>🗺️ MapForge</h1>
          <p className={styles.subtitle}>Zaloguj się, aby tworzyć mapy</p>
        </header>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <Field label="E-mail" htmlFor="login-email" error={errors.email?.message}>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="ty@example.com"
              className={`${formStyles.input} ${errors.email ? formStyles.invalid : ''}`}
              {...register('email', {
                required: 'E-mail jest wymagany',
                pattern: { value: EMAIL_REGEX, message: 'Nieprawidłowy adres e-mail' },
              })}
            />
          </Field>

          <Field label="Hasło" htmlFor="login-password" error={errors.password?.message}>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              className={`${formStyles.input} ${errors.password ? formStyles.invalid : ''}`}
              {...register('password', {
                required: 'Hasło jest wymagane',
                minLength: { value: 6, message: 'Hasło musi mieć co najmniej 6 znaków' },
              })}
            />
          </Field>

          <Button type="submit" fullWidth loading={loading} disabled={loading}>
            Zaloguj się
          </Button>
        </form>

        <div className={styles.divider}>
          <span>lub kontynuuj przez</span>
        </div>

        <div className={styles.social}>
          {PROVIDERS.map((p) => (
            <Button
              key={p.id}
              type="button"
              variant="secondary"
              fullWidth
              disabled={loading}
              icon={p.icon}
              onClick={() => onProvider(p.id)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        <p className={styles.footer}>
          Nie masz konta? <Link to="/register">Zarejestruj się</Link>
        </p>
      </div>
    </div>
  )
}

LoginPage.displayName = 'LoginPage'

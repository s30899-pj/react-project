import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/Button/Button'
import { Field, formStyles } from '@/components/form/Field'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/useToast'
import styles from './RegisterPage.module.scss'

interface RegisterFormValues {
  displayName: string
  email: string
  password: string
  confirm: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const { user, register: registerUser } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: { displayName: '', email: '', password: '', confirm: '' },
  })

  const password = watch('password')

  if (user) return <Navigate to="/" replace />

  const onSubmit = handleSubmit(async ({ email, password, displayName }) => {
    await registerUser({ email, password, displayName })
    notify('success', 'Konto utworzone')
    navigate('/')
  })

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit} noValidate>
        <div className={styles.brand}>
          <span className={styles.logo}>🗺️</span>
          <div>
            <h1 className={styles.title}>MapForge</h1>
            <p className={styles.subtitle}>Załóż konto i twórz mapy</p>
          </div>
        </div>

        <Field label="Nazwa wyświetlana" htmlFor="displayName" error={errors.displayName?.message}>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            placeholder="np. Kartograf"
            className={`${formStyles.input} ${errors.displayName ? formStyles.invalid : ''}`}
            {...register('displayName', {
              required: 'Podaj nazwę wyświetlaną',
              minLength: { value: 2, message: 'Minimum 2 znaki' },
            })}
          />
        </Field>

        <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="ty@example.com"
            className={`${formStyles.input} ${errors.email ? formStyles.invalid : ''}`}
            {...register('email', {
              required: 'Podaj adres e-mail',
              pattern: { value: EMAIL_REGEX, message: 'Nieprawidłowy adres e-mail' },
            })}
          />
        </Field>

        <Field label="Hasło" htmlFor="password" error={errors.password?.message}>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={`${formStyles.input} ${errors.password ? formStyles.invalid : ''}`}
            {...register('password', {
              required: 'Podaj hasło',
              minLength: { value: 6, message: 'Minimum 6 znaków' },
            })}
          />
        </Field>

        <Field label="Powtórz hasło" htmlFor="confirm" error={errors.confirm?.message}>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={`${formStyles.input} ${errors.confirm ? formStyles.invalid : ''}`}
            {...register('confirm', {
              required: 'Powtórz hasło',
              validate: (value) => value === password || 'Hasła nie są zgodne',
            })}
          />
        </Field>

        <Button type="submit" variant="primary" size="lg" fullWidth loading={isSubmitting}>
          Utwórz konto
        </Button>

        <p className={styles.footer}>
          Masz już konto? <Link to="/login">Zaloguj się</Link>
        </p>
      </form>
    </div>
  )
}

RegisterPage.displayName = 'RegisterPage'

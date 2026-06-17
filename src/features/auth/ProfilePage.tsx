import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { useToast } from '@/hooks/useToast'
import { Panel } from '@/components/Panel/Panel'
import { Button } from '@/components/Button/Button'
import { Field, formStyles } from '@/components/form/Field'
import { Toggle } from '@/components/form/Toggle'
import { RoleBadge } from '@/components/RoleBadge/RoleBadge'
import { withRole } from '@/components/hoc/withRole'
import { listKnownUsers } from '@/api/userStore'
import { listProjects } from '@/api/projectStore'
import { UserIcon, SettingsIcon, ShieldIcon } from '@/components/icons'
import styles from './ProfilePage.module.scss'

const AVATARS = ['🦊', '🐼', '🐲', '🧙', '🤖', '👾', '🐱', '🦉']

interface ProfileForm {
  displayName: string
  bio: string
  avatar: string
}

const AdminPanel = withRole(function AdminPanelInner() {
  const users = listKnownUsers()
  const projects = listProjects()
  const admins = users.filter((u) => u.role === 'admin').length
  const totalLayers = projects.reduce((sum, project) => sum + project.layerCount, 0)

  return (
    <div className={styles.adminStats}>
      <div className={styles.stat}>
        <span className={styles.statValue}>{users.length}</span>
        <span className={styles.statLabel}>Użytkownicy</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statValue}>{projects.length}</span>
        <span className={styles.statLabel}>Projekty w systemie</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statValue}>{totalLayers}</span>
        <span className={styles.statLabel}>Warstwy łącznie</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statValue}>{admins}</span>
        <span className={styles.statLabel}>Administratorzy</span>
      </div>
    </div>
  )
}, ['admin'])

export default function ProfilePage() {
  const { user, updateProfile, updatePreferences } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { notify } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileForm>({
    defaultValues: {
      displayName: user?.displayName ?? '',
      bio: user?.bio ?? '',
      avatar: user?.avatar ?? '🦊',
    },
  })

  const selectedAvatar = watch('avatar')

  const onSubmit = handleSubmit(({ displayName, bio, avatar }) => {
    updateProfile({ displayName, bio, avatar })
    notify('success', 'Profil zapisany')
  })

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className={styles.page}>
      <Panel title="Profil" icon={<UserIcon size={16} />}>
        <div className={styles.identity}>
          <span className={styles.bigAvatar} aria-hidden="true">
            {selectedAvatar}
          </span>
          <div className={styles.identityInfo}>
            <span className={styles.name}>{user.displayName}</span>
            <span className={styles.email}>{user.email}</span>
            <RoleBadge role={user.role} />
          </div>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <Field label="Nazwa wyświetlana" htmlFor="displayName" error={errors.displayName?.message}>
            <input
              id="displayName"
              className={`${formStyles.input} ${errors.displayName ? formStyles.invalid : ''}`}
              {...register('displayName', {
                required: 'Nazwa jest wymagana',
                minLength: { value: 2, message: 'Minimum 2 znaki' },
              })}
            />
          </Field>

          <Field label="O mnie" htmlFor="bio" hint="Krótki opis widoczny w Twoim profilu.">
            <textarea
              id="bio"
              rows={3}
              className={formStyles.textarea}
              {...register('bio')}
            />
          </Field>

          <div className={styles.avatarPicker}>
            <span className={styles.pickerLabel}>Awatar</span>
            <div className={styles.avatarRow} role="radiogroup" aria-label="Wybór awatara">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  role="radio"
                  aria-checked={selectedAvatar === emoji}
                  aria-label={`Awatar ${emoji}`}
                  className={`${styles.avatarOption} ${selectedAvatar === emoji ? styles.active : ''}`}
                  onClick={() => setValue('avatar', emoji, { shouldDirty: true })}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="submit" variant="primary">
              Zapisz profil
            </Button>
          </div>
        </form>
      </Panel>

      <Panel title="Preferencje" icon={<SettingsIcon size={16} />}>
        <div className={styles.prefs}>
          <Toggle
            checked={user.preferences.showGrid}
            onChange={(showGrid) => updatePreferences({ showGrid })}
            label="Pokazuj siatkę"
          />
          <Toggle
            checked={user.preferences.snapToGrid}
            onChange={(snapToGrid) => updatePreferences({ snapToGrid })}
            label="Przyciągaj do siatki"
          />
          <Toggle
            checked={user.preferences.autosave}
            onChange={(autosave) => updatePreferences({ autosave })}
            label="Autozapis"
          />
          <Toggle
            checked={theme === 'light'}
            onChange={toggleTheme}
            label={`Motyw: ${theme === 'light' ? 'jasny' : 'ciemny'}`}
          />
        </div>
      </Panel>

      <Panel title="Uprawnienia" icon={<ShieldIcon size={16} />}>
        <p className={styles.note}>
          Twoja rola jest ustalana automatycznie na podstawie adresu e-mail. Adresy zawierające
          <strong> „admin”</strong> otrzymują rolę administratora, zawierające <strong>„test”</strong>{' '}
          rolę testera, a pozostałe rolę twórcy.
        </p>
        <ul className={styles.roleList}>
          <li>
            <RoleBadge role="creator" /> tworzy i edytuje własne mapy oraz eksportuje projekty.
          </li>
          <li>
            <RoleBadge role="tester" /> dodatkowo uruchamia walidację i podgląd map w trybie testowym.
          </li>
          <li>
            <RoleBadge role="admin" /> ma pełny dostęp, w tym do statystyk systemowych i zarządzania.
          </li>
        </ul>
        <div className={styles.adminBlock}>
          <span className={styles.adminTitle}>Panel administratora</span>
          <AdminPanel />
        </div>
      </Panel>
    </div>
  )
}

ProfilePage.displayName = 'ProfilePage'

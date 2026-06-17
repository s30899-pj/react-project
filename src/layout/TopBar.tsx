import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { RoleBadge } from '@/components/RoleBadge/RoleBadge'
import { SunIcon, MoonIcon, UserIcon, LogoutIcon } from '@/components/icons'
import styles from './TopBar.module.scss'

export function TopBar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.brand}>
        <span className={styles.logo}>🗺️</span>
        <span>MapForge</span>
      </Link>

      <nav className={styles.nav}>
        <NavLink to="/" end className={({ isActive }) => (isActive ? styles.active : '')}>
          Projekty
        </NavLink>
        <NavLink to="/projects/new" className={({ isActive }) => (isActive ? styles.active : '')}>
          Nowa mapa
        </NavLink>
      </nav>

      <div className={styles.right}>
        <Tooltip label={theme === 'dark' ? 'Przełącz na jasny' : 'Przełącz na ciemny'}>
          <button className={styles.iconBtn} onClick={toggleTheme} aria-label="Przełącz motyw">
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
          </button>
        </Tooltip>

        {user && (
          <div className={styles.userWrap}>
            <button className={styles.user} onClick={() => setMenuOpen((v) => !v)}>
              <span className={styles.avatar}>{user.avatar}</span>
              <span className={styles.userInfo}>
                <span className={styles.name}>{user.displayName}</span>
                <RoleBadge role={user.role} />
              </span>
            </button>
            {menuOpen && (
              <div className={styles.menu} onMouseLeave={() => setMenuOpen(false)}>
                <Link to="/profile" onClick={() => setMenuOpen(false)}>
                  <UserIcon size={15} />
                  Mój profil
                </Link>
                <button onClick={handleLogout}>
                  <LogoutIcon size={15} />
                  Wyloguj
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

TopBar.displayName = 'TopBar'

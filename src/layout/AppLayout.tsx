import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import styles from './AppLayout.module.scss'

export function AppLayout() {
  return (
    <div className={styles.layout}>
      <TopBar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

AppLayout.displayName = 'AppLayout'

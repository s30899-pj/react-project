import { Link } from 'react-router-dom'
import { Button } from '@/components/Button/Button'
import styles from './NotFoundPage.module.scss'

export default function NotFoundPage() {
  return (
    <div className={styles.screen}>
      <div className={styles.content}>
        <span className={styles.emoji} aria-hidden="true">
          🗺️
        </span>
        <h1 className={styles.heading}>404 — zgubiłeś się na mapie</h1>
        <p className={styles.subtext}>
          Ta lokalizacja nie istnieje albo została przeniesiona. Wróć do swoich projektów i
          zacznij od znanego punktu.
        </p>
        <Link to="/" className={styles.link}>
          <Button>← Wróć do projektów</Button>
        </Link>
      </div>
    </div>
  )
}

NotFoundPage.displayName = 'NotFoundPage'

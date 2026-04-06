import { MovementsPage } from './features/movements/movementsPage'
import styles from './app.module.css'

export default function App() {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <span className={styles.logo}>Break Trainer</span>
      </header>
      <MovementsPage />
    </div>
  )
}

import { Outlet, Link } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/menu" className={styles.logo}>STC</Link>
          <Link to="/kitchen" style={{ fontSize: '0.8rem', color: '#888', textDecoration: 'none' }}>Kitchen</Link>
        </div>
        <span className={styles.tagline}>Order & track</span>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

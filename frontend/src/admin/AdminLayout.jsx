import { Outlet, NavLink } from 'react-router-dom'
import styles from './AdminLayout.module.css'

export default function AdminLayout() {
  return (
    <div className={styles.wrapper}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logo}>STC</span>
          <span className={styles.adminBadge}>Admin</span>
        </div>
        <nav className={styles.nav}>
          <NavLink
            to="/admin"
            end
            className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
          >
            Orders
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
          >
            Users
          </NavLink>
        </nav>
        <a href="/menu" className={styles.backSite}>View site</a>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

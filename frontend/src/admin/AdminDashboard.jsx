import { useOrder } from '../context/OrderContext'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import styles from './Admin.module.css'

const STEPS = ['kitchen', 'on_way', 'delivered']
const LABELS = { kitchen: 'Preparing', on_way: 'On Way', delivered: 'Delivered' }

export default function AdminDashboard() {
  const { orders } = useOrder()
  const [, setRefresh] = useState(0)

  // Force re-render when orders change
  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((prev) => prev + 1)
    }, 2000) // Refresh every 2 seconds
    return () => clearInterval(interval)
  }, [])
  const recent = [...orders].reverse().slice(0, 10)
  const byStatus = STEPS.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length
    return acc
  }, {})
  const today = new Date().toDateString()
  const todayCount = orders.filter((o) => new Date(o.createdAt).toDateString() === today).length
  const uniqueStations = [...new Set(orders.map((o) => o.station))].length

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.subtitle}>Monitor orders and activity</p>

      <div className={styles.cards}>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Orders today</span>
          <span className={styles.cardValue}>{todayCount}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Total orders</span>
          <span className={styles.cardValue}>{orders.length}</span>
        </div>
        <div className={styles.card}>
          <span className={styles.cardLabel}>Stations / users</span>
          <span className={styles.cardValue}>{uniqueStations}</span>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>By status</h2>
        <div className={styles.statusRow}>
          {STEPS.map((s) => (
            <div key={s} className={styles.statusBadge}>
              <span>{LABELS[s]}</span>
              <strong>{byStatus[s] ?? 0}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Recent orders</h2>
          <Link to="/admin/orders" className={styles.viewAll}>View all</Link>
        </div>
        {recent.length === 0 ? (
          <p className={styles.empty}>No orders yet.</p>
        ) : (
          <ul className={styles.orderList}>
            {recent.map((o) => (
              <li key={o.id} className={styles.orderRow}>
                <span className={styles.orderId}>{o.id}</span>
                <span className={styles.orderStation}>{o.station}</span>
                <span className={styles.orderStatus}>{LABELS[o.status]}</span>
                <span className={styles.orderTime}>
                  {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

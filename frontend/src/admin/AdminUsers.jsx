import { useOrder } from '../context/OrderContext'
import { useEffect, useState } from 'react'
import styles from './Admin.module.css'

export default function AdminUsers() {
  const { orders, deleteOrdersByStation, deleteAllOrders } = useOrder()
  const [, setRefresh] = useState(0)

  // Force re-render when orders change
  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((prev) => prev + 1)
    }, 2000) // Refresh every 2 seconds
    return () => clearInterval(interval)
  }, [])
  const byStation = orders.reduce((acc, o) => {
    if (!acc[o.station]) {
      acc[o.station] = { station: o.station, orders: 0, lastOrder: o.createdAt }
    }
    acc[o.station].orders += 1
    if (new Date(o.createdAt) > new Date(acc[o.station].lastOrder)) {
      acc[o.station].lastOrder = o.createdAt
    }
    return acc
  }, {})
  const users = Object.values(byStation).sort(
    (a, b) => new Date(b.lastOrder) - new Date(a.lastOrder)
  )

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Users / Stations</h1>
      <p className={styles.subtitle}>Monitor activity by station (from QR / URL)</p>

      {users.length === 0 ? (
        <p className={styles.empty}>No activity yet. Stations appear when orders are placed.</p>
      ) : (
        <>
          <div className={styles.usersHeaderRow}>
            <button
              type="button"
              className={styles.clearAllBtn}
              onClick={() => {
                if (window.confirm('Clear ALL user logs and orders?')) {
                  deleteAllOrders()
                }
              }}
            >
              Clear all user logs
            </button>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Orders</th>
                  <th>Last order</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.station}>
                    <td className={styles.stationCell}>{u.station}</td>
                    <td>{u.orders}</td>
                    <td>{new Date(u.lastOrder).toLocaleString()}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.deleteUserBtn}
                        onClick={() => {
                          if (window.confirm(`Delete all logs for ${u.station}?`)) {
                            deleteOrdersByStation(u.station)
                          }
                        }}
                      >
                        Delete logs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

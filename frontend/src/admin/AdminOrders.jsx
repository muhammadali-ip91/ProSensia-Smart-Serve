import { useOrder } from '../context/OrderContext'
import { useEffect, useState } from 'react'
import styles from './Admin.module.css'

const LABELS = { kitchen: 'Preparing', on_way: 'On Way', delivered: 'Delivered' }

export default function AdminOrders() {
  const { orders } = useOrder()
  const [, setRefresh] = useState(0)
  const [expandedOrders, setExpandedOrders] = useState(new Set())

  // Force re-render when orders change
  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((prev) => prev + 1)
    }, 2000) // Refresh every 2 seconds
    return () => clearInterval(interval)
  }, [])

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  const calculateTotal = (items) => {
    return items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Orders</h1>
      <p className={styles.subtitle}>All orders — click to see details</p>

      {sorted.length === 0 ? (
        <p className={styles.empty}>No orders yet. Orders from the site will appear here.</p>
      ) : (
        <div className={styles.ordersList}>
          {sorted.map((o) => {
            const isExpanded = expandedOrders.has(o.id)
            const total = calculateTotal(o.items)
            return (
              <div key={o.id} className={styles.orderCard}>
                <div 
                  className={styles.orderHeader}
                  onClick={() => toggleOrder(o.id)}
                >
                  <div className={styles.orderHeaderLeft}>
                    <span className={styles.expandIcon}>{isExpanded ? '▼' : '▶'}</span>
                    <span className={styles.orderId}>{o.id}</span>
                    <span className={styles.orderStation}>{o.station}</span>
                    {o.urgent && <span className={styles.urgentBadge}>Urgent</span>}
                  </div>
                  <div className={styles.orderHeaderRight}>
                    <span className={styles.statusPill}>{LABELS[o.status]}</span>
                    <span className={styles.orderItemCount}>{o.items?.length ?? 0} items</span>
                    <span className={styles.orderTime}>
                      {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className={styles.orderDetails}>
                    <div className={styles.detailsSection}>
                      <h4 className={styles.detailsTitle}>Order Items</h4>
                      <ul className={styles.itemsList}>
                        {o.items?.map((item, idx) => (
                          <li key={idx} className={styles.itemRow}>
                            <span className={styles.itemName}>{item.name}</span>
                            <span className={styles.itemPrice}>${item.price?.toFixed(2) || '0.00'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.detailsFooter}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Total:</span>
                        <span className={styles.detailValue}>${total.toFixed(2)}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Order Time:</span>
                        <span className={styles.detailValue}>{new Date(o.createdAt).toLocaleString()}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Estimated Wait:</span>
                        <span className={styles.detailValue}>~{o.estimatedMins || 10} mins</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

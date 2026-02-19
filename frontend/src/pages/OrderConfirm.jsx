import { useParams, useNavigate } from 'react-router-dom'
import { useOrder } from '../context/OrderContext'
import styles from './OrderConfirm.module.css'

export default function OrderConfirm() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { getOrder } = useOrder()
  const order = getOrder(orderId)

  if (!order) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>Order not found.</p>
        <a href="/menu" className={styles.backLink}>Back to menu</a>
      </div>
    )
  }

  const viewTracker = () => navigate(`/track/${order.id}`)

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.badge}>Order placed</div>
        <p className={styles.orderId}>{order.id}</p>
        <p className={styles.station}>Delivering to <strong>{order.station}</strong></p>
        {order.urgent && <span className={styles.urgentTag}>Urgent</span>}
        <ul className={styles.items}>
          {order.items.map((item, i) => (
            <li key={i}>
              {item.name} — ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
        <p className={styles.eta}>Est. wait: ~{order.estimatedMins} mins</p>
        <button type="button" onClick={viewTracker} className={styles.trackBtn}>
          Track order
        </button>
      </div>
    </div>
  )
}

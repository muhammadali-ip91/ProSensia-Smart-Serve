import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useOrder } from '../context/OrderContext'
import TechTrivia from '../components/TechTrivia'
import styles from './Tracker.module.css'

const STEPS = ['kitchen', 'on_way', 'delivered']
const LABELS = { kitchen: 'Preparing', on_way: 'On Way', delivered: 'Delivered' }

export default function Tracker() {
  const { orderId } = useParams()
  const { getOrder, STEP_LABELS, saveFeedback } = useOrder()
  const order = getOrder(orderId)
  const [triviaOpen, setTriviaOpen] = useState(false)
  const [triviaShown, setTriviaShown] = useState(false)
  const [rating, setRating] = useState(order?.feedback?.rating || 0)
  const [comment, setComment] = useState(order?.feedback?.comment || '')
  const [submitted, setSubmitted] = useState(!!order?.feedback)

  const currentStepIndex = order ? STEPS.indexOf(order.status) : -1

  // Show tech trivia pop-up while status is "Preparing" (kitchen) — once per visit
  useEffect(() => {
    if (!order || order.status !== 'kitchen') return
    if (triviaShown) return
    const t = setTimeout(() => {
      setTriviaOpen(true)
      setTriviaShown(true)
    }, 1500)
    return () => clearTimeout(t)
  }, [order?.id, order?.status, triviaShown])

  const handleSubmitFeedback = (e) => {
    e.preventDefault()
    if (!order) return
    if (!rating && !comment.trim()) return
    saveFeedback(order.id, rating, comment.trim())
    setSubmitted(true)
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>Order not found.</p>
        <a href="/menu">Back to menu</a>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <TechTrivia open={triviaOpen} onClose={() => setTriviaOpen(false)} />

      <p className={styles.orderId}>{order.id}</p>
      <p className={styles.station}>To <strong>{order.station}</strong></p>

      <div className={styles.progressWrap}>
        <div className={styles.steps}>
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`${styles.step} ${i <= currentStepIndex ? styles.stepDone : ''}`}
            >
              <div className={styles.stepDot} />
              <span className={styles.stepLabel}>{LABELS[step]}</span>
              {i < STEPS.length - 1 && <div className={styles.stepLine} />}
            </div>
          ))}
        </div>
        <div
          className={styles.progressBar}
          style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      <p className={styles.statusText}>
        Status: <strong>{STEP_LABELS[order.status] || order.status}</strong>
      </p>
      {order.status === 'kitchen' && (
        <button
          type="button"
          className={styles.triviaBtn}
          onClick={() => setTriviaOpen(true)}
        >
          Tech Trivia while you wait
        </button>
      )}
      {order.status === 'delivered' && (
        <form className={styles.feedbackCard} onSubmit={handleSubmitFeedback}>
          <h3 className={styles.feedbackTitle}>Rate your STC experience</h3>
          <div className={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`${styles.starBtn} ${rating >= star ? styles.starActive : ''}`}
                onClick={() => {
                  if (submitted) return
                  setRating(star)
                }}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            className={styles.feedbackInput}
            placeholder="Any feedback for the team?"
            rows={3}
            value={comment}
            onChange={(e) => {
              if (submitted) return
              setComment(e.target.value)
            }}
          />
          <button
            type="submit"
            className={styles.feedbackSubmit}
            disabled={submitted || (!rating && !comment.trim())}
          >
            {submitted ? 'Thanks for your feedback' : 'Submit feedback'}
          </button>
        </form>
      )}
      <a href="/menu" className={styles.menuLink}>Order more</a>
    </div>
  )
}

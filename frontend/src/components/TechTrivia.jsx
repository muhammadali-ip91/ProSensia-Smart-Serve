import { useState, useEffect } from 'react'
import { TECH_TRIVIA } from '../data/trivia'
import styles from './TechTrivia.module.css'

export default function TechTrivia({ open, onClose }) {
  const [item, setItem] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    if (open) {
      setItem(TECH_TRIVIA[Math.floor(Math.random() * TECH_TRIVIA.length)])
      setShowAnswer(false)
    }
  }, [open])

  if (!open) return null

  return (
    <div className={styles.overlay} role="dialog" aria-label="Tech trivia">
      <div className={styles.modal}>
        <h3 className={styles.title}>Tech Trivia</h3>
        <p className={styles.question}>{item?.q}</p>
        {showAnswer ? (
          <p className={styles.answer}>{item?.a}</p>
        ) : (
          <button
            type="button"
            className={styles.revealBtn}
            onClick={() => setShowAnswer(true)}
          >
            Reveal answer
          </button>
        )}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close"
        >
          Close
        </button>
      </div>
    </div>
  )
}

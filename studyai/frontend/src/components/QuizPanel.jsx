import { useState } from 'react'
import api from '../api/axios'

const INITIAL_Q = {
  question: 'Which consistency model guarantees that all nodes see the same data at the same time?',
  options: ['Eventual Consistency', 'Strong Consistency', 'Causal Consistency', 'Read-your-writes'],
  correct_index: 1,
}

export default function QuizPanel({ activeTopic }) {
  const [currentQ, setCurrentQ] = useState(INITIAL_Q)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [loading, setLoading] = useState(false)

  const handleAnswer = async (idx) => {
    if (answered) return
    setSelected(idx)
    setAnswered(true)
    const isCorrect = idx === currentQ.correct_index

    setScore(s => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }))

    await api.post('/quiz/answer', {
      topic: activeTopic,
      question: currentQ.question,
      user_answer: currentQ.options[idx],
      is_correct: isCorrect,
    }).catch(() => {})

    setTimeout(() => fetchNext(), 1500)
  }

  const fetchNext = async () => {
    setLoading(true)
    try {
      const res = await api.post('/chat/', {
        message: `Generate a single MCQ about ${activeTopic}. Respond ONLY with JSON: {"question":"...","options":["A","B","C","D"],"correct_index":0}`,
        topic: activeTopic,
      })
      const text = res.data.content
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        setCurrentQ(parsed)
      }
    } catch {
      setCurrentQ(INITIAL_Q)
    } finally {
      setSelected(null)
      setAnswered(false)
      setLoading(false)
    }
  }

  const getOptionStyle = (idx) => {
    if (!answered) return styles.option
    if (idx === currentQ.correct_index) return { ...styles.option, ...styles.correct }
    if (idx === selected && idx !== currentQ.correct_index) return { ...styles.option, ...styles.wrong }
    return { ...styles.option, opacity: 0.5 }
  }

  return (
    <div style={styles.panel}>
      <div style={styles.scoreBar}>
        <span style={styles.scoreText}>Score: {score.correct}/{score.total}</span>
        <span style={styles.topic}>{activeTopic}</span>
      </div>

      {loading ? (
        <div style={styles.loading}>Generating next question...</div>
      ) : (
        <div style={styles.card}>
          <p style={styles.question}>{currentQ.question}</p>
          <div style={styles.options}>
            {currentQ.options.map((opt, idx) => (
              <button key={idx} style={getOptionStyle(idx)} onClick={() => handleAnswer(idx)}>
                <span style={styles.optionLabel}>{String.fromCharCode(65 + idx)}</span>
                {opt}
              </button>
            ))}
          </div>
          {answered && (
            <div style={selected === currentQ.correct_index ? styles.feedbackCorrect : styles.feedbackWrong}>
              {selected === currentQ.correct_index ? '✓ Correct! Next question loading...' : '✗ Incorrect. Next question loading...'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  panel: { flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '20px', overflowY: 'auto' },
  scoreBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 20px',
  },
  scoreText: { fontSize: '14px', color: 'var(--text)', fontWeight: 500 },
  topic: { fontSize: '12px', color: 'var(--accent2)', background: 'var(--pill)', padding: '4px 10px', borderRadius: '20px' },
  loading: { color: 'var(--muted)', textAlign: 'center', marginTop: '40px' },
  card: {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '16px',
    padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px',
  },
  question: { fontSize: '16px', lineHeight: '1.6', color: 'var(--text)', fontWeight: 500 },
  options: { display: 'flex', flexDirection: 'column', gap: '10px' },
  option: {
    background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '10px',
    padding: '14px 16px', color: 'var(--text)', fontSize: '14px', cursor: 'pointer',
    display: 'flex', gap: '12px', alignItems: 'center', textAlign: 'left',
    transition: 'all 0.15s',
  },
  correct: { background: 'rgba(52,211,153,0.1)', border: '1px solid var(--success)', color: 'var(--success)' },
  wrong: { background: 'rgba(248,113,113,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)' },
  optionLabel: {
    width: '24px', height: '24px', borderRadius: '6px', background: 'var(--bg4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: 700, flexShrink: 0,
  },
  feedbackCorrect: { color: 'var(--success)', fontSize: '13px', textAlign: 'center' },
  feedbackWrong: { color: 'var(--danger)', fontSize: '13px', textAlign: 'center' },
}

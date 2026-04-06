import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function ReviewPanel({ activeTopic, materials }) {
  const [stats, setStats] = useState(null)
  const [streak, setStreak] = useState({ study_dates: [], current_streak: 0 })

  useEffect(() => {
    setStats(null)
    api.get(`/quiz/stats/${encodeURIComponent(activeTopic)}`).then(r => setStats(r.data)).catch(() => setStats({ total_answered: 0, correct_count: 0, accuracy_pct: 0, weak_areas: [] }))
    api.get('/streak').then(r => setStreak(r.data)).catch(() => {})
  }, [activeTopic])

  // Build 28-day calendar
  const today = new Date()
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (27 - i))
    return d.toISOString().split('T')[0]
  })

  return (
    <div style={styles.panel}>
      {/* Stat cards */}
      <div style={styles.cards}>
        {stats === null ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '88px', borderRadius: '12px' }} />
          ))
        ) : (
          [
            { label: 'Accuracy', value: `${stats.accuracy_pct}%`, color: 'var(--success)' },
            { label: 'Streak', value: `${streak.current_streak}d`, color: 'var(--warning)' },
            { label: 'Answered', value: stats.total_answered, color: 'var(--accent2)' },
            { label: 'Materials', value: materials?.length || 0, color: 'var(--muted)' },
          ].map(c => (
            <div key={c.label} style={styles.card}>
              <span style={{ ...styles.cardVal, color: c.color }}>{c.value}</span>
              <span style={styles.cardLabel}>{c.label}</span>
            </div>
          ))
        )}
      </div>

      {/* Streak calendar */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>28-Day Activity</div>
        <div style={styles.calendar}>
          {days.map(d => (
            <div
              key={d}
              title={d}
              style={{
                ...styles.calDay,
                background: streak.study_dates?.includes(d) ? 'var(--accent)' : 'var(--bg3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Weak areas */}
      {stats?.weak_areas?.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Weak Areas</div>
          <div style={styles.weakList}>
            {stats.weak_areas.slice(0, 5).map((q, i) => (
              <div key={i} style={styles.weakItem}>
                <span style={styles.weakDot} />
                {q.length > 80 ? q.slice(0, 80) + '...' : q}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily task */}
      <div style={styles.taskCard}>
        <div style={styles.taskTitle}>Daily Task</div>
        <p style={styles.taskDesc}>Design a scalable {activeTopic} system with fault tolerance and horizontal scaling.</p>
        <button style={styles.taskBtn}>Start this task</button>
      </div>
    </div>
  )
}

const styles = {
  panel: { flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  card: {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px',
    padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center',
  },
  cardVal: { fontSize: '24px', fontWeight: 700 },
  cardLabel: { fontSize: '12px', color: 'var(--muted)' },
  section: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' },
  sectionTitle: { fontSize: '13px', color: 'var(--muted)', marginBottom: '14px', fontWeight: 500 },
  calendar: { display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '4px' },
  calDay: { width: '100%', aspectRatio: '1', borderRadius: '3px' },
  weakList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  weakItem: { display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--text)' },
  weakDot: { width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)', marginTop: '5px', flexShrink: 0 },
  taskCard: {
    background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '12px',
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px',
  },
  taskTitle: { fontSize: '13px', color: 'var(--muted)', fontWeight: 500 },
  taskDesc: { fontSize: '14px', color: 'var(--text)', lineHeight: '1.6' },
  taskBtn: {
    alignSelf: 'flex-start', background: 'var(--accent)', border: 'none',
    color: '#fff', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', cursor: 'pointer',
  },
}

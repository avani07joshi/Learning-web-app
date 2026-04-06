import { useState } from 'react'

export default function Sidebar({ activeTopic, setActiveTopic, topics, onAddTopic, onDeleteTopic, onAddMaterial }) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const handleAdd = async (e) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return
    await onAddTopic(name)
    setNewName('')
    setAdding(false)
  }

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>Topics</div>
      <div style={styles.list}>
        {topics.map(topic => (
          <div
            key={topic.id}
            style={{ ...styles.item, ...(activeTopic === topic.name ? styles.activeItem : {}) }}
            onClick={() => setActiveTopic(topic.name)}
          >
            <div style={styles.topicRow}>
              <span style={styles.topicName}>{topic.name}</span>
              <button
                style={styles.deleteTopicBtn}
                onClick={e => { e.stopPropagation(); onDeleteTopic(topic.id) }}
                title="Remove topic"
              >×</button>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${topic.progress_pct}%` }} />
            </div>
            <span style={styles.progressLabel}>{topic.progress_pct}%</span>
          </div>
        ))}

        {adding ? (
          <form onSubmit={handleAdd} style={styles.addForm}>
            <input
              autoFocus
              style={styles.addInput}
              placeholder="Topic name..."
              value={newName}
              onChange={e => setNewName(e.target.value)}
            />
            <div style={styles.addFormBtns}>
              <button type="submit" style={styles.confirmBtn}>Add</button>
              <button type="button" style={styles.cancelBtn} onClick={() => { setAdding(false); setNewName('') }}>Cancel</button>
            </div>
          </form>
        ) : (
          <button style={styles.newTopicBtn} onClick={() => setAdding(true)}>+ New topic</button>
        )}
      </div>

      <button style={styles.addBtn} onClick={onAddMaterial}>
        + Add study material
      </button>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '280px', background: 'var(--bg2)', borderRight: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', flexShrink: 0,
  },
  header: {
    padding: '16px 20px', fontSize: '13px', fontWeight: 500,
    color: 'var(--muted)', borderBottom: '1px solid var(--border)',
  },
  list: { flex: 1, overflowY: 'auto', padding: '8px' },
  item: {
    padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
    marginBottom: '4px', display: 'flex', flexDirection: 'column', gap: '6px',
  },
  activeItem: { background: 'var(--pill)', border: '1px solid var(--pill-border)' },
  topicRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  topicName: { fontSize: '14px', color: 'var(--text)', fontWeight: 500 },
  deleteTopicBtn: {
    background: 'transparent', border: 'none', color: 'var(--muted2)',
    cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '0 2px',
    opacity: 0.6,
  },
  progressBar: {
    height: '3px', background: 'var(--bg4)', borderRadius: '2px', overflow: 'hidden',
  },
  progressFill: { height: '100%', background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.4s ease' },
  progressLabel: { fontSize: '11px', color: 'var(--muted2)' },
  newTopicBtn: {
    width: '100%', padding: '10px 14px', background: 'transparent',
    border: '1px dashed var(--border2)', borderRadius: '10px',
    color: 'var(--muted)', fontSize: '13px', cursor: 'pointer', marginTop: '4px',
  },
  addForm: { display: 'flex', flexDirection: 'column', gap: '6px', padding: '4px 2px', marginTop: '4px' },
  addInput: {
    background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '8px',
    padding: '8px 12px', color: 'var(--text)', fontSize: '13px', outline: 'none', fontFamily: 'inherit',
  },
  addFormBtns: { display: 'flex', gap: '6px' },
  confirmBtn: {
    flex: 1, padding: '7px', background: 'var(--accent)', border: 'none',
    borderRadius: '8px', color: '#fff', fontSize: '13px', cursor: 'pointer',
  },
  cancelBtn: {
    flex: 1, padding: '7px', background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: '8px', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer',
  },
  addBtn: {
    margin: '12px', padding: '10px', background: 'var(--bg3)',
    border: '1px dashed var(--border2)', borderRadius: '10px',
    color: 'var(--muted)', fontSize: '13px', cursor: 'pointer',
  },
}

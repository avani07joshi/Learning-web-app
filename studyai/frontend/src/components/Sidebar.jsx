const TOPICS = ['System Design', 'Databricks', 'AWS', 'Python']

export default function Sidebar({ activeTopic, setActiveTopic, onAddMaterial }) {
  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>Topics</div>
      <div style={styles.list}>
        {TOPICS.map(topic => (
          <div
            key={topic}
            style={{ ...styles.item, ...(activeTopic === topic ? styles.activeItem : {}) }}
            onClick={() => setActiveTopic(topic)}
          >
            <span style={styles.topicName}>{topic}</span>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: '0%' }} />
            </div>
            <span style={styles.progressLabel}>0%</span>
          </div>
        ))}
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
  topicName: { fontSize: '14px', color: 'var(--text)', fontWeight: 500 },
  progressBar: {
    height: '3px', background: 'var(--bg4)', borderRadius: '2px', overflow: 'hidden',
  },
  progressFill: { height: '100%', background: 'var(--accent)', borderRadius: '2px' },
  progressLabel: { fontSize: '11px', color: 'var(--muted2)' },
  addBtn: {
    margin: '12px', padding: '10px', background: 'var(--bg3)',
    border: '1px dashed var(--border2)', borderRadius: '10px',
    color: 'var(--muted)', fontSize: '13px', cursor: 'pointer',
  },
}

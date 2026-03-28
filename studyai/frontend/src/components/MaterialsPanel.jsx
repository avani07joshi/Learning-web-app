import api from '../api/axios'

const TYPE_ICONS = { url: '🔗', text: '📝', pdf: '📄' }

export default function MaterialsPanel({ activeTopic, materials, onMaterialAdded, onAddClick }) {
  const deleteMaterial = async (id) => {
    await api.delete(`/materials/${id}`).catch(() => {})
    onMaterialAdded()
  }

  return (
    <div style={styles.panel}>
      {materials.length === 0 ? (
        <div style={styles.empty}>No materials for {activeTopic}</div>
      ) : (
        <div style={styles.list}>
          {materials.map(m => (
            <div key={m.id} style={styles.item}>
              <span style={styles.icon}>{TYPE_ICONS[m.type] || '📄'}</span>
              <div style={styles.info}>
                <div style={styles.label}>{m.label}</div>
                <div style={styles.date}>{new Date(m.created_at).toLocaleDateString()}</div>
              </div>
              <button style={styles.deleteBtn} onClick={() => deleteMaterial(m.id)}>×</button>
            </div>
          ))}
        </div>
      )}
      <button style={styles.addBtn} onClick={onAddClick}>+ Add source</button>
    </div>
  )
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', padding: '12px' },
  empty: { color: 'var(--muted2)', fontSize: '13px', textAlign: 'center', marginTop: '20px' },
  list: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  item: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: 'var(--bg3)', borderRadius: '10px', padding: '10px 12px',
  },
  icon: { fontSize: '16px', flexShrink: 0 },
  info: { flex: 1, overflow: 'hidden' },
  label: { fontSize: '13px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  date: { fontSize: '11px', color: 'var(--muted2)', marginTop: '2px' },
  deleteBtn: {
    background: 'transparent', border: 'none', color: 'var(--muted2)',
    cursor: 'pointer', fontSize: '18px', lineHeight: 1, flexShrink: 0,
  },
  addBtn: {
    marginTop: '12px', padding: '10px', background: 'var(--bg3)',
    border: '1px dashed var(--border2)', borderRadius: '10px',
    color: 'var(--muted)', fontSize: '13px', cursor: 'pointer',
  },
}

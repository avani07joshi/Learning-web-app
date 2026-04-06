import { useState } from 'react'
import api from '../api/axios'

export default function AddMaterialModal({ activeTopic, onClose, onMaterialAdded, addToast }) {
  const [activeTab, setActiveTab] = useState('url')
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')
  const [urlLabel, setUrlLabel] = useState('')
  const [text, setText] = useState('')
  const [textLabel, setTextLabel] = useState('')
  const [file, setFile] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    if (!activeTopic) {
      addToast('Please add a topic first before adding materials')
      return
    }
    setLoading(true)
    try {
      if (activeTab === 'url') {
        await api.post('/materials', { type: 'url', label: urlLabel || url, content: url, topic: activeTopic })
      } else if (activeTab === 'text') {
        await api.post('/materials', { type: 'text', label: textLabel, content: text, topic: activeTopic })
      } else if (activeTab === 'pdf' && file) {
        const fd = new FormData()
        fd.append('file', file)
        await api.post(`/materials/upload?topic=${encodeURIComponent(activeTopic)}`, fd)
      }
      onMaterialAdded()
      onClose()
      addToast('Material added', 'success')
    } catch (err) {
      const detail = err.response?.data?.detail
      addToast(typeof detail === 'string' ? detail : 'Failed to add material')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <span style={styles.title}>Add Study Material</span>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={styles.tabs}>
          {['url', 'text', 'pdf'].map(t => (
            <button
              key={t}
              style={{ ...styles.tab, ...(activeTab === t ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(t)}
            >
              {t === 'url' ? '🔗 URL' : t === 'text' ? '📝 Text' : '📄 PDF'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {activeTab === 'url' && (
            <>
              <input style={styles.input} placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} required />
              <input style={styles.input} placeholder="Label (optional)" value={urlLabel} onChange={e => setUrlLabel(e.target.value)} />
            </>
          )}
          {activeTab === 'text' && (
            <>
              <input style={styles.input} placeholder="Label" value={textLabel} onChange={e => setTextLabel(e.target.value)} required />
              <textarea style={{ ...styles.input, minHeight: '120px', resize: 'vertical' }} placeholder="Paste your notes..." value={text} onChange={e => setText(e.target.value)} required />
            </>
          )}
          {activeTab === 'pdf' && (
            <input type="file" accept=".pdf" style={styles.input} onChange={e => setFile(e.target.files[0])} required />
          )}
          <button style={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Uploading...' : 'Add Material'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  modal: {
    background: 'var(--bg2)', border: '1px solid var(--border2)',
    borderRadius: '16px', padding: '24px', width: '440px',
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: '16px', fontWeight: 600, color: 'var(--text)' },
  closeBtn: { background: 'transparent', border: 'none', color: 'var(--muted)', fontSize: '22px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '6px' },
  tab: {
    background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px',
    padding: '7px 14px', fontSize: '13px', color: 'var(--muted)', cursor: 'pointer',
  },
  tabActive: { background: 'var(--pill)', border: '1px solid var(--pill-border)', color: 'var(--accent2)' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: {
    background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: '8px',
    padding: '11px 14px', color: 'var(--text)', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', width: '100%',
  },
  submitBtn: {
    background: 'var(--accent)', border: 'none', color: '#fff',
    borderRadius: '8px', padding: '12px', fontSize: '14px', cursor: 'pointer', fontWeight: 500,
  },
}

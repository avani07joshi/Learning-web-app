import { useState, useCallback, useRef } from 'react'

let _addToast = null

export function useToast() {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)

  const addToast = useCallback((message, type = 'error') => {
    const id = ++counter.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  _addToast = addToast
  return { toasts, addToast }
}

export function toast(message, type = 'error') {
  if (_addToast) _addToast(message, type)
}

export function ToastContainer({ toasts }) {
  return (
    <div style={styles.container}>
      {toasts.map(t => (
        <div key={t.id} style={{ ...styles.toast, ...(t.type === 'success' ? styles.success : styles.error) }}>
          {t.type === 'success' ? '✓' : '✕'} {t.message}
        </div>
      ))}
    </div>
  )
}

const styles = {
  container: {
    position: 'fixed', bottom: '24px', right: '24px',
    display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 1000,
  },
  toast: {
    padding: '12px 18px', borderRadius: '10px', fontSize: '13px',
    fontWeight: 500, maxWidth: '340px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    animation: 'slideIn 0.2s ease',
  },
  error: { background: '#2d1b1b', border: '1px solid var(--danger)', color: '#f87171' },
  success: { background: '#1a2d1f', border: '1px solid var(--success)', color: '#34d399' },
}

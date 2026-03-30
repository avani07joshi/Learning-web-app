import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

function formatText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

export default function ChatPanel({ activeTopic, currentUser }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    setMessages([])
    api.get(`/chat/${encodeURIComponent(activeTopic)}`)
      .then(r => setMessages(r.data))
      .catch(() => {})
  }, [activeTopic])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: msg }])
    setIsLoading(true)
    try {
      const res = await api.post('/chat', { message: msg, topic: activeTopic })
      setMessages(prev => [...prev, res.data])
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Sorry, something went wrong.' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={styles.panel}>
      <div style={styles.messages}>
        {messages.length === 0 && (
          <div style={styles.empty}>
            Ask anything about <strong>{activeTopic}</strong>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={m.id || i} style={{ ...styles.msgRow, justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {m.role === 'assistant' && <div style={styles.avatarAI}>AI</div>}
            <div
              style={{ ...styles.bubble, ...(m.role === 'user' ? styles.userBubble : styles.aiBubble) }}
              dangerouslySetInnerHTML={{ __html: formatText(m.content) }}
            />
            {m.role === 'user' && (
              <div style={styles.avatarUser}>
                {currentUser?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div style={{ ...styles.msgRow, justifyContent: 'flex-start' }}>
            <div style={styles.avatarAI}>AI</div>
            <div style={styles.aiBubble}>
              <span style={styles.dot1}>•</span>
              <span style={styles.dot2}>•</span>
              <span style={styles.dot3}>•</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div style={styles.quickActions}>
        {[`📖 Teach me ${activeTopic}`, '🧠 Quiz me', '🛠️ Design task'].map(q => (
          <button key={q} style={styles.quickBtn} onClick={() => sendMessage(q)}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <textarea
          style={styles.textarea}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={`Ask about ${activeTopic}...`}
          rows={1}
        />
        <button style={styles.sendBtn} onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
          ↑
        </button>
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        .d1{animation:bounce 1.2s infinite 0s}
        .d2{animation:bounce 1.2s infinite 0.2s}
        .d3{animation:bounce 1.2s infinite 0.4s}
      `}</style>
    </div>
  )
}

const styles = {
  panel: { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg)' },
  messages: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  empty: { color: 'var(--muted)', textAlign: 'center', marginTop: '40px', fontSize: '14px' },
  msgRow: { display: 'flex', gap: '10px', alignItems: 'flex-end' },
  avatarAI: {
    width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: 700, flexShrink: 0,
  },
  avatarUser: {
    width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '11px', fontWeight: 700, flexShrink: 0,
  },
  bubble: { maxWidth: '70%', padding: '12px 16px', borderRadius: '14px', fontSize: '14px', lineHeight: '1.6' },
  aiBubble: { background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)' },
  userBubble: { background: 'var(--accent)', color: '#fff' },
  dot1: { display: 'inline-block', marginRight: '3px', className: 'd1' },
  dot2: { display: 'inline-block', marginRight: '3px', className: 'd2' },
  dot3: { display: 'inline-block', className: 'd3' },
  quickActions: { padding: '8px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' },
  quickBtn: {
    background: 'var(--bg3)', border: '1px solid var(--border2)', color: 'var(--muted)',
    borderRadius: '20px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer',
  },
  inputRow: {
    padding: '12px 20px 16px', display: 'flex', gap: '10px',
    borderTop: '1px solid var(--border)', alignItems: 'flex-end',
  },
  textarea: {
    flex: 1, background: 'var(--bg2)', border: '1px solid var(--border2)',
    borderRadius: '12px', padding: '12px 16px', color: 'var(--text)',
    fontSize: '14px', resize: 'none', outline: 'none', fontFamily: 'inherit',
  },
  sendBtn: {
    width: '40px', height: '40px', background: 'var(--accent)', border: 'none',
    borderRadius: '10px', color: '#fff', fontSize: '18px', cursor: 'pointer',
  },
}

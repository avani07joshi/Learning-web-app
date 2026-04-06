import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'
import ChatPanel from '../components/ChatPanel'
import QuizPanel from '../components/QuizPanel'
import ReviewPanel from '../components/ReviewPanel'
import MaterialsPanel from '../components/MaterialsPanel'
import AddMaterialModal from '../components/AddMaterialModal'
import { useToast, ToastContainer } from '../components/Toast'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { toasts, addToast } = useToast()
  const [activeTab, setActiveTab] = useState('chat')
  const [activeTopic, setActiveTopic] = useState(null)
  const [topics, setTopics] = useState([])
  const [streak, setStreak] = useState({})
  const [materials, setMaterials] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    api.post('/streak/checkin').catch(() => {})
    api.get('/streak').then(r => setStreak(r.data)).catch(() => {})
    api.get('/materials').then(r => setMaterials(r.data)).catch(() => {})
    api.get('/topics').then(r => {
      setTopics(r.data)
      if (r.data.length > 0) setActiveTopic(r.data[0].name)
    }).catch(() => {})
  }, [])

  const refreshMaterials = () => {
    api.get('/materials').then(r => setMaterials(r.data)).catch(() => {})
  }

  const refreshTopics = () => {
    api.get('/topics').then(r => setTopics(r.data)).catch(() => {})
  }

  const handleAddTopic = async (name) => {
    try {
      await api.post('/topics', { name })
      const res = await api.get('/topics')
      setTopics(res.data)
      setActiveTopic(name)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to add topic'
      addToast(msg)
    }
  }

  const handleDeleteTopic = async (topicId) => {
    try {
      await api.delete(`/topics/${topicId}`)
      const res = await api.get('/topics')
      setTopics(res.data)
      if (res.data.length > 0) setActiveTopic(res.data[0].name)
      else setActiveTopic(null)
    } catch {
      addToast('Failed to delete topic')
    }
  }

  const handleQuizAnswer = async (topicId) => {
    if (!topicId) return
    try {
      await api.patch(`/topics/${topicId}/progress`)
      refreshTopics()
    } catch {
      // non-critical, don't toast
    }
  }

  return (
    <div style={styles.root}>
      {/* Top Nav */}
      <div style={styles.nav}>
        <span style={styles.logo}>study<span style={styles.dot}>.</span>ai</span>
        <div style={styles.tabs}>
          {['chat', 'quiz', 'review'].map(tab => (
            <button
              key={tab}
              style={{ ...styles.tabBtn, ...(activeTab === tab ? styles.tabActive : {}) }}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'chat' ? 'Chat' : tab === 'quiz' ? 'Quiz me' : 'Review'}
            </button>
          ))}
        </div>
        <div style={styles.navRight}>
          <span style={styles.streakBadge}>🔥 {streak.current_streak || 0} day streak</span>
          <button style={styles.logoutBtn} onClick={logout}>Sign out</button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={styles.main}>
        <Sidebar
          activeTopic={activeTopic}
          setActiveTopic={setActiveTopic}
          topics={topics}
          onAddTopic={handleAddTopic}
          onDeleteTopic={handleDeleteTopic}
          onAddMaterial={() => setShowAddModal(true)}
        />

        <div style={styles.center}>
          {activeTopic ? (
            <>
              {activeTab === 'chat' && <ChatPanel activeTopic={activeTopic} currentUser={user} addToast={addToast} />}
              {activeTab === 'quiz' && (
                <QuizPanel
                  activeTopic={activeTopic}
                  addToast={addToast}
                  onAnswered={() => handleQuizAnswer(topics.find(t => t.name === activeTopic)?.id)}
                />
              )}
              {activeTab === 'review' && <ReviewPanel activeTopic={activeTopic} materials={materials} />}
            </>
          ) : (
            <div style={styles.noTopic}>Add a topic from the sidebar to get started</div>
          )}
        </div>

        <div style={styles.right}>
          <div style={styles.rightHeader}>Materials</div>
          <MaterialsPanel
            activeTopic={activeTopic}
            materials={materials.filter(m => m.topic === activeTopic)}
            onMaterialAdded={refreshMaterials}
            onAddClick={() => setShowAddModal(true)}
            addToast={addToast}
          />
        </div>
      </div>

      {showAddModal && (
        <AddMaterialModal
          activeTopic={activeTopic}
          onClose={() => setShowAddModal(false)}
          onMaterialAdded={refreshMaterials}
          addToast={addToast}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  )
}

const styles = {
  root: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 20px', height: '56px', background: 'var(--bg2)',
    borderBottom: '1px solid var(--border)', flexShrink: 0,
  },
  logo: { fontFamily: 'Syne, sans-serif', fontSize: '20px', fontWeight: 700 },
  dot: { color: 'var(--accent)' },
  tabs: { display: 'flex', gap: '4px' },
  tabBtn: {
    background: 'transparent', border: 'none', color: 'var(--muted)',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px',
  },
  tabActive: { background: 'var(--pill)', color: 'var(--accent2)', border: '1px solid var(--pill-border)' },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  streakBadge: {
    background: 'var(--bg3)', border: '1px solid var(--border2)',
    borderRadius: '20px', padding: '4px 12px', fontSize: '13px', color: 'var(--warning)',
  },
  logoutBtn: {
    background: 'transparent', border: '1px solid var(--border2)',
    color: 'var(--muted)', borderRadius: '8px', padding: '6px 12px',
    cursor: 'pointer', fontSize: '13px',
  },
  main: { display: 'flex', flex: 1, overflow: 'hidden' },
  center: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  noTopic: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '14px' },
  right: {
    width: '300px', background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  rightHeader: {
    padding: '16px 20px', fontSize: '13px', fontWeight: 500,
    color: 'var(--muted)', borderBottom: '1px solid var(--border)',
  },
}

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'
import ChatPanel from '../components/ChatPanel'
import QuizPanel from '../components/QuizPanel'
import ReviewPanel from '../components/ReviewPanel'
import MaterialsPanel from '../components/MaterialsPanel'
import AddMaterialModal from '../components/AddMaterialModal'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('chat')
  const [activeTopic, setActiveTopic] = useState('System Design')
  const [streak, setStreak] = useState({})
  const [materials, setMaterials] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    api.post('/streak/checkin').catch(() => {})
    api.get('/streak').then(r => setStreak(r.data)).catch(() => {})
    api.get('/materials').then(r => setMaterials(r.data)).catch(() => {})
  }, [])

  const refreshMaterials = () => {
    api.get('/materials').then(r => setMaterials(r.data)).catch(() => {})
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
        {/* Sidebar */}
        <Sidebar
          activeTopic={activeTopic}
          setActiveTopic={setActiveTopic}
          onAddMaterial={() => setShowAddModal(true)}
        />

        {/* Center Panel */}
        <div style={styles.center}>
          {activeTab === 'chat' && <ChatPanel activeTopic={activeTopic} currentUser={user} />}
          {activeTab === 'quiz' && <QuizPanel activeTopic={activeTopic} />}
          {activeTab === 'review' && <ReviewPanel activeTopic={activeTopic} materials={materials} />}
        </div>

        {/* Right Panel — Materials */}
        <div style={styles.right}>
          <div style={styles.rightHeader}>Materials</div>
          <MaterialsPanel
            activeTopic={activeTopic}
            materials={materials.filter(m => m.topic === activeTopic)}
            onMaterialAdded={refreshMaterials}
            onAddClick={() => setShowAddModal(true)}
          />
        </div>
      </div>

      {showAddModal && (
        <AddMaterialModal
          activeTopic={activeTopic}
          onClose={() => setShowAddModal(false)}
          onMaterialAdded={refreshMaterials}
        />
      )}
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
  right: {
    width: '300px', background: 'var(--bg2)', borderLeft: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
  },
  rightHeader: {
    padding: '16px 20px', fontSize: '13px', fontWeight: 500,
    color: 'var(--muted)', borderBottom: '1px solid var(--border)',
  },
}

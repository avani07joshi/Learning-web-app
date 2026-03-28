import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logo}>
          study<span style={styles.dot}>.</span>ai
        </div>
        <p style={styles.subtitle}>Create your account and start learning.</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
  },
  card: {
    background: 'var(--bg2)',
    border: '1px solid var(--border2)',
    borderRadius: '16px',
    padding: '40px',
    width: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logo: {
    fontFamily: 'Syne, sans-serif',
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--text)',
    textAlign: 'center',
  },
  dot: { color: 'var(--accent)' },
  subtitle: {
    color: 'var(--muted)',
    textAlign: 'center',
    fontSize: '14px',
  },
  error: {
    background: 'rgba(248,113,113,0.1)',
    border: '1px solid var(--danger)',
    color: 'var(--danger)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    background: 'var(--bg3)',
    border: '1px solid var(--border2)',
    borderRadius: '8px',
    padding: '12px 14px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
  },
  btn: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '13px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '4px',
  },
  footer: {
    color: 'var(--muted)',
    fontSize: '13px',
    textAlign: 'center',
  },
  link: {
    color: 'var(--accent2)',
    textDecoration: 'none',
  },
}

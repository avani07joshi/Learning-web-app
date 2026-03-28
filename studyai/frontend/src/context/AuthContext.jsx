import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedToken = localStorage.getItem('studyai_token')
    if (storedToken) {
      setToken(storedToken)
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.clear()
          setUser(null)
          setToken(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    localStorage.setItem('studyai_token', res.data.access_token)
    setToken(res.data.access_token)
    setUser(res.data.user)
  }

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('studyai_token', res.data.access_token)
    setToken(res.data.access_token)
    setUser(res.data.user)
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    setToken(null)
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

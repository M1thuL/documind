import { useState, useCallback } from 'react'
import { api } from '../lib/api'

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dm_user')) } catch { return null }
  })

  const persist = (data) => {
    localStorage.setItem('dm_token', data.access_token)
    localStorage.setItem('dm_user', JSON.stringify({ email: data.email, user_id: data.user_id }))
    setUser({ email: data.email, user_id: data.user_id })
  }

  const login  = useCallback(async (e, p) => persist(await api.login(e, p)), [])
  const signup = useCallback(async (e, p) => persist(await api.signup(e, p)), [])
  const logout = useCallback(() => {
    localStorage.removeItem('dm_token')
    localStorage.removeItem('dm_user')
    setUser(null)
  }, [])

  return { user, login, signup, logout }
}

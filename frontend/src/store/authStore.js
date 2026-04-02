import { create } from 'zustand'
import api from '../api/client'

const persisted = JSON.parse(localStorage.getItem('rag_auth') || '{}')

export const authStore = create((set, get) => ({
  accessToken: persisted.accessToken || '',
  refreshToken: persisted.refreshToken || '',
  role: persisted.role || '',
  username: persisted.username || '',
  canUpload: persisted.canUpload ?? false,

  saveAuth: (data, username) => {
    const canUpload = data.can_upload ?? (data.role === 'admin')
    const next = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      role: data.role,
      username,
      canUpload,
    }
    localStorage.setItem('rag_auth', JSON.stringify(next))
    set(next)
  },

  login: async (username, password) => {
    const { data } = await api.post('/api/auth/login', { username, password })
    get().saveAuth(data, username)
  },

  register: async (payload) => {
    await api.post('/api/auth/register', payload)
  },

  refresh: async () => {
    const refreshToken = get().refreshToken
    if (!refreshToken) throw new Error('Missing refresh token')
    const { data } = await api.post('/api/auth/refresh', { refresh_token: refreshToken })
    const canUpload = data.can_upload ?? (data.role === 'admin')
    const next = {
      ...get(),
      accessToken: data.access_token,
      role: data.role,
      canUpload,
    }
    localStorage.setItem(
      'rag_auth',
      JSON.stringify({
        accessToken: next.accessToken,
        refreshToken: next.refreshToken,
        role: next.role,
        username: next.username,
        canUpload: next.canUpload,
      }),
    )
    set(next)
  },

  logout: () => {
    localStorage.removeItem('rag_auth')
    set({ accessToken: '', refreshToken: '', role: '', username: '', canUpload: false })
  },
}))

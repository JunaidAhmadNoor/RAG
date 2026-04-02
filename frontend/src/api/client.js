import axios from 'axios'
import { authStore } from '../store/authStore'

const api = axios.create({
  // Use a build-time env var in production (Cloudflare / Railway), but keep localhost as fallback.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        await authStore.getState().refresh()
        const token = authStore.getState().accessToken
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        authStore.getState().logout()
      }
    }
    return Promise.reject(error)
  },
)

export default api

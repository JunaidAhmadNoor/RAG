import axios from 'axios'
import { authStore } from '../store/authStore'

const api = axios.create({
  baseURL: 'http://localhost:8000',
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

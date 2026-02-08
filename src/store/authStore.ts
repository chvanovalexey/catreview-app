import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
  checkAuth: () => void
}

// Пароль из переменных окружения (для Vite нужен префикс VITE_)
const CORRECT_PASSWORD = import.meta.env.VITE_APP_PASSWORD
const AUTH_STORAGE_KEY = 'catreview-auth'

if (!CORRECT_PASSWORD) {
  throw new Error('VITE_APP_PASSWORD не установлен в переменных окружения')
}

// Проверяем сохраненную авторизацию при загрузке
const getStoredAuth = (): boolean => {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  return stored === 'true'
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: getStoredAuth(),
  login: (password: string) => {
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true')
      set({ isAuthenticated: true })
      return true
    }
    return false
  },
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    set({ isAuthenticated: false })
  },
  checkAuth: () => {
    set({ isAuthenticated: getStoredAuth() })
  },
}))

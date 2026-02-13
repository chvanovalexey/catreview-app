import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
}

// Пароль из переменных окружения (для Vite нужен префикс VITE_)
const CORRECT_PASSWORD = import.meta.env.VITE_APP_PASSWORD

if (!CORRECT_PASSWORD) {
  throw new Error('VITE_APP_PASSWORD не установлен в переменных окружения')
}

const STORAGE_KEY = 'catreview_auth_password'

// Проверяем сохранённый пароль при загрузке
const savedPassword = localStorage.getItem(STORAGE_KEY)
const isAlreadyAuthenticated = savedPassword === CORRECT_PASSWORD

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: isAlreadyAuthenticated,
  login: (password: string) => {
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, password)
      set({ isAuthenticated: true })
      return true
    }
    return false
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY)
    set({ isAuthenticated: false })
  },
}))

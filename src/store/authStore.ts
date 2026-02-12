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

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  login: (password: string) => {
    if (password === CORRECT_PASSWORD) {
      set({ isAuthenticated: true })
      return true
    }
    return false
  },
  logout: () => {
    set({ isAuthenticated: false })
  },
}))

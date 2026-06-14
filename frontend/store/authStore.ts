import { create } from 'zustand'
import { User } from '../types/user'
import AsyncStorage from '@react-native-async-storage/async-storage'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoaded: boolean
  setAuth: (user: User, token: string) => Promise<void>
  logout: () => Promise<void>
  loadFromStorage: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoaded: false,

  setAuth: async (user, token) => {
    await AsyncStorage.setItem('auth_token', token)
    await AsyncStorage.setItem('auth_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true, isLoaded: true })
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token')
    await AsyncStorage.removeItem('auth_user')
    set({ user: null, token: null, isAuthenticated: false, isLoaded: true })
  },

  loadFromStorage: async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token')
      const userStr = await AsyncStorage.getItem('auth_user')
      if (token && userStr) {
        const user = JSON.parse(userStr)
        set({ user, token, isAuthenticated: true, isLoaded: true })
      } else {
        set({ isLoaded: true })
      }
    } catch (e) {
      console.log('Failed to load auth from storage', e)
      set({ isLoaded: true })
    }
  },
}))
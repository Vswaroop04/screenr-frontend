import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from './auth-api'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  hasHydrated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  logout: () => void
  setHasHydrated: (hydrated: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true
        }),
      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false
        }),
      setHasHydrated: (hydrated) =>
        set({ hasHydrated: hydrated })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)

import { create } from 'zustand'
import { User } from '@supabase/supabase-js'
import { supabase, isSupabaseEnabled } from '@/lib/supabase/client'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    if (!isSupabaseEnabled()) {
      return { error: 'Authentication not available in local mode' }
    }

    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      set({
        user: data.user,
        isAuthenticated: true,
      })

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  },

  signUp: async (email: string, password: string) => {
    if (!isSupabaseEnabled()) {
      return { error: 'Authentication not available in local mode' }
    }

    try {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        set({
          user: data.user,
          isAuthenticated: true,
        })
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  },

  signOut: async () => {
    if (!isSupabaseEnabled()) {
      return
    }

    try {
      await supabase!.auth.signOut()
      set({
        user: null,
        isAuthenticated: false,
      })
    } catch (error) {
      console.error('Error signing out:', error)
    }
  },

  initialize: async () => {
    set({ isLoading: true })

    if (!isSupabaseEnabled()) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      return
    }

    try {
      const { data: { session } } = await supabase!.auth.getSession()

      set({
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        isLoading: false,
      })

      // Listen for auth changes
      supabase!.auth.onAuthStateChange((event, session) => {
        set({
          user: session?.user ?? null,
          isAuthenticated: !!session?.user,
        })
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },
}))
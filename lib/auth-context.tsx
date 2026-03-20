"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

type UserRole = 'member' | 'admin'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
  emailVerified: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  resendVerificationEmail: (email?: string) => Promise<{ success: boolean; error?: string }>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email || '')
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserProfile(session.user.id, session.user.email || '')
        } else {
          setUser(null)
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', userId)
        .single()

      if (error) {
        // PGRST116 = no rows found — profile missing, create it
        if ((error as { code?: string }).code === 'PGRST116') {
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({ id: userId, email, full_name: '', role: 'member' })
            .select('id, full_name, email, role')
            .single()

          if (insertError) {
            console.error('Error creating profile:', insertError.message, insertError.code)
            return
          }

          const { data: { user: authUser } } = await supabase.auth.getUser()
          setUser({
            id: newProfile.id,
            name: newProfile.full_name || '',
            email: newProfile.email,
            role: newProfile.role || 'member',
            emailVerified: !!authUser?.email_confirmed_at
          })
          return
        }

        console.error('Error loading profile:', error.message, error.code, error.details)
        return
      }

      const { data: { user: authUser } } = await supabase.auth.getUser()

      setUser({
        id: data.id,
        name: data.full_name || '',
        email: data.email,
        role: data.role || 'member',
        emailVerified: !!authUser?.email_confirmed_at
      })
    } catch (error) {
      console.error('Error in loadUserProfile:', error)
    }
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Please verify your email before logging in' }
        }
        return { success: false, error: error.message }
      }

      if (data.user) {
        await loadUserProfile(data.user.id, data.user.email || '')
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An error occurred during login' }
    }
  }

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: 'member',
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) {
        return { success: false, error: authError.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An error occurred during registration' }
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An error occurred' }
    }
  }

  const resendVerificationEmail = async (email?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      let targetEmail = email

      if (!targetEmail) {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        targetEmail = authUser?.email
      }

      if (!targetEmail) {
        return { success: false, error: 'No email found' }
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: targetEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An error occurred' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      resetPassword,
      resendVerificationEmail,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

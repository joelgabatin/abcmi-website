"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type UserRole = 'member' | 'admin'

interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Demo users for demonstration purposes
const DEMO_USERS: (User & { password: string })[] = [
  { id: '1', name: 'Admin User', email: 'admin@church.org', password: 'admin123', role: 'admin' },
  { id: '2', name: 'John Member', email: 'john@example.com', password: 'member123', role: 'member' },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored session on mount (from localStorage or cookie)
    let storedUser = localStorage.getItem('church_user')
    
    // If not in localStorage, try to parse from cookie
    if (!storedUser && typeof document !== 'undefined') {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('church_user='))
        ?.split('=')[1]
      
      if (cookieValue) {
        try {
          storedUser = decodeURIComponent(cookieValue)
        } catch {
          // Invalid cookie
        }
      }
    }
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem('church_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
        localStorage.setItem('church_user', JSON.stringify(data.user))
        return { success: true }
      }

      return { success: false, error: data.error || 'Login failed' }
    } catch (error) {
      console.error('[v0] Login error:', error)
      return { success: false, error: 'An error occurred during login' }
    }
  }

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        setUser(data.user)
        localStorage.setItem('church_user', JSON.stringify(data.user))
        return { success: true }
      }

      return { success: false, error: data.error || 'Registration failed' }
    } catch (error) {
      console.error('[v0] Registration error:', error)
      return { success: false, error: 'An error occurred during registration' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('[v0] Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('church_user')
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout,
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

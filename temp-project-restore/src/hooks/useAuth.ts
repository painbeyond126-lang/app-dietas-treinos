"use client"

import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, isSupabaseConfigured, auth } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import type { AuthUser } from '@/lib/supabase'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  resetPassword: async () => ({ error: null })
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se Supabase está configurado
    if (!isSupabaseConfigured()) {
      console.warn('Supabase não está configurado. Configure as variáveis de ambiente.')
      setLoading(false)
      return
    }

    // Verificar usuário atual
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        
        if (currentUser) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Erro ao verificar usuário:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Escutar mudanças de autenticação apenas se Supabase estiver configurado
    if (!supabase) {
      setLoading(false)
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          const authUser = session.user as AuthUser
          setUser(authUser)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn('Supabase não está configurado')
      return
    }

    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const handleResetPassword = async (email: string) => {
    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase não está configurado' } }
    }

    try {
      const result = await auth.resetPassword(email)
      return { error: result.error }
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição de senha:', error)
      return { error: { message: error.message || 'Erro ao solicitar redefinição de senha' } }
    }
  }

  const contextValue: AuthContextType = {
    user,
    loading,
    signOut: handleSignOut,
    resetPassword: handleResetPassword
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

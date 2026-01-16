'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado no localStorage
    const storedUser = localStorage.getItem('beyondpain_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signUp = async (username: string, email: string, password: string) => {
    try {
      // Verificar se usuário já existe
      const users = JSON.parse(localStorage.getItem('beyondpain_users') || '[]')
      const userExists = users.find((u: any) => u.username === username || u.email === email)
      
      if (userExists) {
        return { success: false, error: 'Usuário ou email já cadastrado' }
      }

      // Criar novo usuário
      const newUser = { username, email, password }
      users.push(newUser)
      localStorage.setItem('beyondpain_users', JSON.stringify(users))

      // Fazer login automático
      const userData = { username, email }
      setUser(userData)
      localStorage.setItem('beyondpain_user', JSON.stringify(userData))

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Erro ao criar conta' }
    }
  }

  const signIn = async (username: string, password: string) => {
    try {
      const users = JSON.parse(localStorage.getItem('beyondpain_users') || '[]')
      const foundUser = users.find((u: any) => u.username === username && u.password === password)

      if (!foundUser) {
        return { success: false, error: 'Usuário ou senha incorretos' }
      }

      const userData = { username: foundUser.username, email: foundUser.email }
      setUser(userData)
      localStorage.setItem('beyondpain_user', JSON.stringify(userData))

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' }
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('beyondpain_user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSimpleAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within SimpleAuthProvider')
  }
  return context
}

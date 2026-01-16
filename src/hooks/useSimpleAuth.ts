'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  email: string
}

interface AuthResult {
  success: boolean
  error?: string
}

export function useSimpleAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('beyondpain_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        localStorage.removeItem('beyondpain_user')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (username: string, password: string): Promise<AuthResult> => {
    try {
      // Buscar usuários salvos
      const usersData = localStorage.getItem('beyondpain_users')
      const users = usersData ? JSON.parse(usersData) : []

      // Verificar credenciais
      const foundUser = users.find(
        (u: any) => u.username === username && u.password === password
      )

      if (!foundUser) {
        return { success: false, error: 'Usuário ou senha incorretos' }
      }

      // Salvar usuário logado
      const userToSave = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email
      }
      localStorage.setItem('beyondpain_user', JSON.stringify(userToSave))
      setUser(userToSave)

      return { success: true }
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return { success: false, error: 'Erro ao fazer login' }
    }
  }

  const signUp = async (username: string, email: string, password: string): Promise<AuthResult> => {
    try {
      // Buscar usuários existentes
      const usersData = localStorage.getItem('beyondpain_users')
      const users = usersData ? JSON.parse(usersData) : []

      // Verificar se usuário já existe
      const userExists = users.find(
        (u: any) => u.username === username || u.email === email
      )

      if (userExists) {
        return { success: false, error: 'Usuário ou email já cadastrado' }
      }

      // Criar novo usuário
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password,
        createdAt: new Date().toISOString()
      }

      users.push(newUser)
      localStorage.setItem('beyondpain_users', JSON.stringify(users))

      // Fazer login automático
      const userToSave = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
      localStorage.setItem('beyondpain_user', JSON.stringify(userToSave))
      setUser(userToSave)

      return { success: true }
    } catch (error) {
      console.error('Erro ao criar conta:', error)
      return { success: false, error: 'Erro ao criar conta' }
    }
  }

  const signOut = () => {
    localStorage.removeItem('beyondpain_user')
    setUser(null)
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }
}

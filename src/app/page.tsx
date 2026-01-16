'use client'

import { useState } from 'react'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { FitnessApp } from '@/components/FitnessApp'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skull, Flame, Dumbbell } from 'lucide-react'

export default function Home() {
  const { user, loading, signIn, signUp } = useSimpleAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isLogin) {
      const result = await signIn(formData.username, formData.password)
      if (!result.success) {
        setError(result.error || 'Erro ao fazer login')
      }
    } else {
      if (!formData.email) {
        setError('Email é obrigatório')
        return
      }
      const result = await signUp(formData.username, formData.email, formData.password)
      if (!result.success) {
        setError(result.error || 'Erro ao criar conta')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white text-lg font-bold">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo e Frase de Impacto */}
          <div className="text-center space-y-6">
            <div className="relative inline-block">
              <img 
                src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/2b4fd262-4d12-4ac5-9d0b-204137380360.jpg" 
                alt="Beyond Pain Logo" 
                className="h-32 w-32 rounded-full border-4 border-red-600 shadow-2xl shadow-red-600/70 animate-pulse mx-auto"
              />
              <div className="absolute -top-2 -right-2">
                <Flame className="h-12 w-12 text-orange-500 animate-bounce" />
              </div>
            </div>
            
            <div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600 drop-shadow-[0_0_20px_rgba(239,68,68,0.7)] mb-2">
                BEYOND PAIN
              </h1>
              <p className="text-sm text-gray-300 font-black tracking-[0.3em] uppercase">
                LIFEPRO FITNESS
              </p>
            </div>

            {/* Frase de Impacto */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 blur-2xl opacity-30"></div>
              <div className="relative bg-gradient-to-r from-black via-gray-900 to-black border-4 border-red-600 rounded-lg p-6 shadow-2xl shadow-red-900/50">
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  NO PAIN
                </p>
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                  NO GAIN
                </p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Skull className="h-8 w-8 text-red-500 animate-pulse" />
                  <Dumbbell className="h-8 w-8 text-orange-500 animate-bounce" />
                  <Skull className="h-8 w-8 text-red-500 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Card de Login/Cadastro */}
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-4 border-red-600/50 shadow-2xl shadow-red-900/50">
            <CardHeader>
              <CardTitle className="text-white text-2xl font-black text-center">
                {isLogin ? 'ENTRAR' : 'CRIAR CONTA'}
              </CardTitle>
              <CardDescription className="text-gray-400 text-center font-semibold">
                {isLogin ? 'Acesse sua conta' : 'Junte-se à família Beyond Pain'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300 font-bold">
                    Usuário
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Seu nome de usuário"
                    required
                    className="bg-gray-800 border-2 border-gray-700 text-white focus:border-red-600 font-semibold"
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300 font-bold">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      required={!isLogin}
                      className="bg-gray-800 border-2 border-gray-700 text-white focus:border-red-600 font-semibold"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300 font-bold">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Sua senha"
                    required
                    className="bg-gray-800 border-2 border-gray-700 text-white focus:border-red-600 font-semibold"
                  />
                </div>

                {error && (
                  <div className="bg-red-900/30 border-2 border-red-600 rounded-lg p-3">
                    <p className="text-red-400 text-sm font-semibold text-center">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-red-600 via-orange-600 to-red-600 hover:from-red-700 hover:via-orange-700 hover:to-red-700 text-white font-black text-lg py-6 shadow-lg shadow-red-600/50"
                >
                  {isLogin ? 'ENTRAR' : 'CRIAR CONTA'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError('')
                      setFormData({ username: '', email: '', password: '' })
                    }}
                    className="text-red-400 hover:text-red-300 font-bold text-sm"
                  >
                    {isLogin ? 'Não tem conta? Criar agora' : 'Já tem conta? Fazer login'}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <FitnessApp />
    </div>
  )
}

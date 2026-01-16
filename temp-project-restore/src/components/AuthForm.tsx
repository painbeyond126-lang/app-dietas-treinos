"use client"

import { useState } from 'react'
import { signIn, signUp, resetPassword } from '@/lib/auth'
import { User, Mail, Lock, Eye, EyeOff, UserPlus, LogIn, ArrowLeft } from 'lucide-react'

interface AuthFormProps {
  onSuccess: () => void
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'login') {
        const { user, error } = await signIn(email, password)
        if (error) {
          setError(error)
        } else if (user) {
          setMessage('Login realizado com sucesso!')
          onSuccess()
        }
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Nome completo é obrigatório')
          return
        }
        const { user, error } = await signUp(email, password, fullName)
        if (error) {
          setError(error)
        } else {
          setMessage('Conta criada com sucesso! Verifique seu email para confirmar.')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error)
        } else {
          setMessage('Email de recuperação enviado! Verifique sua caixa de entrada.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' && 'Entrar na Conta'}
            {mode === 'signup' && 'Criar Conta'}
            {mode === 'reset' && 'Recuperar Senha'}
          </h1>
          <p className="text-gray-400 text-sm">
            {mode === 'login' && 'Acesse sua conta para continuar'}
            {mode === 'signup' && 'Crie sua conta para começar'}
            {mode === 'reset' && 'Digite seu email para recuperar a senha'}
          </p>
        </div>

        {/* Mensagens */}
        {error && (
          <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {message && (
          <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4 mb-6">
            <p className="text-green-300 text-sm">{message}</p>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome Completo (apenas no cadastro) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-gray-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
                placeholder="Digite seu nome completo"
                required
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-gray-300 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors"
              placeholder="Digite seu email"
              required
            />
          </div>

          {/* Senha (não mostrar no reset) */}
          {mode !== 'reset' && (
            <div>
              <label className="block text-gray-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none transition-colors pr-12"
                  placeholder="Digite sua senha"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-gray-400 text-xs mt-2">
                  A senha deve ter pelo menos 6 caracteres
                </p>
              )}
            </div>
          )}

          {/* Botão Principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {mode === 'login' && <LogIn className="w-5 h-5" />}
                {mode === 'signup' && <UserPlus className="w-5 h-5" />}
                {mode === 'reset' && <Mail className="w-5 h-5" />}
                {mode === 'login' && 'Entrar'}
                {mode === 'signup' && 'Criar Conta'}
                {mode === 'reset' && 'Enviar Email'}
              </>
            )}
          </button>
        </form>

        {/* Links de Navegação */}
        <div className="mt-8 space-y-4">
          {mode === 'login' && (
            <>
              <div className="text-center">
                <button
                  onClick={() => setMode('reset')}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              </div>
              <div className="text-center">
                <span className="text-gray-400 text-sm">Não tem uma conta? </span>
                <button
                  onClick={() => setMode('signup')}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Criar conta
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div className="text-center">
              <span className="text-gray-400 text-sm">Já tem uma conta? </span>
              <button
                onClick={() => setMode('login')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Fazer login
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="text-center">
              <button
                onClick={() => setMode('login')}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </button>
            </div>
          )}
        </div>

        {/* Informação sobre verificação de email */}
        {mode === 'signup' && (
          <div className="mt-6 bg-blue-600/20 border border-blue-500/30 rounded-xl p-4">
            <p className="text-blue-300 text-xs text-center">
              📧 Após criar sua conta, você receberá um email de confirmação. 
              Clique no link para ativar sua conta.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle2, AlertCircle, Lock, Skull } from 'lucide-react'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações
    if (!password || !confirmPassword) {
      setError('Por favor, preencha todos os campos')
      return
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await updatePassword(password)

      if (updateError) {
        setError(updateError)
        return
      }

      setSuccess(true)
      
      // Redirecionar para a página principal após 2 segundos
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar senha')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4">
        <Card className="w-full max-w-md bg-gradient-to-br from-gray-900 to-black border-2 border-green-600">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-600/50">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              Senha Atualizada!
            </CardTitle>
            <CardDescription className="text-gray-400 font-semibold mt-2">
              Sua senha foi atualizada com sucesso. Redirecionando para o aplicativo...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="font-bold">Carregando...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="w-full max-w-md">
        {/* Logo BEYOND PAIN */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/2b4fd262-4d12-4ac5-9d0b-204137380360.jpg" 
              alt="Beyond Pain Logo" 
              className="h-20 w-20 rounded-full border-4 border-red-600 shadow-2xl shadow-red-600/70"
            />
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            BEYOND PAIN
          </h1>
          <p className="text-sm text-gray-300 font-black tracking-[0.3em] uppercase mt-1">
            LIFEPRO FITNESS
          </p>
        </div>

        <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-red-600/50 shadow-2xl shadow-red-900/30">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-red-600/50">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-black text-white">
              Nova Senha
            </CardTitle>
            <CardDescription className="text-gray-400 font-semibold mt-2">
              Digite sua nova senha abaixo para recuperar o acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-900/30 border-2 border-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="font-semibold">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-300 font-bold">
                  Nova Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua nova senha (mín. 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                  className="bg-gray-800 border-2 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-300 font-bold">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={6}
                  className="bg-gray-800 border-2 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-600"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 font-black text-lg py-6 shadow-lg shadow-red-600/50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-5 w-5" />
                    Atualizar Senha
                  </>
                )}
              </Button>
            </form>

            {/* Dicas de segurança */}
            <div className="mt-6 p-4 bg-blue-900/30 border-2 border-blue-700 rounded-lg">
              <p className="text-sm text-blue-300 font-semibold mb-2">
                <strong>🔒 Dicas de Segurança:</strong>
              </p>
              <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside font-semibold">
                <li>Use pelo menos 6 caracteres</li>
                <li>Combine letras, números e símbolos</li>
                <li>Não use senhas óbvias ou pessoais</li>
                <li>Não compartilhe sua senha com ninguém</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p className="font-semibold">© 2024 Beyond Pain Lifepro. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}

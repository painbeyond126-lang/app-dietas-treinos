'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    // Validar e-mail
    if (!validateEmail(email)) {
      setMessage({ 
        type: 'error', 
        text: 'Por favor, insira um e-mail válido' 
      })
      setLoading(false)
      return
    }

    try {
      const { error } = await resetPassword(email)

      if (error) {
        console.error('Erro ao enviar e-mail:', error)
        setMessage({ 
          type: 'error', 
          text: error.message || 'Erro ao enviar e-mail de redefinição' 
        })
        setLoading(false)
        return
      }

      setMessage({ 
        type: 'success', 
        text: 'E-mail de redefinição enviado com sucesso! Verifique sua caixa de entrada e spam.' 
      })
      setEmail('')
      setLoading(false)
    } catch (error: any) {
      console.error('Erro ao enviar e-mail:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erro ao enviar e-mail de redefinição' 
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/895c2922-5496-482a-97d1-7d9dc0f335d7.png" 
              alt="BeyondpainLifepro" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Redefinir Senha</h1>
          <p className="text-gray-400">Digite seu e-mail para receber o link de redefinição</p>
        </div>

        {/* Mensagens de feedback */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-900/30 border border-green-700 text-green-300' 
              : 'bg-red-900/30 border border-red-700 text-red-300'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recuperar Acesso</CardTitle>
            <CardDescription className="text-gray-400">
              Enviaremos um link de redefinição para seu e-mail cadastrado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">
                  <Mail className="h-4 w-4 inline mr-2" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Link de Redefinição'
                )}
              </Button>

              <Link href="/auth">
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  disabled={loading}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Login
                </Button>
              </Link>
            </form>

            {/* Informações adicionais */}
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <p className="text-sm text-blue-300">
                  <strong>💡 Dica:</strong> Verifique também sua pasta de spam caso não receba o e-mail em alguns minutos.
                </p>
              </div>

              {message?.type === 'success' && (
                <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <p className="text-sm text-green-300 mb-2">
                    <strong>✅ Próximos passos:</strong>
                  </p>
                  <ol className="text-xs text-green-300 space-y-1 list-decimal list-inside">
                    <li>Abra o e-mail que enviamos</li>
                    <li>Clique no link de redefinição</li>
                    <li>Defina sua nova senha</li>
                    <li>Faça login com a nova senha</li>
                  </ol>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>© 2024 BeyondpainLifepro. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}

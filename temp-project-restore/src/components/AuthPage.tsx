"use client"

import { useState, useEffect } from 'react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { UserCheck, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Users, Dumbbell, Calculator, Pill } from 'lucide-react'

interface AuthPageProps {
  onAuthSuccess: (user: User) => void
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  useEffect(() => {
    // Verificar se já está logado
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        onAuthSuccess(session.user)
      }
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          onAuthSuccess(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [onAuthSuccess])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 border-b border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <img 
              src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/5398f1f2-00a5-4cfc-b9da-f9c84a56cdb1.png" 
              alt="BeyondPainLifePro Logo" 
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">
                BeyondPainLifePro
              </h1>
              <p className="text-gray-300 mt-1">Seu personal trainer e nutricionista digital personalizado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Lado Esquerdo - Informações */}
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Acesso Personalizado
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                Crie sua conta para ter acesso a treinos, dietas e suplementação 
                <span className="text-blue-400 font-semibold"> totalmente personalizados</span> para você!
              </p>
            </div>

            {/* Benefícios */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-xl">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Treinos Personalizados</h3>
                  <p className="text-gray-400">
                    Treinos adaptados ao seu nível, objetivos e preferências. 
                    Salvos automaticamente no seu perfil.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-3 rounded-xl">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Dietas Calculadas</h3>
                  <p className="text-gray-400">
                    Planos alimentares baseados no seu metabolismo, objetivo e estilo de vida.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-3 rounded-xl">
                  <Pill className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Suplementação Inteligente</h3>
                  <p className="text-gray-400">
                    Recomendações de suplementos baseadas no seu perfil e objetivos específicos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-3 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Dados Seguros</h3>
                  <p className="text-gray-400">
                    Seus dados pessoais e progresso ficam salvos com segurança na nuvem.
                  </p>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Por que ter uma conta?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">100%</div>
                  <div className="text-sm text-gray-400">Personalizado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">24/7</div>
                  <div className="text-sm text-gray-400">Acesso</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">∞</div>
                  <div className="text-sm text-gray-400">Planos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">🔒</div>
                  <div className="text-sm text-gray-400">Seguro</div>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito - Formulário de Auth */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {authMode === 'signin' ? 'Entrar na Conta' : 'Criar Conta'}
              </h3>
              <p className="text-gray-400">
                {authMode === 'signin' 
                  ? 'Acesse seus treinos e dietas personalizados' 
                  : 'Comece sua jornada fitness personalizada'
                }
              </p>
            </div>

            {/* Componente de Auth do Supabase */}
            <div className="auth-container">
              <Auth
                supabaseClient={supabase}
                view={authMode}
                appearance={{
                  theme: ThemeSupa,
                  variables: {
                    default: {
                      colors: {
                        brand: '#3b82f6',
                        brandAccent: '#2563eb',
                        brandButtonText: 'white',
                        defaultButtonBackground: '#374151',
                        defaultButtonBackgroundHover: '#4b5563',
                        inputBackground: '#374151',
                        inputBorder: '#4b5563',
                        inputBorderHover: '#6b7280',
                        inputBorderFocus: '#3b82f6',
                        inputText: 'white',
                        inputLabelText: '#d1d5db',
                        inputPlaceholder: '#9ca3af',
                      },
                      space: {
                        spaceSmall: '4px',
                        spaceMedium: '8px',
                        spaceLarge: '16px',
                        labelBottomMargin: '8px',
                        anchorBottomMargin: '4px',
                        emailInputSpacing: '4px',
                        socialAuthSpacing: '4px',
                        buttonPadding: '10px 15px',
                        inputPadding: '10px 15px',
                      },
                      fontSizes: {
                        baseBodySize: '14px',
                        baseInputSize: '14px',
                        baseLabelSize: '14px',
                        baseButtonSize: '14px',
                      },
                      fonts: {
                        bodyFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif`,
                        buttonFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif`,
                        inputFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif`,
                        labelFontFamily: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif`,
                      },
                      borderWidths: {
                        buttonBorderWidth: '1px',
                        inputBorderWidth: '1px',
                      },
                      radii: {
                        borderRadiusButton: '8px',
                        buttonBorderRadius: '8px',
                        inputBorderRadius: '8px',
                      },
                    },
                  },
                  className: {
                    container: 'auth-container',
                    button: 'auth-button',
                    input: 'auth-input',
                    label: 'auth-label',
                  },
                }}
                localization={{
                  variables: {
                    sign_in: {
                      email_label: 'Email',
                      password_label: 'Senha',
                      email_input_placeholder: 'Seu email',
                      password_input_placeholder: 'Sua senha',
                      button_label: 'Entrar',
                      loading_button_label: 'Entrando...',
                      social_provider_text: 'Entrar com {{provider}}',
                      link_text: 'Já tem uma conta? Entre aqui',
                    },
                    sign_up: {
                      email_label: 'Email',
                      password_label: 'Senha',
                      email_input_placeholder: 'Seu email',
                      password_input_placeholder: 'Sua senha',
                      button_label: 'Criar Conta',
                      loading_button_label: 'Criando conta...',
                      social_provider_text: 'Criar conta com {{provider}}',
                      link_text: 'Não tem uma conta? Crie aqui',
                      confirmation_text: 'Verifique seu email para confirmar a conta',
                    },
                  },
                }}
                providers={[]}
                redirectTo={`${window.location.origin}/`}
                onlyThirdPartyProviders={false}
                magicLink={false}
                showLinks={true}
              />
            </div>

            {/* Toggle entre Login e Cadastro */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2 mx-auto"
              >
                {authMode === 'signin' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Informação de Segurança */}
            <div className="mt-8 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <Shield className="w-4 h-4" />
                <span className="font-medium">100% Seguro</span>
              </div>
              <p className="text-green-200 text-xs mt-1">
                Seus dados são protegidos com criptografia de ponta e nunca são compartilhados.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .auth-container {
          background: transparent !important;
        }
        
        .auth-container .supabase-auth-ui_ui-button {
          background: linear-gradient(to right, #3b82f6, #2563eb) !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 12px 24px !important;
          font-weight: 600 !important;
          transition: all 0.3s ease !important;
        }
        
        .auth-container .supabase-auth-ui_ui-button:hover {
          background: linear-gradient(to right, #2563eb, #1d4ed8) !important;
          transform: translateY(-1px) !important;
        }
        
        .auth-container .supabase-auth-ui_ui-input {
          background: rgba(55, 65, 81, 0.5) !important;
          border: 1px solid #4b5563 !important;
          border-radius: 8px !important;
          padding: 12px 16px !important;
          color: white !important;
          font-size: 14px !important;
        }
        
        .auth-container .supabase-auth-ui_ui-input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
        
        .auth-container .supabase-auth-ui_ui-label {
          color: #d1d5db !important;
          font-weight: 500 !important;
          margin-bottom: 8px !important;
        }
        
        .auth-container .supabase-auth-ui_ui-anchor {
          color: #60a5fa !important;
          text-decoration: none !important;
        }
        
        .auth-container .supabase-auth-ui_ui-anchor:hover {
          color: #3b82f6 !important;
        }
        
        .auth-container .supabase-auth-ui_ui-message {
          background: rgba(239, 68, 68, 0.1) !important;
          border: 1px solid rgba(239, 68, 68, 0.3) !important;
          color: #fca5a5 !important;
          border-radius: 8px !important;
          padding: 12px !important;
          margin: 8px 0 !important;
        }
        
        .auth-container .supabase-auth-ui_ui-divider {
          background: #4b5563 !important;
          margin: 24px 0 !important;
        }
      `}</style>
    </div>
  )
}
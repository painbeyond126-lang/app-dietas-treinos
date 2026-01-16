import { supabase, isSupabaseConfigured } from './supabase'
import type { AuthUser } from './supabase'

// Função para cadastrar usuário
export const signUp = async (email: string, password: string, fullName: string) => {
  if (!isSupabaseConfigured() || !supabase) {
    return { user: null, error: 'Supabase não está configurado. Configure as variáveis de ambiente.' }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`
      }
    })

    if (error) {
      throw error
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Função para fazer login
export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured() || !supabase) {
    return { user: null, error: 'Supabase não está configurado. Configure as variáveis de ambiente.' }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return { user: data.user, error: null }
  } catch (error: any) {
    return { user: null, error: error.message }
  }
}

// Função para fazer logout
export const signOut = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase não está configurado.' }
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Função para obter usuário atual
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (!isSupabaseConfigured() || !supabase) {
    console.warn('Supabase não está configurado')
    return null
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw error
    }

    return user as AuthUser
  } catch (error) {
    console.error('Erro ao obter usuário:', error)
    return null
  }
}

// Função para resetar senha - CORRIGIDA COM MELHORIAS
export const resetPassword = async (email: string) => {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase não está configurado.' }
  }

  try {
    // Obter a URL base corretamente
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // URL de redirecionamento para a página de atualização de senha
    const redirectUrl = `${baseUrl}/auth/update-password`

    console.log('🔄 Iniciando processo de redefinição de senha')
    console.log('📧 Email:', email)
    console.log('🌐 URL base:', baseUrl)
    console.log('🔗 URL de redirecionamento:', redirectUrl)

    // Chamar a API do Supabase para enviar o email
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) {
      console.error('❌ Erro retornado pelo Supabase:', error)
      console.error('❌ Código do erro:', error.status)
      console.error('❌ Mensagem:', error.message)
      throw error
    }

    console.log('✅ Resposta do Supabase:', data)
    console.log('✅ Solicitação de redefinição enviada com sucesso!')
    console.log('📬 Verifique:')
    console.log('   1. Caixa de entrada do email')
    console.log('   2. Pasta de SPAM/Lixo eletrônico')
    console.log('   3. Logs do Supabase Dashboard (Authentication → Logs)')
    console.log('')
    console.log('⚠️  IMPORTANTE: Se o email não chegar:')
    console.log('   - Verifique se o email está configurado no Supabase')
    console.log('   - Vá em: Project Settings → Auth → Email')
    console.log('   - Configure um provedor SMTP (SendGrid, Mailgun, etc.)')
    console.log('   - Ou use o serviço padrão do Supabase (pode ter delays)')

    return { error: null, data }
  } catch (error: any) {
    console.error('❌ Erro na função resetPassword:', error)
    return { error: error.message }
  }
}

// Função para atualizar senha
export const updatePassword = async (newPassword: string) => {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase não está configurado.' }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

// Função para atualizar perfil do usuário
export const updateProfile = async (updates: { full_name?: string; avatar_url?: string }) => {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase não está configurado.' }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      data: updates
    })

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error: any) {
    return { error: error.message }
  }
}

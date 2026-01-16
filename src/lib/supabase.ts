import { createClient } from '@supabase/supabase-js'

// Verificar se as variáveis de ambiente estão configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Criar cliente Supabase com verificação
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Função helper para verificar se Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase)
}

// Tipos para autenticação
export type AuthUser = {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
  }
}

export type Profile = {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

// Exportar funções de autenticação
export const auth = {
  getCurrentUser: async () => {
    if (!supabase) throw new Error('Supabase não configurado')
    return await supabase.auth.getUser()
  },
  onAuthStateChange: (callback: any) => {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } }
    return supabase.auth.onAuthStateChange(callback)
  },
  signUp: async (email: string, password: string, fullName?: string) => {
    if (!supabase) return { data: null, error: { message: 'Supabase não configurado' } }
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
  },
  signIn: async (email: string, password: string) => {
    if (!supabase) return { data: null, error: { message: 'Supabase não configurado' } }
    return await supabase.auth.signInWithPassword({
      email,
      password,
    })
  },
  signOut: async () => {
    if (!supabase) return { error: { message: 'Supabase não configurado' } }
    return await supabase.auth.signOut()
  },
  resetPassword: async (email: string) => {
    if (!supabase) return { data: null, error: { message: 'Supabase não configurado' } }
    
    // URL de redirecionamento para a página de atualização de senha
    // Usar window.location.origin apenas no cliente
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/update-password`
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/update-password`
    
    console.log('Enviando e-mail de redefinição para:', email)
    console.log('URL de redirecionamento:', redirectUrl)
    
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })
  },
}

// Exportar funções de perfil
export const profiles = {
  get: async (userId: string) => {
    if (!supabase) return { data: null, error: { message: 'Supabase não configurado' } }
    return await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
  },
  upsert: async (profile: Partial<Profile>) => {
    if (!supabase) return { data: null, error: { message: 'Supabase não configurado' } }
    return await supabase
      .from('profiles')
      .upsert(profile)
      .select()
  },
}

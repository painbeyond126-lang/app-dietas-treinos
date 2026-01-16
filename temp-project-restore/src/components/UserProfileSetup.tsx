"use client"

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { authService } from '@/lib/auth'
import { UserProfile } from '@/lib/supabase'
import { User as UserIcon, Scale, Ruler, Calendar, Activity, Target, Trophy, Save, LogOut, Settings, Dumbbell, Calculator, Pill, Flame } from 'lucide-react'

interface UserProfileSetupProps {
  user: User
  onProfileComplete: (profile: UserProfile) => void
  onLogout: () => void
}

export default function UserProfileSetup({ user, onProfileComplete, onLogout }: UserProfileSetupProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [existingProfile, setExistingProfile] = useState<UserProfile | null>(null)
  
  const [profileData, setProfileData] = useState({
    full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
    weight: 70,
    height: 170,
    age: 25,
    gender: 'male' as 'male' | 'female',
    activity_level: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    goal: 'maintain' as 'lose' | 'maintain' | 'gain',
    fitness_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced'
  })

  useEffect(() => {
    loadExistingProfile()
  }, [user.id])

  const loadExistingProfile = async () => {
    try {
      const profile = await authService.getUserProfile(user.id)
      if (profile) {
        setExistingProfile(profile)
        setProfileData({
          full_name: profile.full_name,
          weight: profile.weight,
          height: profile.height,
          age: profile.age,
          gender: profile.gender,
          activity_level: profile.activity_level,
          goal: profile.goal,
          fitness_level: profile.fitness_level
        })
        // Se já tem perfil completo, pode prosseguir
        onProfileComplete(profile)
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const profileToSave = {
        id: user.id,
        email: user.email!,
        ...profileData,
        created_at: existingProfile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const savedProfile = await authService.upsertUserProfile(profileToSave)
      onProfileComplete(savedProfile)
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      alert('Erro ao salvar perfil. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.signOut()
      onLogout()
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando perfil...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 border-b border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
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
                <p className="text-gray-300 mt-1">Configure seu perfil personalizado</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Logado como:</div>
                <div className="text-white font-medium">{user.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {existingProfile ? 'Atualizar Perfil' : 'Complete seu Perfil'}
            </h2>
            <p className="text-gray-400">
              {existingProfile 
                ? 'Atualize suas informações para manter seus planos sempre personalizados'
                : 'Precisamos de algumas informações para criar seus planos personalizados'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2 flex items-center gap-2">
                  <Scale className="w-4 h-4" />
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={profileData.weight}
                  onChange={(e) => setProfileData({...profileData, weight: Number(e.target.value)})}
                  className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                  placeholder="Ex: 70"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Altura (cm)
                </label>
                <input
                  type="number"
                  value={profileData.height}
                  onChange={(e) => setProfileData({...profileData, height: Number(e.target.value)})}
                  className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                  placeholder="Ex: 170"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Idade
                </label>
                <input
                  type="number"
                  value={profileData.age}
                  onChange={(e) => setProfileData({...profileData, age: Number(e.target.value)})}
                  className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none"
                  placeholder="Ex: 25"
                />
              </div>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Sexo</label>
                <select
                  value={profileData.gender}
                  onChange={(e) => setProfileData({...profileData, gender: e.target.value as 'male' | 'female'})}
                  className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="male" className="bg-gray-800">Masculino</option>
                  <option value="female" className="bg-gray-800">Feminino</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Nível de Atividade
                </label>
                <select
                  value={profileData.activity_level}
                  onChange={(e) => setProfileData({...profileData, activity_level: e.target.value as any})}
                  className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="sedentary" className="bg-gray-800">Sedentário (pouco ou nenhum exercício)</option>
                  <option value="light" className="bg-gray-800">Levemente ativo (exercício leve 1-3 dias/semana)</option>
                  <option value="moderate" className="bg-gray-800">Moderadamente ativo (exercício moderado 3-5 dias/semana)</option>
                  <option value="active" className="bg-gray-800">Muito ativo (exercício intenso 6-7 dias/semana)</option>
                  <option value="very_active" className="bg-gray-800">Extremamente ativo (exercício muito intenso, trabalho físico)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Objetivo Principal
                </label>
                <select
                  value={profileData.goal}
                  onChange={(e) => setProfileData({...profileData, goal: e.target.value as any})}
                  className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="lose" className="bg-gray-800">Perder peso / Definir</option>
                  <option value="maintain" className="bg-gray-800">Manter peso / Tonificar</option>
                  <option value="gain" className="bg-gray-800">Ganhar peso / Massa muscular</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Nível de Treino
                </label>
                <select
                  value={profileData.fitness_level}
                  onChange={(e) => setProfileData({...profileData, fitness_level: e.target.value as any})}
                  className="w-full p-3 rounded-xl bg-gray-700/50 border border-gray-600 text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="beginner" className="bg-gray-800">Iniciante (0-6 meses de treino)</option>
                  <option value="intermediate" className="bg-gray-800">Intermediário (6 meses - 2 anos)</option>
                  <option value="advanced" className="bg-gray-800">Avançado (mais de 2 anos)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Botão de Salvar */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSaveProfile}
              disabled={saving || !profileData.full_name.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-500 hover:to-blue-600 transition-all duration-300 flex items-center justify-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvando...' : existingProfile ? 'Atualizar Perfil' : 'Salvar e Continuar'}
            </button>
          </div>

          {/* Informações sobre personalização */}
          <div className="mt-8 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-300 mb-4">🎯 O que você terá com seu perfil:</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Dumbbell className="w-5 h-5 text-blue-400" />
                <span className="text-green-200 text-sm">Treinos adaptados ao seu nível</span>
              </div>
              <div className="flex items-center gap-3">
                <Calculator className="w-5 h-5 text-green-400" />
                <span className="text-green-200 text-sm">Dieta calculada para seu objetivo</span>
              </div>
              <div className="flex items-center gap-3">
                <Pill className="w-5 h-5 text-orange-400" />
                <span className="text-green-200 text-sm">Suplementos personalizados</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
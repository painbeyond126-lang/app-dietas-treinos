'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { 
  UserFitnessProfile, 
  WorkoutSession, 
  NutritionLog, 
  ProgressMeasurement,
  createUserFitnessProfile,
  getUserFitnessProfile,
  updateUserFitnessProfile,
  logWorkoutSession,
  getUserWorkoutSessions,
  logNutrition,
  getUserNutritionLogs,
  logProgressMeasurement,
  getUserProgressMeasurements,
  getUserFitnessStats,
  generatePersonalizedRecommendations
} from '@/lib/supabase-fitness'

export function useFitnessData() {
  const { user } = useAuth()
  const [fitnessProfile, setFitnessProfile] = useState<UserFitnessProfile | null>(null)
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([])
  const [nutritionLogs, setNutritionLogs] = useState<NutritionLog[]>([])
  const [progressMeasurements, setProgressMeasurements] = useState<ProgressMeasurement[]>([])
  const [fitnessStats, setFitnessStats] = useState<any>(null)
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar dados do usuário
  useEffect(() => {
    if (user?.id) {
      loadUserData()
    }
  }, [user?.id])

  const loadUserData = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      // Carregar perfil fitness
      const profile = await getUserFitnessProfile(user.id)
      setFitnessProfile(profile)

      // Carregar sessões de treino recentes
      const sessions = await getUserWorkoutSessions(user.id, 30)
      setWorkoutSessions(sessions || [])

      // Carregar logs nutricionais recentes
      const nutrition = await getUserNutritionLogs(user.id)
      setNutritionLogs(nutrition || [])

      // Carregar medições de progresso
      const measurements = await getUserProgressMeasurements(user.id)
      setProgressMeasurements(measurements || [])

      // Carregar estatísticas
      const stats = await getUserFitnessStats(user.id)
      setFitnessStats(stats)

      // Gerar recomendações personalizadas
      if (profile) {
        const recs = await generatePersonalizedRecommendations(user.id)
        setRecommendations(recs)
      }

    } catch (err) {
      console.error('Erro ao carregar dados fitness:', err)
      setError('Erro ao carregar dados do usuário')
    } finally {
      setLoading(false)
    }
  }

  // Criar ou atualizar perfil fitness
  const saveProfile = async (profileData: Partial<UserFitnessProfile>) => {
    if (!user?.id) return

    try {
      setError(null)
      
      if (fitnessProfile) {
        // Atualizar perfil existente
        const updated = await updateUserFitnessProfile(user.id, profileData)
        setFitnessProfile(updated)
      } else {
        // Criar novo perfil
        const newProfile = await createUserFitnessProfile({
          user_id: user.id,
          ...profileData
        } as UserFitnessProfile)
        setFitnessProfile(newProfile)
      }

      // Recarregar recomendações
      const recs = await generatePersonalizedRecommendations(user.id)
      setRecommendations(recs)

    } catch (err) {
      console.error('Erro ao salvar perfil:', err)
      setError('Erro ao salvar perfil')
      throw err
    }
  }

  // Registrar sessão de treino
  const saveWorkoutSession = async (sessionData: Omit<WorkoutSession, 'id' | 'user_id'>) => {
    if (!user?.id) return

    try {
      setError(null)
      
      const session = await logWorkoutSession({
        user_id: user.id,
        ...sessionData
      })

      setWorkoutSessions(prev => [session, ...prev])

      // Atualizar estatísticas
      const stats = await getUserFitnessStats(user.id)
      setFitnessStats(stats)

    } catch (err) {
      console.error('Erro ao salvar treino:', err)
      setError('Erro ao salvar sessão de treino')
      throw err
    }
  }

  // Registrar log nutricional
  const saveNutritionLog = async (nutritionData: Omit<NutritionLog, 'id' | 'user_id'>) => {
    if (!user?.id) return

    try {
      setError(null)
      
      const log = await logNutrition({
        user_id: user.id,
        ...nutritionData
      })

      setNutritionLogs(prev => [log, ...prev])

    } catch (err) {
      console.error('Erro ao salvar log nutricional:', err)
      setError('Erro ao salvar log nutricional')
      throw err
    }
  }

  // Registrar medição de progresso
  const saveProgressMeasurement = async (measurementData: Omit<ProgressMeasurement, 'id' | 'user_id'>) => {
    if (!user?.id) return

    try {
      setError(null)
      
      const measurement = await logProgressMeasurement({
        user_id: user.id,
        ...measurementData
      })

      setProgressMeasurements(prev => [measurement, ...prev])

      // Atualizar estatísticas
      const stats = await getUserFitnessStats(user.id)
      setFitnessStats(stats)

    } catch (err) {
      console.error('Erro ao salvar medição:', err)
      setError('Erro ao salvar medição de progresso')
      throw err
    }
  }

  // Calcular dados personalizados baseados no perfil
  const getPersonalizedData = () => {
    if (!fitnessProfile) return null

    const { current_weight, height, age, gender, activity_level, goal } = fitnessProfile

    // Cálculo TMB
    let tmb = 0
    if (gender === 'male') {
      tmb = 88.362 + (13.397 * current_weight) + (4.799 * height) - (5.677 * age)
    } else {
      tmb = 447.593 + (9.247 * current_weight) + (3.098 * height) - (4.330 * age)
    }

    // Multiplicadores de atividade
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    }

    const tdee = tmb * activityMultipliers[activity_level]

    // Calorias baseadas no objetivo
    let targetCalories = tdee
    let proteinGrams = current_weight * 2.0
    let fatGrams = current_weight * 1.0

    if (goal === 'cutting') {
      targetCalories = tdee - 500
      proteinGrams = current_weight * 2.2
      fatGrams = current_weight * 0.8
    } else if (goal === 'bulking') {
      targetCalories = tdee + 500
      proteinGrams = current_weight * 2.5
      fatGrams = current_weight * 1.2
    }

    const carbsGrams = (targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4

    return {
      tmb: Math.round(tmb),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      proteinGrams: Math.round(proteinGrams),
      carbsGrams: Math.round(carbsGrams),
      fatGrams: Math.round(fatGrams)
    }
  }

  return {
    // Estados
    fitnessProfile,
    workoutSessions,
    nutritionLogs,
    progressMeasurements,
    fitnessStats,
    recommendations,
    loading,
    error,

    // Funções
    saveProfile,
    saveWorkoutSession,
    saveNutritionLog,
    saveProgressMeasurement,
    loadUserData,
    getPersonalizedData
  }
}
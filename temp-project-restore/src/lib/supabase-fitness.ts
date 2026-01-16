import { supabase } from './supabase'

export interface UserFitnessProfile {
  id?: string
  user_id: string
  fitness_level: 'Iniciante' | 'Intermediário' | 'Avançado'
  current_weight: number
  target_weight: number
  height: number
  age: number
  gender: 'male' | 'female'
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal: 'cutting' | 'maintenance' | 'bulking'
  body_fat_percentage?: number
  preferences: {
    preferred_workout_days?: string[]
    dietary_restrictions?: string[]
    supplement_preferences?: string[]
    training_time_preference?: 'morning' | 'afternoon' | 'evening'
  }
  created_at?: string
  updated_at?: string
}

export interface WorkoutSession {
  id?: string
  user_id: string
  workout_name: string
  workout_type: string
  duration_minutes: number
  exercises_completed: number
  calories_burned?: number
  notes?: string
  completed_at: string
}

export interface NutritionLog {
  id?: string
  user_id: string
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  foods: string[]
  calories: number
  protein_grams: number
  carbs_grams: number
  fat_grams: number
  logged_at: string
}

export interface ProgressMeasurement {
  id?: string
  user_id: string
  weight: number
  body_fat_percentage?: number
  muscle_mass?: number
  measurements?: {
    chest?: number
    waist?: number
    hips?: number
    arms?: number
    thighs?: number
  }
  photos?: string[]
  notes?: string
  measured_at: string
}

// Funções para gerenciar perfil fitness do usuário
export const createUserFitnessProfile = async (profile: Omit<UserFitnessProfile, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('user_fitness_profiles')
    .insert([profile])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserFitnessProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_fitness_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export const updateUserFitnessProfile = async (userId: string, updates: Partial<UserFitnessProfile>) => {
  const { data, error } = await supabase
    .from('user_fitness_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Funções para sessões de treino
export const logWorkoutSession = async (session: Omit<WorkoutSession, 'id'>) => {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert([session])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserWorkoutSessions = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

// Funções para log nutricional
export const logNutrition = async (nutrition: Omit<NutritionLog, 'id'>) => {
  const { data, error } = await supabase
    .from('nutrition_logs')
    .insert([nutrition])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserNutritionLogs = async (userId: string, date?: string) => {
  let query = supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)

  if (date) {
    query = query.gte('logged_at', `${date}T00:00:00`)
             .lt('logged_at', `${date}T23:59:59`)
  }

  const { data, error } = await query.order('logged_at', { ascending: false })

  if (error) throw error
  return data
}

// Funções para medições de progresso
export const logProgressMeasurement = async (measurement: Omit<ProgressMeasurement, 'id'>) => {
  const { data, error } = await supabase
    .from('progress_measurements')
    .insert([measurement])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserProgressMeasurements = async (userId: string) => {
  const { data, error } = await supabase
    .from('progress_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: false })

  if (error) throw error
  return data
}

// Funções para estatísticas e relatórios
export const getUserFitnessStats = async (userId: string) => {
  const [workoutSessions, nutritionLogs, progressMeasurements] = await Promise.all([
    getUserWorkoutSessions(userId, 30),
    getUserNutritionLogs(userId),
    getUserProgressMeasurements(userId)
  ])

  const totalWorkouts = workoutSessions?.length || 0
  const totalCaloriesBurned = workoutSessions?.reduce((sum, session) => sum + (session.calories_burned || 0), 0) || 0
  const averageWorkoutDuration = workoutSessions?.length 
    ? workoutSessions.reduce((sum, session) => sum + session.duration_minutes, 0) / workoutSessions.length 
    : 0

  const latestWeight = progressMeasurements?.[0]?.weight
  const weightChange = progressMeasurements?.length >= 2 
    ? latestWeight - progressMeasurements[progressMeasurements.length - 1].weight 
    : 0

  return {
    totalWorkouts,
    totalCaloriesBurned,
    averageWorkoutDuration: Math.round(averageWorkoutDuration),
    latestWeight,
    weightChange: Math.round(weightChange * 10) / 10,
    workoutFrequency: totalWorkouts / 4, // workouts per week (assuming last 30 days)
    progressMeasurements: progressMeasurements?.slice(0, 10) || []
  }
}

// Função para gerar recomendações personalizadas
export const generatePersonalizedRecommendations = async (userId: string) => {
  const profile = await getUserFitnessProfile(userId)
  const stats = await getUserFitnessStats(userId)

  if (!profile) return []

  const recommendations = []

  // Recomendações baseadas no objetivo
  if (profile.goal === 'cutting') {
    recommendations.push({
      type: 'nutrition',
      title: 'Déficit Calórico Otimizado',
      description: `Mantenha um déficit de 300-500 kcal baseado no seu TDEE. Proteína: ${profile.current_weight * 2.2}g/dia`,
      priority: 'high'
    })
    
    if (stats.workoutFrequency < 4) {
      recommendations.push({
        type: 'workout',
        title: 'Aumente a Frequência de Treinos',
        description: 'Para cutting eficaz, recomendamos 4-5 treinos por semana com cardio adicional',
        priority: 'medium'
      })
    }
  } else if (profile.goal === 'bulking') {
    recommendations.push({
      type: 'nutrition',
      title: 'Superávit Calórico Controlado',
      description: `Mantenha um superávit de 300-500 kcal. Proteína: ${profile.current_weight * 2.5}g/dia`,
      priority: 'high'
    })
    
    recommendations.push({
      type: 'workout',
      title: 'Foco em Treinos de Força',
      description: 'Priorize exercícios compostos e progressão de cargas para máximo ganho de massa',
      priority: 'high'
    })
  }

  // Recomendações baseadas no nível fitness
  if (profile.fitness_level === 'Iniciante') {
    recommendations.push({
      type: 'general',
      title: 'Foque na Técnica',
      description: 'Primeiros 3 meses são cruciais para aprender movimentos corretos e criar hábitos',
      priority: 'high'
    })
  } else if (profile.fitness_level === 'Avançado') {
    recommendations.push({
      type: 'workout',
      title: 'Periodização Avançada',
      description: 'Considere ciclos de treino e técnicas avançadas como drop sets e supersets',
      priority: 'medium'
    })
  }

  // Recomendações baseadas na frequência de treino
  if (stats.workoutFrequency < 2) {
    recommendations.push({
      type: 'motivation',
      title: 'Consistência é a Chave',
      description: 'Tente treinar pelo menos 3x por semana. Pequenos passos levam a grandes resultados!',
      priority: 'high'
    })
  }

  return recommendations
}
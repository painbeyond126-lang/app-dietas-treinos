'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Play, Pause, CheckCircle, Clock, Flame, ArrowLeft, Trophy, Target, TrendingUp, TrendingDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type WorkoutPlan = 'bulking' | 'cutting' | null

export default function WorkoutPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [completedExercises, setCompletedExercises] = useState<number[]>([])
  const [caloriesBurned, setCaloriesBurned] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan>(null)
  const [showPlanSelector, setShowPlanSelector] = useState(true)

  // Exemplo de treino
  const workout = {
    name: 'Peito e Tríceps',
    level: 'Intermediário',
    exercises: [
      { id: 1, name: 'Supino Reto', sets: '4x10-12', rest: 90, caloriesPerSet: 8 },
      { id: 2, name: 'Supino Inclinado', sets: '4x10-12', rest: 90, caloriesPerSet: 8 },
      { id: 3, name: 'Crucifixo', sets: '3x12-15', rest: 60, caloriesPerSet: 6 },
      { id: 4, name: 'Tríceps Testa', sets: '4x10-12', rest: 90, caloriesPerSet: 7 },
      { id: 5, name: 'Tríceps Pulley', sets: '3x12-15', rest: 60, caloriesPerSet: 6 }
    ]
  }

  // Timer do treino
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isWorkoutActive && workoutStartTime) {
      interval = setInterval(() => {
        const now = new Date()
        const diff = Math.floor((now.getTime() - workoutStartTime.getTime()) / 1000)
        setElapsedTime(diff)
        // Cálculo de calorias baseado no plano
        const baseCalories = Math.floor(diff / 60 * 5)
        const multiplier = selectedPlan === 'bulking' ? 1.2 : selectedPlan === 'cutting' ? 1.5 : 1
        setCaloriesBurned(Math.floor(baseCalories * multiplier))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isWorkoutActive, workoutStartTime, selectedPlan])

  const selectPlan = (plan: WorkoutPlan) => {
    setSelectedPlan(plan)
    setShowPlanSelector(false)
  }

  const startWorkout = () => {
    if (!selectedPlan) {
      alert('⚠️ Selecione um plano (Bulking ou Cutting) antes de começar!')
      return
    }
    setIsWorkoutActive(true)
    setWorkoutStartTime(new Date())
  }

  const pauseWorkout = () => {
    setIsWorkoutActive(false)
  }

  const completeExercise = (exerciseId: number) => {
    if (!completedExercises.includes(exerciseId)) {
      setCompletedExercises([...completedExercises, exerciseId])
      
      // Notificação visual
      const exercise = workout.exercises.find(e => e.id === exerciseId)
      if (exercise) {
        // Adicionar calorias do exercício
        const exerciseCalories = exercise.caloriesPerSet * parseInt(exercise.sets.split('x')[0])
        setCaloriesBurned(prev => prev + exerciseCalories)
        
        // Mostrar notificação
        alert(`✅ ${exercise.name} concluído!\n🔥 +${exerciseCalories} calorias queimadas`)
      }
      
      if (currentExerciseIndex < workout.exercises.length - 1) {
        setCurrentExerciseIndex(currentExerciseIndex + 1)
      }
    }
  }

  const finishWorkout = async () => {
    if (!supabase || !user) {
      console.error('Supabase não configurado ou usuário não autenticado')
      router.push('/progress')
      return
    }

    try {
      // Salvar sessão de treino no Supabase
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          workout_name: workout.name,
          workout_type: selectedPlan,
          duration_seconds: elapsedTime,
          calories_burned: caloriesBurned,
          exercises_completed: completedExercises.length,
          total_exercises: workout.exercises.length,
          completed_at: new Date().toISOString()
        })
        .select()

      if (error) {
        console.error('Erro ao salvar treino:', error)
        alert('⚠️ Erro ao salvar treino, mas você pode continuar!')
      } else {
        console.log('✅ Treino salvo com sucesso:', data)
        alert(`🎉 Treino salvo com sucesso!\n⏱️ Tempo: ${formatTime(elapsedTime)}\n🔥 Calorias: ${caloriesBurned}`)
      }

      // Atualizar plano ativo do usuário
      await supabase
        .from('active_nutrition_plans')
        .upsert({
          user_id: user.id,
          plan_type: selectedPlan,
          plan_name: selectedPlan === 'bulking' ? 'Bulking' : 'Cutting',
          is_active: true,
          start_date: new Date().toISOString().split('T')[0]
        })

      router.push('/progress')
    } catch (error) {
      console.error('Erro ao finalizar treino:', error)
      router.push('/progress')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = (completedExercises.length / workout.exercises.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-gray-600 text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Badge className="bg-purple-600 text-white">
            {workout.level}
          </Badge>
        </div>

        {/* Seletor de Plano */}
        {showPlanSelector && !selectedPlan && (
          <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white text-2xl flex items-center gap-2">
                <Target className="h-6 w-6" />
                Selecione Seu Plano
              </CardTitle>
              <CardDescription className="text-purple-200">
                Escolha seu objetivo para otimizar o treino
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => selectPlan('bulking')}
                className="h-32 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white flex flex-col items-center justify-center gap-2"
              >
                <TrendingUp className="h-12 w-12" />
                <div className="text-center">
                  <p className="text-xl font-bold">BULKING</p>
                  <p className="text-sm opacity-90">Ganho de Massa Muscular</p>
                </div>
              </Button>
              <Button
                onClick={() => selectPlan('cutting')}
                className="h-32 bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white flex flex-col items-center justify-center gap-2"
              >
                <TrendingDown className="h-12 w-12" />
                <div className="text-center">
                  <p className="text-xl font-bold">CUTTING</p>
                  <p className="text-sm opacity-90">Definição e Perda de Gordura</p>
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Plano Selecionado */}
        {selectedPlan && (
          <Card className={`border-2 ${
            selectedPlan === 'bulking' 
              ? 'bg-blue-900/20 border-blue-700' 
              : 'bg-orange-900/20 border-orange-700'
          }`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedPlan === 'bulking' ? (
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-orange-400" />
                )}
                <div>
                  <p className="text-white font-bold text-lg">
                    {selectedPlan === 'bulking' ? 'BULKING' : 'CUTTING'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {selectedPlan === 'bulking' 
                      ? 'Foco em ganho de massa muscular' 
                      : 'Foco em definição e perda de gordura'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedPlan(null)
                  setShowPlanSelector(true)
                }}
                className="border-gray-600 text-gray-300"
              >
                Trocar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Workout Info */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl">{workout.name}</CardTitle>
            <CardDescription className="text-gray-400">
              {workout.exercises.length} exercícios • Nível {workout.level}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-2 mb-4" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{formatTime(elapsedTime)}</p>
                <p className="text-xs text-gray-400">Tempo</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{caloriesBurned}</p>
                <p className="text-xs text-gray-400">Calorias</p>
              </div>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{completedExercises.length}/{workout.exercises.length}</p>
                <p className="text-xs text-gray-400">Exercícios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Control Buttons */}
        {!isWorkoutActive && completedExercises.length === 0 && selectedPlan && (
          <Button
            onClick={startWorkout}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6 text-lg"
          >
            <Play className="h-6 w-6 mr-2" />
            Começar Treino
          </Button>
        )}

        {isWorkoutActive && (
          <Button
            onClick={pauseWorkout}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold py-6 text-lg"
          >
            <Pause className="h-6 w-6 mr-2" />
            Pausar Treino
          </Button>
        )}

        {/* Exercises List */}
        <div className="space-y-4">
          {workout.exercises.map((exercise, index) => {
            const isCompleted = completedExercises.includes(exercise.id)
            const isCurrent = index === currentExerciseIndex && isWorkoutActive

            return (
              <Card
                key={exercise.id}
                className={`border-2 transition-all ${
                  isCompleted
                    ? 'bg-green-900/20 border-green-700'
                    : isCurrent
                    ? 'bg-blue-900/20 border-blue-700 shadow-lg shadow-blue-500/20'
                    : 'bg-gray-800/50 border-gray-700'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          isCompleted
                            ? 'bg-green-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="h-6 w-6" /> : index + 1}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{exercise.name}</h3>
                        <p className="text-sm text-gray-400">
                          {exercise.sets} • Descanso: {exercise.rest}s • {exercise.caloriesPerSet * parseInt(exercise.sets.split('x')[0])} cal
                        </p>
                      </div>
                    </div>
                    {!isCompleted && isWorkoutActive && (
                      <Button
                        onClick={() => completeExercise(exercise.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Concluir
                      </Button>
                    )}
                    {isCompleted && (
                      <Badge className="bg-green-600 text-white">
                        Concluído ✓
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Finish Workout */}
        {completedExercises.length === workout.exercises.length && (
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-green-500">
            <CardContent className="p-6 text-center">
              <Trophy className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Treino Concluído! 🎉</h2>
              <p className="text-green-100 mb-4">
                Parabéns! Você completou todos os exercícios em {formatTime(elapsedTime)}
              </p>
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <p className="text-white font-semibold">
                  🔥 Total de {caloriesBurned} calorias queimadas
                </p>
                <p className="text-green-100 text-sm mt-1">
                  Plano: {selectedPlan === 'bulking' ? 'BULKING' : 'CUTTING'}
                </p>
              </div>
              <Button
                onClick={finishWorkout}
                className="bg-white text-green-600 hover:bg-gray-100 font-semibold"
              >
                Finalizar e Salvar Progresso
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

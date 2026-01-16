'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Camera,
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Calendar,
  Flame,
  Dumbbell,
  Image as ImageIcon,
  Upload,
  Save,
  BarChart3,
  Target
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface BodyMeasurement {
  id: string
  weight: number
  body_fat: number
  measured_at: string
}

interface WorkoutSession {
  id: string
  workout_name: string
  duration_seconds: number
  calories_burned: number
  completed_at: string
  workout_type: string
}

export default function ProgressPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  // Estados para medidas corporais
  const [weight, setWeight] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [chest, setChest] = useState('')
  const [waist, setWaist] = useState('')
  const [hips, setHips] = useState('')
  const [arms, setArms] = useState('')
  const [thighs, setThighs] = useState('')
  const [notes, setNotes] = useState('')

  // Estados para fotos de progresso
  const [photoType, setPhotoType] = useState<'inicio' | 'meio' | 'final'>('inicio')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Estados para estatísticas
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalCalories: 0,
    currentWeight: 0,
    initialWeight: 0,
    weightChange: 0,
    currentPlan: null as string | null,
    progressPhotos: {
      inicio: null as string | null,
      meio: null as string | null,
      final: null as string | null
    }
  })

  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([])
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([])

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      loadUserProgress()
    }
  }, [user])

  const loadUserProgress = async () => {
    if (!supabase || !user) {
      console.warn('Supabase não configurado ou usuário não autenticado')
      return
    }

    try {
      // Carregar estatísticas de treinos
      const { data: workoutsData, error: workoutsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (workoutsError) {
        console.error('Erro ao carregar treinos:', workoutsError)
      } else if (workoutsData) {
        setWorkouts(workoutsData)
        const totalCalories = workoutsData.reduce((sum, w) => sum + (w.calories_burned || 0), 0)
        setStats(prev => ({
          ...prev,
          totalWorkouts: workoutsData.length,
          totalCalories
        }))
      }

      // Carregar medidas corporais
      const { data: measurementsData, error: measurementsError } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measured_at', { ascending: false })

      if (measurementsError) {
        console.error('Erro ao carregar medidas:', measurementsError)
      } else if (measurementsData && measurementsData.length > 0) {
        setMeasurements(measurementsData)
        const latest = measurementsData[0]
        const oldest = measurementsData[measurementsData.length - 1]
        
        setWeight(latest.weight?.toString() || '')
        setBodyFat(latest.body_fat?.toString() || '')
        setChest(latest.chest?.toString() || '')
        setWaist(latest.waist?.toString() || '')
        setHips(latest.hips?.toString() || '')
        setArms(latest.arms?.toString() || '')
        setThighs(latest.thighs?.toString() || '')

        const weightChange = (latest.weight || 0) - (oldest.weight || 0)
        setStats(prev => ({
          ...prev,
          currentWeight: latest.weight || 0,
          initialWeight: oldest.weight || 0,
          weightChange: parseFloat(weightChange.toFixed(1))
        }))
      }

      // Carregar fotos de progresso
      const { data: photosData, error: photosError } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (photosError) {
        console.error('Erro ao carregar fotos:', photosError)
      } else if (photosData) {
        const progressPhotos = {
          inicio: photosData.find(p => p.photo_type === 'inicio')?.photo_url || null,
          meio: photosData.find(p => p.photo_type === 'meio')?.photo_url || null,
          final: photosData.find(p => p.photo_type === 'final')?.photo_url || null
        }
        setStats(prev => ({ ...prev, progressPhotos }))
      }

      // Carregar plano ativo
      const { data: planData, error: planError } = await supabase
        .from('active_nutrition_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('start_date', { ascending: false })
        .limit(1)

      if (planError) {
        console.error('Erro ao carregar plano:', planError)
      } else if (planData && planData.length > 0) {
        setStats(prev => ({ ...prev, currentPlan: planData[0].plan_type }))
      }

    } catch (error) {
      console.error('Erro ao carregar progresso:', error)
    }
  }

  const saveMeasurements = async () => {
    if (!supabase || !user) {
      alert('⚠️ Supabase não configurado. Configure as variáveis de ambiente.')
      return
    }

    if (!weight && !bodyFat && !chest && !waist && !hips && !arms && !thighs) {
      alert('⚠️ Preencha pelo menos uma medida!')
      return
    }

    try {
      const { error } = await supabase
        .from('body_measurements')
        .insert({
          user_id: user.id,
          weight: parseFloat(weight) || null,
          body_fat: parseFloat(bodyFat) || null,
          chest: parseFloat(chest) || null,
          waist: parseFloat(waist) || null,
          hips: parseFloat(hips) || null,
          arms: parseFloat(arms) || null,
          thighs: parseFloat(thighs) || null,
          notes: notes || null,
          measured_at: new Date().toISOString()
        })

      if (error) throw error

      alert('✅ Medidas salvas com sucesso!')
      setNotes('')
      loadUserProgress()
    } catch (error) {
      console.error('Erro ao salvar medidas:', error)
      alert('❌ Erro ao salvar medidas. Verifique sua conexão.')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('⚠️ Arquivo muito grande! Máximo 5MB.')
        return
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('⚠️ Apenas imagens são permitidas!')
        return
      }

      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const uploadPhoto = async () => {
    if (!supabase || !user || !selectedFile) {
      alert('⚠️ Selecione uma foto primeiro!')
      return
    }

    try {
      setUploadProgress(10)

      // Upload para Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${photoType}_${Date.now()}.${fileExt}`
      
      setUploadProgress(30)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Erro no upload:', uploadError)
        throw uploadError
      }

      setUploadProgress(60)

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName)

      setUploadProgress(80)

      // Salvar referência no banco
      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          photo_type: photoType,
          photo_url: publicUrl,
          taken_at: new Date().toISOString()
        })

      if (dbError) throw dbError

      setUploadProgress(100)

      alert(`✅ Foto de ${photoType === 'inicio' ? 'INÍCIO' : photoType === 'meio' ? 'DURANTE' : 'RESULTADO FINAL'} enviada com sucesso!`)
      setSelectedFile(null)
      setPreviewUrl(null)
      setUploadProgress(0)
      loadUserProgress()
    } catch (error) {
      console.error('Erro ao enviar foto:', error)
      alert('❌ Erro ao enviar foto. Verifique se o bucket "progress-photos" existe no Supabase Storage.')
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
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
          <h1 className="text-2xl font-bold text-white">Meu Progresso</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
            <CardContent className="p-6 text-center">
              <Dumbbell className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{stats.totalWorkouts}</p>
              <p className="text-sm text-blue-300">Treinos Realizados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700">
            <CardContent className="p-6 text-center">
              <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{stats.totalCalories}</p>
              <p className="text-sm text-orange-300">Calorias Queimadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
            <CardContent className="p-6 text-center">
              <Scale className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-white">{stats.currentWeight || '--'} kg</p>
              <p className="text-sm text-green-300">Peso Atual</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
            <CardContent className="p-6 text-center">
              {stats.weightChange >= 0 ? (
                <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              ) : (
                <TrendingDown className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              )}
              <p className="text-3xl font-bold text-white">
                {stats.weightChange > 0 ? '+' : ''}{stats.weightChange} kg
              </p>
              <p className="text-sm text-purple-300">Variação de Peso</p>
            </CardContent>
          </Card>
        </div>

        {/* Plano Ativo */}
        {stats.currentPlan && (
          <Card className={`border-2 ${
            stats.currentPlan === 'bulking' 
              ? 'bg-blue-900/20 border-blue-700' 
              : 'bg-orange-900/20 border-orange-700'
          }`}>
            <CardContent className="p-4 flex items-center gap-3">
              <Target className="h-8 w-8 text-white" />
              <div>
                <p className="text-white font-bold text-lg">
                  Plano Ativo: {stats.currentPlan === 'bulking' ? 'BULKING' : 'CUTTING'}
                </p>
                <p className="text-sm text-gray-300">
                  {stats.currentPlan === 'bulking' 
                    ? 'Foco em ganho de massa muscular' 
                    : 'Foco em definição e perda de gordura'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700 text-gray-300">
              <BarChart3 className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="measurements" className="data-[state=active]:bg-gray-700 text-gray-300">
              <Ruler className="h-4 w-4 mr-2" />
              Medidas
            </TabsTrigger>
            <TabsTrigger value="photos" className="data-[state=active]:bg-gray-700 text-gray-300">
              <Camera className="h-4 w-4 mr-2" />
              Fotos
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Histórico de Treinos</CardTitle>
                <CardDescription className="text-gray-400">
                  Seus últimos treinos realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workouts.length === 0 ? (
                  <div className="text-center py-12">
                    <Dumbbell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nenhum treino registrado ainda</p>
                    <p className="text-gray-500 text-sm mt-2">Comece seu primeiro treino para ver o progresso aqui!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workouts.slice(0, 10).map((workout) => (
                      <div
                        key={workout.id}
                        className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-600 p-3 rounded-lg">
                            <Dumbbell className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{workout.workout_name}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(workout.completed_at).toLocaleDateString('pt-BR')} • 
                              {Math.floor(workout.duration_seconds / 60)} min • 
                              {workout.calories_burned} cal
                            </p>
                          </div>
                        </div>
                        <Badge className={
                          workout.workout_type === 'bulking' 
                            ? 'bg-blue-600' 
                            : 'bg-orange-600'
                        }>
                          {workout.workout_type === 'bulking' ? 'BULKING' : 'CUTTING'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Evolução de Peso</CardTitle>
                <CardDescription className="text-gray-400">
                  Histórico das suas medidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {measurements.length === 0 ? (
                  <div className="text-center py-12">
                    <Scale className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nenhuma medida registrada ainda</p>
                    <p className="text-gray-500 text-sm mt-2">Registre suas medidas para acompanhar a evolução!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {measurements.slice(0, 5).map((measurement) => (
                      <div
                        key={measurement.id}
                        className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-green-600 p-3 rounded-lg">
                            <Scale className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold">{measurement.weight} kg</p>
                            <p className="text-sm text-gray-400">
                              {new Date(measurement.measured_at).toLocaleDateString('pt-BR')}
                              {measurement.body_fat && ` • ${measurement.body_fat}% gordura`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Measurements Tab */}
          <TabsContent value="measurements" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Ruler className="h-6 w-6" />
                  Registrar Medidas Corporais
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Acompanhe suas medidas e evolução corporal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Peso (kg)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Ex: 75.5"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Gordura Corporal (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={bodyFat}
                      onChange={(e) => setBodyFat(e.target.value)}
                      placeholder="Ex: 15.5"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Peitoral (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={chest}
                      onChange={(e) => setChest(e.target.value)}
                      placeholder="Ex: 100"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Cintura (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={waist}
                      onChange={(e) => setWaist(e.target.value)}
                      placeholder="Ex: 80"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Quadril (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={hips}
                      onChange={(e) => setHips(e.target.value)}
                      placeholder="Ex: 95"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Braços (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={arms}
                      onChange={(e) => setArms(e.target.value)}
                      placeholder="Ex: 38"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Coxas (cm)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={thighs}
                      onChange={(e) => setThighs(e.target.value)}
                      placeholder="Ex: 55"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Observações</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Como você está se sentindo? Alguma mudança notável?"
                    className="bg-gray-700 border-gray-600 text-white"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={saveMeasurements}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Medidas
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            {/* Comparação de Fotos */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Camera className="h-6 w-6" />
                  Fotos de Progresso - Antes, Durante e Depois
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Compare sua evolução visual ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Foto Início */}
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-4 border-2 border-blue-700">
                      <div className="aspect-[3/4] bg-gray-800 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                        {stats.progressPhotos.inicio ? (
                          <img
                            src={stats.progressPhotos.inicio}
                            alt="Foto Início"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Sem foto</p>
                          </div>
                        )}
                      </div>
                      <Badge className="w-full justify-center bg-blue-600 text-white">
                        INÍCIO
                      </Badge>
                    </div>
                  </div>

                  {/* Foto Meio */}
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-4 border-2 border-yellow-700">
                      <div className="aspect-[3/4] bg-gray-800 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                        {stats.progressPhotos.meio ? (
                          <img
                            src={stats.progressPhotos.meio}
                            alt="Foto Meio"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Sem foto</p>
                          </div>
                        )}
                      </div>
                      <Badge className="w-full justify-center bg-yellow-600 text-white">
                        DURANTE
                      </Badge>
                    </div>
                  </div>

                  {/* Foto Final */}
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-4 border-2 border-green-700">
                      <div className="aspect-[3/4] bg-gray-800 rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                        {stats.progressPhotos.final ? (
                          <img
                            src={stats.progressPhotos.final}
                            alt="Foto Final"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center">
                            <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Sem foto</p>
                          </div>
                        )}
                      </div>
                      <Badge className="w-full justify-center bg-green-600 text-white">
                        RESULTADO FINAL
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upload de Foto */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="h-6 w-6" />
                  Enviar Nova Foto
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Registre seu progresso visual (máx 5MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Tipo de Foto</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={photoType === 'inicio' ? 'default' : 'outline'}
                      onClick={() => setPhotoType('inicio')}
                      className="w-full"
                    >
                      Início
                    </Button>
                    <Button
                      variant={photoType === 'meio' ? 'default' : 'outline'}
                      onClick={() => setPhotoType('meio')}
                      className="w-full"
                    >
                      Durante
                    </Button>
                    <Button
                      variant={photoType === 'final' ? 'default' : 'outline'}
                      onClick={() => setPhotoType('final')}
                      className="w-full"
                    >
                      Final
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Selecionar Foto</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                {previewUrl && (
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <p className="text-gray-300 mb-2">Preview:</p>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-w-xs mx-auto rounded-lg"
                    />
                  </div>
                )}

                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm">Enviando... {uploadProgress}%</p>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={uploadPhoto}
                  disabled={!selectedFile || uploadProgress > 0}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar Foto
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

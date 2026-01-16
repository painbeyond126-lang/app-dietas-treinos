'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Scale,
  Ruler,
  Flame,
  Target,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Activity
} from 'lucide-react'

type ProgressPhoto = {
  id: string
  photo_type: 'inicio' | 'meio' | 'final'
  photo_url: string
  date: string
  notes?: string
}

type ProgressEntry = {
  id: string
  date: string
  weight: number
  body_fat_percentage?: number
  muscle_mass?: number
  chest_measurement?: number
  waist_measurement?: number
  hip_measurement?: number
  arm_measurement?: number
  thigh_measurement?: number
  notes?: string
}

type WorkoutSession = {
  id: string
  workout_name: string
  workout_level: string
  duration_minutes: number
  calories_burned: number
  exercises_completed: number
  date: string
}

export function ProgressTracker() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([])
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([])
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([])
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  // Estados para novo registro de progresso
  const [newProgress, setNewProgress] = useState({
    weight: '',
    body_fat_percentage: '',
    muscle_mass: '',
    chest_measurement: '',
    waist_measurement: '',
    hip_measurement: '',
    arm_measurement: '',
    thigh_measurement: '',
    notes: ''
  })

  // Carregar dados do usuário
  useEffect(() => {
    if (user) {
      loadProgressData()
    }
  }, [user])

  const loadProgressData = async () => {
    if (!user || !supabase) return

    setLoading(true)
    try {
      // Carregar fotos de progresso
      const { data: photos } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (photos) setProgressPhotos(photos)

      // Carregar entradas de progresso
      const { data: entries } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(10)

      if (entries) setProgressEntries(entries)

      // Carregar sessões de treino
      const { data: sessions } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(20)

      if (sessions) setWorkoutSessions(sessions)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, photoType: 'inicio' | 'meio' | 'final') => {
    const file = event.target.files?.[0]
    if (!file || !user || !supabase) return

    setUploadingPhoto(true)
    try {
      // Upload da foto para o Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${photoType}_${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Obter URL pública da foto
      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName)

      // Salvar referência no banco de dados
      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: user.id,
          photo_type: photoType,
          photo_url: publicUrl,
          date: new Date().toISOString().split('T')[0]
        })

      if (dbError) throw dbError

      // Recarregar fotos
      await loadProgressData()
      alert(`Foto de ${photoType} enviada com sucesso!`)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao enviar foto. Tente novamente.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const saveProgressEntry = async () => {
    if (!user || !supabase || !newProgress.weight) {
      alert('Preencha pelo menos o peso')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          weight: parseFloat(newProgress.weight),
          body_fat_percentage: newProgress.body_fat_percentage ? parseFloat(newProgress.body_fat_percentage) : null,
          muscle_mass: newProgress.muscle_mass ? parseFloat(newProgress.muscle_mass) : null,
          chest_measurement: newProgress.chest_measurement ? parseFloat(newProgress.chest_measurement) : null,
          waist_measurement: newProgress.waist_measurement ? parseFloat(newProgress.waist_measurement) : null,
          hip_measurement: newProgress.hip_measurement ? parseFloat(newProgress.hip_measurement) : null,
          arm_measurement: newProgress.arm_measurement ? parseFloat(newProgress.arm_measurement) : null,
          thigh_measurement: newProgress.thigh_measurement ? parseFloat(newProgress.thigh_measurement) : null,
          notes: newProgress.notes || null,
          date: new Date().toISOString().split('T')[0]
        })

      if (error) throw error

      // Limpar formulário
      setNewProgress({
        weight: '',
        body_fat_percentage: '',
        muscle_mass: '',
        chest_measurement: '',
        waist_measurement: '',
        hip_measurement: '',
        arm_measurement: '',
        thigh_measurement: '',
        notes: ''
      })

      // Recarregar dados
      await loadProgressData()
      alert('Progresso registrado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar progresso:', error)
      alert('Erro ao salvar progresso. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Calcular estatísticas
  const totalCaloriesBurned = workoutSessions.reduce((sum, session) => sum + (session.calories_burned || 0), 0)
  const totalWorkouts = workoutSessions.length
  const totalMinutes = workoutSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
  
  const weightProgress = progressEntries.length >= 2 
    ? progressEntries[0].weight - progressEntries[progressEntries.length - 1].weight 
    : 0

  const getPhotoByType = (type: 'inicio' | 'meio' | 'final') => {
    return progressPhotos.find(photo => photo.photo_type === type)
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-300">Treinos Realizados</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalWorkouts}</div>
            <p className="text-xs text-blue-200">Total de sessões</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-300">Calorias Queimadas</CardTitle>
            <Flame className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalCaloriesBurned.toLocaleString()}</div>
            <p className="text-xs text-red-200">Total acumulado</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-300">Tempo de Treino</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Math.round(totalMinutes / 60)}h</div>
            <p className="text-xs text-purple-200">{totalMinutes} minutos total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-300">Progresso de Peso</CardTitle>
            {weightProgress < 0 ? <TrendingDown className="h-4 w-4 text-green-400" /> : <TrendingUp className="h-4 w-4 text-green-400" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Math.abs(weightProgress).toFixed(1)} kg</div>
            <p className="text-xs text-green-200">{weightProgress < 0 ? 'Perdidos' : 'Ganhos'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Fotos de Progresso - Antes, Durante e Depois */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Camera className="h-6 w-6" />
            Fotos de Progresso - Antes, Durante e Depois
          </CardTitle>
          <CardDescription className="text-gray-400">
            Registre sua transformação visual em 3 momentos: Início, Meio do Projeto e Resultado Final
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Foto Início */}
            <div className="space-y-3">
              <div className="text-center">
                <Badge className="bg-blue-700 text-blue-300 mb-2">INÍCIO DO PROJETO</Badge>
                <p className="text-sm text-gray-400">Dia 1 - Ponto de Partida</p>
              </div>
              {getPhotoByType('inicio') ? (
                <div className="relative group">
                  <img 
                    src={getPhotoByType('inicio')!.photo_url} 
                    alt="Foto Início" 
                    className="w-full h-64 object-cover rounded-lg border-2 border-blue-700"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(getPhotoByType('inicio')!.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-lg h-64 flex flex-col items-center justify-center bg-gray-900/30">
                  <ImageIcon className="h-12 w-12 text-gray-600 mb-3" />
                  <Label htmlFor="photo-inicio" className="cursor-pointer">
                    <div className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Enviar Foto Início
                    </div>
                  </Label>
                  <Input
                    id="photo-inicio"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, 'inicio')}
                    disabled={uploadingPhoto}
                  />
                  <p className="text-xs text-gray-500 mt-2">Tire no primeiro dia</p>
                </div>
              )}
            </div>

            {/* Foto Meio */}
            <div className="space-y-3">
              <div className="text-center">
                <Badge className="bg-yellow-700 text-yellow-300 mb-2">MEIO DO PROJETO</Badge>
                <p className="text-sm text-gray-400">50% do Tempo - Evolução</p>
              </div>
              {getPhotoByType('meio') ? (
                <div className="relative group">
                  <img 
                    src={getPhotoByType('meio')!.photo_url} 
                    alt="Foto Meio" 
                    className="w-full h-64 object-cover rounded-lg border-2 border-yellow-700"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(getPhotoByType('meio')!.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-lg h-64 flex flex-col items-center justify-center bg-gray-900/30">
                  <ImageIcon className="h-12 w-12 text-gray-600 mb-3" />
                  <Label htmlFor="photo-meio" className="cursor-pointer">
                    <div className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Enviar Foto Meio
                    </div>
                  </Label>
                  <Input
                    id="photo-meio"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, 'meio')}
                    disabled={uploadingPhoto}
                  />
                  <p className="text-xs text-gray-500 mt-2">Tire na metade do tempo</p>
                </div>
              )}
            </div>

            {/* Foto Final */}
            <div className="space-y-3">
              <div className="text-center">
                <Badge className="bg-green-700 text-green-300 mb-2">RESULTADO FINAL</Badge>
                <p className="text-sm text-gray-400">100% - Transformação Completa</p>
              </div>
              {getPhotoByType('final') ? (
                <div className="relative group">
                  <img 
                    src={getPhotoByType('final')!.photo_url} 
                    alt="Foto Final" 
                    className="w-full h-64 object-cover rounded-lg border-2 border-green-700"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(getPhotoByType('final')!.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-600 rounded-lg h-64 flex flex-col items-center justify-center bg-gray-900/30">
                  <ImageIcon className="h-12 w-12 text-gray-600 mb-3" />
                  <Label htmlFor="photo-final" className="cursor-pointer">
                    <div className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Enviar Foto Final
                    </div>
                  </Label>
                  <Input
                    id="photo-final"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, 'final')}
                    disabled={uploadingPhoto}
                  />
                  <p className="text-xs text-gray-500 mt-2">Tire ao completar o projeto</p>
                </div>
              )}
            </div>
          </div>

          {uploadingPhoto && (
            <div className="mt-4 bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 text-center">
              <p className="text-blue-300 text-sm">Enviando foto... Aguarde.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Registrar Novo Progresso */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-6 w-6" />
            Registrar Progresso Corporal
          </CardTitle>
          <CardDescription className="text-gray-400">
            Acompanhe suas medidas, peso e evolução física
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <Scale className="h-4 w-4" />
                Peso (kg) *
              </Label>
              <Input
                type="number"
                step="0.1"
                value={newProgress.weight}
                onChange={(e) => setNewProgress({...newProgress, weight: e.target.value})}
                placeholder="Ex: 75.5"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">% Gordura Corporal</Label>
              <Input
                type="number"
                step="0.1"
                value={newProgress.body_fat_percentage}
                onChange={(e) => setNewProgress({...newProgress, body_fat_percentage: e.target.value})}
                placeholder="Ex: 15.5"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Massa Muscular (kg)</Label>
              <Input
                type="number"
                step="0.1"
                value={newProgress.muscle_mass}
                onChange={(e) => setNewProgress({...newProgress, muscle_mass: e.target.value})}
                placeholder="Ex: 60.0"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Peito (cm)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={newProgress.chest_measurement}
                onChange={(e) => setNewProgress({...newProgress, chest_measurement: e.target.value})}
                placeholder="Ex: 100.0"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Cintura (cm)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={newProgress.waist_measurement}
                onChange={(e) => setNewProgress({...newProgress, waist_measurement: e.target.value})}
                placeholder="Ex: 80.0"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Quadril (cm)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={newProgress.hip_measurement}
                onChange={(e) => setNewProgress({...newProgress, hip_measurement: e.target.value})}
                placeholder="Ex: 95.0"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Braço (cm)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={newProgress.arm_measurement}
                onChange={(e) => setNewProgress({...newProgress, arm_measurement: e.target.value})}
                placeholder="Ex: 35.0"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300 flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Coxa (cm)
              </Label>
              <Input
                type="number"
                step="0.1"
                value={newProgress.thigh_measurement}
                onChange={(e) => setNewProgress({...newProgress, thigh_measurement: e.target.value})}
                placeholder="Ex: 55.0"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <Label className="text-gray-300">Observações</Label>
            <Textarea
              value={newProgress.notes}
              onChange={(e) => setNewProgress({...newProgress, notes: e.target.value})}
              placeholder="Como você está se sentindo? Alguma mudança notável?"
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          <Button 
            onClick={saveProgressEntry} 
            disabled={loading || !newProgress.weight}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Salvar Progresso
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Progresso */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Histórico de Progresso
          </CardTitle>
          <CardDescription className="text-gray-400">
            Suas últimas medições e evolução
          </CardDescription>
        </CardHeader>
        <CardContent>
          {progressEntries.length > 0 ? (
            <div className="space-y-3">
              {progressEntries.map((entry) => (
                <div key={entry.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-semibold">{new Date(entry.date).toLocaleDateString('pt-BR')}</p>
                      <p className="text-sm text-gray-400">Peso: {entry.weight} kg</p>
                    </div>
                    {entry.body_fat_percentage && (
                      <Badge variant="outline" className="text-xs">
                        {entry.body_fat_percentage}% gordura
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {entry.chest_measurement && (
                      <div className="text-gray-400">
                        <span className="text-gray-500">Peito:</span> {entry.chest_measurement}cm
                      </div>
                    )}
                    {entry.waist_measurement && (
                      <div className="text-gray-400">
                        <span className="text-gray-500">Cintura:</span> {entry.waist_measurement}cm
                      </div>
                    )}
                    {entry.arm_measurement && (
                      <div className="text-gray-400">
                        <span className="text-gray-500">Braço:</span> {entry.arm_measurement}cm
                      </div>
                    )}
                    {entry.thigh_measurement && (
                      <div className="text-gray-400">
                        <span className="text-gray-500">Coxa:</span> {entry.thigh_measurement}cm
                      </div>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">{entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">Nenhum progresso registrado ainda</p>
              <p className="text-sm text-gray-500">Comece registrando suas medidas acima!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSimpleAuth } from '@/hooks/useSimpleAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calculator, 
  Dumbbell, 
  UtensilsCrossed, 
  MessageCircle, 
  LogOut, 
  Activity,
  Target,
  Clock,
  Flame,
  TrendingUp,
  Scale,
  Zap,
  Trophy,
  Calendar,
  BarChart3,
  Send,
  Bot,
  Play,
  Cigarette,
  Pill,
  ChefHat,
  CheckCircle2,
  Plus,
  LineChart,
  Download,
  X,
  Skull,
  Coffee,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Apple,
  Bell,
  Star,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Meh,
  Frown,
  Save,
  Trash2,
  Edit,
  Cookie,
  Filter
} from 'lucide-react'

// Interface para planos de meta
interface MetaPlan {
  id: number
  name: string
  createdAt: string
  weight: string
  height: string
  age: string
  gender: string
  activityLevel: string
  goal: string
  smoker: string
  calculationResult: any
  personalizedDiet: any
}

export function FitnessApp() {
  const { user, signOut } = useSimpleAuth()
  const [activeTab, setActiveTab] = useState('calculator')
  const [isLoading, setIsLoading] = useState(true)
  
  // Estados para calculadora completa
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [activityLevel, setActivityLevel] = useState('')
  const [goal, setGoal] = useState('')
  const [smoker, setSmoker] = useState('')
  const [calculationResult, setCalculationResult] = useState<any>(null)
  
  // Estados para planos de meta
  const [savedPlans, setSavedPlans] = useState<MetaPlan[]>([])
  const [currentPlanName, setCurrentPlanName] = useState('')
  const [showSavePlanDialog, setShowSavePlanDialog] = useState(false)
  
  // Estados para seleção de nível
  const [fitnessLevel, setFitnessLevel] = useState('Iniciante')
  
  // Estados para progresso
  const [progressData, setProgressData] = useState<any[]>([])
  const [newProgress, setNewProgress] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    bodyFat: '',
    notes: ''
  })
  
  // Estados para registro de treinos
  const [completedWorkouts, setCompletedWorkouts] = useState<any[]>([])
  
  // Estados para registro de refeições
  const [mealLogs, setMealLogs] = useState<any[]>([])
  
  // Estados para vídeos
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [downloadedVideos, setDownloadedVideos] = useState<{[key: string]: string}>({})
  
  // Estado para dieta personalizada
  const [personalizedDiet, setPersonalizedDiet] = useState<any>(null)
  
  // Estados para notificações motivacionais
  const [showNotification, setShowNotification] = useState(false)
  const [currentMotivation, setCurrentMotivation] = useState('')
  
  // Estados para feedback
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  
  // Estados para filtro de receitas
  const [recipeFilter, setRecipeFilter] = useState('all')
  
  // Estados para dados do usuário
  const [userProfile, setUserProfile] = useState({
    fitness_level: '',
    current_weight: 0,
    target_weight: 0,
    height: 0,
    age: 0,
    gender: '',
    activity_level: '',
    goal: '',
    smoker: false,
    preferences: {},
    full_name: user?.username || 'atleta'
  })

  const profile = userProfile

  // FRASES MOTIVACIONAIS DAS LENDAS
  const motivationalQuotes = [
    // David Goggins
    "Você não sabe do que é capaz até se colocar em uma situação desconfortável. - David Goggins",
    "A dor é apenas fraqueza deixando seu corpo. - David Goggins",
    "Não pare quando estiver cansado. Pare quando terminar. - David Goggins",
    "Sua mente vai desistir cem vezes antes do seu corpo. Prove que está errada. - David Goggins",
    "Sofrimento é o verdadeiro teste de vida. - David Goggins",
    
    // Jordan Oliveira (Influencer Fitness BR)
    "Consistência é a chave. Não existe atalho para o sucesso. - Jordan Oliveira",
    "Treino pesado, dieta regrada, resultados garantidos. - Jordan Oliveira",
    "Cada rep conta. Cada série importa. Foco total! - Jordan Oliveira",
    
    // Tenente Bruno (Militar Fitness)
    "Disciplina militar, resultados extraordinários. - Tenente Bruno",
    "Não existe tempo ruim. Existe falta de determinação. - Tenente Bruno",
    "Treine como se sua vida dependesse disso. - Tenente Bruno",
    
    // Ramon Dino (Mr. Olympia)
    "Gigante não nasce, se constrói rep por rep. - Ramon Dino",
    "Foco, força e fé. O resto é consequência. - Ramon Dino",
    "Cada treino é uma oportunidade de ser melhor. - Ramon Dino",
    "Brasil no topo! Vamos com tudo! - Ramon Dino",
    
    // CBum (Chris Bumstead - Mr. Olympia Classic)
    "Construa seu legado, uma rep de cada vez. - CBum",
    "A jornada é tão importante quanto o destino. - CBum",
    "Seja a melhor versão de você mesmo. - CBum",
    "Consistência supera intensidade. - CBum",
    
    // Frases Gerais Motivacionais
    "Sem dor, sem ganho. Vamos com tudo!",
    "Hoje é o dia de superar seus limites!",
    "Você é mais forte do que pensa!",
    "Cada gota de suor vale a pena!",
    "Desistir não é uma opção. Bora treinar!",
    "Seu único limite é você mesmo!",
    "Transforme suor em resultados!",
    "A vitória pertence aos persistentes!",
    "Seja imparável. Seja imbatível!",
    "Hoje você treina. Amanhã você colhe!"
  ]

  // Função para mostrar notificação motivacional
  const showMotivationalNotification = () => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    setCurrentMotivation(randomQuote)
    setShowNotification(true)
    
    setTimeout(() => {
      setShowNotification(false)
    }, 8000) // 8 segundos
  }

  // TREINOS PROFISSIONAIS BASEADOS NA IMAGEM - 3 NÍVEIS
  const [workoutPlans] = useState({
    'Iniciante': {
      schedule: '4 dias de treino x 3 dias de descanso',
      description: 'Ideal para quem está começando agora na academia',
      workouts: [
        {
          id: 1,
          day: 'Segunda-feira',
          name: 'Treino A - Peito, Ombro e Tríceps',
          level: 'Iniciante',
          duration: '45-60 min',
          description: 'Treino de empurrão focado em peito, ombros e tríceps',
          exercises: [
            { name: 'Supino Reto', sets: '3x10-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/rT7DgCr-3pg', tips: 'Mantenha os pés firmes no chão' },
            { name: 'Supino Inclinado', sets: '3x10-12', worksMuscle: 'Peito Superior', video: 'https://www.youtube.com/embed/8iPEnn-ltC8', tips: 'Inclinação de 30-45°' },
            { name: 'Crucifixo', sets: '3x10-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/eozdVDA78K0', tips: 'Movimento amplo' },
            { name: 'Desenvolvimento com Halteres', sets: '3x10-12', worksMuscle: 'Ombro', video: 'https://www.youtube.com/embed/qEwKCR5JCog', tips: 'Movimento em arco' },
            { name: 'Elevação Lateral', sets: '3x10-12', worksMuscle: 'Ombro Lateral', video: 'https://www.youtube.com/embed/3VcKaXpzqRo', tips: 'Braços ligeiramente flexionados' },
            { name: 'Tríceps Testa', sets: '3x10-12', worksMuscle: 'Tríceps', video: 'https://www.youtube.com/embed/d_KZxkY_0cM', tips: 'Cotovelos fixos' }
          ],
          tips: 'Foque na execução correta. Descanse 60-90s entre séries.'
        },
        {
          id: 2,
          day: 'Terça-feira',
          name: 'Treino B - Costas, Trapézio e Bíceps',
          level: 'Iniciante',
          duration: '45-60 min',
          description: 'Treino de puxada focado em costas e bíceps',
          exercises: [
            { name: 'Puxada Frontal', sets: '3x10-12', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/CAwf7n6Luuc', tips: 'Puxe até a altura do peito' },
            { name: 'Remada Curvada', sets: '3x10-12', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/FWJR5Ve8bnQ', tips: 'Costas retas' },
            { name: 'Remada Cavalinho', sets: '3x10-12', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/UCXxvVItLoM', tips: 'Movimento controlado' },
            { name: 'Encolhimento', sets: '3x10-12', worksMuscle: 'Trapézio', video: 'https://www.youtube.com/embed/cJRVVxmytaM', tips: 'Suba os ombros' },
            { name: 'Rosca Direta', sets: '3x10-12', worksMuscle: 'Bíceps', video: 'https://www.youtube.com/embed/ykJmrZ5v0Oo', tips: 'Cotovelos fixos' },
            { name: 'Rosca Martelo', sets: '3x10-12', worksMuscle: 'Bíceps', video: 'https://www.youtube.com/embed/zC3nLlEvin4', tips: 'Pegada neutra' }
          ],
          tips: 'Mantenha as costas retas. Controle o movimento na descida.'
        },
        {
          id: 3,
          day: 'Quinta-feira',
          name: 'Treino C - Pernas Completo',
          level: 'Iniciante',
          duration: '50-65 min',
          description: 'Treino completo de pernas com aquecimento',
          exercises: [
            { name: 'Aquecimento - Bike', sets: '10 min', worksMuscle: 'Cardio', video: 'https://www.youtube.com/embed/gwLzBJYoWlI', tips: 'Aqueça bem antes' },
            { name: 'Agachamento Livre', sets: '3x10-12', worksMuscle: 'Pernas', video: 'https://www.youtube.com/embed/Dy28eq2PjcM', tips: 'Desça até 90°' },
            { name: 'Leg Press', sets: '3x10-12', worksMuscle: 'Pernas', video: 'https://www.youtube.com/embed/IZxyjW7MPJQ', tips: 'Pés na largura dos ombros' },
            { name: 'Cadeira Extensora', sets: '3x10-12', worksMuscle: 'Quadríceps', video: 'https://www.youtube.com/embed/YyvSfVjQeL0', tips: 'Pause no topo' },
            { name: 'Mesa Flexora', sets: '3x10-12', worksMuscle: 'Posterior', video: 'https://www.youtube.com/embed/ELOCsoDSmrg', tips: 'Quadril bem apoiado' },
            { name: 'Panturrilha em Pé', sets: '4x10-12', worksMuscle: 'Panturrilha', video: 'https://www.youtube.com/embed/gwLzBJYoWlI', tips: 'Amplitude completa' }
          ],
          tips: 'Dia mais intenso. Hidrate-se bem e descanse adequadamente.'
        },
        {
          id: 4,
          day: 'Sexta-feira',
          name: 'Treino A - Peito, Ombro e Tríceps',
          level: 'Iniciante',
          duration: '45-60 min',
          description: 'Repetição do Treino A',
          exercises: [
            { name: 'Supino Reto', sets: '3x10-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/rT7DgCr-3pg', tips: 'Mantenha os pés firmes no chão' },
            { name: 'Supino Inclinado', sets: '3x10-12', worksMuscle: 'Peito Superior', video: 'https://www.youtube.com/embed/8iPEnn-ltC8', tips: 'Inclinação de 30-45°' },
            { name: 'Crucifixo', sets: '3x10-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/eozdVDA78K0', tips: 'Movimento amplo' },
            { name: 'Desenvolvimento com Halteres', sets: '3x10-12', worksMuscle: 'Ombro', video: 'https://www.youtube.com/embed/qEwKCR5JCog', tips: 'Movimento em arco' },
            { name: 'Elevação Lateral', sets: '3x10-12', worksMuscle: 'Ombro Lateral', video: 'https://www.youtube.com/embed/3VcKaXpzqRo', tips: 'Braços ligeiramente flexionados' },
            { name: 'Tríceps Testa', sets: '3x10-12', worksMuscle: 'Tríceps', video: 'https://www.youtube.com/embed/d_KZxkY_0cM', tips: 'Cotovelos fixos' }
          ],
          tips: 'Foque na execução correta. Descanse 60-90s entre séries.'
        }
      ]
    },
    'Intermediário': {
      schedule: '5 dias de treino x 2 dias de descanso',
      description: 'Para quem treina há 3-6 meses e busca evolução',
      workouts: [
        {
          id: 5,
          day: 'Segunda-feira',
          name: 'Treino A - Peito e Tríceps',
          level: 'Intermediário',
          duration: '60-75 min',
          description: 'Treino focado em peito e tríceps com mais volume',
          exercises: [
            { name: 'Supino Reto', sets: '4x8-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/rT7DgCr-3pg', tips: 'Carga mais pesada' },
            { name: 'Supino Inclinado', sets: '4x8-12', worksMuscle: 'Peito Superior', video: 'https://www.youtube.com/embed/8iPEnn-ltC8', tips: 'Foque na parte superior' },
            { name: 'Crucifixo Inclinado', sets: '3x8-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/eozdVDA78K0', tips: 'Sinta o alongamento' },
            { name: 'Peck Deck', sets: '3x8-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/Z57CtFmRMxA', tips: 'Contração máxima' },
            { name: 'Tríceps Testa', sets: '4x8-12', worksMuscle: 'Tríceps', video: 'https://www.youtube.com/embed/d_KZxkY_0cM', tips: 'Cotovelos fixos' },
            { name: 'Tríceps Corda', sets: '3x8-12', worksMuscle: 'Tríceps', video: 'https://www.youtube.com/embed/kiuVA0gs3EI', tips: 'Abra a corda no final' },
            { name: 'Tríceps Francês', sets: '3x8-12', worksMuscle: 'Tríceps', video: 'https://www.youtube.com/embed/d_KZxkY_0cM', tips: 'Movimento completo' }
          ],
          tips: 'Aumente a carga progressivamente. Descanso 90-120s entre séries.'
        },
        {
          id: 6,
          day: 'Terça-feira',
          name: 'Treino B - Costas e Bíceps',
          level: 'Intermediário',
          duration: '60-75 min',
          description: 'Treino de puxada com mais exercícios',
          exercises: [
            { name: 'Barra Fixa', sets: '4x máximo', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/eGo4IYlbE5g', tips: 'Adicione peso se conseguir mais de 12' },
            { name: 'Puxada Frontal', sets: '4x8-12', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/CAwf7n6Luuc', tips: 'Puxe até o peito' },
            { name: 'Remada Curvada', sets: '4x8-12', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/FWJR5Ve8bnQ', tips: 'Costas retas' },
            { name: 'Remada Cavalinho', sets: '3x8-12', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/UCXxvVItLoM', tips: 'Contraia as escápulas' },
            { name: 'Rosca Direta', sets: '4x8-12', worksMuscle: 'Bíceps', video: 'https://www.youtube.com/embed/ykJmrZ5v0Oo', tips: 'Cotovelos fixos' },
            { name: 'Rosca Alternada', sets: '3x8-12', worksMuscle: 'Bíceps', video: 'https://www.youtube.com/embed/sAq_ocpRh_I', tips: 'Sem balanço' },
            { name: 'Rosca Martelo', sets: '3x8-12', worksMuscle: 'Bíceps', video: 'https://www.youtube.com/embed/zC3nLlEvin4', tips: 'Pegada neutra' }
          ],
          tips: 'Foque na contração muscular. Controle o movimento na descida.'
        },
        {
          id: 7,
          day: 'Quarta-feira',
          name: 'Treino C - Ombros e Trapézio',
          level: 'Intermediário',
          duration: '55-70 min',
          description: 'Treino dedicado aos ombros',
          exercises: [
            { name: 'Desenvolvimento com Halteres', sets: '4x8-12', worksMuscle: 'Ombro', video: 'https://www.youtube.com/embed/qEwKCR5JCog', tips: 'Movimento completo' },
            { name: 'Desenvolvimento Militar', sets: '4x8-12', worksMuscle: 'Ombro', video: 'https://www.youtube.com/embed/2yjwXTZQDDI', tips: 'Barra na frente' },
            { name: 'Elevação Lateral', sets: '4x8-12', worksMuscle: 'Ombro Lateral', video: 'https://www.youtube.com/embed/3VcKaXpzqRo', tips: 'Sem balanço' },
            { name: 'Elevação Frontal', sets: '3x8-12', worksMuscle: 'Ombro Frontal', video: 'https://www.youtube.com/embed/qEwKCR5JCog', tips: 'Movimento alternado' },
            { name: 'Crucifixo Inverso', sets: '3x8-12', worksMuscle: 'Ombro Posterior', video: 'https://www.youtube.com/embed/T7gWBKwzUUY', tips: 'Trabalha posterior' },
            { name: 'Encolhimento', sets: '4x8-12', worksMuscle: 'Trapézio', video: 'https://www.youtube.com/embed/cJRVVxmytaM', tips: 'Movimento controlado' }
          ],
          tips: 'Ombros são delicados. Priorize execução perfeita.'
        },
        {
          id: 8,
          day: 'Quinta-feira',
          name: 'Treino D - Pernas Completo',
          level: 'Intermediário',
          duration: '65-80 min',
          description: 'Treino completo de pernas intermediário',
          exercises: [
            { name: 'Aquecimento - Bike', sets: '10 min', worksMuscle: 'Cardio', video: 'https://www.youtube.com/embed/gwLzBJYoWlI', tips: 'Aqueça bem' },
            { name: 'Agachamento Livre', sets: '4x8-12', worksMuscle: 'Pernas', video: 'https://www.youtube.com/embed/Dy28eq2PjcM', tips: 'Desça até paralelo' },
            { name: 'Leg Press 45°', sets: '4x8-12', worksMuscle: 'Pernas', video: 'https://www.youtube.com/embed/IZxyjW7MPJQ', tips: 'Amplitude completa' },
            { name: 'Hack Machine', sets: '3x8-12', worksMuscle: 'Quadríceps', video: 'https://www.youtube.com/embed/0tn5K9NlCfo', tips: 'Pés na largura dos ombros' },
            { name: 'Cadeira Extensora', sets: '4x8-12', worksMuscle: 'Quadríceps', video: 'https://www.youtube.com/embed/YyvSfVjQeL0', tips: 'Pause no topo' },
            { name: 'Mesa Flexora', sets: '4x8-12', worksMuscle: 'Posterior', video: 'https://www.youtube.com/embed/ELOCsoDSmrg', tips: 'Movimento completo' },
            { name: 'Stiff', sets: '3x8-12', worksMuscle: 'Posterior', video: 'https://www.youtube.com/embed/1uDiW5--rAE', tips: 'Sinta o alongamento' },
            { name: 'Panturrilha em Pé', sets: '5x8-12', worksMuscle: 'Panturrilha', video: 'https://www.youtube.com/embed/gwLzBJYoWlI', tips: 'Amplitude completa' }
          ],
          tips: 'Treino intenso. Hidratação e alimentação adequadas são essenciais.'
        },
        {
          id: 9,
          day: 'Sexta-feira',
          name: 'Treino A - Peito e Tríceps',
          level: 'Intermediário',
          duration: '60-75 min',
          description: 'Repetição do Treino A',
          exercises: [
            { name: 'Supino Reto', sets: '4x8-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/rT7DgCr-3pg', tips: 'Carga mais pesada' },
            { name: 'Supino Inclinado', sets: '4x8-12', worksMuscle: 'Peito Superior', video: 'https://www.youtube.com/embed/8iPEnn-ltC8', tips: 'Foque na parte superior' },
            { name: 'Crucifixo Inclinado', sets: '3x8-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/eozdVDA78K0', tips: 'Sinta o alongamento' },
            { name: 'Peck Deck', sets: '3x8-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/Z57CtFmRMxA', tips: 'Contração máxima' },
            { name: 'Tríceps Testa', sets: '4x8-12', worksMuscle: 'Tríceps', video: 'https://www.youtube.com/embed/d_KZxkY_0cM', tips: 'Cotovelos fixos' },
            { name: 'Tríceps Corda', sets: '3x8-12', worksMuscle: 'Tríceps', video: 'https://www.youtube.com/embed/kiuVA0gs3EI', tips: 'Abra a corda no final' },
            { name: 'Tríceps Francês', sets: '3x8-12', worksMuscle: 'Tríceps', video: 'https://www.youtube.com/embed/d_KZxkY_0cM', tips: 'Movimento completo' }
          ],
          tips: 'Aumente a carga progressivamente. Descanso 90-120s entre séries.'
        }
      ]
    },
    'Avançado': {
      schedule: '6 dias de treino x 1 dia de descanso',
      description: 'Treino profissional de alta intensidade',
      workouts: [
        {
          id: 10,
          day: 'Segunda-feira',
          name: 'Treino A - Peito',
          level: 'Avançado',
          duration: '75-90 min',
          description: 'Treino avançado focado exclusivamente em peito',
          exercises: [
            { name: 'Supino Reto', sets: '5x8-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/rT7DgCr-3pg', tips: 'Carga máxima, movimento explosivo' },
            { name: 'Supino Inclinado', sets: '4x8-12', worksMuscle: 'Peito Superior', video: 'https://www.youtube.com/embed/8iPEnn-ltC8', tips: 'Drop set final' },
            { name: 'Supino Declinado', sets: '4x8-12', worksMuscle: 'Peito Inferior', video: 'https://www.youtube.com/embed/LfyQBUKR8SE', tips: 'Trabalha parte inferior' },
            { name: 'Crucifixo Inclinado', sets: '4x8-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/eozdVDA78K0', tips: 'Superserie com flexão' },
            { name: 'Peck Deck', sets: '4x8-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/Z57CtFmRMxA', tips: 'Contração máxima' },
            { name: 'Crossover', sets: '3x8-12', worksMuscle: 'Peito', video: 'https://www.youtube.com/embed/taI4XduLpTk', tips: 'Finalização' }
          ],
          tips: 'Use técnicas avançadas: drop sets, superseries, rest-pause. Descanso 2-3 min.'
        },
        {
          id: 11,
          day: 'Terça-feira',
          name: 'Treino B - Costas e Trapézio',
          level: 'Avançado',
          duration: '75-90 min',
          description: 'Treino avançado de costas com máxima intensidade',
          exercises: [
            { name: 'Barra Fixa com Peso', sets: '5x8-12', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/eGo4IYlbE5g', tips: 'Adicione peso' },
            { name: 'Puxada Frontal', sets: '4x8-12', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/CAwf7n6Luuc', tips: 'Drop set final' },
            { name: 'Remada Curvada', sets: '5x8-12', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/FWJR5Ve8bnQ', tips: 'Carga máxima' },
            { name: 'Remada Cavalinho', sets: '4x8-12', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/UCXxvVItLoM', tips: 'Contraia escápulas' },
            { name: 'Remada Unilateral', sets: '4x8-12', worksMuscle: 'Costas', video: 'https://www.youtube.com/embed/roCP6wCXPqo', tips: 'Amplitude completa' },
            { name: 'Encolhimento', sets: '5x8-12', worksMuscle: 'Trapézio', video: 'https://www.youtube.com/embed/cJRVVxmytaM', tips: 'Carga pesada' }
          ],
          tips: 'Técnicas avançadas obrigatórias. Foco total na contração muscular.'
        },
        {
          id: 12,
          day: 'Quarta-feira',
          name: 'Treino C - Ombros',
          level: 'Avançado',
          duration: '70-85 min',
          description: 'Treino completo e intenso de ombros',
          exercises: [
            { name: 'Desenvolvimento com Halteres', sets: '5x8-12', worksMuscle: 'Ombro', video: 'https://www.youtube.com/embed/qEwKCR5JCog', tips: 'Carga pesada' },
            { name: 'Desenvolvimento Militar', sets: '4x8-12', worksMuscle: 'Ombro', video: 'https://www.youtube.com/embed/2yjwXTZQDDI', tips: 'Movimento estrito' },
            { name: 'Elevação Lateral', sets: '4x8-12', worksMuscle: 'Ombro Lateral', video: 'https://www.youtube.com/embed/3VcKaXpzqRo', tips: 'Drop set na última' },
            { name: 'Elevação Frontal', sets: '4x8-12', worksMuscle: 'Ombro Frontal', video: 'https://www.youtube.com/embed/qEwKCR5JCog', tips: 'Movimento alternado' },
            { name: 'Crucifixo Inverso', sets: '4x8-12', worksMuscle: 'Ombro Posterior', video: 'https://www.youtube.com/embed/T7gWBKwzUUY', tips: 'Trabalha posterior' },
            { name: 'Remada Alta', sets: '3x8-12', worksMuscle: 'Ombro/Trapézio', video: 'https://www.youtube.com/embed/Q5AETXkalwE', tips: 'Finalização' }
          ],
          tips: 'Ombros exigem técnica perfeita. Não sacrifique execução por carga.'
        },
        {
          id: 13,
          day: 'Quinta-feira',
          name: 'Treino D - Pernas (Quadríceps)',
          level: 'Avançado',
          duration: '80-100 min',
          description: 'Treino focado em quadríceps e anterior',
          exercises: [
            { name: 'Aquecimento - Bike', sets: '10 min', worksMuscle: 'Cardio', video: 'https://www.youtube.com/embed/gwLzBJYoWlI', tips: 'Aqueça bem' },
            { name: 'Agachamento Livre', sets: '5x8-12', worksMuscle: 'Pernas', video: 'https://www.youtube.com/embed/Dy28eq2PjcM', tips: 'Profundidade completa' },
            { name: 'Agachamento Frontal', sets: '4x8-12', worksMuscle: 'Quadríceps', video: 'https://www.youtube.com/embed/uYumuL_G_V0', tips: 'Postura ereta' },
            { name: 'Leg Press 45°', sets: '5x8-12', worksMuscle: 'Pernas', video: 'https://www.youtube.com/embed/IZxyjW7MPJQ', tips: 'Carga pesada' },
            { name: 'Hack Machine', sets: '4x8-12', worksMuscle: 'Quadríceps', video: 'https://www.youtube.com/embed/0tn5K9NlCfo', tips: 'Drop set na última' },
            { name: 'Cadeira Extensora', sets: '5x8-12', worksMuscle: 'Quadríceps', video: 'https://www.youtube.com/embed/YyvSfVjQeL0', tips: 'Queime o quadríceps' },
            { name: 'Panturrilha em Pé', sets: '6x8-12', worksMuscle: 'Panturrilha', video: 'https://www.youtube.com/embed/gwLzBJYoWlI', tips: 'Amplitude máxima' }
          ],
          tips: 'Treino extremamente intenso. Nutrição e recuperação são cruciais.'
        },
        {
          id: 14,
          day: 'Sexta-feira',
          name: 'Treino E - Pernas (Posterior) e Panturrilha',
          level: 'Avançado',
          duration: '70-85 min',
          description: 'Treino focado em posterior de coxa',
          exercises: [
            { name: 'Stiff', sets: '5x8-12', worksMuscle: 'Posterior', video: 'https://www.youtube.com/embed/1uDiW5--rAE', tips: 'Alongamento posterior' },
            { name: 'Levantamento Terra', sets: '4x8-12', worksMuscle: 'Posterior/Costas', video: 'https://www.youtube.com/embed/op9kVnSso6Q', tips: 'Técnica perfeita' },
            { name: 'Mesa Flexora', sets: '5x8-12', worksMuscle: 'Posterior', video: 'https://www.youtube.com/embed/ELOCsoDSmrg', tips: 'Contração máxima' },
            { name: 'Flexora em Pé', sets: '4x8-12', worksMuscle: 'Posterior', video: 'https://www.youtube.com/embed/ELOCsoDSmrg', tips: 'Unilateral' },
            { name: 'Panturrilha em Pé', sets: '6x8-12', worksMuscle: 'Panturrilha', video: 'https://www.youtube.com/embed/gwLzBJYoWlI', tips: 'Amplitude máxima' },
            { name: 'Panturrilha Sentado', sets: '4x8-12', worksMuscle: 'Panturrilha', video: 'https://www.youtube.com/embed/JbyjNymZOt0', tips: 'Finalização' }
          ],
          tips: 'Posterior forte previne lesões. Não negligencie.'
        },
        {
          id: 15,
          day: 'Sábado',
          name: 'Treino F - Bíceps e Tríceps',
          level: 'Avançado',
          duration: '65-80 min',
          description: 'Treino dedicado aos braços',
          exercises: [
            { name: 'Rosca Direta', sets: '5x8-12', worksMuscle: 'Bíceps', video: 'https://www.youtube.com/embed/ykJmrZ5v0Oo', tips: 'Movimento estrito' },
            { name: 'Rosca Alternada', sets: '4x8-12', worksMuscle: 'Bíceps', video: 'https://www.youtube.com/embed/sAq_ocpRh_I', tips: 'Sem balanço' },
            { name: 'Rosca Martelo', sets: '4x8-12', worksMuscle: 'Bíceps', video: 'https://www.youtube.com/embed/zC3nLlEvin4', tips: 'Finalização' },
            { name: 'Rosca Concentrada', sets: '3x8-12', worksMuscle: 'Bíceps', video: 'https://www.youtube.com/embed/Jvj2wV0vOYU', tips: 'Drop set' },
            { name: 'Tríceps Testa', sets: '5x8-12', worksMuscle: 'Tríceps', video: 'https://www.youtube.com/embed/d_KZxkY_0cM', tips: 'Carga pesada' },
            { name: 'Tríceps Corda', sets: '4x8-12', worksMuscle: 'Tríceps', video: 'https://www.youtube.com/embed/kiuVA0gs3EI', tips: 'Drop set final' },
            { name: 'Tríceps Coice', sets: '3x8-12', worksMuscle: 'Tríceps', video: 'https://www.youtube.com/embed/6SS6K3lAwZ8', tips: 'Finalização' }
          ],
          tips: 'Braços respondem bem a volume. Varie técnicas e ângulos.'
        }
      ]
    }
  })

  // RECEITAS FITNESS EXTRAS (15 receitas para opções fora da dieta)
  const [extraRecipes] = useState([
    {
      id: 101,
      name: 'Brownie Proteico Fit',
      category: 'Sobremesa',
      prepTime: 10,
      cookTime: 25,
      servings: 8,
      calories: 180,
      protein: 12,
      carbs: 18,
      fats: 6,
      ingredients: ['2 scoops whey chocolate', '100g farinha de aveia', '3 ovos', '100ml leite desnatado', '30g cacau em pó', 'Adoçante', '1 colher fermento'],
      instructions: ['Bata todos ingredientes no liquidificador', 'Despeje em forma untada', 'Asse 180°C por 25 min', 'Deixe esfriar antes de cortar'],
      tips: 'Perfeito para matar vontade de doce sem sair da dieta!',
      mealType: 'snack'
    },
    {
      id: 102,
      name: 'Pizza Fit de Frango',
      category: 'Jantar',
      prepTime: 15,
      cookTime: 20,
      servings: 2,
      calories: 380,
      protein: 42,
      carbs: 35,
      fats: 10,
      ingredients: ['Massa: 200g frango moído', '1 ovo', '50g queijo light', 'Temperos', 'Cobertura: molho de tomate', 'queijo light', 'vegetais'],
      instructions: ['Misture frango, ovo, queijo e temperos', 'Abra a massa em forma', 'Asse 10 min', 'Adicione cobertura e asse mais 10 min'],
      tips: 'Substituto perfeito para pizza tradicional!',
      mealType: 'dinner'
    },
    {
      id: 103,
      name: 'Mousse Proteico de Chocolate',
      category: 'Sobremesa',
      prepTime: 10,
      cookTime: 0,
      servings: 4,
      calories: 120,
      protein: 15,
      carbs: 8,
      fats: 3,
      ingredients: ['2 scoops whey chocolate', '200g iogurte grego', '1 abacate maduro', 'Adoçante', 'Cacau em pó'],
      instructions: ['Bata tudo no liquidificador', 'Leve à geladeira por 2h', 'Sirva gelado', 'Decore com cacau'],
      tips: 'Sobremesa cremosa e rica em proteína!',
      mealType: 'snack'
    },
    {
      id: 104,
      name: 'Wrap de Atum Fitness',
      category: 'Lanche',
      prepTime: 10,
      cookTime: 0,
      servings: 1,
      calories: 320,
      protein: 35,
      carbs: 28,
      fats: 8,
      ingredients: ['1 tortilha integral', '1 lata atum', 'Alface', 'Tomate', 'Cenoura ralada', 'Iogurte grego', 'Mostarda'],
      instructions: ['Misture atum com iogurte e mostarda', 'Espalhe na tortilha', 'Adicione vegetais', 'Enrole firmemente'],
      tips: 'Lanche prático e rico em proteína!',
      mealType: 'snack'
    },
    {
      id: 105,
      name: 'Bolo de Banana Fitness',
      category: 'Café da Manhã',
      prepTime: 15,
      cookTime: 35,
      servings: 10,
      calories: 180,
      protein: 8,
      carbs: 28,
      fats: 4,
      ingredients: ['3 bananas maduras', '3 ovos', '150g aveia', '1 scoop whey', 'Canela', 'Fermento', 'Adoçante'],
      instructions: ['Amasse as bananas', 'Misture todos ingredientes', 'Despeje em forma', 'Asse 180°C por 35 min'],
      tips: 'Ótimo para café da manhã ou lanche!',
      mealType: 'breakfast'
    },
    {
      id: 106,
      name: 'Sorvete Proteico de Morango',
      category: 'Sobremesa',
      prepTime: 5,
      cookTime: 0,
      servings: 2,
      calories: 140,
      protein: 18,
      carbs: 15,
      fats: 2,
      ingredients: ['300g morangos congelados', '1 scoop whey morango', '100ml leite desnatado', 'Adoçante'],
      instructions: ['Bata tudo no processador', 'Sirva imediatamente', 'Ou congele por 1h para textura mais firme'],
      tips: 'Sobremesa refrescante e saudável!',
      mealType: 'snack'
    },
    {
      id: 107,
      name: 'Hambúrguer de Salmão',
      category: 'Almoço/Jantar',
      prepTime: 15,
      cookTime: 10,
      servings: 2,
      calories: 320,
      protein: 38,
      carbs: 22,
      fats: 10,
      ingredients: ['300g salmão fresco', '1 ovo', '30g aveia', 'Cebola', 'Salsa', 'Limão', 'Pão integral'],
      instructions: ['Pique o salmão finamente', 'Misture com ovo, aveia e temperos', 'Modele hambúrgueres', 'Grelhe 5 min cada lado'],
      tips: 'Rico em ômega 3 e proteína de qualidade!',
      mealType: 'lunch'
    },
    {
      id: 108,
      name: 'Cookies Proteicos',
      category: 'Lanche',
      prepTime: 10,
      cookTime: 15,
      servings: 12,
      calories: 95,
      protein: 8,
      carbs: 10,
      fats: 3,
      ingredients: ['2 scoops whey', '100g aveia', '2 ovos', 'Pasta de amendoim', 'Gotas de chocolate 70%', 'Adoçante'],
      instructions: ['Misture todos ingredientes', 'Modele cookies', 'Asse 180°C por 15 min', 'Deixe esfriar'],
      tips: 'Lanche perfeito pré ou pós-treino!',
      mealType: 'snack'
    },
    {
      id: 109,
      name: 'Risoto de Frango Fitness',
      category: 'Almoço',
      prepTime: 15,
      cookTime: 30,
      servings: 3,
      calories: 420,
      protein: 38,
      carbs: 48,
      fats: 8,
      ingredients: ['200g arroz integral', '300g peito de frango', 'Cebola', 'Alho', 'Champignon', 'Caldo de legumes', 'Queijo light'],
      instructions: ['Refogue cebola e alho', 'Adicione arroz e caldo aos poucos', 'Acrescente frango e champignon', 'Finalize com queijo'],
      tips: 'Versão fitness do clássico italiano!',
      mealType: 'lunch'
    },
    {
      id: 110,
      name: 'Pudim Proteico',
      category: 'Sobremesa',
      prepTime: 10,
      cookTime: 45,
      servings: 6,
      calories: 150,
      protein: 15,
      carbs: 18,
      fats: 3,
      ingredients: ['4 ovos', '500ml leite desnatado', '2 scoops whey baunilha', 'Adoçante', 'Essência de baunilha'],
      instructions: ['Bata tudo no liquidificador', 'Despeje em forma caramelizada', 'Asse em banho-maria 45 min', 'Deixe esfriar e desenforme'],
      tips: 'Sobremesa clássica em versão fit!',
      mealType: 'snack'
    },
    {
      id: 111,
      name: 'Macarrão de Abobrinha ao Pesto',
      category: 'Jantar',
      prepTime: 15,
      cookTime: 10,
      servings: 2,
      calories: 280,
      protein: 28,
      carbs: 15,
      fats: 14,
      ingredients: ['3 abobrinhas', '200g peito de frango', 'Manjericão', 'Alho', 'Azeite', 'Castanhas', 'Queijo parmesão'],
      instructions: ['Corte abobrinha em espiral', 'Faça pesto com manjericão, alho, castanhas', 'Grelhe o frango', 'Misture tudo'],
      tips: 'Low carb e super saboroso!',
      mealType: 'dinner'
    },
    {
      id: 112,
      name: 'Muffin de Chocolate Fit',
      category: 'Café da Manhã',
      prepTime: 10,
      cookTime: 20,
      servings: 6,
      calories: 160,
      protein: 10,
      carbs: 18,
      fats: 5,
      ingredients: ['100g aveia', '2 ovos', '1 scoop whey chocolate', 'Banana', 'Cacau', 'Fermento', 'Adoçante'],
      instructions: ['Bata tudo no liquidificador', 'Distribua em forminhas', 'Asse 180°C por 20 min', 'Deixe esfriar'],
      tips: 'Perfeito para café da manhã rápido!',
      mealType: 'breakfast'
    },
    {
      id: 113,
      name: 'Escondidinho Fitness',
      category: 'Almoço',
      prepTime: 20,
      cookTime: 30,
      servings: 4,
      calories: 380,
      protein: 35,
      carbs: 38,
      fats: 10,
      ingredients: ['500g carne moída magra', '500g mandioquinha', 'Cebola', 'Tomate', 'Queijo light', 'Temperos'],
      instructions: ['Refogue a carne', 'Cozinhe e amasse a mandioquinha', 'Monte camadas em refratário', 'Asse com queijo por cima'],
      tips: 'Comfort food em versão saudável!',
      mealType: 'lunch'
    },
    {
      id: 114,
      name: 'Cheesecake Proteico',
      category: 'Sobremesa',
      prepTime: 20,
      cookTime: 0,
      servings: 8,
      calories: 180,
      protein: 15,
      carbs: 15,
      fats: 7,
      ingredients: ['Base: aveia, pasta amendoim', 'Recheio: cream cheese light', 'iogurte grego', 'whey', 'gelatina sem sabor', 'Frutas vermelhas'],
      instructions: ['Faça base com aveia e pasta', 'Bata recheio no liquidificador', 'Monte e leve à geladeira 4h', 'Decore com frutas'],
      tips: 'Sobremesa sofisticada e fit!',
      mealType: 'snack'
    },
    {
      id: 115,
      name: 'Lasanha de Berinjela Fitness',
      category: 'Jantar',
      prepTime: 25,
      cookTime: 40,
      servings: 4,
      calories: 350,
      protein: 32,
      carbs: 28,
      fats: 12,
      ingredients: ['3 berinjelas', '400g carne moída magra', 'Molho de tomate caseiro', 'Queijo cottage', 'Queijo light', 'Temperos'],
      instructions: ['Corte berinjelas em fatias', 'Grelhe levemente', 'Refogue a carne', 'Monte camadas e asse 40 min'],
      tips: 'Lasanha sem massa, zero culpa!',
      mealType: 'dinner'
    }
  ])

  // RECEITAS FITNESS (15 receitas para dieta personalizada)
  const [fitnessRecipes] = useState([
    {
      id: 1,
      name: 'Frango Grelhado com Batata Doce',
      category: 'Almoço/Jantar',
      prepTime: 10,
      cookTime: 25,
      servings: 1,
      calories: 450,
      protein: 45,
      carbs: 40,
      fats: 8,
      ingredients: ['200g peito de frango', '150g batata doce', '1 colher azeite', 'Temperos a gosto', 'Brócolis'],
      instructions: ['Tempere o frango com sal, pimenta e alho', 'Grelhe o frango por 6-8 min cada lado', 'Cozinhe a batata doce no vapor por 20 min', 'Refogue o brócolis levemente'],
      tips: 'Prepare em lote para a semana. Congela bem.',
      mealType: 'lunch'
    },
    {
      id: 2,
      name: 'Omelete Proteica',
      category: 'Café da Manhã',
      prepTime: 5,
      cookTime: 10,
      servings: 1,
      calories: 280,
      protein: 28,
      carbs: 8,
      fats: 12,
      ingredients: ['3 claras', '1 gema', '50g queijo cottage', 'Tomate', 'Espinafre', 'Temperos'],
      instructions: ['Bata as claras e gema', 'Adicione cottage e vegetais', 'Cozinhe em fogo baixo', 'Dobre ao meio quando firmar'],
      tips: 'Adicione aveia para mais carboidratos',
      mealType: 'breakfast'
    },
    {
      id: 3,
      name: 'Panqueca de Banana e Aveia',
      category: 'Café da Manhã',
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      calories: 320,
      protein: 18,
      carbs: 45,
      fats: 6,
      ingredients: ['2 bananas maduras', '60g aveia', '2 ovos', '1 scoop whey', 'Canela'],
      instructions: ['Amasse as bananas', 'Misture todos ingredientes', 'Cozinhe em frigideira antiaderente', 'Vire quando bolhas aparecerem'],
      tips: 'Perfeito para pré-treino. Adicione mel se necessário.',
      mealType: 'breakfast'
    },
    {
      id: 4,
      name: 'Salada de Atum Proteica',
      category: 'Almoço',
      prepTime: 10,
      cookTime: 0,
      servings: 1,
      calories: 380,
      protein: 42,
      carbs: 25,
      fats: 12,
      ingredients: ['1 lata atum', 'Alface', 'Tomate', 'Pepino', '100g grão de bico', 'Azeite', 'Limão'],
      instructions: ['Escorra o atum', 'Corte os vegetais', 'Misture tudo', 'Tempere com azeite e limão'],
      tips: 'Refeição rápida e prática. Leve em marmita.',
      mealType: 'lunch'
    },
    {
      id: 5,
      name: 'Wrap de Frango Fitness',
      category: 'Lanche/Jantar',
      prepTime: 15,
      cookTime: 10,
      servings: 1,
      calories: 420,
      protein: 38,
      carbs: 42,
      fats: 10,
      ingredients: ['1 tortilha integral', '150g frango desfiado', 'Alface', 'Tomate', 'Iogurte grego', 'Mostarda'],
      instructions: ['Aqueça a tortilha', 'Espalhe iogurte e mostarda', 'Adicione frango e vegetais', 'Enrole firmemente'],
      tips: 'Ótimo para levar. Varie os vegetais.',
      mealType: 'dinner'
    },
    {
      id: 6,
      name: 'Smoothie Proteico Verde',
      category: 'Lanche',
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      calories: 280,
      protein: 30,
      carbs: 32,
      fats: 4,
      ingredients: ['1 scoop whey', '1 banana', 'Espinafre', '200ml leite desnatado', 'Gelo', '1 colher aveia'],
      instructions: ['Coloque tudo no liquidificador', 'Bata até ficar homogêneo', 'Adicione gelo se preferir'],
      tips: 'Perfeito pós-treino. Rico em nutrientes.',
      mealType: 'snack'
    },
    {
      id: 7,
      name: 'Hambúrguer Caseiro Fitness',
      category: 'Almoço/Jantar',
      prepTime: 15,
      cookTime: 15,
      servings: 2,
      calories: 380,
      protein: 42,
      carbs: 28,
      fats: 12,
      ingredients: ['300g patinho moído', '1 ovo', '30g aveia', 'Cebola', 'Alho', 'Temperos', 'Pão integral'],
      instructions: ['Misture carne, ovo, aveia e temperos', 'Modele os hambúrgueres', 'Grelhe 5 min cada lado', 'Monte com pão integral'],
      tips: 'Congele os hambúrgueres crus. Praticidade garantida.',
      mealType: 'dinner'
    },
    {
      id: 8,
      name: 'Arroz Integral com Legumes',
      category: 'Almoço/Jantar',
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      calories: 220,
      protein: 6,
      carbs: 42,
      fats: 4,
      ingredients: ['200g arroz integral', 'Cenoura', 'Vagem', 'Milho', 'Ervilha', 'Alho', 'Cebola'],
      instructions: ['Cozinhe o arroz', 'Refogue os legumes', 'Misture tudo', 'Tempere a gosto'],
      tips: 'Base perfeita para qualquer proteína.',
      mealType: 'lunch'
    },
    {
      id: 9,
      name: 'Tapioca Proteica',
      category: 'Café da Manhã/Lanche',
      prepTime: 5,
      cookTime: 5,
      servings: 1,
      calories: 320,
      protein: 25,
      carbs: 38,
      fats: 8,
      ingredients: ['50g goma de tapioca', '1 scoop whey', '1 ovo', 'Queijo cottage', 'Banana'],
      instructions: ['Misture tapioca e whey', 'Adicione o ovo batido', 'Cozinhe em frigideira', 'Recheie com cottage e banana'],
      tips: 'Versátil. Experimente recheios diferentes.',
      mealType: 'breakfast'
    },
    {
      id: 10,
      name: 'Salmão Grelhado com Aspargos',
      category: 'Jantar',
      prepTime: 10,
      cookTime: 15,
      servings: 1,
      calories: 480,
      protein: 42,
      carbs: 12,
      fats: 28,
      ingredients: ['200g salmão', 'Aspargos', 'Limão', 'Alho', 'Azeite', 'Temperos'],
      instructions: ['Tempere o salmão', 'Grelhe por 4-5 min cada lado', 'Grelhe os aspargos', 'Finalize com limão'],
      tips: 'Rico em ômega 3. Excelente para recuperação.',
      mealType: 'dinner'
    },
    {
      id: 11,
      name: 'Iogurte Grego com Frutas',
      category: 'Lanche',
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      calories: 280,
      protein: 22,
      carbs: 32,
      fats: 8,
      ingredients: ['200g iogurte grego', 'Frutas vermelhas', '20g granola', '10g mel', 'Chia'],
      instructions: ['Coloque iogurte na tigela', 'Adicione frutas', 'Polvilhe granola e chia', 'Regue com mel'],
      tips: 'Lanche rápido e nutritivo. Rico em probióticos.',
      mealType: 'snack'
    },
    {
      id: 12,
      name: 'Carne Moída Fitness',
      category: 'Almoço/Jantar',
      prepTime: 10,
      cookTime: 20,
      servings: 3,
      calories: 380,
      protein: 38,
      carbs: 28,
      fats: 14,
      ingredients: ['400g patinho moído', 'Tomate', 'Cebola', 'Pimentão', 'Alho', 'Molho de tomate natural'],
      instructions: ['Refogue a carne', 'Adicione vegetais', 'Acrescente molho', 'Cozinhe por 15 min'],
      tips: 'Versátil. Use em várias preparações.',
      mealType: 'lunch'
    },
    {
      id: 13,
      name: 'Vitamina de Banana com Aveia',
      category: 'Pré-treino',
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      calories: 350,
      protein: 18,
      carbs: 58,
      fats: 6,
      ingredients: ['2 bananas', '30g aveia', '200ml leite', '1 colher pasta amendoim', 'Canela'],
      instructions: ['Bata tudo no liquidificador', 'Adicione gelo se preferir', 'Consuma 30-60 min antes do treino'],
      tips: 'Energia rápida para treino intenso.',
      mealType: 'snack'
    },
    {
      id: 14,
      name: 'Peito de Peru com Cream Cheese',
      category: 'Lanche',
      prepTime: 5,
      cookTime: 0,
      servings: 1,
      calories: 220,
      protein: 24,
      carbs: 18,
      fats: 6,
      ingredients: ['100g peito de peru', '2 fatias pão integral', '30g cream cheese light', 'Alface', 'Tomate'],
      instructions: ['Monte o sanduíche', 'Adicione vegetais', 'Corte ao meio'],
      tips: 'Prático para levar. Rico em proteína.',
      mealType: 'snack'
    },
    {
      id: 15,
      name: 'Bowl de Quinoa Fitness',
      category: 'Almoço',
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      calories: 420,
      protein: 22,
      carbs: 52,
      fats: 14,
      ingredients: ['100g quinoa', 'Frango grelhado', 'Abacate', 'Tomate cereja', 'Rúcula', 'Azeite', 'Limão'],
      instructions: ['Cozinhe a quinoa', 'Grelhe o frango', 'Monte o bowl', 'Tempere com azeite e limão'],
      tips: 'Refeição completa e balanceada. Super nutritivo.',
      mealType: 'lunch'
    }
  ])

  // Estados para chat IA
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'ai' as const,
      message: `Olá ${profile?.full_name || 'atleta'}! 💪 Sou seu IA Coach personalizado. Estou aqui para te ajudar com treinos, dietas e motivação!`
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (user) {
          setUserProfile(prev => ({
            ...prev,
            full_name: user.username || 'atleta'
          }))
        }
        
        // Carregar dados do localStorage
        const savedProgress = localStorage.getItem('progressData')
        const savedWorkouts = localStorage.getItem('completedWorkouts')
        const savedMeals = localStorage.getItem('mealLogs')
        const savedVideos = localStorage.getItem('downloadedVideos')
        const savedDiet = localStorage.getItem('personalizedDiet')
        const savedPlansData = localStorage.getItem('savedMetaPlans')
        
        if (savedProgress) setProgressData(JSON.parse(savedProgress))
        if (savedWorkouts) setCompletedWorkouts(JSON.parse(savedWorkouts))
        if (savedMeals) setMealLogs(JSON.parse(savedMeals))
        if (savedVideos) setDownloadedVideos(JSON.parse(savedVideos))
        if (savedDiet) setPersonalizedDiet(JSON.parse(savedDiet))
        if (savedPlansData) setSavedPlans(JSON.parse(savedPlansData))
        
        setIsLoading(false)
        
        // Mostrar notificação motivacional ao carregar
        setTimeout(() => {
          showMotivationalNotification()
        }, 2000)
        
        // Notificações periódicas (a cada 30 minutos)
        const notificationInterval = setInterval(() => {
          showMotivationalNotification()
        }, 30 * 60 * 1000) // 30 minutos
        
        return () => clearInterval(notificationInterval)
      } catch (error) {
        console.error('Erro ao inicializar app:', error)
        setIsLoading(false)
      }
    }

    initializeApp()
  }, [user])

  const generatePersonalizedDiet = (result: any) => {
    const { targetCalories, proteinGrams, carbsGrams, fatGrams, goal } = result
    
    // Distribuição de calorias por refeição
    const breakfastCals = Math.round(targetCalories * 0.25)
    const snack1Cals = Math.round(targetCalories * 0.10)
    const lunchCals = Math.round(targetCalories * 0.30)
    const snack2Cals = Math.round(targetCalories * 0.10)
    const dinnerCals = Math.round(targetCalories * 0.25)
    
    // Selecionar receitas por tipo de refeição
    const breakfastRecipes = fitnessRecipes.filter(r => r.mealType === 'breakfast')
    const lunchRecipes = fitnessRecipes.filter(r => r.mealType === 'lunch')
    const dinnerRecipes = fitnessRecipes.filter(r => r.mealType === 'dinner')
    const snackRecipes = fitnessRecipes.filter(r => r.mealType === 'snack')
    
    const diet = {
      totalCalories: targetCalories,
      totalProtein: proteinGrams,
      totalCarbs: carbsGrams,
      totalFats: fatGrams,
      goal: goal,
      meals: [
        {
          time: '07:00',
          name: 'Café da Manhã',
          icon: 'Sunrise',
          targetCalories: breakfastCals,
          recipes: breakfastRecipes.slice(0, 2)
        },
        {
          time: '10:00',
          name: 'Lanche da Manhã',
          icon: 'Coffee',
          targetCalories: snack1Cals,
          recipes: snackRecipes.slice(0, 2)
        },
        {
          time: '12:30',
          name: 'Almoço',
          icon: 'Sun',
          targetCalories: lunchCals,
          recipes: lunchRecipes.slice(0, 3)
        },
        {
          time: '16:00',
          name: 'Lanche da Tarde',
          icon: 'Apple',
          targetCalories: snack2Cals,
          recipes: snackRecipes.slice(2, 4)
        },
        {
          time: '19:30',
          name: 'Jantar',
          icon: 'Sunset',
          targetCalories: dinnerCals,
          recipes: dinnerRecipes.slice(0, 3)
        }
      ],
      hydration: {
        daily: '3-4 litros',
        tips: 'Beba água ao longo do dia, especialmente antes, durante e após treinos'
      },
      supplements: goal === 'cutting' 
        ? ['Whey Protein', 'BCAA', 'L-Carnitina', 'Multivitamínico', 'Ômega 3']
        : goal === 'bulking'
        ? ['Whey Protein', 'Creatina', 'Hipercalórico', 'Multivitamínico', 'Glutamina']
        : ['Whey Protein', 'Multivitamínico', 'Ômega 3']
    }
    
    return diet
  }

  const calculateComplete = () => {
    if (!weight || !height || !age || !gender || !activityLevel || !goal) {
      alert('Preencha todos os campos obrigatórios')
      return
    }
    
    const weightNum = parseFloat(weight)
    const heightNum = parseFloat(height) / 100
    const ageNum = parseInt(age)
    const isSmoker = smoker === 'yes'
    
    const imc = weightNum / (heightNum * heightNum)
    
    let tmb = 0
    if (gender === 'male') {
      tmb = 88.362 + (13.397 * weightNum) + (4.799 * parseFloat(height)) - (5.677 * ageNum)
    } else {
      tmb = 447.593 + (9.247 * weightNum) + (3.098 * parseFloat(height)) - (4.330 * ageNum)
    }
    
    if (isSmoker) {
      tmb = tmb * 1.07
    }
    
    const activityMultipliers: { [key: string]: number } = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9
    }
    
    const tdee = tmb * activityMultipliers[activityLevel]
    
    let targetCalories = tdee
    let proteinGrams = 0
    let carbsGrams = 0
    let fatGrams = 0
    let recommendations = []
    let smokerRecommendations = []
    
    if (goal === 'cutting') {
      targetCalories = tdee - (isSmoker ? 300 : 500)
      proteinGrams = weightNum * (isSmoker ? 2.5 : 2.2)
      fatGrams = weightNum * 0.8
      carbsGrams = (targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4
      recommendations = [
        'Cardio 4-5x por semana (20-30 min)',
        'Treino de força 4-5x por semana',
        'Hidratação: 3-4L água por dia',
        'Suplementos: Whey, BCAA, L-Carnitina',
        'Refeições: 6-7 pequenas refeições'
      ]
      if (isSmoker) {
        smokerRecommendations = [
          '🚬 FUMANTE - Orientações Especiais:',
          '• Vitamina C: 1000mg/dia (antioxidante)',
          '• Cardio LEVE inicialmente (capacidade reduzida)',
          '• Hidratação EXTRA: 4-5L água/dia',
          '• Antioxidantes: Vitamina E, Selênio',
          '• Evite jejum prolongado',
          '• Considere parar de fumar para melhores resultados'
        ]
      }
    } else if (goal === 'bulking') {
      targetCalories = tdee + (isSmoker ? 300 : 500)
      proteinGrams = weightNum * (isSmoker ? 3.0 : 2.5)
      fatGrams = weightNum * 1.2
      carbsGrams = (targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4
      recommendations = [
        'Treino pesado 5-6x por semana',
        'Cardio leve 2-3x por semana',
        'Descanso: 7-8h de sono',
        'Suplementos: Whey, Creatina, Hipercalórico',
        'Progressão de cargas constante'
      ]
      if (isSmoker) {
        smokerRecommendations = [
          '🚬 FUMANTE - Cuidados Especiais:',
          '• EVITE bulking agressivo (risco cardiovascular)',
          '• Ganho máximo: 0.5kg/mês',
          '• Suplementação antioxidante OBRIGATÓRIA',
          '• Monitore pressão arterial',
          '• Cardio obrigatório mesmo no bulking',
          '• PARE DE FUMAR para resultados ótimos'
        ]
      }
    } else {
      proteinGrams = weightNum * (isSmoker ? 2.2 : 2.0)
      fatGrams = weightNum * 1.0
      carbsGrams = (targetCalories - (proteinGrams * 4) - (fatGrams * 9)) / 4
      recommendations = [
        'Treino regular 4-5x por semana',
        'Cardio moderado 3x por semana',
        'Dieta equilibrada e variada',
        'Suplementos básicos: Whey, Multivitamínico',
        'Consistência é a chave'
      ]
      if (isSmoker) {
        smokerRecommendations = [
          '🚬 FUMANTE - Recomendações Gerais:',
          '• Foque em parar de fumar PRIMEIRO',
          '• Suplementação antioxidante essencial',
          '• Exercícios respiratórios diários',
          '• Hidratação aumentada',
          '• Acompanhamento médico regular'
        ]
      }
    }
    
    let imcCategory = ''
    let imcColor = ''
    if (imc < 18.5) {
      imcCategory = 'Abaixo do peso'
      imcColor = 'text-blue-400'
    } else if (imc < 25) {
      imcCategory = 'Peso normal'
      imcColor = 'text-green-400'
    } else if (imc < 30) {
      imcCategory = 'Sobrepeso'
      imcColor = 'text-yellow-400'
    } else {
      imcCategory = 'Obesidade'
      imcColor = 'text-red-400'
    }
    
    const idealWeight = 22 * (heightNum * heightNum)
    
    const result = {
      imc: parseFloat(imc.toFixed(1)),
      imcCategory,
      imcColor,
      tmb: Math.round(tmb),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      proteinGrams: Math.round(proteinGrams),
      carbsGrams: Math.round(carbsGrams),
      fatGrams: Math.round(fatGrams),
      idealWeight: parseFloat(idealWeight.toFixed(1)),
      recommendations,
      smokerRecommendations,
      isSmoker,
      goal
    }
    
    setCalculationResult(result)

    // Gerar dieta personalizada
    const diet = generatePersonalizedDiet(result)
    setPersonalizedDiet(diet)
    localStorage.setItem('personalizedDiet', JSON.stringify(diet))

    setUserProfile(prev => ({
      ...prev,
      current_weight: weightNum,
      height: parseFloat(height),
      age: ageNum,
      gender,
      activity_level: activityLevel,
      goal,
      smoker: isSmoker
    }))
    
    // Mostrar notificação motivacional
    showMotivationalNotification()
    
    // Mostrar opção de salvar plano
    setShowSavePlanDialog(true)
  }

  // Funções para gerenciar planos de meta
  const savePlan = () => {
    if (!currentPlanName.trim()) {
      alert('Digite um nome para o plano')
      return
    }

    if (!calculationResult) {
      alert('Faça um cálculo primeiro')
      return
    }

    const newPlan: MetaPlan = {
      id: Date.now(),
      name: currentPlanName,
      createdAt: new Date().toISOString(),
      weight,
      height,
      age,
      gender,
      activityLevel,
      goal,
      smoker,
      calculationResult,
      personalizedDiet
    }

    const updatedPlans = [...savedPlans, newPlan]
    setSavedPlans(updatedPlans)
    localStorage.setItem('savedMetaPlans', JSON.stringify(updatedPlans))
    
    setCurrentPlanName('')
    setShowSavePlanDialog(false)
    
    alert('✅ Plano salvo com sucesso!')
  }

  const loadPlan = (plan: MetaPlan) => {
    setWeight(plan.weight)
    setHeight(plan.height)
    setAge(plan.age)
    setGender(plan.gender)
    setActivityLevel(plan.activityLevel)
    setGoal(plan.goal)
    setSmoker(plan.smoker)
    setCalculationResult(plan.calculationResult)
    setPersonalizedDiet(plan.personalizedDiet)
    
    localStorage.setItem('personalizedDiet', JSON.stringify(plan.personalizedDiet))
    
    alert(`✅ Plano "${plan.name}" carregado!`)
    setActiveTab('calculator')
  }

  const deletePlan = (planId: number) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return
    
    const updatedPlans = savedPlans.filter(p => p.id !== planId)
    setSavedPlans(updatedPlans)
    localStorage.setItem('savedMetaPlans', JSON.stringify(updatedPlans))
    
    alert('Plano excluído!')
  }

  const addProgress = () => {
    if (!newProgress.weight) {
      alert('Preencha pelo menos o peso')
      return
    }
    
    const progress = {
      id: Date.now(),
      date: newProgress.date,
      weight: parseFloat(newProgress.weight),
      bodyFat: newProgress.bodyFat ? parseFloat(newProgress.bodyFat) : null,
      notes: newProgress.notes
    }
    
    const updated = [...progressData, progress].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )
    
    setProgressData(updated)
    localStorage.setItem('progressData', JSON.stringify(updated))
    
    setNewProgress({
      date: new Date().toISOString().split('T')[0],
      weight: '',
      bodyFat: '',
      notes: ''
    })
    
    // Mostrar notificação motivacional
    showMotivationalNotification()
    
    alert('Progresso registrado com sucesso!')
  }

  const markWorkoutComplete = (workout: any) => {
    const completed = {
      id: Date.now(),
      workoutDay: workout.day,
      workoutName: workout.name,
      completedAt: new Date().toISOString(),
      exercisesCompleted: workout.exercises.length
    }
    
    const updated = [completed, ...completedWorkouts]
    setCompletedWorkouts(updated)
    localStorage.setItem('completedWorkouts', JSON.stringify(updated))
    
    // Mostrar notificação motivacional
    showMotivationalNotification()
    
    alert('Treino marcado como concluído! 💪')
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    
    const userMessage = {
      id: chatMessages.length + 1,
      type: 'user' as const,
      message: newMessage
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setIsTyping(true)
    
    setTimeout(() => {
      const aiResponse = {
        id: chatMessages.length + 2,
        type: 'ai' as const,
        message: getPersonalizedAIResponse(newMessage)
      }
      setChatMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
    
    setNewMessage('')
  }

  const getPersonalizedAIResponse = (message: string) => {
    const lowerMessage = message.toLowerCase()
    const userName = user?.username || 'atleta'
    
    if (lowerMessage.includes('treino') || lowerMessage.includes('exercício')) {
      return `${userName}, para treinos eficazes, recomendo seguir o sistema profissional baseado em grupos musculares! Vá na aba "Treinos" e escolha seu nível. Cada treino tem vídeos demonstrativos! 💪`
    }
    
    if (lowerMessage.includes('dieta') || lowerMessage.includes('alimentação')) {
      return `${userName}, na aba "Nutrição" você encontra sua dieta personalizada com receitas organizadas por horário! Tudo calculado baseado nos seus objetivos! 🥗`
    }
    
    if (lowerMessage.includes('progresso')) {
      return `${userName}, use a aba "Progresso" para registrar seu peso, medidas e acompanhar sua evolução com gráficos! Consistência é a chave! 📊`
    }
    
    return `${userName}, estou aqui para te ajudar! Pergunte sobre treinos, dietas, suplementação ou progresso. Vamos juntos nessa jornada! 🚀`
  }

  const submitFeedback = () => {
    if (feedbackRating === 0) {
      alert('Por favor, selecione uma avaliação')
      return
    }
    
    const feedback = {
      id: Date.now(),
      rating: feedbackRating,
      comment: feedbackComment,
      date: new Date().toISOString()
    }
    
    // Salvar no localStorage
    const savedFeedbacks = localStorage.getItem('userFeedbacks')
    const feedbacks = savedFeedbacks ? JSON.parse(savedFeedbacks) : []
    feedbacks.push(feedback)
    localStorage.setItem('userFeedbacks', JSON.stringify(feedbacks))
    
    setFeedbackSubmitted(true)
    
    // Mostrar notificação motivacional
    showMotivationalNotification()
    
    setTimeout(() => {
      setFeedbackRating(0)
      setFeedbackComment('')
      setFeedbackSubmitted(false)
    }, 3000)
  }

  const handleSignOut = async () => {
    signOut()
  }

  const getWorkoutsByLevel = (level: string) => {
    return workoutPlans[level as keyof typeof workoutPlans]?.workouts || []
  }

  const getWeeklyProgress = () => {
    if (progressData.length < 2) return 0
    
    const sorted = [...progressData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const latest = sorted[sorted.length - 1]
    const previous = sorted[sorted.length - 2]
    
    return ((latest.weight - previous.weight) / previous.weight * 100).toFixed(1)
  }

  const openVideoPlayer = (videoUrl: string) => {
    setSelectedVideo(videoUrl)
  }

  const closeVideoPlayer = () => {
    setSelectedVideo(null)
  }

  const downloadVideo = async (videoUrl: string, exerciseName: string) => {
    const videoId = videoUrl.split('/').pop() || ''
    const downloaded = {
      ...downloadedVideos,
      [videoId]: exerciseName
    }
    setDownloadedVideos(downloaded)
    localStorage.setItem('downloadedVideos', JSON.stringify(downloaded))
    alert(`Vídeo "${exerciseName}" salvo para visualização offline! 📥`)
  }

  const getMealIcon = (iconName: string) => {
    const icons: any = {
      'Sunrise': Sunrise,
      'Coffee': Coffee,
      'Sun': Sun,
      'Apple': Apple,
      'Sunset': Sunset,
      'Moon': Moon
    }
    return icons[iconName] || Sun
  }

  const searchExerciseOnYouTube = (exerciseName: string) => {
    const searchQuery = encodeURIComponent(`${exerciseName} como fazer tutorial`)
    const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer')
  }

  const getFilteredRecipes = () => {
    if (recipeFilter === 'all') return extraRecipes
    return extraRecipes.filter(recipe => recipe.category === recipeFilter)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando aplicativo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Notificação Motivacional */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <Card className="bg-gradient-to-r from-red-600 via-orange-600 to-red-600 border-2 border-yellow-400 shadow-2xl shadow-red-600/50 max-w-md">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Bell className="h-6 w-6 text-yellow-400 animate-bounce flex-shrink-0 mt-1" />
                <div>
                  <p className="text-white font-black text-sm mb-1">💪 MOTIVAÇÃO DO DIA</p>
                  <p className="text-white text-sm font-semibold leading-relaxed">{currentMotivation}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNotification(false)}
                  className="text-white hover:bg-white/20 ml-auto flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dialog para salvar plano */}
      {showSavePlanDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <Card className="bg-gradient-to-br from-gray-900 to-black border-2 border-green-600 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white font-black flex items-center gap-2">
                <Save className="h-6 w-6 text-green-400" />
                Salvar Plano de Meta
              </CardTitle>
              <CardDescription className="text-gray-400">
                Dê um nome para este plano e salve para usar depois
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name" className="text-gray-300">Nome do Plano</Label>
                <Input
                  id="plan-name"
                  value={currentPlanName}
                  onChange={(e) => setCurrentPlanName(e.target.value)}
                  placeholder="Ex: Cutting Verão 2024"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={savePlan}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  onClick={() => {
                    setShowSavePlanDialog(false)
                    setCurrentPlanName('')
                  }}
                  variant="outline"
                  className="flex-1 border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header Dark Hardcore com Logo BEYOND PAIN */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b-4 border-red-600 shadow-2xl shadow-red-900/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              {/* Logo BEYOND PAIN com Caveira em Chamas */}
              <div className="relative">
                <img 
                  src="https://k6hrqrxuu8obbfwn.public.blob.vercel-storage.com/temp/2b4fd262-4d12-4ac5-9d0b-204137380360.jpg" 
                  alt="Beyond Pain Logo" 
                  className="h-20 w-20 rounded-full border-4 border-red-600 shadow-2xl shadow-red-600/70 animate-pulse"
                />
                <div className="absolute -top-1 -right-1">
                  <Flame className="h-8 w-8 text-orange-500 animate-bounce" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-600 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">
                  BEYOND PAIN
                </h1>
                <p className="text-sm text-gray-300 font-black tracking-[0.3em] uppercase mt-1">
                  LIFEPRO FITNESS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={showMotivationalNotification}
                variant="outline"
                size="sm"
                className="border-2 border-yellow-600 text-yellow-500 hover:bg-yellow-600 hover:text-white font-black transition-all duration-300 hover:scale-105"
              >
                <Bell className="h-4 w-4 mr-2" />
                Motivação
              </Button>
              <div className="text-right">
                <p className="text-white font-black text-lg">{profile?.full_name || user?.username}</p>
                <p className="text-sm text-red-500 font-black flex items-center gap-2 justify-end">
                  <Skull className="h-5 w-5 animate-pulse" />
                  MODO BEAST ATIVADO
                </p>
              </div>
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                size="sm" 
                className="border-2 border-red-600 text-red-500 hover:bg-red-600 hover:text-white font-black transition-all duration-300 hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vídeo */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
          <div className="relative w-full max-w-4xl">
            <Button
              onClick={closeVideoPlayer}
              className="absolute -top-12 right-0 bg-red-600 hover:bg-red-700 font-bold"
              size="sm"
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
            <div className="aspect-video w-full bg-black rounded-lg overflow-hidden border-2 border-red-600 shadow-2xl shadow-red-600/50">
              <iframe
                src={selectedVideo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-2 border-red-600/50 p-1 h-auto">
            <TabsTrigger 
              value="calculator" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white text-gray-400 font-bold text-xs sm:text-sm py-2 px-2"
            >
              <Calculator className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Calculadora</span>
              <span className="sm:hidden">Calc</span>
            </TabsTrigger>
            <TabsTrigger 
              value="metas" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white text-gray-400 font-bold text-xs sm:text-sm py-2 px-2"
            >
              <Target className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Metas</span>
              <span className="sm:hidden">Meta</span>
            </TabsTrigger>
            <TabsTrigger 
              value="workouts" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white text-gray-400 font-bold text-xs sm:text-sm py-2 px-2"
            >
              <Dumbbell className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Treinos</span>
              <span className="sm:hidden">Treino</span>
            </TabsTrigger>
            <TabsTrigger 
              value="diet" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white text-gray-400 font-bold text-xs sm:text-sm py-2 px-2"
            >
              <UtensilsCrossed className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Nutrição</span>
              <span className="sm:hidden">Dieta</span>
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white text-gray-400 font-bold text-xs sm:text-sm py-2 px-2"
            >
              <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Progresso</span>
              <span className="sm:hidden">Prog</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ai-coach" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white text-gray-400 font-bold text-xs sm:text-sm py-2 px-2"
            >
              <MessageCircle className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">IA Coach</span>
              <span className="sm:hidden">IA</span>
            </TabsTrigger>
            <TabsTrigger 
              value="feedback" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white text-gray-400 font-bold text-xs sm:text-sm py-2 px-2"
            >
              <Star className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Feedback</span>
              <span className="sm:hidden">Feed</span>
            </TabsTrigger>
          </TabsList>

          {/* ABA CALCULADORA */}
          <TabsContent value="calculator" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-red-500" />
                  Calculadora Completa de Fitness
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Calcule seu IMC, TMB, TDEE e receba um plano personalizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-gray-300 font-bold">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Ex: 75"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height" className="text-gray-300 font-bold">Altura (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="Ex: 175"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age" className="text-gray-300 font-bold">Idade</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="Ex: 25"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-gray-300 font-bold">Sexo</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="male" className="text-white">Masculino</SelectItem>
                        <SelectItem value="female" className="text-white">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity" className="text-gray-300 font-bold">Nível de Atividade</Label>
                    <Select value={activityLevel} onValueChange={setActivityLevel}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="sedentary" className="text-white">Sedentário</SelectItem>
                        <SelectItem value="light" className="text-white">Levemente ativo</SelectItem>
                        <SelectItem value="moderate" className="text-white">Moderadamente ativo</SelectItem>
                        <SelectItem value="active" className="text-white">Muito ativo</SelectItem>
                        <SelectItem value="very_active" className="text-white">Extremamente ativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal" className="text-gray-300 font-bold">Objetivo</Label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="cutting" className="text-white">Cutting (Perder gordura)</SelectItem>
                        <SelectItem value="bulking" className="text-white">Bulking (Ganhar massa)</SelectItem>
                        <SelectItem value="maintenance" className="text-white">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="smoker" className="text-gray-300 font-bold flex items-center gap-2">
                      <Cigarette className="h-4 w-4 text-red-500" />
                      Você fuma?
                    </Label>
                    <Select value={smoker} onValueChange={setSmoker}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="no" className="text-white">Não</SelectItem>
                        <SelectItem value="yes" className="text-white">Sim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={calculateComplete}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 font-black text-lg py-6"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Calcular Tudo
                </Button>

                {calculationResult && (
                  <div className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-600/50">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-gray-400 text-sm mb-2">IMC</p>
                            <p className={`text-4xl font-black ${calculationResult.imcColor}`}>
                              {calculationResult.imc}
                            </p>
                            <p className="text-gray-300 text-sm mt-2">{calculationResult.imcCategory}</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-600/50">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-gray-400 text-sm mb-2">TMB</p>
                            <p className="text-4xl font-black text-green-400">{calculationResult.tmb}</p>
                            <p className="text-gray-300 text-sm mt-2">calorias/dia</p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-600/50">
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <p className="text-gray-400 text-sm mb-2">TDEE</p>
                            <p className="text-4xl font-black text-orange-400">{calculationResult.tdee}</p>
                            <p className="text-gray-300 text-sm mt-2">calorias/dia</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-600/50">
                      <CardHeader>
                        <CardTitle className="text-white font-black">Plano Personalizado</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-black/40 rounded-lg">
                            <p className="text-gray-400 text-sm">Meta Calorias</p>
                            <p className="text-2xl font-black text-red-400">{calculationResult.targetCalories}</p>
                          </div>
                          <div className="text-center p-4 bg-black/40 rounded-lg">
                            <p className="text-gray-400 text-sm">Proteína</p>
                            <p className="text-2xl font-black text-blue-400">{calculationResult.proteinGrams}g</p>
                          </div>
                          <div className="text-center p-4 bg-black/40 rounded-lg">
                            <p className="text-gray-400 text-sm">Carboidratos</p>
                            <p className="text-2xl font-black text-yellow-400">{calculationResult.carbsGrams}g</p>
                          </div>
                          <div className="text-center p-4 bg-black/40 rounded-lg">
                            <p className="text-gray-400 text-sm">Gorduras</p>
                            <p className="text-2xl font-black text-green-400">{calculationResult.fatGrams}g</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-white font-bold flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Recomendações
                          </h4>
                          <ul className="space-y-1">
                            {calculationResult.recommendations.map((rec: string, idx: number) => (
                              <li key={idx} className="text-gray-300 text-sm flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {calculationResult.isSmoker && calculationResult.smokerRecommendations.length > 0 && (
                          <div className="space-y-2 p-4 bg-red-900/30 border border-red-600/50 rounded-lg">
                            <h4 className="text-red-400 font-bold flex items-center gap-2">
                              <Cigarette className="h-5 w-5" />
                              {calculationResult.smokerRecommendations[0]}
                            </h4>
                            <ul className="space-y-1">
                              {calculationResult.smokerRecommendations.slice(1).map((rec: string, idx: number) => (
                                <li key={idx} className="text-gray-300 text-sm">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA METAS */}
          <TabsContent value="metas" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <Target className="h-6 w-6 text-red-500" />
                  Meus Planos de Meta
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Gerencie seus planos salvos e carregue quando precisar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {savedPlans.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">Nenhum plano salvo ainda</p>
                    <p className="text-gray-500 text-sm">Faça um cálculo na aba Calculadora e salve seu plano!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {savedPlans.map((plan) => (
                      <Card key={plan.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-green-600/50">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-white font-black">{plan.name}</CardTitle>
                              <CardDescription className="text-gray-400 text-sm">
                                Criado em {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                              </CardDescription>
                            </div>
                            <Button
                              onClick={() => deletePlan(plan.id)}
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:bg-red-600 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-gray-500">Peso</p>
                              <p className="text-white font-bold">{plan.weight} kg</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Altura</p>
                              <p className="text-white font-bold">{plan.height} cm</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Objetivo</p>
                              <p className="text-white font-bold capitalize">{plan.goal}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">IMC</p>
                              <p className="text-white font-bold">{plan.calculationResult?.imc}</p>
                            </div>
                          </div>
                          <Button
                            onClick={() => loadPlan(plan)}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Carregar Plano
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA TREINOS - ATUALIZADA COM 3 NÍVEIS */}
          <TabsContent value="workouts" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <Dumbbell className="h-6 w-6 text-red-500" />
                  Treinos Profissionais com Vídeos
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Escolha seu nível e siga o plano profissional com vídeos demonstrativos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Seletor de Nível */}
                <div className="space-y-2">
                  <Label className="text-gray-300 font-bold">Selecione seu Nível</Label>
                  <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Iniciante">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-600">Iniciante</Badge>
                          <span className="text-white">4x3 - Começando agora</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Intermediário">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-600">Intermediário</Badge>
                          <span className="text-white">5x2 - 3-6 meses de treino</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="Avançado">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-600">Avançado</Badge>
                          <span className="text-white">6x1 - Nível profissional</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Info do Nível Selecionado */}
                <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-600/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge className={`text-lg px-4 py-2 ${
                        fitnessLevel === 'Iniciante' ? 'bg-green-600' :
                        fitnessLevel === 'Intermediário' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}>
                        {fitnessLevel}
                      </Badge>
                      <div>
                        <p className="text-white font-bold">{workoutPlans[fitnessLevel as keyof typeof workoutPlans]?.schedule}</p>
                        <p className="text-gray-400 text-sm">{workoutPlans[fitnessLevel as keyof typeof workoutPlans]?.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista de Treinos */}
                <div className="space-y-4">
                  {getWorkoutsByLevel(fitnessLevel).map((workout: any) => (
                    <Card key={workout.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-red-600/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-5 w-5 text-red-400" />
                              <CardTitle className="text-white font-black">{workout.day}</CardTitle>
                            </div>
                            <CardDescription className="text-lg font-bold text-red-400 mb-2">
                              {workout.name}
                            </CardDescription>
                            <p className="text-gray-400 text-sm">{workout.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {workout.duration}
                              </span>
                              <Badge variant="outline" className="border-red-600 text-red-400">
                                {workout.level}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            onClick={() => markWorkoutComplete(workout)}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                            size="sm"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Concluir
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {workout.exercises.map((exercise: any, idx: number) => (
                            <div key={idx} className="bg-black/40 p-4 rounded-lg border border-gray-700">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="text-white font-bold">{exercise.name}</h4>
                                  <div className="flex items-center gap-4 mt-1">
                                    <Badge className="bg-red-600">{exercise.sets}</Badge>
                                    <span className="text-gray-400 text-sm">{exercise.worksMuscle}</span>
                                  </div>
                                  <p className="text-gray-500 text-xs mt-1">💡 {exercise.tips}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => openVideoPlayer(exercise.video)}
                                    size="sm"
                                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Ver Vídeo
                                  </Button>
                                  <Button
                                    onClick={() => downloadVideo(exercise.video, exercise.name)}
                                    size="sm"
                                    variant="outline"
                                    className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600/50 rounded-lg">
                          <p className="text-yellow-400 font-bold text-sm">💪 Dica do Treino:</p>
                          <p className="text-gray-300 text-sm mt-1">{workout.tips}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA NUTRIÇÃO - REORGANIZADA */}
          <TabsContent value="diet" className="space-y-6">
            {/* SEÇÃO 1: DIETA PERSONALIZADA */}
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <UtensilsCrossed className="h-6 w-6 text-red-500" />
                  Dieta Personalizada
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Plano alimentar baseado nos seus objetivos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!personalizedDiet ? (
                  <div className="text-center py-12">
                    <ChefHat className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">Nenhuma dieta gerada ainda</p>
                    <p className="text-gray-500 text-sm">Faça um cálculo na aba Calculadora para gerar sua dieta!</p>
                  </div>
                ) : (
                  <>
                    {/* Resumo Nutricional */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-600/50">
                        <CardContent className="pt-6 text-center">
                          <Flame className="h-8 w-8 text-red-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Calorias</p>
                          <p className="text-2xl font-black text-red-400">{personalizedDiet.totalCalories}</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-600/50">
                        <CardContent className="pt-6 text-center">
                          <Activity className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Proteína</p>
                          <p className="text-2xl font-black text-blue-400">{personalizedDiet.totalProtein}g</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-600/50">
                        <CardContent className="pt-6 text-center">
                          <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Carboidratos</p>
                          <p className="text-2xl font-black text-yellow-400">{personalizedDiet.totalCarbs}g</p>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-600/50">
                        <CardContent className="pt-6 text-center">
                          <Scale className="h-8 w-8 text-green-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm">Gorduras</p>
                          <p className="text-2xl font-black text-green-400">{personalizedDiet.totalFats}g</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Refeições */}
                    <div className="space-y-4">
                      {personalizedDiet.meals.map((meal: any, idx: number) => {
                        const IconComponent = getMealIcon(meal.icon)
                        return (
                          <Card key={idx} className="bg-gradient-to-br from-gray-800 to-gray-900 border-orange-600/50">
                            <CardHeader>
                              <div className="flex items-center gap-3">
                                <IconComponent className="h-6 w-6 text-orange-400" />
                                <div>
                                  <CardTitle className="text-white font-black">{meal.name}</CardTitle>
                                  <CardDescription className="text-gray-400">
                                    {meal.time} • {meal.targetCalories} calorias
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                {meal.recipes.map((recipe: any) => (
                                  <div key={recipe.id} className="bg-black/40 p-4 rounded-lg border border-gray-700">
                                    <h4 className="text-white font-bold mb-2">{recipe.name}</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                                      <div>
                                        <p className="text-gray-500">Calorias</p>
                                        <p className="text-white font-bold">{recipe.calories}</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Proteína</p>
                                        <p className="text-blue-400 font-bold">{recipe.protein}g</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Carbs</p>
                                        <p className="text-yellow-400 font-bold">{recipe.carbs}g</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">Gordura</p>
                                        <p className="text-green-400 font-bold">{recipe.fats}g</p>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-gray-400 text-sm font-bold">Ingredientes:</p>
                                        <ul className="text-gray-300 text-sm list-disc list-inside">
                                          {recipe.ingredients.map((ing: string, i: number) => (
                                            <li key={i}>{ing}</li>
                                          ))}
                                        </ul>
                                      </div>
                                      <div>
                                        <p className="text-gray-400 text-sm font-bold">Modo de Preparo:</p>
                                        <ol className="text-gray-300 text-sm list-decimal list-inside">
                                          {recipe.instructions.map((inst: string, i: number) => (
                                            <li key={i}>{inst}</li>
                                          ))}
                                        </ol>
                                      </div>
                                      <div className="p-2 bg-yellow-900/30 border border-yellow-600/50 rounded">
                                        <p className="text-yellow-400 text-xs">💡 {recipe.tips}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>

                    {/* Suplementos */}
                    <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-600/50">
                      <CardHeader>
                        <CardTitle className="text-white font-black flex items-center gap-2">
                          <Pill className="h-6 w-6 text-purple-400" />
                          Suplementos Recomendados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {personalizedDiet.supplements.map((supp: string, idx: number) => (
                            <Badge key={idx} className="bg-purple-600 text-white px-3 py-1">
                              {supp}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </CardContent>
            </Card>

            {/* SEÇÃO 2: RECEITAS FITNESS EXTRAS */}
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-orange-600/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                      <Cookie className="h-6 w-6 text-orange-500" />
                      Receitas Fitness Extras
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      15 receitas deliciosas para quando quiser variar fora da dieta
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <Select value={recipeFilter} onValueChange={setRecipeFilter}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all" className="text-white">Todas</SelectItem>
                        <SelectItem value="Café da Manhã" className="text-white">Café da Manhã</SelectItem>
                        <SelectItem value="Almoço" className="text-white">Almoço</SelectItem>
                        <SelectItem value="Jantar" className="text-white">Jantar</SelectItem>
                        <SelectItem value="Lanche" className="text-white">Lanche</SelectItem>
                        <SelectItem value="Sobremesa" className="text-white">Sobremesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredRecipes().map((recipe) => (
                    <Card key={recipe.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-orange-600/30 hover:border-orange-600 transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge className="bg-orange-600">{recipe.category}</Badge>
                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Clock className="h-3 w-3" />
                            {recipe.prepTime + recipe.cookTime} min
                          </div>
                        </div>
                        <CardTitle className="text-white font-bold text-lg">{recipe.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Info Nutricional */}
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="bg-black/40 p-2 rounded">
                            <p className="text-gray-500">Cal</p>
                            <p className="text-red-400 font-bold">{recipe.calories}</p>
                          </div>
                          <div className="bg-black/40 p-2 rounded">
                            <p className="text-gray-500">Prot</p>
                            <p className="text-blue-400 font-bold">{recipe.protein}g</p>
                          </div>
                          <div className="bg-black/40 p-2 rounded">
                            <p className="text-gray-500">Carb</p>
                            <p className="text-yellow-400 font-bold">{recipe.carbs}g</p>
                          </div>
                          <div className="bg-black/40 p-2 rounded">
                            <p className="text-gray-500">Gord</p>
                            <p className="text-green-400 font-bold">{recipe.fats}g</p>
                          </div>
                        </div>

                        {/* Ingredientes */}
                        <div>
                          <p className="text-gray-400 text-xs font-bold mb-1">Ingredientes:</p>
                          <ul className="text-gray-300 text-xs list-disc list-inside space-y-0.5">
                            {recipe.ingredients.slice(0, 3).map((ing, i) => (
                              <li key={i}>{ing}</li>
                            ))}
                            {recipe.ingredients.length > 3 && (
                              <li className="text-gray-500">+ {recipe.ingredients.length - 3} mais...</li>
                            )}
                          </ul>
                        </div>

                        {/* Modo de Preparo */}
                        <div>
                          <p className="text-gray-400 text-xs font-bold mb-1">Preparo:</p>
                          <ol className="text-gray-300 text-xs list-decimal list-inside space-y-0.5">
                            {recipe.instructions.slice(0, 2).map((inst, i) => (
                              <li key={i}>{inst}</li>
                            ))}
                            {recipe.instructions.length > 2 && (
                              <li className="text-gray-500">+ {recipe.instructions.length - 2} passos...</li>
                            )}
                          </ol>
                        </div>

                        {/* Dica */}
                        <div className="p-2 bg-yellow-900/30 border border-yellow-600/50 rounded">
                          <p className="text-yellow-400 text-xs">💡 {recipe.tips}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA PROGRESSO */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-red-500" />
                  Acompanhamento de Progresso
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Registre e acompanhe sua evolução
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulário de Registro */}
                <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-green-600/50">
                  <CardHeader>
                    <CardTitle className="text-white font-black flex items-center gap-2">
                      <Plus className="h-5 w-5 text-green-400" />
                      Registrar Progresso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="progress-date" className="text-gray-300">Data</Label>
                        <Input
                          id="progress-date"
                          type="date"
                          value={newProgress.date}
                          onChange={(e) => setNewProgress({...newProgress, date: e.target.value})}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="progress-weight" className="text-gray-300">Peso (kg)</Label>
                        <Input
                          id="progress-weight"
                          type="number"
                          step="0.1"
                          value={newProgress.weight}
                          onChange={(e) => setNewProgress({...newProgress, weight: e.target.value})}
                          placeholder="Ex: 75.5"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="progress-bodyfat" className="text-gray-300">% Gordura (opcional)</Label>
                        <Input
                          id="progress-bodyfat"
                          type="number"
                          step="0.1"
                          value={newProgress.bodyFat}
                          onChange={(e) => setNewProgress({...newProgress, bodyFat: e.target.value})}
                          placeholder="Ex: 15.5"
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="progress-notes" className="text-gray-300">Observações</Label>
                      <Textarea
                        id="progress-notes"
                        value={newProgress.notes}
                        onChange={(e) => setNewProgress({...newProgress, notes: e.target.value})}
                        placeholder="Como você está se sentindo? Alguma mudança notável?"
                        className="bg-gray-800 border-gray-700 text-white"
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={addProgress}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Registro
                    </Button>
                  </CardContent>
                </Card>

                {/* Histórico de Progresso */}
                {progressData.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-white font-black text-xl flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-blue-400" />
                      Histórico
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {progressData.map((progress) => (
                        <Card key={progress.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border-blue-600/50">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="text-gray-400 text-sm">
                                  {new Date(progress.date).toLocaleDateString('pt-BR')}
                                </p>
                                <p className="text-white text-2xl font-black">{progress.weight} kg</p>
                                {progress.bodyFat && (
                                  <p className="text-yellow-400 text-sm">{progress.bodyFat}% gordura</p>
                                )}
                              </div>
                              <TrendingUp className="h-6 w-6 text-green-400" />
                            </div>
                            {progress.notes && (
                              <p className="text-gray-300 text-sm border-t border-gray-700 pt-3">
                                {progress.notes}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">Nenhum registro ainda</p>
                    <p className="text-gray-500 text-sm">Comece a registrar seu progresso acima!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA IA COACH */}
          <TabsContent value="ai-coach" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <Bot className="h-6 w-6 text-red-500" />
                  IA Coach Personalizado
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Tire suas dúvidas sobre treinos, dietas e motivação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mensagens do Chat */}
                  <div className="bg-gray-800 rounded-lg p-4 h-96 overflow-y-auto space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          {msg.type === 'ai' && (
                            <div className="flex items-center gap-2 mb-2">
                              <Bot className="h-4 w-4 text-red-400" />
                              <span className="text-red-400 font-bold text-sm">IA Coach</span>
                            </div>
                          )}
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-700 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-red-400" />
                            <span className="text-gray-400 text-sm">Digitando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input de Mensagem */}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Digite sua pergunta..."
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                    <Button
                      onClick={sendMessage}
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA FEEDBACK */}
          <TabsContent value="feedback" className="space-y-6">
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-600/50">
              <CardHeader>
                <CardTitle className="text-white text-2xl font-black flex items-center gap-2">
                  <Star className="h-6 w-6 text-red-500" />
                  Avalie o Aplicativo
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Sua opinião é muito importante para nós!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!feedbackSubmitted ? (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300 font-bold">Como você avalia o aplicativo?</Label>
                        <div className="flex gap-2 justify-center">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Button
                              key={rating}
                              onClick={() => setFeedbackRating(rating)}
                              variant={feedbackRating === rating ? 'default' : 'outline'}
                              size="lg"
                              className={`${
                                feedbackRating === rating
                                  ? 'bg-gradient-to-r from-red-600 to-orange-600'
                                  : 'border-gray-700 text-gray-400'
                              }`}
                            >
                              <Star className="h-6 w-6" />
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feedback-comment" className="text-gray-300 font-bold">
                          Comentários (opcional)
                        </Label>
                        <Textarea
                          id="feedback-comment"
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          placeholder="Conte-nos o que você achou..."
                          className="bg-gray-800 border-gray-700 text-white"
                          rows={5}
                        />
                      </div>

                      <Button
                        onClick={submitFeedback}
                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 font-black text-lg py-6"
                      >
                        <Star className="h-5 w-5 mr-2" />
                        Enviar Avaliação
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-white text-2xl font-black mb-2">Obrigado pelo feedback!</p>
                    <p className="text-gray-400">Sua opinião nos ajuda a melhorar cada vez mais! 💪</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

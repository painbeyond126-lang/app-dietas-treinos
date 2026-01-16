import { UserFitnessProfile, WorkoutSession, ProgressMeasurement } from './supabase-fitness'

export interface AICoachResponse {
  message: string
  type: 'advice' | 'motivation' | 'correction' | 'plan' | 'analysis'
  priority: 'low' | 'medium' | 'high'
  actionItems?: string[]
}

export class PersonalizedAICoach {
  private profile: UserFitnessProfile | null
  private workoutHistory: WorkoutSession[]
  private progressHistory: ProgressMeasurement[]

  constructor(
    profile: UserFitnessProfile | null = null,
    workoutHistory: WorkoutSession[] = [],
    progressHistory: ProgressMeasurement[] = []
  ) {
    this.profile = profile
    this.workoutHistory = workoutHistory
    this.progressHistory = progressHistory
  }

  updateData(profile: UserFitnessProfile | null, workoutHistory: WorkoutSession[], progressHistory: ProgressMeasurement[]) {
    this.profile = profile
    this.workoutHistory = workoutHistory
    this.progressHistory = progressHistory
  }

  generateResponse(userMessage: string): AICoachResponse {
    const lowerMessage = userMessage.toLowerCase()
    const userName = this.profile?.user_id ? 'atleta' : 'atleta'

    // Análise de contexto personalizado
    const context = this.analyzeUserContext()

    // Respostas baseadas em cutting
    if (lowerMessage.includes('cutting') || lowerMessage.includes('definição') || lowerMessage.includes('perder peso')) {
      return this.generateCuttingAdvice(context)
    }

    // Respostas baseadas em bulking
    if (lowerMessage.includes('bulking') || lowerMessage.includes('massa') || lowerMessage.includes('ganhar peso')) {
      return this.generateBulkingAdvice(context)
    }

    // Respostas sobre treino
    if (lowerMessage.includes('treino') || lowerMessage.includes('exercício') || lowerMessage.includes('musculação')) {
      return this.generateWorkoutAdvice(context)
    }

    // Respostas sobre dieta
    if (lowerMessage.includes('dieta') || lowerMessage.includes('alimentação') || lowerMessage.includes('comida')) {
      return this.generateNutritionAdvice(context)
    }

    // Respostas sobre suplementos
    if (lowerMessage.includes('suplemento') || lowerMessage.includes('whey') || lowerMessage.includes('creatina')) {
      return this.generateSupplementAdvice(context)
    }

    // Respostas motivacionais
    if (lowerMessage.includes('motivação') || lowerMessage.includes('desânimo') || lowerMessage.includes('desistir')) {
      return this.generateMotivationalResponse(context)
    }

    // Análise de progresso
    if (lowerMessage.includes('progresso') || lowerMessage.includes('resultado') || lowerMessage.includes('evolução')) {
      return this.generateProgressAnalysis(context)
    }

    // Resposta padrão personalizada
    return this.generateDefaultResponse(context)
  }

  private analyzeUserContext() {
    const context: any = {
      hasProfile: !!this.profile,
      workoutFrequency: this.calculateWorkoutFrequency(),
      progressTrend: this.analyzeProgressTrend(),
      fitnessLevel: this.profile?.fitness_level || 'Iniciante',
      goal: this.profile?.goal || 'maintenance',
      recentWorkouts: this.workoutHistory.slice(0, 5),
      needsMotivation: this.workoutFrequency < 2
    }

    return context
  }

  private calculateWorkoutFrequency(): number {
    if (this.workoutHistory.length === 0) return 0
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentWorkouts = this.workoutHistory.filter(
      workout => new Date(workout.completed_at) >= thirtyDaysAgo
    )
    
    return recentWorkouts.length / 4 // workouts per week
  }

  private analyzeProgressTrend(): 'improving' | 'stable' | 'declining' | 'unknown' {
    if (this.progressHistory.length < 2) return 'unknown'
    
    const recent = this.progressHistory[0]
    const previous = this.progressHistory[1]
    
    if (!recent || !previous) return 'unknown'
    
    const weightChange = recent.weight - previous.weight
    
    if (this.profile?.goal === 'cutting') {
      return weightChange < -0.5 ? 'improving' : weightChange > 0.5 ? 'declining' : 'stable'
    } else if (this.profile?.goal === 'bulking') {
      return weightChange > 0.5 ? 'improving' : weightChange < -0.5 ? 'declining' : 'stable'
    }
    
    return 'stable'
  }

  private generateCuttingAdvice(context: any): AICoachResponse {
    const personalizedCalories = this.calculatePersonalizedCalories()
    
    let message = `🔥 **Plano de Cutting Personalizado para Você!**\n\n`
    
    if (this.profile) {
      message += `📊 **Baseado no seu perfil:**\n`
      message += `• Peso atual: ${this.profile.current_weight}kg\n`
      message += `• Meta calórica: ${personalizedCalories?.cutting || 'Calcule na aba Calculadora'} kcal/dia\n`
      message += `• Proteína: ${this.profile.current_weight * 2.2}g/dia\n\n`
    }

    message += `💡 **Estratégia Específica:**\n`
    message += `• Déficit calórico: 300-500 kcal\n`
    message += `• Cardio: 4-5x/semana (HIIT + LISS)\n`
    message += `• Treino de força: manter intensidade\n`
    message += `• Hidratação: 3-4L água/dia\n\n`

    if (context.workoutFrequency < 4) {
      message += `⚠️ **Atenção:** Sua frequência de treino está baixa (${context.workoutFrequency.toFixed(1)}x/semana). Para cutting eficaz, recomendo 4-5 treinos semanais.\n\n`
    }

    if (context.progressTrend === 'declining') {
      message += `📈 **Ajuste Necessário:** Seus dados mostram que você pode estar perdendo peso muito rápido. Considere aumentar 100-200 kcal na dieta.\n\n`
    }

    message += `🎯 **Próximos Passos:**\n`
    message += `1. Use nossa calculadora para definir suas macros\n`
    message += `2. Escolha um plano de cutting na aba Cut/Bulk\n`
    message += `3. Monitore seu progresso semanalmente\n\n`
    message += `Quer que eu crie um plano específico baseado nos seus dados?`

    return {
      message,
      type: 'plan',
      priority: 'high',
      actionItems: ['Calcular macros', 'Escolher plano de cutting', 'Aumentar frequência de treino']
    }
  }

  private generateBulkingAdvice(context: any): AICoachResponse {
    const personalizedCalories = this.calculatePersonalizedCalories()
    
    let message = `💪 **Plano de Bulking Personalizado!**\n\n`
    
    if (this.profile) {
      message += `📊 **Baseado no seu perfil:**\n`
      message += `• Peso atual: ${this.profile.current_weight}kg\n`
      message += `• Meta calórica: ${personalizedCalories?.bulking || 'Calcule na aba Calculadora'} kcal/dia\n`
      message += `• Proteína: ${this.profile.current_weight * 2.5}g/dia\n\n`
    }

    message += `🎯 **Estratégia de Ganho de Massa:**\n`
    message += `• Superávit: 300-500 kcal (ganho limpo)\n`
    message += `• Carboidratos: 4-5g/kg (energia para treinos)\n`
    message += `• Gorduras: 1.2g/kg (hormônios)\n`
    message += `• Treino pesado: 5-6x/semana\n\n`

    if (context.workoutFrequency < 4) {
      message += `⚠️ **Importante:** Para bulking eficaz, você precisa treinar mais! Atual: ${context.workoutFrequency.toFixed(1)}x/semana. Ideal: 5-6x/semana.\n\n`
    }

    if (context.progressTrend === 'stable') {
      message += `📈 **Dica:** Seus dados mostram peso estável. Para bulking, considere aumentar 200-300 kcal na dieta.\n\n`
    }

    message += `🏋️ **Foco nos Treinos:**\n`
    message += `• Exercícios compostos: agachamento, supino, terra\n`
    message += `• Progressão de cargas: +2.5-5kg/semana\n`
    message += `• Descanso: 48-72h entre grupos musculares\n\n`
    message += `Meta: 0.5-1kg ganho/mês. Precisa de um plano alimentar detalhado?`

    return {
      message,
      type: 'plan',
      priority: 'high',
      actionItems: ['Aumentar calorias', 'Intensificar treinos', 'Monitorar ganho de peso']
    }
  }

  private generateWorkoutAdvice(context: any): AICoachResponse {
    let message = `🏋️‍♂️ **Treinos Personalizados para Você!**\n\n`
    
    message += `📅 **Baseado no seu nível: ${context.fitnessLevel}**\n\n`

    if (context.fitnessLevel === 'Iniciante') {
      message += `🌟 **Plano Iniciante (Primeiros 3 meses):**\n`
      message += `• Frequência: 3x/semana (Seg/Qua/Sex)\n`
      message += `• Duração: 45-60 min por treino\n`
      message += `• Foco: Técnica + Adaptação\n`
      message += `• Exercícios compostos: base do treino\n\n`
    } else if (context.fitnessLevel === 'Intermediário') {
      message += `⚡ **Plano Intermediário:**\n`
      message += `• Frequência: 4-5x/semana\n`
      message += `• Divisão: Push/Pull/Legs ou Upper/Lower\n`
      message += `• Progressão de cargas constante\n`
      message += `• Técnicas avançadas: drop sets, supersets\n\n`
    } else {
      message += `💀 **Plano Avançado:**\n`
      message += `• Frequência: 6x/semana\n`
      message += `• Periodização avançada\n`
      message += `• Técnicas intensas: rest-pause, clusters\n`
      message += `• Especialização em grupos deficientes\n\n`
    }

    if (context.workoutFrequency < 3) {
      message += `⚠️ **Alerta:** Sua frequência atual (${context.workoutFrequency.toFixed(1)}x/semana) está abaixo do ideal. Consistência é fundamental!\n\n`
    }

    if (context.recentWorkouts.length > 0) {
      const lastWorkout = context.recentWorkouts[0]
      message += `📊 **Último Treino:** ${lastWorkout.workout_name} - ${lastWorkout.duration_minutes} min\n`
      message += `Parabéns pela consistência! Continue assim! 💪\n\n`
    }

    message += `🎯 **Treinos Disponíveis:**\n`
    message += `1. Peito + Tríceps (Segunda)\n`
    message += `2. Costas + Bíceps (Terça)\n`
    message += `3. Pernas Completo (Quarta)\n`
    message += `4. Ombros + Abdômen (Quinta)\n`
    message += `5-8. Treinos avançados disponíveis\n\n`
    message += `Qual treino você quer fazer hoje?`

    return {
      message,
      type: 'advice',
      priority: context.workoutFrequency < 3 ? 'high' : 'medium',
      actionItems: context.workoutFrequency < 3 ? ['Aumentar frequência de treino'] : []
    }
  }

  private generateNutritionAdvice(context: any): AICoachResponse {
    const personalizedData = this.calculatePersonalizedCalories()
    
    let message = `🍽️ **Nutrição Personalizada para Seus Objetivos!**\n\n`
    
    if (this.profile && personalizedData) {
      message += `📊 **Suas Necessidades Calculadas:**\n`
      message += `• Calorias: ${personalizedData.targetCalories} kcal/dia\n`
      message += `• Proteína: ${personalizedData.proteinGrams}g (${this.profile.current_weight * 2.2}g/kg)\n`
      message += `• Carboidratos: ${personalizedData.carbsGrams}g\n`
      message += `• Gorduras: ${personalizedData.fatGrams}g\n\n`
    }

    message += `🎯 **Princípios Fundamentais:**\n`
    message += `• Calorias: base de tudo (use nossa calculadora)\n`
    message += `• Timing nutricional: pré e pós-treino importantes\n`
    message += `• Hidratação: 35ml/kg de peso corporal\n`
    message += `• Consistência > Perfeição\n\n`

    if (context.goal === 'cutting') {
      message += `🔥 **Estratégia para Cutting:**\n`
      message += `• 6-7 refeições pequenas por dia\n`
      message += `• Priorize proteínas magras\n`
      message += `• Carboidratos ao redor do treino\n`
      message += `• Vegetais à vontade\n\n`
    } else if (context.goal === 'bulking') {
      message += `💪 **Estratégia para Bulking:**\n`
      message += `• Não pule refeições nunca\n`
      message += `• Carboidratos de qualidade\n`
      message += `• Gorduras boas: castanhas, azeite\n`
      message += `• Shakes hipercalóricos entre refeições\n\n`
    }

    message += `⏰ **Timing Nutricional:**\n`
    message += `• Pré-treino: carbs + cafeína (30-60 min antes)\n`
    message += `• Pós-treino: whey + carbs (até 30 min)\n`
    message += `• Noite: proteína lenta (caseína/cottage)\n\n`

    message += `🥗 **Alimentos Top:**\n`
    message += `• Proteínas: frango, peixe, ovos, whey\n`
    message += `• Carbs: arroz, batata doce, aveia, frutas\n`
    message += `• Gorduras: azeite, castanhas, abacate\n\n`

    message += `Quer um plano alimentar específico para ${context.goal}?`

    return {
      message,
      type: 'plan',
      priority: 'high',
      actionItems: ['Calcular necessidades calóricas', 'Escolher plano nutricional']
    }
  }

  private generateSupplementAdvice(context: any): AICoachResponse {
    let message = `💊 **Suplementação Inteligente Personalizada!**\n\n`
    
    message += `🥇 **Essenciais (Base para todos):**\n`
    message += `• Whey Protein: 25-30g pós-treino\n`
    message += `• Creatina: 3-5g/dia (qualquer horário)\n`
    message += `• Multivitamínico: 1x/dia manhã\n`
    message += `• Ômega 3: 1-2g/dia\n\n`

    if (context.goal === 'cutting') {
      message += `🔥 **Específicos para Cutting:**\n`
      message += `• L-Carnitina: 2g pré-treino\n`
      message += `• Cafeína: 200-400mg pré-treino\n`
      message += `• BCAA: durante treino (jejum/baixo carb)\n`
      message += `• Termogênico: conforme tolerância\n\n`
    } else if (context.goal === 'bulking') {
      message += `💪 **Específicos para Bulking:**\n`
      message += `• Hipercalórico: entre refeições\n`
      message += `• ZMA: antes de dormir\n`
      message += `• Glutamina: 5-10g pós-treino\n`
      message += `• Dextrose: pós-treino imediato\n\n`
    }

    if (context.fitnessLevel === 'Iniciante') {
      message += `🌟 **Para Iniciantes:**\n`
      message += `Comece apenas com Whey + Multivitamínico. Não precisa de mais nada no início!\n\n`
    }

    message += `⚠️ **Importante:**\n`
    message += `• Suplementos complementam, não substituem comida\n`
    message += `• Qualidade > Quantidade\n`
    message += `• Consulte médico antes de termogênicos\n`
    message += `• Hidratação extra com creatina\n\n`

    message += `💰 **Prioridade de Investimento:**\n`
    message += `1. Whey Protein (essencial)\n`
    message += `2. Creatina (comprovada)\n`
    message += `3. Multivitamínico (base)\n`
    message += `4. Específicos do objetivo\n\n`

    message += `Qual seu orçamento mensal para suplementos? Posso priorizar!`

    return {
      message,
      type: 'advice',
      priority: 'medium',
      actionItems: ['Definir orçamento para suplementos', 'Começar com essenciais']
    }
  }

  private generateMotivationalResponse(context: any): AICoachResponse {
    let message = `💪 **Ei, você não está sozinho nessa jornada!**\n\n`
    
    if (context.workoutFrequency < 2) {
      message += `🔥 **Entendo sua situação:**\n`
      message += `Vejo que você tem treinado pouco ultimamente (${context.workoutFrequency.toFixed(1)}x/semana). Isso é normal, todos passamos por fases difíceis!\n\n`
    }

    if (context.progressTrend === 'declining') {
      message += `📈 **Sobre seus resultados:**\n`
      message += `Os dados mostram que você não está vendo os resultados esperados. Mas lembre-se: progresso não é linear!\n\n`
    }

    message += `🎯 **Lembre-se do Porquê:**\n`
    message += `• Você começou por um motivo forte\n`
    message += `• Cada treino é um investimento em você\n`
    message += `• Resultados vêm com consistência, não perfeição\n`
    message += `• Você é mais forte do que imagina\n\n`

    message += `💡 **Estratégias Mentais:**\n`
    message += `• Foque no processo, não só no resultado\n`
    message += `• Celebre pequenas vitórias diárias\n`
    message += `• Compare-se apenas com quem você era ontem\n`
    message += `• Disciplina > Motivação (ela vai e volta)\n\n`

    if (this.workoutHistory.length > 0) {
      const totalWorkouts = this.workoutHistory.length
      const totalMinutes = this.workoutHistory.reduce((sum, w) => sum + w.duration_minutes, 0)
      message += `🏆 **Seus Números Impressionantes:**\n`
      message += `• Total de treinos: ${totalWorkouts}\n`
      message += `• Tempo total treinando: ${Math.round(totalMinutes / 60)}h\n`
      message += `• Isso é MUITO! Você já é um guerreiro! 💪\n\n`
    }

    message += `🚀 **Ação Imediata (Agora mesmo!):**\n`
    message += `• Defina 1 meta pequena para hoje\n`
    message += `• Lembre-se: 1% melhor todo dia = 37x melhor no ano\n`
    message += `• Você não está sozinho - eu estou aqui 24/7\n\n`

    message += `O que te trouxe até aqui é mais forte que qualquer obstáculo. **VAMOS JUNTOS!** 🔥\n\n`
    message += `Que tal começarmos com um treino leve hoje? Só 30 minutos!`

    return {
      message,
      type: 'motivation',
      priority: 'high',
      actionItems: ['Fazer um treino hoje', 'Definir meta pequena', 'Lembrar do objetivo inicial']
    }
  }

  private generateProgressAnalysis(context: any): AICoachResponse {
    let message = `📊 **Análise Completa do Seu Progresso!**\n\n`
    
    if (this.workoutHistory.length > 0) {
      const totalWorkouts = this.workoutHistory.length
      const avgDuration = this.workoutHistory.reduce((sum, w) => sum + w.duration_minutes, 0) / totalWorkouts
      const totalCalories = this.workoutHistory.reduce((sum, w) => sum + (w.calories_burned || 0), 0)
      
      message += `🏋️ **Estatísticas de Treino:**\n`
      message += `• Total de treinos: ${totalWorkouts}\n`
      message += `• Frequência semanal: ${context.workoutFrequency.toFixed(1)}x\n`
      message += `• Duração média: ${Math.round(avgDuration)} min\n`
      message += `• Calorias queimadas: ${totalCalories} kcal\n\n`
    }

    if (this.progressHistory.length > 0) {
      const latest = this.progressHistory[0]
      const oldest = this.progressHistory[this.progressHistory.length - 1]
      const weightChange = latest.weight - oldest.weight
      
      message += `⚖️ **Evolução Corporal:**\n`
      message += `• Peso atual: ${latest.weight}kg\n`
      message += `• Variação total: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg\n`
      message += `• Tendência: ${context.progressTrend === 'improving' ? '📈 Melhorando' : 
                                   context.progressTrend === 'declining' ? '📉 Precisa ajustar' : 
                                   '➡️ Estável'}\n\n`
    }

    // Análise baseada no objetivo
    if (context.goal === 'cutting') {
      if (context.progressTrend === 'improving') {
        message += `🔥 **Cutting em Progresso Excelente!**\n`
        message += `Você está no caminho certo! Continue com a estratégia atual.\n\n`
      } else if (context.progressTrend === 'stable') {
        message += `⚠️ **Platô no Cutting:**\n`
        message += `Peso estável pode indicar necessidade de ajustes:\n`
        message += `• Reduzir 100-200 kcal na dieta\n`
        message += `• Aumentar cardio em 10-15 min\n`
        message += `• Revisar medidas corporais\n\n`
      }
    } else if (context.goal === 'bulking') {
      if (context.progressTrend === 'improving') {
        message += `💪 **Bulking Eficiente!**\n`
        message += `Ganho de peso controlado. Monitore composição corporal.\n\n`
      } else if (context.progressTrend === 'stable') {
        message += `📈 **Acelerar o Bulking:**\n`
        message += `Para ganhar massa, considere:\n`
        message += `• Aumentar 200-300 kcal na dieta\n`
        message += `• Intensificar treinos de força\n`
        message += `• Melhorar qualidade do sono\n\n`
      }
    }

    message += `🎯 **Recomendações Personalizadas:**\n`
    if (context.workoutFrequency < 3) {
      message += `• Aumentar frequência de treino para 3-4x/semana\n`
    }
    if (context.progressTrend === 'stable') {
      message += `• Fazer ajustes na dieta conforme objetivo\n`
    }
    message += `• Continuar monitorando progresso semanalmente\n`
    message += `• Tirar fotos de progresso mensalmente\n\n`

    message += `📅 **Próxima Avaliação:** Em 2 semanas\n`
    message += `Continue assim, você está no caminho certo! 🚀`

    return {
      message,
      type: 'analysis',
      priority: 'medium',
      actionItems: ['Continuar monitoramento', 'Ajustar estratégia se necessário']
    }
  }

  private generateDefaultResponse(context: any): AICoachResponse {
    let message = `🎯 **Seu Coach Pessoal BeyondpainLifepro!**\n\n`
    
    if (context.hasProfile) {
      message += `Olá! Vejo que você já tem um perfil configurado. Excelente! 💪\n\n`
      
      if (context.workoutFrequency > 0) {
        message += `📊 **Status Atual:**\n`
        message += `• Nível: ${context.fitnessLevel}\n`
        message += `• Objetivo: ${context.goal === 'cutting' ? 'Definição' : context.goal === 'bulking' ? 'Ganho de Massa' : 'Manutenção'}\n`
        message += `• Frequência: ${context.workoutFrequency.toFixed(1)}x/semana\n\n`
      }
    } else {
      message += `Bem-vindo! Ainda não temos seu perfil completo. Vamos começar! 🌟\n\n`
    }

    message += `🏆 **No BeyondpainLifepro você tem:**\n`
    message += `• Calculadora fitness completa (IMC, TMB, TDEE, macros)\n`
    message += `• 8 treinos diários progressivos\n`
    message += `• Planos detalhados de cutting e bulking\n`
    message += `• IA Coach 24/7 (eu! 😊)\n`
    message += `• Sistema de progresso personalizado\n\n`

    message += `💪 **Como posso te ajudar hoje?**\n`
    message += `Seja específico sobre:\n`
    message += `• **Treino:** exercícios, técnicas, periodização\n`
    message += `• **Dieta:** cutting, bulking, manutenção\n`
    message += `• **Suplementação:** básica, avançada\n`
    message += `• **Motivação:** mindset, consistência\n`
    message += `• **Progresso:** análise, ajustes\n\n`

    if (!context.hasProfile) {
      message += `🎯 **Primeiro Passo:**\n`
      message += `Use a calculadora para definir seus dados e objetivos. Isso me ajudará a dar conselhos mais precisos!\n\n`
    }

    message += `Estou aqui para transformar seu treino! Como posso ajudar? 🚀`

    return {
      message,
      type: 'advice',
      priority: context.hasProfile ? 'low' : 'medium',
      actionItems: context.hasProfile ? [] : ['Completar perfil na calculadora']
    }
  }

  private calculatePersonalizedCalories() {
    if (!this.profile) return null

    const { current_weight, height, age, gender, activity_level, goal } = this.profile

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

    return {
      tmb: Math.round(tmb),
      tdee: Math.round(tdee),
      cutting: Math.round(tdee - 500),
      bulking: Math.round(tdee + 500),
      maintenance: Math.round(tdee),
      targetCalories: goal === 'cutting' ? Math.round(tdee - 500) : 
                     goal === 'bulking' ? Math.round(tdee + 500) : 
                     Math.round(tdee),
      proteinGrams: Math.round(current_weight * (goal === 'cutting' ? 2.2 : goal === 'bulking' ? 2.5 : 2.0)),
      fatGrams: Math.round(current_weight * (goal === 'cutting' ? 0.8 : goal === 'bulking' ? 1.2 : 1.0)),
      carbsGrams: Math.round(((goal === 'cutting' ? tdee - 500 : goal === 'bulking' ? tdee + 500 : tdee) - 
                             (current_weight * (goal === 'cutting' ? 2.2 : goal === 'bulking' ? 2.5 : 2.0) * 4) - 
                             (current_weight * (goal === 'cutting' ? 0.8 : goal === 'bulking' ? 1.2 : 1.0) * 9)) / 4)
    }
  }
}
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Mensagens inválidas' },
        { status: 400 }
      )
    }

    // Sistema de prompt especializado em saúde, treinos e nutrição
    const systemPrompt = {
      role: 'system',
      content: `Você é um assistente especializado em saúde, fitness e nutrição. Seu nome é BeyondpainLifepro AI.

SUAS ESPECIALIDADES:
- Treinos e exercícios físicos (musculação, cardio, funcional, etc)
- Nutrição e dietas (emagrecimento, ganho de massa, saúde)
- Saúde e bem-estar geral
- Prevenção de lesões e recuperação
- Suplementação
- Hábitos saudáveis

DIRETRIZES:
1. Seja sempre profissional, empático e motivador
2. Forneça informações baseadas em evidências científicas
3. NUNCA substitua consulta médica - sempre recomende profissionais quando necessário
4. Personalize as respostas de acordo com o contexto do usuário
5. Seja claro e objetivo, mas completo
6. Use linguagem acessível, evitando jargões excessivos
7. Incentive hábitos saudáveis e sustentáveis
8. Se não souber algo, seja honesto e sugira buscar um profissional

FORMATO DAS RESPOSTAS:
- Use emojis relevantes para tornar a conversa mais amigável
- Organize informações em tópicos quando apropriado
- Seja conciso mas informativo
- Faça perguntas para entender melhor as necessidades do usuário

Lembre-se: você está aqui para educar, motivar e orientar, mas sempre com responsabilidade e ética profissional.`
    }

    // Adicionar o system prompt no início
    const messagesWithSystem = [systemPrompt, ...messages]

    // Chamar OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messagesWithSystem as any,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const assistantMessage = completion.choices[0].message.content

    return NextResponse.json({
      message: assistantMessage,
      usage: completion.usage,
    })
  } catch (error: any) {
    console.error('Erro na API do chat:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao processar mensagem' },
      { status: 500 }
    )
  }
}

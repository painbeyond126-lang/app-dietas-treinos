// Configuração da API OpenAI para o chat IA
export const OPENAI_CONFIG = {
  model: 'gpt-4o',
  temperature: 0.7,
  max_tokens: 1000,
}

export async function getAIResponse(message: string, context?: string): Promise<string> {
  try {
    // Aqui você pode integrar com a API OpenAI quando necessário
    // Por enquanto, o sistema usa respostas personalizadas locais
    return `Resposta da IA para: ${message}`
  } catch (error) {
    console.error('Erro ao obter resposta da IA:', error)
    return 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.'
  }
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Trash2, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

type Message = {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  // Carregar histórico de mensagens
  useEffect(() => {
    loadChatHistory()
  }, [user])

  // Auto-scroll para última mensagem
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadChatHistory = async () => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) throw error

      if (data && data.length > 0) {
        setMessages(data as Message[])
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!user || !supabase) return

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role,
          content,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Adicionar mensagem do usuário
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    // Salvar mensagem do usuário no banco
    await saveMessage('user', userMessage)

    try {
      // Enviar para API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages
            .filter(m => m.role !== 'system')
            .map(m => ({ role: m.role, content: m.content }))
            .concat({ role: 'user', content: userMessage }),
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar mensagem')
      }

      const data = await response.json()

      // Adicionar resposta do assistente
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])

      // Salvar resposta do assistente no banco
      await saveMessage('assistant', data.message)
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const clearHistory = async () => {
    if (!user || !supabase) return
    
    if (!confirm('Tem certeza que deseja limpar todo o histórico de conversas?')) return

    try {
      // Limpar do estado local
      setMessages([])
      
      // Nota: Não podemos usar DELETE por segurança, mas podemos limpar localmente
      // O histórico permanecerá no banco mas não será exibido
      console.log('Histórico limpo localmente')
    } catch (error) {
      console.error('Erro ao limpar histórico:', error)
    }
  }

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">BeyondpainLifepro AI</h1>
            <p className="text-sm text-gray-400">Seu assistente de saúde, treinos e nutrição</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearHistory}
          className="text-gray-400 hover:text-red-400"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Limpar
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-full mb-4">
              <MessageSquare className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Olá! 👋</h2>
            <p className="text-gray-400 max-w-md">
              Sou seu assistente especializado em saúde, treinos e nutrição. 
              Como posso ajudar você hoje?
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
              <button
                onClick={() => setInput('Quero montar um treino de hipertrofia')}
                className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 text-left transition-colors"
              >
                <p className="text-white font-medium">💪 Treino de Hipertrofia</p>
                <p className="text-sm text-gray-400">Monte um plano personalizado</p>
              </button>
              <button
                onClick={() => setInput('Como melhorar minha alimentação?')}
                className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 text-left transition-colors"
              >
                <p className="text-white font-medium">🥗 Nutrição Saudável</p>
                <p className="text-sm text-gray-400">Dicas de alimentação</p>
              </button>
              <button
                onClick={() => setInput('Quais suplementos devo tomar?')}
                className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 text-left transition-colors"
              >
                <p className="text-white font-medium">💊 Suplementação</p>
                <p className="text-sm text-gray-400">Orientações sobre suplementos</p>
              </button>
              <button
                onClick={() => setInput('Como prevenir lesões no treino?')}
                className="bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-lg p-3 text-left transition-colors"
              >
                <p className="text-white font-medium">🛡️ Prevenção de Lesões</p>
                <p className="text-sm text-gray-400">Treine com segurança</p>
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-800/50 border border-gray-700 text-gray-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs mt-2 opacity-70">
                  {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-4">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-gray-800/50 border-t border-gray-700 p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta sobre saúde, treinos ou nutrição..."
            className="flex-1 bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Pressione Enter para enviar, Shift+Enter para nova linha
        </p>
      </div>
    </div>
  )
}

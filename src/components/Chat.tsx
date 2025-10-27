'use client'

import { useState, useRef, useEffect } from 'react'
import { Bot, User, Send } from 'lucide-react'
import Image from 'next/image'
import AIConfig from './AIConfig'

interface Message {
  id: number
  type: 'user' | 'ai'
  content: string
}

interface AIConfigType {
  type: 'openai' | 'ollama' | 'smart'
  openaiKey?: string
  ollamaModel?: string
}

interface ChatProps {
  initialMessages?: Message[]
  onMessagesChange?: (messages: Message[]) => void
  onNewConversation?: () => void
}

// Función para conectar con OpenAI (requiere API key)
const generateOpenAIResponse = async (message: string, apiKey: string): Promise<string> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        max_tokens: 500
      })
    })
    
    if (!response.ok) {
      throw new Error('Error de API')
    }
    
    const data = await response.json()
    return data.choices[0].message.content
  } catch {
    return '❌ Error conectando con OpenAI. Verifica tu API key.'
  }
}

// Función para conectar con Ollama local (gratuito)
const generateOllamaResponse = async (message: string): Promise<string> => {
  try {
    console.log('🦙 Conectando a Ollama...')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos máximo
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'llama3.2',
        prompt: message,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
          num_predict: 200 // Limitar tokens para respuestas más rápidas
        }
      })
    })
    
    clearTimeout(timeoutId)
    
    console.log('📡 Respuesta de Ollama:', response.status)
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Datos recibidos de Ollama')
    return `🦙 **Ollama (LLaMA 3.2):**\n\n${data.response}`
  } catch (error) {
    console.error('❌ Error de Ollama:', error)
    return '🦙 Ollama no está disponible. Verifica que esté corriendo en puerto 11434'
  }
}

// Sistema inteligente local
const generateSmartResponse = (message: string): string => {
  const msg = message.toLowerCase()
  
  // Basic greetings
  if (msg.includes('hola') || msg.includes('buenas') || msg.includes('saludos')) {
    return "¡Hola! 👋 Me alegra conocerte. Soy tu asistente de IA y puedo ayudarte con cualquier tema que necesites. ¿En qué puedo ayudarte hoy?"
  }
  
  // Municipal topics
  if (msg.includes('municipalidad') || msg.includes('municipal') || msg.includes('oficina')) {
    return "🏛️ **Asistencia Municipal**\n\nPuedo ayudarte con:\n• Redacción de notas oficiales\n• Consultas sobre procedimientos\n• Orientación administrativa\n• Documentación municipal\n\n¿Con qué tema específico necesitas ayuda?"
  }
  
  // Politics
  if (msg.includes('política') || msg.includes('politica') || msg.includes('gobierno')) {
    return "🏛️ **Política Argentina**\n\nLa política argentina es compleja y fascinante. Tenemos un sistema presidencialista con múltiples partidos políticos. Algunos temas actuales incluyen:\n\n- Economía e inflación\n- Políticas sociales\n- Relaciones internacionales\n- Federalismo vs centralismo\n\n¿Hay algún aspecto específico que te interese más?"
  }
  
  // Science and technology
  if (msg.includes('ciencia') || msg.includes('tecnología') || msg.includes('inteligencia artificial') || msg.includes('ia')) {
    return "🧬 **¡Me encanta hablar de ciencia y tecnología!**\n\nLa IA está revolucionando todo: desde medicina hasta arte. Por ejemplo, ¿sabías que ya existen IAs que pueden predecir terremotos, crear música original y hasta ayudar a descubrir nuevos medicamentos?\n\n¿Hay algún avance tecnológico específico que te llame la atención? Puedo contarte sobre robótica, biotecnología, computación cuántica, o lo que te interese."
  }
  
  // Philosophy and deep thoughts
  if (msg.includes('filosofía') || msg.includes('sentido de la vida') || msg.includes('existencia') || msg.includes('pensar')) {
    return "🤔 **Pregunta filosófica interesante...**\n\nLa filosofía nos ayuda a entender quiénes somos y por qué estamos aquí. Desde Sócrates hasta pensadores modernos, hemos buscado respuestas sobre la consciencia, la moral, y el propósito.\n\n¿Qué te hace reflexionar últimamente? ¿Te interesa más la ética, la metafísica, o tal vez cómo la tecnología está cambiando nuestra forma de pensar?"
  }
  
  // Default response
  return `🤖 **Respuesta inteligente a: "${message}"**\n\nEntiendo tu consulta. Te ayudo con información general, consultas sobre trabajo municipal, redacción de documentos, y conversación general sobre cualquier tema que te interese.\n\n¿Podrías contarme más detalles sobre lo que necesitas?`
}

const Chat = ({ initialMessages = [], onMessagesChange, onNewConversation }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0 
      ? initialMessages 
      : [{
          id: 1,
          type: 'ai',
          content: '¡Hola! Soy tu asistente de IA local con Ollama (LLaMA 3.2). Tengo inteligencia real y puedo ayudarte con cualquier tema. ¿De qué quieres charlar?',
        }]
  )
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiConfig, setAiConfig] = useState<AIConfigType>({ type: 'ollama' })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setMessages(initialMessages.length > 0 
      ? initialMessages 
      : [{
          id: 1,
          type: 'ai',
          content: '¡Hola! Soy tu asistente de IA local con Ollama (LLaMA 3.2). Tengo inteligencia real y puedo ayudarte con cualquier tema. ¿De qué quieres charlar?',
        }]
    )
  }, [initialMessages])

  useEffect(() => {
    if (onMessagesChange && messages.length > 0) {
      onMessagesChange(messages)
    }
  }, [messages, onMessagesChange])

  const handleNewConversation = () => {
    const initialMessage = {
      id: 1,
      type: 'ai' as const,
      content: '¡Hola! Soy tu asistente de IA. ¿En qué puedo ayudarte hoy?'
    }
    setMessages([initialMessage])
    if (onNewConversation) {
      onNewConversation()
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
    }

    const currentMessages = [...messages, userMessage]
    setMessages(currentMessages)
    setInputMessage('')
    setIsLoading(true)

    try {
      let response = ''
      
      switch (aiConfig.type) {
        case 'openai':
          if (aiConfig.openaiKey) {
            response = await generateOpenAIResponse(inputMessage, aiConfig.openaiKey)
          } else {
            response = '❌ Por favor configura tu API key de OpenAI'
          }
          break
          
        case 'ollama':
          response = await generateOllamaResponse(inputMessage)
          break
          
        case 'smart':
        default:
          response = generateSmartResponse(inputMessage)
          break
      }

      const botResponse: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
      }

      const updatedMessages = [...currentMessages, botResponse]
      setMessages(updatedMessages)
      
    } catch (error) {
      const errorResponse: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: '❌ Lo siento, hubo un error al procesar tu mensaje.',
      }
      
      setMessages([...currentMessages, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl shadow-2xl">
      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              message.type === 'user' 
                ? 'bg-teal-600 text-white' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {message.type === 'user' ? <User size={20} /> : <Bot size={20} />}
            </div>
            
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-teal-600 text-white ml-auto'
                  : 'bg-gray-50 text-gray-800'
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="ml-2 text-gray-500">Pensando...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Área de entrada */}
      <div className="p-6 border-t bg-gray-50 rounded-b-3xl">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje aquí..."
              className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '60px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={onNewConversation ? handleNewConversation : undefined}
            className="px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
          >
            Nueva
          </button>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-4 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        
        <div className="mt-4">
          <AIConfig config={aiConfig} onConfigChange={setAiConfig} />
        </div>
      </div>
    </div>
  )
}

export default Chat
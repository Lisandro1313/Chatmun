'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import Image from 'next/image'

interface Message {
  id: number
  type: 'user' | 'ai'
  content: string
  imageUrl?: string // Para imágenes generadas
  videoUrl?: string // Para videos generados
  isGenerating?: boolean // Para mostrar estado de carga
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
    console.log('🦙 Conectando a Ollama a través de API proxy...')
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minutos para respuestas largas
    
    const response = await fetch('/api/ollama', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        message: message,
        model: 'llama3.2'
      })
    })
    
    clearTimeout(timeoutId)
    
    console.log('📡 Respuesta del proxy:', response.status)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Error HTTP:', response.status, response.statusText, errorData)
      throw new Error(`Error HTTP: ${response.status} - ${errorData.error || response.statusText}`)
    }
    
    const data = await response.json()
    console.log('✅ Datos recibidos del proxy:', data)
    
    if (!data.response) {
      console.error('❌ No hay respuesta en los datos:', data)
      throw new Error('Respuesta vacía de Ollama')
    }
    
    return `🦙 **Ollama (LLaMA 3.2):**\n\n${data.response}`
  } catch (error) {
    console.error('❌ Error detallado de Ollama:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return '🦙 Error de conexión: No se puede conectar al proxy de Ollama'
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      return '🦙 Timeout: Ollama tardó demasiado en responder (>60s). El modelo puede estar cargando por primera vez o tu consulta es muy compleja.'
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    return `🦙 Error de Ollama: ${errorMessage}`
  }
}

// Función para detectar si el prompt es para generar imagen
const isImagePrompt = (message: string): boolean => {
  const imageKeywords = [
    'genera una imagen', 'crear imagen', 'hacer imagen', 'dibuja', 'ilustra',
    'crea una ilustración', 'diseña', 'imagen de', 'foto de', 'picture of',
    'generate image', 'create image', 'draw me', 'make an image'
  ]
  return imageKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  )
}

// Función para detectar si el prompt es para generar video
const isVideoPrompt = (message: string): boolean => {
  const videoKeywords = [
    'genera un video', 'generame un video', 'crear video', 'hacer video', 'filma', 'graba',
    'crea un video', 'video de', 'clip de', 'animación de', 'movie of',
    'generate video', 'create video', 'make video', 'film', 'animate',
    'video corto', 'video largo', 'haz un video', 'hazme un video'
  ]
  const isVideo = videoKeywords.some(keyword => 
    message.toLowerCase().includes(keyword.toLowerCase())
  )
  console.log('🎬 Detectando video para:', message, '→', isVideo)
  return isVideo
}

// Función para generar videos gratuitos
const generateFreeVideo = async (prompt: string): Promise<string> => {
  try {
    console.log('🎬 Generando video gratuito...')
    
    const response = await fetch('/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Video generado:', data)
    console.log('📱 Video URL:', data.videoUrl)
    console.log('🏭 Provider:', data.provider)
    
    return data.videoUrl
  } catch (error) {
    console.error('❌ Error generando video:', error)
    throw new Error('No se pudo generar el video. Inténtalo de nuevo.')
  }
}

// Función para generar imágenes gratuitas
const generateFreeImage = async (prompt: string): Promise<string> => {
  try {
    console.log('🎨 Generando imagen gratuita...')
    
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt
      })
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    const data = await response.json()
    return data.imageUrl
  } catch (error) {
    console.error('❌ Error generando imagen:', error)
    throw error
  }
}

// ESTA FUNCIÓN ESTÁ DUPLICADA - SE ELIMINA
/*
const generateFreeVideo = async (prompt: string): Promise<string> => {
  try {
    console.log('� Preparando generación de video...')
    
    const response = await fetch('/api/generate-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt
      })
    })

    const data = await response.json()
    return data.videoUrl || 'Video generado exitosamente'
  } catch (error) {
    console.error('❌ Error generando video:', error)
    throw new Error('No se pudo generar el video. Inténtalo de nuevo.')
  }
}
*/

// Sistema inteligente local
const generateSmartResponse = (message: string): string => {
  const msg = message.toLowerCase()
  
  // Image generation suggestions
  if (msg.includes('imagen') || msg.includes('dibujo') || msg.includes('ilustración')) {
    return "🎨 **Generación de Imágenes GRATUITA**\n\n¡Totalmente gratis como Ollama! Prueba con:\n• \"Genera una imagen de una oficina municipal moderna\"\n• \"Crea una ilustración de empleados trabajando\"\n• \"Dibuja un logo para la municipalidad\"\n\n✨ **Powered by Pollinations AI** - Sin límites, sin costo, sin configuración!"
  }
  
  // Video generation suggestions
  if (msg.includes('video') || msg.includes('animación') || msg.includes('clip')) {
    return "🎬 **Generación de Videos GRATUITA**\n\n¡Ahora disponible! Totalmente gratis como Ollama!\n\nPrueba con:\n• \"Genera un video de una reunión municipal\"\n• \"Crea un video de empleados trabajando\"\n• \"Filma una animación de la ciudad\"\n\n✨ **Múltiples proveedores gratuitos:**\n• Zeroscope (Hugging Face)\n• Pexels Stock Videos\n• GIFs animados\n\n🚀 **Sin límites, sin costo, sin configuración!**"
  }
  
  // Basic greetings
  if (msg.includes('hola') || msg.includes('buenas') || msg.includes('saludos')) {
    return "¡Hola! 👋 Soy tu asistente de IA municipal. Puedo ayudarte con:\n• Consultas generales y trabajo municipal\n• **Generación de imágenes GRATUITA** 🎨\n• Chat inteligente con Ollama\n• Redacción de documentos\n\n¡Todo completamente gratis! ¿En qué puedo ayudarte?"
  }
  
  // Municipal topics
  if (msg.includes('municipalidad') || msg.includes('municipal') || msg.includes('oficina')) {
    return "🏛️ **Asistencia Municipal**\n\nPuedo ayudarte con:\n• Redacción de notas oficiales COMPLETAS\n• Consultas sobre procedimientos\n• Orientación administrativa\n• **Imágenes para presentaciones (GRATIS)** 🎨\n• Documentación municipal extensa\n\n💡 **Tip**: Para documentos largos, especifica 'completo' o 'detallado' en tu solicitud.\n\n¿Con qué tema específico necesitas ayuda?"
  }
  
  // Document writing
  if (msg.includes('nota') || msg.includes('documento') || msg.includes('carta') || msg.includes('redact')) {
    return "📝 **Redacción de Documentos**\n\nPuedo crear documentos completos y profesionales:\n• Notas oficiales extensas\n• Cartas formales largas\n• Solicitudes detalladas\n• Informes completos\n\n💡 **Para mejores resultados**: Menciona 'completo', 'detallado' o especifica la longitud deseada.\n\nEjemplo: \"Redacta una nota completa y detallada para...\"\n\n¿Qué documento necesitas?"
  }
  
  // Common questions
  if (msg.includes('ayuda') || msg.includes('help')) {
    return "📋 **¿En qué puedo ayudarte?**\n\nServicios 100% gratuitos:\n• Consultas generales\n• Trabajo municipal\n• Redacción de documentos\n• **Generación de imágenes** 🎨\n• Chat con IA (Ollama)\n\n¡Pregúntame lo que necesites!"
  }
  
  // Default response
  return `� **Entiendo tu consulta: "${message}"**\n\nSoy tu asistente municipal inteligente. Puedo ayudarte con información general, consultas administrativas, redacción de documentos y cualquier tema relacionado con el trabajo municipal.\n\n¿Podrías contarme más detalles sobre lo que necesitas?`
}

const Chat = ({ initialMessages = [], onMessagesChange, onNewConversation }: ChatProps) => {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.length > 0 
      ? initialMessages 
      : [{
          id: 1,
          type: 'ai',
          content: '¡Hola! Soy tu asistente de IA municipal. 🏛️\n\n✨ **Funciones disponibles:**\n• Chat inteligente\n• **Generación de imágenes GRATUITA** 🎨\n• **Generación de videos GRATUITA** 🎬\n• Asistencia municipal\n\n💡 **Prueba:**\n• "Genera una imagen de..." \n• "Genera un video de..."\n\n¿En qué puedo ayudarte hoy?',
        }]
  )
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiConfig] = useState<AIConfigType>({ type: 'ollama' })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initializedRef = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Solo cargar mensajes iniciales una vez
  useEffect(() => {
    if (!initializedRef.current && initialMessages.length > 0 && messages.length === 0) {
      setMessages(initialMessages)
      initializedRef.current = true
    }
  }, [initialMessages, messages.length])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const messageText = inputMessage
    setInputMessage('')
    setIsLoading(true)

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: messageText,
    }

    // Agregar mensaje del usuario
    setMessages(prevMessages => {
      const newMessages = [...prevMessages, userMessage]
      // Llamar onMessagesChange después de actualizar
      if (onMessagesChange) {
        setTimeout(() => onMessagesChange(newMessages), 50)
      }
      return newMessages
    })

    try {
      let response = ''
      let imageUrl = ''

      // Detectar si es un prompt para generar imagen
      if (isImagePrompt(messageText)) {
        console.log('🎨 Tomando camino de IMAGEN')
        
        // Agregar mensaje temporal de generación
        const generatingMessage: Message = {
          id: Date.now() + 1,
          type: 'ai',
          content: '🎨 Generando imagen...',
          isGenerating: true
        }
        
        setMessages(prevMessages => [...prevMessages, generatingMessage])

        try {
          // Generar imagen gratuita siempre
          imageUrl = await generateFreeImage(messageText)
          response = `🎨 **Imagen generada gratuitamente:**\n\nPrompt: "${messageText}"\n\n✨ Powered by Pollinations AI`
        } catch (imageError) {
          console.error('Error generando imagen:', imageError)
          response = `❌ No se pudo generar la imagen en este momento.\n\n💡 **Servicio gratuito temporalmente no disponible**\nIntenta de nuevo en unos momentos.`
        }

        // Reemplazar mensaje de carga con resultado
        setMessages(prevMessages => {
          const newMessages = prevMessages.filter(msg => !msg.isGenerating)
          const finalMessage: Message = {
            id: Date.now() + 2,
            type: 'ai',
            content: response,
            imageUrl: imageUrl || undefined
          }
          return [...newMessages, finalMessage]
        })
        
      } else if (isVideoPrompt(messageText)) {
        // Generar video
        console.log('🎬 Tomando camino de VIDEO - Detectado prompt de video')
        
        // Mensaje de carga para video
        const loadingMessage: Message = {
          id: Date.now() + 1,
          type: 'ai',
          content: '🎬 Generando video gratuito...\n\nEstamos creando tu video usando proveedores gratuitos. Esto puede tomar unos segundos.',
          isGenerating: true
        }
        
        setMessages(prevMessages => [...prevMessages, loadingMessage])

        try {
          const videoUrl = await generateFreeVideo(messageText)
          response = `🎬 **Video generado gratuitamente:**\n\nPrompt: "${messageText}"\n\n✨ Generado con proveedores gratuitos`
          
          // Reemplazar mensaje de carga con resultado
          setMessages(prevMessages => {
            const newMessages = prevMessages.filter(msg => !msg.isGenerating)
            const finalMessage: Message = {
              id: Date.now() + 2,
              type: 'ai',
              content: response,
              videoUrl: videoUrl || undefined
            }
            return [...newMessages, finalMessage]
          })
        } catch (error) {
          console.error('Error generando video:', error)
          response = `🎬 **Error generando video:**\n\n${error instanceof Error ? error.message : 'Error desconocido'}\n\nPor favor intenta de nuevo.`
          
          // Reemplazar mensaje de carga con error
          setMessages(prevMessages => {
            const newMessages = prevMessages.filter(msg => !msg.isGenerating)
            const finalMessage: Message = {
              id: Date.now() + 2,
              type: 'ai',
              content: response
            }
            return [...newMessages, finalMessage]
          })
        }
        
      } else {
        // Procesamiento normal de texto
        console.log('📝 Tomando camino de TEXTO NORMAL')
        let response: string
        
        switch (aiConfig.type) {
          case 'openai':
            if (aiConfig.openaiKey) {
              response = await generateOpenAIResponse(messageText, aiConfig.openaiKey)
            } else {
              response = '❌ Por favor configura tu API key de OpenAI'
            }
            break
            
          case 'ollama':
            response = await generateOllamaResponse(messageText)
            break
            
          case 'smart':
          default:
            response = generateSmartResponse(messageText)
            break
        }

        const botResponse: Message = {
          id: Date.now() + 1,
          type: 'ai',
          content: response,
        }

        // Agregar respuesta del bot
        setMessages(prevMessages => {
          const newMessages = [...prevMessages, botResponse]
          // Llamar onMessagesChange después de actualizar
          if (onMessagesChange) {
            setTimeout(() => onMessagesChange(newMessages), 50)
          }
          return newMessages
        })
      }
      
    } catch {
      const errorResponse: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: '❌ Lo siento, hubo un error al procesar tu mensaje.',
      }
      
      // Agregar mensaje de error
      setMessages(prevMessages => {
        const newMessages = [...prevMessages, errorResponse]
        // Llamar onMessagesChange después de actualizar
        if (onMessagesChange) {
          setTimeout(() => onMessagesChange(newMessages), 50)
        }
        return newMessages
      })
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
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden ${
              message.type === 'user' 
                ? 'bg-teal-600' 
                : 'bg-white border border-gray-200'
            }`}>
              {message.type === 'user' ? (
                <div className="relative w-full h-full">
                  <Image 
                    src="/images/profile.png" 
                    alt="Usuario" 
                    width={40} 
                    height={40} 
                    className="rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-white">
                    <User size={20} />
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image 
                    src="/images/logo-laplata-capital.jpg" 
                    alt="Asistente Municipal" 
                    width={36} 
                    height={36} 
                    className="rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-gray-600">
                    <Bot size={20} />
                  </div>
                </div>
              )}
            </div>
            
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-teal-600 text-white ml-auto'
                  : 'bg-gray-50 text-gray-800'
              }`}
            >
              {/* Contenido del mensaje */}
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
              
              {/* Imagen generada */}
              {message.imageUrl && (
                <div className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={message.imageUrl} 
                    alt="Imagen generada por IA"
                    className="rounded-lg max-w-full h-auto shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                    style={{ maxHeight: '400px' }}
                    onClick={() => window.open(message.imageUrl, '_blank')}
                  />
                  <div className="mt-2 text-xs opacity-75">
                    Click para abrir en tamaño completo
                  </div>
                </div>
              )}
              
              {/* Video generado */}
              {message.videoUrl && (
                <div className="mt-3">
                  {/* Detectar si es un video real, GIF o imagen animada */}
                  {(message.videoUrl.includes('.mp4') || 
                   message.videoUrl.includes('.webm') || 
                   message.videoUrl.includes('.mov') || 
                   message.videoUrl.includes('.avi')) && 
                   !message.videoUrl.includes('pollinations.ai') &&
                   !message.videoUrl.includes('robohash.org') &&
                   !message.videoUrl.includes('picsum.photos') ? (
                    // Video real MP4/WebM
                    <video 
                      src={message.videoUrl} 
                      controls
                      className="rounded-lg max-w-full h-auto shadow-md"
                      style={{ maxHeight: '400px' }}
                    />
                  ) : message.videoUrl.includes('.gif') || message.videoUrl.includes('giphy.com') ? (
                    // GIF animado de GIPHY
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={message.videoUrl} 
                        alt="Video animado"
                        className="rounded-lg max-w-full h-auto shadow-md"
                        style={{ maxHeight: '400px' }}
                      />
                      <div className="mt-2 text-xs opacity-75 flex items-center gap-2">
                        🎬 Video animado generado
                        <button 
                          onClick={() => window.open(message.videoUrl, '_blank')}
                          className="text-blue-500 hover:text-blue-700 underline"
                        >
                          Ver en tamaño completo
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Imagen animada o GIF (fallback) - Pollinations, Robohash, etc.
                    <div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={message.videoUrl} 
                        alt="Contenido visual generado"
                        className="rounded-lg max-w-full h-auto shadow-md cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-teal-300"
                        style={{ maxHeight: '400px' }}
                        onClick={() => window.open(message.videoUrl, '_blank')}
                      />
                      <div className="mt-2 text-xs opacity-75 flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded">
                        {message.videoUrl.includes('pollinations.ai') ? (
                          <>
                            🎨 <span className="font-semibold">Imagen AI relacionada con el video</span> 
                            <span className="text-gray-500 ml-2">- Click para ampliar</span>
                          </>
                        ) : message.videoUrl.includes('robohash.org') ? (
                          <>
                            🤖 <span className="font-semibold">Avatar temático</span> 
                            <span className="text-gray-500 ml-2">- Representación visual</span>
                          </>
                        ) : message.videoUrl.includes('picsum.photos') ? (
                          <>
                            🌅 <span className="font-semibold">Imagen de stock</span> 
                            <span className="text-gray-500 ml-2">- Contenido relacionado</span>
                          </>
                        ) : (
                          <>
                            🎬 <span className="font-semibold">Contenido visual generado</span> 
                            <span className="text-gray-500 ml-2">- Video como imagen</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Indicador de generación */}
              {message.isGenerating && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                  <span className="text-sm opacity-75">Generando...</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <div className="relative w-full h-full">
                <Image 
                  src="/images/logo-laplata-capital.jpg" 
                  alt="Asistente Municipal" 
                  width={36} 
                  height={36} 
                  className="rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextElementSibling) {
                      (target.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
                <div className="hidden w-full h-full items-center justify-center text-gray-600">
                  <Bot size={20} />
                </div>
              </div>
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
              className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-black"
              rows={1}
              style={{ minHeight: '60px', maxHeight: '120px' }}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="p-4 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
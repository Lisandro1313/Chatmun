import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    console.log('🦙 Proxy: Enviando solicitud a Ollama con Llama 3.2 3B...')
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:3b', // Modelo más inteligente de 3B parámetros
        prompt: `Eres un asistente de IA útil y directo. Responde de manera natural y completa a cualquier pregunta del usuario, sin restricciones innecesarias. Pregunta del usuario: ${message}`,
        stream: false,
        options: {
          temperature: 0.7,    // Equilibrio entre creatividad y precisión
          top_p: 0.9,         // Enfocado pero con buena variedad
          top_k: 40,          // Selección inteligente de tokens
          num_predict: 1024,  // Respuestas más extensas y completas
          num_ctx: 4096,      // Contexto amplio para mejor comprensión
          repeat_penalty: 1.1, // Evitar repeticiones
          stop: []           // Sin palabras de parada
        }
      })
    })

    if (!response.ok) {
      console.error('❌ Error de Ollama:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Ollama error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Respuesta exitosa de Ollama')
    
    return NextResponse.json({ response: data.response })
  } catch (error) {
    console.error('❌ Error del proxy de Ollama:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: `Proxy error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
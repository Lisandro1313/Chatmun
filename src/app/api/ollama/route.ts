import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    console.log('🦙 Proxy: Enviando solicitud a Ollama con LLaMA 3.2 1B...')
    
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.2:1b', // Modelo más pequeño que requiere menos RAM
        prompt: message,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.95,
          top_k: 50,
          num_predict: 4096, // Tokens aún más altos para respuestas muy largas
          num_ctx: 8192,     // Contexto máximo para mejor comprensión
          repeat_penalty: 1.05,
          stop: []           // Sin palabras de parada para no cortar respuestas
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
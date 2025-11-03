import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    
    console.log('🎨 Generando imagen gratuita...')
    
    // Método 1: Usar Pollinations AI (completamente gratuito)
    try {
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&seed=${Math.floor(Math.random() * 1000000)}`
      
      console.log('✅ Imagen generada con Pollinations AI')
      return NextResponse.json({ 
        imageUrl: pollinationsUrl,
        provider: 'Pollinations AI (Gratuito)'
      })
    } catch {
      console.log('⚠️ Pollinations no disponible, probando alternativa...')
    }

    // Método 2: Usar Picsum para imágenes aleatorias como fallback
    const fallbackUrl = `https://picsum.photos/512/512?random=${Math.floor(Math.random() * 1000)}`
    
    console.log('✅ Imagen de demostración generada')
    return NextResponse.json({ 
      imageUrl: fallbackUrl,
      provider: 'Demo (Gratuito)',
      message: `Prompt procesado: "${prompt}". En producción usaría un modelo de IA para generar esta imagen.`
    })

  } catch (error) {
    console.error('❌ Error del API de generación de imágenes:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { error: `Error: ${errorMessage}` },
      { status: 500 }
    )
  }
}

// También agregamos endpoint para video (futuro)
export async function PUT(request: NextRequest) {
  try {
    const { prompt } = await request.json()
    
    console.log('🎬 Generación de video solicitada...')
    
    // Por ahora retornamos un placeholder
    return NextResponse.json({ 
      message: `Video con prompt "${prompt}" se generaría aquí. Próximamente con modelos locales gratuitos.`,
      provider: 'En desarrollo'
    })

  } catch {
    return NextResponse.json(
      { error: 'Error en generación de video' },
      { status: 500 }
    )
  }
}
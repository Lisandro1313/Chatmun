import { NextRequest, NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'

// Diferentes proveedores gratuitos de video
const VIDEO_PROVIDERS = {
  // Zeroscope via Hugging Face (Completamente gratis)
  ZEROSCOPE: 'https://api-inference.huggingface.co/models/cerspense/zeroscope_v2_576w',
  
  // Stable Video Diffusion (si está disponible)
  STABLE_VIDEO: 'https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt',
  
  // Backup: Generador de video simple con frames
  FALLBACK: 'https://api.pexels.com/videos/search'
}

// Función para generar video REAL con Hugging Face
async function generateWithHuggingFaceVideo(prompt: string) {
  try {
    console.log('🤗 Intentando Hugging Face Video Generation (REAL)...')
    
    const hfToken = process.env.HUGGINGFACE_TOKEN || process.env.HF_TOKEN
    
    if (!hfToken) {
      console.log('⚠️ Token de Hugging Face no configurado')
      return null
    }

    const hf = new HfInference(hfToken)
    
    // Intentar generación directa de video con texto
    console.log('🎬 Intentando generación de video con prompt directo...')
    try {
    // Usar modelos básicos que no requieren Inference Providers
      const basicModels = [
        'ali-vilab/text-to-video-ms-1.7b',
        'damo-vilab/text-to-video-ms-1.7b',
        'modelscope/damo-text-to-video-synthesis',
        'camenduru/text2video-zero',
        'runwayml/stable-video-diffusion-img2vid-xt'
      ]

      for (const model of basicModels) {
        try {
          console.log(`🎬 Probando modelo básico: ${model}`)
          
          const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${hfToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                num_frames: 16,
                height: 320,
                width: 576,
                guidance_scale: 15,
                num_inference_steps: 50
              }
            })
          })

          console.log(`🎬 ${model} response status:`, response.status)

          if (response.ok) {
            const contentType = response.headers.get('content-type')
            console.log(`📹 Content-Type: ${contentType}`)
            
            if (contentType && (contentType.includes('video') || contentType.includes('mp4'))) {
              // Es un video real
              const videoBlob = await response.blob()
              if (videoBlob && videoBlob.size > 0) {
                const arrayBuffer = await videoBlob.arrayBuffer()
                const base64 = Buffer.from(arrayBuffer).toString('base64')
                const videoUrl = `data:${contentType};base64,${base64}`
                console.log(`✅ VIDEO REAL generado con ${model}`)
                
                return {
                  success: true,
                  videoUrl: videoUrl,
                  provider: `Hugging Face Video (${model})`,
                  message: 'Video MP4 real generado con IA',
                  isRealVideo: true
                }
              }
            }
          } else {
            const errorText = await response.text()
            console.log(`❌ ${model} error:`, response.status, errorText)
          }
        } catch (modelError) {
          console.log(`❌ ${model} falló:`, modelError)
          continue
        }
      }
    } catch (directError) {
      console.log('❌ API directa falló:', directError)
    }

    return null
  } catch (error) {
    console.log('❌ Hugging Face no disponible:', error)
    return null
  }
}

// Función para generar video con Stable Video Diffusion
async function generateWithStableVideo(prompt: string) {
  try {
    console.log('🎬 Intentando Stable Video Diffusion...')
    
    const hfToken = process.env.HUGGINGFACE_TOKEN || process.env.HF_TOKEN
    
    if (!hfToken) {
      console.log('⚠️ Token de Hugging Face no configurado para Stable Video')
      return null
    }

    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_frames: 16,
          fps: 6
        }
      })
    })

    if (response.ok) {
      const videoBlob = await response.blob()
      const arrayBuffer = await videoBlob.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const videoUrl = `data:video/mp4;base64,${base64}`
      
      return {
        success: true,
        videoUrl: videoUrl,
        provider: 'Stable Video Diffusion (IA)',
        isRealVideo: true
      }
    }
  } catch (error) {
    console.log('❌ Stable Video error:', error)
  }
  
  return null
}

// Función para generar video con Replicate (RunwayML gratis)
async function generateWithReplicate(prompt: string) {
  try {
    console.log('🎬 Intentando Replicate...')
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.REPLICATE_API_TOKEN || 'demo_token'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: "9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351", // Stable Video Diffusion
        input: {
          prompt: prompt,
          num_frames: 16,
          width: 512,
          height: 512
        }
      })
    })

    if (response.ok) {
      const data = await response.json()
      
      if (data.urls && data.urls.get) {
        return {
          success: true,
          videoUrl: data.urls.get,
          provider: 'Replicate (Stable Video - Gratuito)'
        }
      }
    }
  } catch (error) {
    console.log('Replicate error:', error)
  }
  
  return null
}

// Función para generar videos con APIs gratuitas (Pixabay)
async function generateFreeVideo(prompt: string) {
  try {
    console.log('🎬 Intentando APIs de video gratuitas...')
    
    // Opción 1: Usar Pixabay (tiene videos gratuitos MP4)
    try {
      console.log('🎬 Probando Pixabay para videos MP4...')
      const pixabayResponse = await fetch(
        `https://pixabay.com/api/videos/?key=demo&q=${encodeURIComponent(prompt)}&per_page=3&min_width=640`,
        { 
          method: 'GET',
          headers: {
            'User-Agent': 'ChatMun-AI/1.0'
          }
        }
      )
      
      console.log('🎬 Pixabay response status:', pixabayResponse.status)
      
      if (pixabayResponse.ok) {
        const data = await pixabayResponse.json()
        console.log('🎬 Pixabay videos encontrados:', data.hits?.length || 0)
        
        if (data.hits && data.hits.length > 0) {
          const video = data.hits[0]
          console.log('✅ Video MP4 encontrado en Pixabay:', video.tags)
          return {
            success: true,
            videoUrl: video.videos.medium.url,
            provider: 'Pixabay (Video MP4 Gratuito)',
            message: 'Video MP4 real de biblioteca gratuita',
            isRealVideo: true
          }
        } else {
          console.log('⚠️ Pixabay no encontró videos para:', prompt)
        }
      } else {
        console.log('⚠️ Pixabay response no OK:', pixabayResponse.status)
      }
    } catch (error) {
      console.log('Pixabay no disponible:', error)
    }
    
    console.log('APIs de video gratuitas no disponibles')
    return null
    
  } catch (error) {
    console.error('Error en APIs de video gratuitas:', error)
    return null
  }
}

// Función para generar GIFs animados con Tenor (SOLO para GIFs explícitos)
async function generateAnimatedGIF(prompt: string) {
  try {
    console.log('🎭 Generando GIF animado con Tenor...')
    
    // Usar Tenor API para GIFs animados
    const tenorResponse = await fetch(
      `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(prompt)}&key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&limit=1&media_filter=gif&contentfilter=off`
    )
    
    console.log('🎭 Tenor response status:', tenorResponse.status)
    
    if (tenorResponse.ok) {
      const data = await tenorResponse.json()
      console.log('🎭 Tenor data disponible:', data.results?.length || 0)
      
      if (data.results && data.results.length > 0) {
        const gif = data.results[0]
        const gifUrl = gif.media_formats.gif.url
        console.log('✅ GIF encontrado en Tenor:', gif.content_description)
        console.log('🔗 GIF URL:', gifUrl)
        return {
          success: true,
          videoUrl: gifUrl,
          provider: 'Tenor (GIF Animado Gratuito)',
          message: 'GIF animado relacionado con el prompt',
          isGif: true
        }
      } else {
        console.log('⚠️ Tenor no encontró resultados para:', prompt)
      }
    } else {
      console.log('⚠️ Tenor response no OK:', tenorResponse.status)
    }
    
    return null
  } catch (error) {
    console.error('Error generando GIF con Tenor:', error)
    return null
  }
}

// Función para generar video con Pexels (videos stock MP4)
async function generateWithPexels(prompt: string) {
  try {
    console.log('🎬 Probando Pexels para videos MP4...')
    const pexelsKey = process.env.PEXELS_API_KEY || 'demo_key'
    
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(prompt)}&per_page=1`,
      {
        headers: {
          'Authorization': pexelsKey
        }
      }
    )

    console.log('🎬 Pexels response status:', response.status)

    if (response.ok) {
      const data = await response.json()
      console.log('🎬 Pexels videos encontrados:', data.videos?.length || 0)
      
      if (data.videos && data.videos.length > 0) {
        const video = data.videos[0]
        const videoFile = video.video_files.find((file: { quality: string }) => file.quality === 'sd' || file.quality === 'hd')
        
        console.log('✅ Video MP4 encontrado en Pexels')
        return {
          success: true,
          videoUrl: videoFile?.link || video.video_files[0].link,
          provider: 'Pexels Stock Video MP4 (Gratuito)',
          thumbnail: video.image,
          isRealVideo: true
        }
      } else {
        console.log('⚠️ Pexels no encontró videos para:', prompt)
      }
    } else {
      console.log('⚠️ Pexels response no OK:', response.status)
    }
  } catch (error) {
    console.log('❌ Pexels no disponible:', error)
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, type = 'video' } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt es requerido' },
        { status: 400 }
      )
    }

    console.log(`🎬 Generando ${type} con prompt:`, prompt)

    // Si es un GIF, usar principalmente Tenor
    if (type === 'gif') {
      console.log('🎭 Modo GIF - Priorizando Tenor')
      const gifResult = await generateAnimatedGIF(prompt)
      if (gifResult?.success) {
        console.log(`✅ GIF generado con: ${gifResult.provider}`)
        return NextResponse.json(gifResult)
      }
    } else {
      console.log('🎬 Modo VIDEO - Priorizando videos MP4 reales')
    }

    // Para videos reales, usar proveedores de video MP4 primero (SIN Tenor)
    const providers = [
      () => generateWithPexels(prompt),          // PRIORIDAD 1: Videos MP4 reales
      () => generateFreeVideo(prompt),           // PRIORIDAD 2: Videos de stock Pixabay
      () => generateWithHuggingFaceVideo(prompt), // PRIORIDAD 3: IA de video
      () => generateWithStableVideo(prompt),     // PRIORIDAD 4: Stable Video Diffusion
      () => generateWithReplicate(prompt)        // PRIORIDAD 5: Replicate
      // NOTA: Tenor eliminado de la lista de videos - solo se usa para GIFs explícitos
    ]

    console.log('🎬 Probando proveedores en orden de prioridad para VIDEOS MP4...')
    
    for (const provider of providers) {
      const result = await provider()
      if (result?.success) {
        console.log(`✅ Video MP4 generado con: ${result.provider}`)
        return NextResponse.json(result)
      }
    }

    // Si todo falla, generar un video placeholder MP4
    console.log('⚠️ Todos los proveedores de video MP4 fallaron, usando placeholder')
    return NextResponse.json({
      success: true,
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4',
      provider: 'Video de Ejemplo MP4 (Fallback)',
      message: 'Video placeholder mientras configuramos el servicio',
      isRealVideo: true
    })

  } catch (error) {
    console.error('❌ Error generando video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
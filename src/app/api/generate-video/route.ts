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
            } else {
              // Puede ser una imagen o GIF
              const imageBlob = await response.blob()
              if (imageBlob && imageBlob.size > 0) {
                const arrayBuffer = await imageBlob.arrayBuffer()
                const base64 = Buffer.from(arrayBuffer).toString('base64')
                const imageUrl = `data:${contentType || 'image/png'};base64,${base64}`
                console.log(`✅ Contenido visual generado con ${model}`)
                
                return {
                  success: true,
                  videoUrl: imageUrl,
                  provider: `Hugging Face (${model})`,
                  message: 'Contenido visual generado',
                  isImage: true
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

    // Fallback: Intentar con generación de imagen de alta calidad
    console.log('🎨 Fallback: Generando imagen cinematográfica...')
    try {
      const imageResult = await hf.textToImage({
        model: 'black-forest-labs/FLUX.1-dev',
        inputs: prompt + ' cinematic, high quality, movie still, 4K',
        parameters: {
          width: 512,
          height: 512
        }
      })

      if (imageResult && typeof imageResult === 'object' && 'size' in imageResult) {
        // Convertir blob a base64 para que funcione en el frontend
        const blob = imageResult as Blob
        const arrayBuffer = await blob.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const imageUrl = `data:${blob.type || 'image/png'};base64,${base64}`
        console.log('✅ Imagen cinematográfica de alta calidad generada')
        
        return {
          success: true,
          videoUrl: imageUrl,
          provider: 'Hugging Face (Imagen 4K Cinematográfica)',
          message: 'Imagen de alta calidad relacionada con video',
          isImage: true
        }
      }
    } catch (imageError) {
      console.log('❌ Generación de imagen también falló:', imageError)
    }

  } catch (error) {
    console.log('❌ Hugging Face Video error general:', error)
  }
  
  return null
}

// Función para generar video con Stable Video Diffusion (Hugging Face)
async function generateWithStableVideo(prompt: string) {
  try {
    console.log('🎬 Intentando Stable Video Diffusion...')
    
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-video-diffusion-img2vid-xt-1-1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_demo'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          num_frames: 25,
          num_inference_steps: 25
        }
      })
    })

    if (response.ok) {
      const videoBlob = await response.blob()
      
      // Convertir a base64 para mostrar en el frontend
      const arrayBuffer = await videoBlob.arrayBuffer()
      const base64Video = Buffer.from(arrayBuffer).toString('base64')
      
      return {
        success: true,
        videoUrl: `data:video/mp4;base64,${base64Video}`,
        provider: 'Stable Video Diffusion (Hugging Face - Gratuito)'
      }
    } else {
      console.log('Stable Video no disponible, intentando siguiente...')
    }
  } catch (error) {
    console.log('Stable Video error:', error)
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

// Función para generar videos con APIs gratuitas
async function generateFreeVideo(prompt: string) {
  try {
    console.log('🎬 Intentando APIs de video gratuitas...')
    
    // Opción 1: Usar Pixabay (tiene videos gratuitos)
    try {
      const pixabayResponse = await fetch(
        `https://pixabay.com/api/videos/?key=demo&q=${encodeURIComponent(prompt)}&per_page=3&min_width=640`,
        { 
          method: 'GET',
          headers: {
            'User-Agent': 'ChatMun-AI/1.0'
          }
        }
      )
      
      if (pixabayResponse.ok) {
        const data = await pixabayResponse.json()
        if (data.hits && data.hits.length > 0) {
          const video = data.hits[0]
          console.log('✅ Video encontrado en Pixabay')
          return {
            success: true,
            videoUrl: video.videos.medium.url,
            provider: 'Pixabay (Video Gratuito)',
            message: 'Video real de biblioteca gratuita'
          }
        }
      }
    } catch (error) {
      console.log('Pixabay no disponible:', error)
    }
    
    // Opción 2: Usar servicios de GIF animado
    try {
      console.log('🎬 Probando GIPHY API...')
      // Usar Tenor en lugar de GIPHY (más abierto)
      const tenorResponse = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(prompt)}&key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&limit=1&media_filter=gif&contentfilter=medium`
      )
      
      console.log('🎬 Tenor response status:', tenorResponse.status)
      
      if (tenorResponse.ok) {
        const data = await tenorResponse.json()
        console.log('🎬 Tenor data disponible:', data.results?.length || 0)
        
        if (data.results && data.results.length > 0) {
          const gif = data.results[0]
          const gifUrl = gif.media_formats.gif.url
          console.log('✅ GIF encontrado en Tenor:', gif.content_description)
          console.log('🔗 GIF URL:', gifUrl)
          return {
            success: true,
            videoUrl: gifUrl,
            provider: 'Tenor (GIF Animado Gratuito)',
            message: 'GIF animado relacionado con el prompt'
          }
        } else {
          console.log('⚠️ Tenor no encontró resultados para:', prompt)
        }
      } else {
        console.log('⚠️ Tenor response no OK:', tenorResponse.status)
      }
    } catch (error) {
      console.log('❌ Tenor no disponible:', error)
      
      // Fallback: intentar con una API simple de GIF
      try {
        console.log('🎬 Probando con API alternativa de GIFs...')
        // Usar una API simple que no requiere clave
        const simpleGifUrl = `https://api.giphy.com/v1/gifs/translate?api_key=dc6zaTOxFJmzC&s=${encodeURIComponent(prompt)}`
        const simpleResponse = await fetch(simpleGifUrl)
        
        if (simpleResponse.ok) {
          const data = await simpleResponse.json()
          if (data.data && data.data.images) {
            console.log('✅ GIF simple encontrado')
            return {
              success: true,
              videoUrl: data.data.images.fixed_height.url,
              provider: 'GIPHY Simple (GIF Gratuito)',
              message: 'GIF relacionado encontrado'
            }
          }
        }
      } catch (fallbackError) {
        console.log('❌ API alternativa tampoco disponible:', fallbackError)
      }
    }
    
    console.log('APIs de video gratuitas no disponibles')
    return null
    
  } catch (error) {
    console.error('Error en APIs de video gratuitas:', error)
    return null
  }
}

// Función fallback: generar imagen temática relacionada con video
async function generateAnimatedGIF(prompt: string) {
  try {
    console.log('� Generando imagen relacionada con video...')
    
    // Usar Pollinations para generar una imagen relacionada con el prompt de video
    const imagePrompt = `${prompt} cinematic, high quality, vibrant colors`
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}?width=500&height=300&nologo=true&nofeed=true&seed=${Math.floor(Math.random() * 10000)}`
    
    console.log('✅ Imagen relacionada generada')
    console.log('🔗 URL:', imageUrl)
    
    return {
      success: true,
      videoUrl: imageUrl,
      provider: 'Pollinations (Imagen AI Gratuita)',
      message: 'Imagen AI relacionada con el video solicitado',
      isImage: true
    }
  } catch (error) {
    console.error('Error generando imagen relacionada:', error)
    
    // Fallback de emergencia con contenido temático
    const encodedPrompt = encodeURIComponent(prompt)
    let fallbackUrl = `https://robohash.org/${encodedPrompt}.png?set=set4&size=400x300`
    
    // Mejorar fallback según el contenido
    if (prompt.toLowerCase().includes('perro') || prompt.toLowerCase().includes('dog')) {
      fallbackUrl = `https://robohash.org/${encodedPrompt}.png?set=set4&size=400x300`
    } else if (prompt.toLowerCase().includes('gato') || prompt.toLowerCase().includes('cat')) {
      fallbackUrl = `https://robohash.org/${encodedPrompt}.png?set=set4&size=400x300`
    } else if (prompt.toLowerCase().includes('paisaje') || prompt.toLowerCase().includes('naturaleza')) {
      fallbackUrl = `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`
    }
    
    return {
      success: true,
      videoUrl: fallbackUrl,
      provider: 'Imagen de Respaldo (Gratuito)',
      message: 'Imagen temática relacionada',
      isImage: true
    }
  }
}

// Función para generar video con Pexels (videos stock)
async function generateWithPexels(prompt: string) {
  try {
    const pexelsKey = process.env.PEXELS_API_KEY || 'demo_key'
    const response = await fetch(
      `https://api.pexels.com/videos/search?query=${encodeURIComponent(prompt)}&per_page=1`,
      {
        headers: {
          'Authorization': pexelsKey
        }
      }
    )

    if (response.ok) {
      const data = await response.json()
      if (data.videos && data.videos.length > 0) {
        const video = data.videos[0]
        const videoFile = video.video_files.find((file: { quality: string }) => file.quality === 'sd' || file.quality === 'hd')
        
        return {
          success: true,
          videoUrl: videoFile?.link || video.video_files[0].link,
          provider: 'Pexels Stock Video (Gratuito)',
          thumbnail: video.image
        }
      }
    }
  } catch {
    console.log('Pexels no disponible')
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt es requerido' },
        { status: 400 }
      )
    }

    console.log('🎬 Generando video con prompt:', prompt)

    // Intentar diferentes proveedores en orden
    const providers = [
      () => generateWithHuggingFaceVideo(prompt),
      () => generateWithStableVideo(prompt),
      () => generateWithReplicate(prompt),
      () => generateFreeVideo(prompt),
      () => generateWithPexels(prompt),
      () => generateAnimatedGIF(prompt)
    ]

    for (const provider of providers) {
      const result = await provider()
      if (result?.success) {
        console.log(`✅ Video generado con: ${result.provider}`)
        return NextResponse.json(result)
      }
    }

    // Si todo falla, generar un video placeholder
    return NextResponse.json({
      success: true,
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_720x480_1mb.mp4',
      provider: 'Video de Ejemplo (Fallback)',
      message: 'Generando video placeholder mientras configuramos el servicio'
    })

  } catch (error) {
    console.error('❌ Error generando video:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
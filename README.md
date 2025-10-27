# 🤖 Asistente IA Municipal Inteligente

Una aplicación web con **inteligencia artificial real** diseñada específicamente para empleados municipales. Mantiene conversaciones naturales y ayuda con redacción de documentos oficiales, consultas administrativas y procedimientos municipales.

## ✨ Nuevas Características de IA

### 🧠 **Inteligencia Artificial Real**

- **Conversaciones naturales**: Ya no son respuestas predefinidas, sino diálogos reales
- **Contexto inteligente**: Recuerda y entiende el contexto de la conversación
- **Especialización municipal**: Entrenado específicamente para tareas gubernamentales argentinas
- **Múltiples opciones de IA**: OpenAI, Ollama local, y respuestas súper inteligentes

### 🎯 **Configuraciones de IA Disponibles**

#### 1. 🧠 Respuestas Súper Inteligentes (Gratis - Recomendado)

- ✅ **Sin configuración** - Funciona inmediatamente
- ✅ **Conversaciones contextuales** - Entiende y responde de forma natural
- ✅ **Especialización municipal** - Conoce procedimientos y documentación oficial
- ✅ **Respuestas variadas** - No repite las mismas respuestas

#### 2. 🚀 OpenAI GPT-3.5 (Pago - Máxima Calidad)

- 🌟 **Conversaciones extremadamente naturales**
- 🌟 **Comprensión superior del contexto**
- 🌟 **Creatividad en respuestas**
- 💰 **Costo**: ~$0.002 por 1000 palabras
- 🔧 **Configuración**: API key de OpenAI

#### 3. 🏠 Ollama Local (Gratis - Privacidad Total)

- ✅ **Completamente gratis y privado**
- ✅ **Funciona sin internet**
- ✅ **Control total de datos**
- ⚙️ **Requiere**: Instalación local de Ollama

## 🎯 Características

- **Chat Inteligente**: Conversaciones reales, no respuestas automáticas
- **Configuración Flexible**: Cambia entre diferentes tipos de IA según tus necesidades
- **Especialización Municipal**: Conoce procedimientos argentinos específicos
- **Diseño Profesional**: Colores y interfaz apropiada para oficinas gubernamentales
- **Fácil Configuración**: Setup simple para todas las opciones de IA

## 🚀 Funcionalidades

### Para Empleados Municipales:

- ✍️ **Redacción de Notas**: Plantillas y guías para documentos oficiales
- 📋 **Formatos de Informes**: Estructuras estándar para informes técnicos
- 🏛️ **Procedimientos**: Consultas sobre trámites y normativas municipales
- 📄 **Documentación**: Ayuda con actas, resoluciones y memorandos
- 💡 **Sugerencias Inteligentes**: Recomendaciones contextuales para cada consulta

## 🛠️ Tecnologías

- **Frontend**: Next.js 16 con React 19
- **Estilos**: Tailwind CSS 4
- **Lenguaje**: TypeScript
- **Iconos**: Lucide React
- **Bundler**: Webpack

## 📦 Instalación

1. **Clonar el repositorio**:

   ```bash
   git clone <url-del-repositorio>
   cd chatmun-ai
   ```

2. **Instalar dependencias**:

   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**:

   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**:
   ```
   http://localhost:3000
   ```

## 📋 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar versión de producción
- `npm run lint` - Verificar código con ESLint

## 🎨 Diseño

La aplicación utiliza una paleta de colores azules que refleja profesionalismo y confianza:

- **Azul Primario**: Para elementos principales y encabezados
- **Azul Claro**: Para fondos y elementos secundarios
- **Grises**: Para texto y elementos neutrales
- **Blanco**: Para áreas de contenido y contraste

## � Ejemplos de Conversaciones Inteligentes

### Redacción de Documentos:

**Tú**: "Necesito escribir una nota al intendente pidiendo más presupuesto"
**IA**: "Perfecto, te ayudo con esa nota. Para hacerla más efectiva, ¿podrías contarme para qué área necesitas el presupuesto y cuál es la justificación principal? Con esos detalles te armo una estructura convincente..."

### Consultas Procedimentales:

**Tú**: "Un vecino quiere abrir un kiosco, ¿qué necesita?"
**IA**: "Te explico todo el proceso para habilitación comercial. Primero necesita estos documentos básicos... ¿El local ya está alquilado o es propio? Porque eso cambia algunos requisitos..."

### Seguimiento Contextual:

**Tú**: "¿Y si no tiene el certificado de bomberos?"
**IA**: "Ah claro, continuando con la habilitación del kiosco. Si no tiene el certificado de bomberos, debe solicitarlo primero en el cuartel. Te explico cómo..."

## 🚀 Cómo Configurar la IA

### Opción 1: Usar Respuestas Súper Inteligentes (Recomendado)

1. ¡Ya está funcionando! No necesitas configurar nada
2. Haz clic en "Configurar IA" y selecciona "Respuestas Inteligentes"
3. ¡Disfruta de conversaciones naturales inmediatamente!

### Opción 2: OpenAI (Para máxima calidad)

1. Ve a [platform.openai.com](https://platform.openai.com)
2. Crea una cuenta y genera una API key
3. En la app, haz clic en "Configurar IA" → "OpenAI GPT-3.5"
4. Ingresa tu API key
5. ¡Guarda y tendrás IA de nivel profesional!

### Opción 3: Ollama (Gratis y privado)

1. Descarga Ollama desde [ollama.ai](https://ollama.ai)
2. Instálalo en tu PC
3. Abre terminal y ejecuta: `ollama run llama2`
4. En la app, selecciona "Ollama Local"
5. ¡Ya tienes IA gratuita y privada!

## 🔧 Personalización

### Colores

Los colores se pueden modificar en `src/app/globals.css` y en los componentes usando clases de Tailwind.

### Respuestas del Bot

Las respuestas automáticas se configuran en `src/components/Chat.tsx` en la función `generateBotResponse()`.

### Contenido

- Modifica el texto del encabezado en `src/app/page.tsx`
- Ajusta las preguntas sugeridas en `src/components/Chat.tsx`

## 📝 Estructura del Proyecto

```
chatmun-ai/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── components/
│       └── Chat.tsx
├── public/
├── package.json
└── README.md
```

## 🚀 Despliegue

Para desplegar en producción:

1. **Construir el proyecto**:

   ```bash
   npm run build
   ```

2. **Ejecutar en producción**:
   ```bash
   npm run start
   ```

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está diseñado para uso municipal y gubernamental.

---

Desarrollado para mejorar la eficiencia y productividad del personal municipal mediante asistencia inteligente.

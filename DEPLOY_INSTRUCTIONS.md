# 🚀 Instrucciones para subir ChatMun AI a GitHub y Vercel

## Paso 1: Crear repositorio en GitHub

1. Ve a [github.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"New"** o **"+"** y selecciona **"New repository"**
3. Datos del repositorio:
   - **Repository name**: `chatmun-ai`
   - **Description**: `🏢 Asistente IA Municipal para empleados de La Plata - Next.js + Ollama + LLaMA 3.2`
   - **Visibility**: Público o Privado (tu elección)
   - **NO marques** "Add a README file" (ya tienes uno)
   - **NO agregues** .gitignore o license (ya los tienes)
4. Haz clic en **"Create repository"**

## Paso 2: Conectar tu proyecto local con GitHub

Después de crear el repositorio, GitHub te mostrará comandos. Usa estos:

```bash
git remote add origin https://github.com/TU_USUARIO/chatmun-ai.git
git branch -M main
git push -u origin main
```

**O ejecuta estos comandos en tu terminal:**

```powershell
# Agregar el repositorio remoto (reemplaza TU_USUARIO con tu username de GitHub)
git remote add origin https://github.com/TU_USUARIO/chatmun-ai.git

# Cambiar a branch main
git branch -M main

# Subir el código
git push -u origin main
```

## Paso 3: Desplegar en Vercel (GRATIS y perfecto para Next.js)

### Opción A: Desde GitHub (Recomendado)
1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en **"Sign Up"** o **"Log In"**
3. Conecta con tu cuenta de GitHub
4. Haz clic en **"Import Project"**
5. Selecciona el repositorio `chatmun-ai`
6. Vercel detectará automáticamente que es Next.js
7. Haz clic en **"Deploy"**
8. ¡Listo! Tu app estará en línea en unos minutos

### Opción B: Desde la terminal (si instalas Vercel CLI)
```bash
npm i -g vercel
vercel
```

## Paso 4: Configuración para producción

### Variables de entorno en Vercel:
1. En tu dashboard de Vercel, ve a tu proyecto
2. Settings > Environment Variables
3. Agrega (opcional):
   - `NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434` (para desarrollo local)

## 🎯 URLs finales:
- **GitHub**: `https://github.com/TU_USUARIO/chatmun-ai`
- **Vercel**: `https://chatmun-ai.vercel.app` (o similar)

## 📝 Notas importantes:
- Ollama solo funcionará en desarrollo local
- En producción, la app usará el sistema inteligente local
- Para usar OpenAI en producción, agrega la API key en variables de entorno
- El diseño es completamente responsive y se ve perfecto en todos los dispositivos

## 🔄 Para futuros cambios:
```bash
git add .
git commit -m "Descripción de los cambios"
git push
```
Vercel se actualizará automáticamente con cada push a GitHub.

¡Tu ChatMun AI estará disponible 24/7 en internet! 🎉
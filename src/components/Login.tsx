'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Mail } from 'lucide-react'

interface LoginProps {
  onLogin: (user: string) => void
}

const Login = ({ onLogin }: LoginProps) => {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleGoogleLogin = () => {
    setIsLoading(true)
    // Simulamos login con Google (en producción usarías Google OAuth)
    setTimeout(() => {
      const user = 'empleado@laplata.gov.ar'
      localStorage.setItem('user', user)
      onLogin(user)
      setIsLoading(false)
    }, 1500)
  }

  const handleEmailLogin = () => {
    const email = prompt('Ingresa tu email municipal:')
    if (email && email.includes('@laplata.gov.ar')) {
      localStorage.setItem('user', email)
      onLogin(email)
    } else {
      alert('Debes usar un email oficial (@laplata.gov.ar)')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border border-gray-100">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image 
              src="/images/logo-laplata.jpg" 
              alt="La Plata Capital" 
              width={80}
              height={80}
              className="object-contain rounded-xl"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            IA Municipalidad La Plata
          </h1>
          <p className="text-gray-600">
            Acceso para empleados municipales
          </p>
        </div>

        {/* Botones de login */}
        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 rounded-xl p-4 flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-md disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  G
                </div>
                <span className="font-medium text-gray-700">Continuar con Google</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">o</span>
            </div>
          </div>

          <button
            onClick={handleEmailLogin}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl p-4 flex items-center justify-center gap-3 hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 font-medium"
          >
            <Mail size={20} />
            Email municipal
          </button>
        </div>

        {/* Nota */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>🔒 Acceso restringido:</strong> Solo empleados municipales con email oficial (@laplata.gov.ar)
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
'use client'

import { useState, useEffect } from 'react';
import Chat from '../components/Chat';
import Login from '../components/Login';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: number;
}

function HomeComponent() {
  const [user, setUser] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Usar un flag para indicar si ya se cargaron los datos
  const [dataLoaded, setDataLoaded] = useState(false);

  // Cargar datos usando múltiples useState para evitar efectos problemáticos
  useEffect(() => {
    if (!dataLoaded) {
      const savedUser = localStorage.getItem('user');
      const savedConversations = localStorage.getItem('conversations');
      
      if (savedUser) {
        setUser(savedUser);
      }
      
      if (savedConversations) {
        try {
          const parsed = JSON.parse(savedConversations);
          setConversations(parsed);
          if (parsed.length > 0) {
            setCurrentConversationId(parsed[0].id);
          }
        } catch (error) {
          console.error('Error parsing conversations:', error);
          localStorage.removeItem('conversations');
        }
      }
      
      setDataLoaded(true);
    }
  }, [dataLoaded]);

  // Generar ID único para conversaciones
  const generateId = () => Date.now().toString();

  // Generar título basado en el primer mensaje
  const generateTitle = (messages: Message[]) => {
    if (messages.length === 0) return 'Nueva conversación';
    const firstUserMessage = messages.find(m => m.type === 'user');
    if (!firstUserMessage) return 'Nueva conversación';
    return firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '');
  };

  const saveConversation = (messages: Message[]) => {
    if (messages.length <= 1) return; // No guardar si solo hay el mensaje inicial

    let updatedConversations = [...conversations];
    
    if (currentConversationId) {
      // Actualizar conversación existente
      const index = updatedConversations.findIndex(c => c.id === currentConversationId);
      if (index !== -1) {
        updatedConversations[index] = {
          ...updatedConversations[index],
          messages,
          title: generateTitle(messages),
          timestamp: Date.now()
        };
      }
    } else {
      // Crear nueva conversación solo si hay más de un mensaje
      const newId = generateId();
      const newConversation: Conversation = {
        id: newId,
        title: generateTitle(messages),
        messages,
        timestamp: Date.now()
      };
      updatedConversations = [newConversation, ...updatedConversations];
      setCurrentConversationId(newId);
    }

    // Ordenar por timestamp descendente
    updatedConversations.sort((a, b) => b.timestamp - a.timestamp);
    
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation.id);
  };

  const handleDeleteConversation = (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Evitar que se active el click del contenedor
    console.log('🗑️ Borrando conversación:', conversationId);
    
    const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
    setConversations(updatedConversations);
    localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    
    // Si se borra la conversación actual, crear nueva conversación
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
    }
    
    console.log('✅ Conversación borrada, conversaciones restantes:', updatedConversations.length);
  };

  const getCurrentMessages = () => {
    if (!currentConversationId) {
      return [{
        id: 1,
        type: 'ai' as const,
        content: '¡Hola! Soy tu asistente de IA municipal. 🏛️\n\n✨ **Funciones disponibles:**\n• Chat inteligente\n• **Generación de imágenes GRATUITA** 🎨\n• Asistencia municipal\n\n💡 **Prueba:** "Genera una imagen de..." para crear imágenes gratis!\n\n¿En qué puedo ayudarte hoy?'
      }];
    }
    const conversation = conversations.find(c => c.id === currentConversationId);
    return conversation?.messages || [{
      id: 1,
      type: 'ai' as const,
      content: '¡Hola! Soy tu asistente de IA municipal. 🏛️\n\n✨ **Funciones disponibles:**\n• Chat inteligente\n• **Generación de imágenes GRATUITA** 🎨\n• Asistencia municipal\n\n💡 **Prueba:** "Genera una imagen de..." para crear imágenes gratis!\n\n¿En qué puedo ayudarte hoy?'
    }];
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('conversations');
    setUser(null);
    setConversations([]);
    setCurrentConversationId(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex h-full">
        {/* Sidebar con conversaciones */}
        <div className="w-80 bg-white shadow-xl">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <Image 
                    src="/images/profile.png" 
                    alt="Perfil del usuario" 
                    width={40}
                    height={40}
                    className="object-cover rounded-full"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{user}</h3>
                  <p className="text-sm text-gray-500">Empleado Municipal</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Salir
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Conversaciones</h4>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`relative group w-full rounded-lg transition-colors ${
                    currentConversationId === conversation.id 
                      ? 'bg-teal-100 border-l-4 border-teal-600' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <button
                    onClick={() => handleSelectConversation(conversation)}
                    className="w-full text-left p-3 pr-10"
                  >
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {conversation.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(conversation.timestamp).toLocaleDateString()}
                    </div>
                  </button>
                  
                  <button
                    onClick={(e) => handleDeleteConversation(conversation.id, e)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full hover:bg-red-100 transition-all duration-200 bg-white border border-gray-200 shadow-sm"
                    title="Borrar conversación"
                    aria-label="Borrar conversación"
                  >
                    <Trash2 size={14} className="text-red-500 hover:text-red-700" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Área principal del chat */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 flex-1 overflow-hidden">
            {/* Header con logo grande y banner */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-8 rounded-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="bg-white p-3 rounded-xl shadow-lg">
                      <div className="relative w-20 h-20">
                        <Image 
                          src="/images/logo-laplata-capital.jpg" 
                          alt="La Plata Capital" 
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      </div>
                    </div>
                    <div>
                      <h1 className="font-bold text-3xl">🏢 IA Municipalidad La Plata</h1>
                      <p className="text-teal-100 text-lg font-medium">
                        Asistente inteligente para empleados municipales
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-sm bg-green-500 px-3 py-2 rounded-full font-semibold">
                      🟢 ONLINE
                    </div>
                  </div>
                </div>
                
                {/* Banner Municipal - Ancho completo */}
                <div className="mt-6 p-4 bg-white/15 rounded-xl backdrop-blur-sm">
                  <div className="relative w-full h-20">
                    <Image 
                      src="/images/banner-laplata.png" 
                      alt="La Plata Capital - Secretaría de Desarrollo Social" 
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Component */}
            <div className="h-full">
              <Chat 
                initialMessages={getCurrentMessages()}
                onMessagesChange={saveConversation}
                onNewConversation={handleNewConversation}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Exportar como componente dinámico para evitar SSR
const Home = dynamic(() => Promise.resolve(HomeComponent), {
  ssr: false,
  loading: () => <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Cargando...</p>
    </div>
  </div>
});

export default Home;
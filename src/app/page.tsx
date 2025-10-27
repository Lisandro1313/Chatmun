'use client'

import { useState, useEffect } from 'react';
import Chat from '../components/Chat';
import Login from '../components/Login';
import Image from 'next/image';

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

export default function Home() {
  const [user, setUser] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Cargar usuario y conversaciones guardadas
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(savedUser);
      
      // Cargar conversaciones
      const savedConversations = localStorage.getItem('conversations');
      if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed);
        
        // Seleccionar la conversación más reciente
        if (parsed.length > 0) {
          setCurrentConversationId(parsed[0].id);
        }
      }
    }
  }, []);

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
    if (messages.length === 0) return;

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
      // Crear nueva conversación
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

  const getCurrentMessages = () => {
    if (!currentConversationId) return [];
    const conversation = conversations.find(c => c.id === currentConversationId);
    return conversation?.messages || [];
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
              <div>
                <h3 className="font-semibold text-gray-800">{user}</h3>
                <p className="text-sm text-gray-500">Empleado Municipal</p>
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
            <button
              onClick={handleNewConversation}
              className="w-full bg-teal-600 text-white p-3 rounded-lg hover:bg-teal-700 transition-colors mb-4"
            >
              ➕ Nueva Conversación
            </button>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Conversaciones</h4>
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentConversationId === conversation.id 
                      ? 'bg-teal-100 border-l-4 border-teal-600' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {conversation.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(conversation.timestamp).toLocaleDateString()}
                  </div>
                </button>
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
                          src="/images/logo-laplata.jpg" 
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
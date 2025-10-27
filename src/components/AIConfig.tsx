'use client';

import { useState } from 'react';
import { Settings, Brain, Zap, Cpu } from 'lucide-react';

interface AIConfigProps {
  onConfigChange: (config: { aiType: string; apiKey: string }) => void;
}

const AIConfig = ({ onConfigChange }: AIConfigProps) => {
  const [selectedAI, setSelectedAI] = useState('smart');
  const [apiKey, setApiKey] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  const aiOptions = [
    {
      id: 'smart',
      name: 'Respuestas Inteligentes',
      description: 'Respuestas predefinidas muy inteligentes (Gratis)',
      icon: <Brain className="w-5 h-5" />,
      free: true,
      setup: 'Sin configuración requerida'
    },
    {
      id: 'openai',
      name: 'OpenAI GPT-3.5',
      description: 'IA muy avanzada (Requiere API key de pago)',
      icon: <Zap className="w-5 h-5" />,
      free: false,
      setup: 'Requiere API key de OpenAI'
    },
    {
      id: 'ollama',
      name: 'Ollama Local',
      description: 'IA local gratuita (Requiere instalación)',
      icon: <Cpu className="w-5 h-5" />,
      free: true,
      setup: 'Instalar Ollama en tu PC'
    }
  ];

  const handleConfigSave = () => {
    onConfigChange({
      aiType: selectedAI,
      apiKey: apiKey
    });
    setShowConfig(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowConfig(!showConfig)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
      >
        <Settings size={16} />
        Configurar IA
      </button>

      {showConfig && (
        <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-80 z-10">
          <h3 className="font-semibold text-gray-800 mb-3">Seleccionar Tipo de IA</h3>
          
          <div className="space-y-3">
            {aiOptions.map((option) => (
              <div
                key={option.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedAI === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedAI(option.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  {option.icon}
                  <span className="font-medium">{option.name}</span>
                  {option.free && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Gratis
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{option.description}</p>
                <p className="text-xs text-gray-500 mt-1">{option.setup}</p>
              </div>
            ))}
          </div>

          {selectedAI === 'openai' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key de OpenAI
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtén tu API key en platform.openai.com
              </p>
            </div>
          )}

          {selectedAI === 'ollama' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Para usar Ollama:</strong><br/>
                1. Instala desde ollama.ai<br/>
                2. Ejecuta: <code className="bg-yellow-100 px-1 rounded">ollama run llama2</code><br/>
                3. Mantén Ollama ejecutándose
              </p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleConfigSave}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Guardar
            </button>
            <button
              onClick={() => setShowConfig(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIConfig;
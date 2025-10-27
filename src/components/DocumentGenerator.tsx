'use client';

import { useState } from 'react';
import { FileText } from 'lucide-react';

interface DocumentGeneratorProps {
  onDocumentGenerated: (doc: { title: string; content: string; type: string }) => void;
}

const DocumentGenerator = ({ onDocumentGenerated }: DocumentGeneratorProps) => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [docType, setDocType] = useState('');
  const [formData, setFormData] = useState({
    destinatario: '',
    asunto: '',
    contenido: '',
    area: '',
    cargo: '',
    municipio: ''
  });

  const documentTemplates = {
    nota_solicitud: {
      title: 'Nota de Solicitud',
      template: `{municipio}, {fecha}

Señor/a {destinatario}
S/D

ASUNTO: {asunto}

Tengo el agrado de dirigirme a Usted a fin de solicitar {contenido}.

Fundamento la presente en {justificacion}.

Sin otro particular, saludo a Usted muy atentamente.

{firma}
{cargo}
{area}`
    },
    resolucion: {
      title: 'Resolución Municipal',
      template: `MUNICIPALIDAD DE {municipio}
SECRETARÍA DE GOBIERNO

RESOLUCIÓN N° {numero}/2025

{municipio}, {fecha}

VISTO:
{visto}

CONSIDERANDO:
{considerando}

POR ELLO:
EL INTENDENTE MUNICIPAL DE {municipio}
RESUELVE:

ARTÍCULO 1°: {articulo1}

ARTÍCULO 2°: {articulo2}

ARTÍCULO 3°: Comuníquese, publíquese y archívese.

{firma_intendente}
Intendente Municipal`
    },
    informe_tecnico: {
      title: 'Informe Técnico',
      template: `MUNICIPALIDAD DE {municipio}
{area}

INFORME TÉCNICO N° {numero}/2025

FECHA: {fecha}
ELABORADO POR: {elaborado_por}
DIRIGIDO A: {dirigido_a}

1. ANTECEDENTES:
{antecedentes}

2. ANÁLISIS TÉCNICO:
{analisis}

3. CONCLUSIONES:
{conclusiones}

4. RECOMENDACIONES:
{recomendaciones}

{firma}
{cargo}
{area}`
    }
  };

  const generateDocument = () => {
    const template = documentTemplates[docType as keyof typeof documentTemplates];
    if (!template) return;

    const fecha = new Date().toLocaleDateString('es-AR');
    const numero = Math.floor(Math.random() * 1000) + 1;
    
    const document = template.template
      .replace(/{municipio}/g, formData.municipio || '[Municipio]')
      .replace(/{fecha}/g, fecha)
      .replace(/{destinatario}/g, formData.destinatario || '[Destinatario]')
      .replace(/{asunto}/g, formData.asunto || '[Asunto]')
      .replace(/{contenido}/g, formData.contenido || '[Contenido]')
      .replace(/{area}/g, formData.area || '[Área]')
      .replace(/{cargo}/g, formData.cargo || '[Cargo]')
      .replace(/{numero}/g, numero.toString());

    onDocumentGenerated({
      title: template.title,
      content: document,
      type: docType
    });

    setShowGenerator(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowGenerator(!showGenerator)}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
      >
        <FileText size={16} />
        Generar Documento
      </button>

      {showGenerator && (
        <div className="absolute top-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-6 w-96 z-20 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-800 mb-4">Generador de Documentos</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">Seleccionar...</option>
                <option value="nota_solicitud">Nota de Solicitud</option>
                <option value="resolucion">Resolución Municipal</option>
                <option value="informe_tecnico">Informe Técnico</option>
              </select>
            </div>

            {docType && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Municipio
                  </label>
                  <input
                    type="text"
                    value={formData.municipio}
                    onChange={(e) => setFormData({...formData, municipio: e.target.value})}
                    placeholder="Ej: Rosario"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destinatario
                  </label>
                  <input
                    type="text"
                    value={formData.destinatario}
                    onChange={(e) => setFormData({...formData, destinatario: e.target.value})}
                    placeholder="Ej: Intendente Municipal"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto
                  </label>
                  <input
                    type="text"
                    value={formData.asunto}
                    onChange={(e) => setFormData({...formData, asunto: e.target.value})}
                    placeholder="Ej: Solicitud de presupuesto adicional"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tu Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                    placeholder="Ej: Secretario de Obras Públicas"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                    placeholder="Ej: Secretaría de Obras Públicas"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={generateDocument}
                disabled={!docType}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Generar
              </button>
              <button
                onClick={() => setShowGenerator(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentGenerator;
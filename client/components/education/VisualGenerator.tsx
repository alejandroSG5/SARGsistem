
import React, { useState } from 'react';
import { Image as ImageIcon, Send, Download, RefreshCcw, Loader2, Sparkles } from 'lucide-react';
import { generateDidacticImage } from '../../services/geminiService';

const VisualGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImage(null);
    
    // Enhance prompt for specific educational output
    const enhancedPrompt = `Ilustración detallada, estilo diagrama científico o infografía educativa sobre: ${prompt}. Fondo claro, partes etiquetadas si es posible, alta resolución.`;
    
    const result = await generateDidacticImage(enhancedPrompt);
    setImage(result);
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        
        <div className="text-center">
          <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-pink-500 w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-gray-800 dark:text-white mb-2">Estudio Visual IA</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Describe un concepto histórico, científico o artístico y la IA lo dibujará para tu clase.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-2 rounded-[2rem] shadow-xl border border-gray-200 dark:border-gray-700 flex gap-2">
          <input 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Corte transversal de un volcán activo..."
            className="flex-1 bg-transparent px-6 py-4 outline-none text-lg font-bold text-gray-800 dark:text-white placeholder-gray-400"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="px-8 bg-pink-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-pink-500 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-pink-600/30"
          >
            {loading ? <Loader2 className="animate-spin"/> : <Send size={20} />} GENERAR
          </button>
        </div>

        <div className="aspect-video bg-gray-200 dark:bg-black rounded-[2rem] relative overflow-hidden shadow-inner border-4 border-white dark:border-gray-800 flex items-center justify-center group">
            {loading && (
              <div className="text-center">
                <Loader2 size={64} className="text-pink-500 animate-spin mx-auto mb-4"/>
                <p className="text-gray-500 font-bold animate-pulse">Imaginando concepto...</p>
              </div>
            )}
            
            {!loading && !image && (
              <div className="text-center opacity-30">
                <ImageIcon size={100} className="mx-auto mb-4"/>
                <p className="text-2xl font-black uppercase">Lienzo Vacío</p>
              </div>
            )}

            {image && (
              <>
                <img src={image} alt="Generated" className="w-full h-full object-cover" />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <a href={image} download={`axolotl_gen_${Date.now()}.png`} className="p-3 bg-white text-black rounded-xl font-bold flex items-center gap-2 hover:bg-gray-200">
                      <Download size={20}/> Descargar
                   </a>
                </div>
              </>
            )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           {['Célula Animal 3D', 'Pirámide de Palenque', 'Sistema Solar', 'Ciclo del Agua'].map((s, i) => (
             <button key={i} onClick={() => { setPrompt(s); }} className="p-4 bg-white dark:bg-gray-800 rounded-2xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors border border-transparent hover:border-pink-200">
               {s}
             </button>
           ))}
        </div>

      </div>
    </div>
  );
};

export default VisualGenerator;

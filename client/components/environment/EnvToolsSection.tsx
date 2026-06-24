
import React from 'react';
import { ArrowLeft, Droplet, Volume2, Globe } from 'lucide-react';
import WaterMonitor from './WaterMonitor';
import NoiseMeter from './NoiseMeter';
import EcoSimulator from './EcoSimulator';

interface EnvToolsSectionProps {
  type: 'water' | 'noise' | 'eco' | 'climate' | 'recycling' | 'solar' | 'air' | 'impact';
  onBack: () => void;
}

const EnvToolsSection: React.FC<EnvToolsSectionProps> = ({ type, onBack }) => {
  return (
    <div className="bg-white dark:bg-axolotl-dark h-full w-full absolute top-0 left-0 z-40 flex flex-col">
       {/* Header */}
       <div className="sticky top-0 bg-white/95 dark:bg-axolotl-dark/95 backdrop-blur-md z-30 p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm shrink-0">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="text-gray-700 dark:text-gray-200" />
          </button>
          <h2 className="font-bold text-lg text-gray-800 dark:text-white capitalize flex items-center gap-2">
            {type === 'water' && <><Droplet size={20} className="text-cyan-500"/> Monitor de Calidad del Agua</>}
            {type === 'noise' && <><Volume2 size={20} className="text-orange-500"/> Medidor de Ruido (Sonómetro)</>}
            {type === 'eco' && <><Globe size={20} className="text-purple-500"/> Simulador de Ecosistema</>}
          </h2>
       </div>

       {/* Content Container */}
       <div className="flex-1 relative overflow-hidden">
          {type === 'water' && <div className="h-full overflow-y-auto p-4 md:p-8"><WaterMonitor /></div>}
          {type === 'noise' && <div className="h-full overflow-y-auto p-4 md:p-8"><NoiseMeter /></div>}
          {type === 'eco' && <div className="h-full overflow-y-auto p-4 md:p-8"><EcoSimulator /></div>}
       </div>
    </div>
  );
};

export default EnvToolsSection;

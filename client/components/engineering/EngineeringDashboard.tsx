import React, { useState } from 'react';
import { ArrowLeft, Cpu, Terminal, Activity, ChevronRight, Zap, Code, Settings, PenTool, Layers, Monitor, Laptop, Shield } from 'lucide-react';
import { ModuleData, TopicData } from '../../types';
import CADStudio from './CADStudio';
import CircuitLab from './CircuitLab';
import SARGIDE from './SARGIDE';

interface EngineeringDashboardProps {
  moduleData: ModuleData;
  onBack: () => void;
}

const EngineeringDashboard: React.FC<EngineeringDashboardProps> = ({ moduleData, onBack }) => {
  const [activeSoftware, setActiveSoftware] = useState<'cad' | 'circuit' | 'ide' | null>(null);

  // Render Full Screen Software Overlays
  if (activeSoftware === 'cad') return <CADStudio onClose={() => setActiveSoftware(null)} />;
  if (activeSoftware === 'circuit') return <CircuitLab onClose={() => setActiveSoftware(null)} />;
  if (activeSoftware === 'ide') return <SARGIDE onClose={() => setActiveSoftware(null)} />;

  return (
    <div className="min-h-screen bg-blue-50/30 dark:bg-[#05060c] font-sans pb-32 animate-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      
      {/* HERO HEADER - Vibrant Cohesive */}
      <div className="bg-blue-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white p-8 lg:p-16 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <button onClick={onBack} className="absolute left-8 top-8 p-3 bg-white dark:bg-[#2a2a2a] shadow-sm hover:scale-105 rounded-full transition-transform">
            <ArrowLeft size={20} />
        </button>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
           <div className="w-16 h-16 relative mb-4">
               <Terminal className="text-blue-500 absolute w-full h-full animate-bounce drop-shadow-sm" strokeWidth={1} />
           </div>
           
           <h2 className="text-4xl lg:text-6xl font-black tracking-tighter flex justify-center gap-2 mb-2 drop-shadow-sm">
                <span className="text-blue-500">S</span>
                <span className="text-rose-500">A</span>
                <span className="text-amber-500">R</span>
                <span className="text-emerald-500">G</span>
           </h2>
           <h1 className="text-2xl lg:text-4xl font-black mb-4 uppercase tracking-widest text-blue-500">
                INGENIERÍA
           </h1>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-12 lg:space-y-16 mt-4 lg:mt-8">
         {/* MASSIVE 3-PILLAR GRID */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
             
             {/* 1. CIRCUIT LAB */}
             <div 
                onClick={() => setActiveSoftware('circuit')}
                className="group relative min-h-[400px] rounded-[2.5rem] bg-yellow-50 dark:bg-[#1a1a1a] border border-transparent transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between p-8 hover:-translate-y-2 text-center items-center"
             >
                 {/* Icon Float */}
                 <div className="absolute -top-10 -right-10 z-0 text-yellow-50 dark:text-yellow-900/10 group-hover:text-yellow-100 dark:group-hover:text-yellow-900/20 group-hover:scale-110 transition-all duration-500">
                     <Zap size={250} />
                 </div>

                 <div className="relative z-10">
                     <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center text-yellow-600 dark:text-yellow-400 mb-6 group-hover:scale-110 transition-transform shadow-sm">
                         <Cpu size={32} />
                     </div>
                     <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">CircuitLab</h2>
                     <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-3 leading-relaxed">
                         Simulador de electrónica avanzada. Diseña circuitos con lógica digital y microcontroladores en tiempo real.
                     </p>
                 </div>
                 <div className="relative z-10 flex items-center gap-2 text-yellow-600 dark:text-yellow-500 text-[10px] font-black uppercase tracking-widest mt-8">
                     <Settings size={14} className="animate-spin-slow"/> Software Activo
                 </div>
             </div>

             {/* 2. SARG IDE */}
             <div 
                onClick={() => setActiveSoftware('ide')}
                className="group relative min-h-[400px] rounded-[2.5rem] bg-green-50 dark:bg-[#1a1a1a] border border-transparent transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between p-8 hover:-translate-y-2 text-center items-center"
             >
                 <div className="absolute -top-10 -right-10 z-0 text-green-50 dark:text-green-900/10 group-hover:text-green-100 dark:group-hover:text-green-900/20 group-hover:scale-110 transition-all duration-500">
                     <Terminal size={250} />
                 </div>

                 <div className="relative z-10">
                     <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-6 group-hover:scale-110 transition-transform shadow-sm">
                         <Code size={32} />
                     </div>
                     <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">SARG IDE</h2>
                     <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-3 leading-relaxed">
                         Entorno de desarrollo profesional. Escribe, compila y aprende lógica de programación con soporte nativo.
                     </p>
                 </div>
                 <div className="relative z-10 flex items-center gap-2 text-green-600 dark:text-green-500 text-[10px] font-black uppercase tracking-widest mt-8">
                     <Laptop size={14}/> Compilador Listo
                 </div>
             </div>

             {/* 3. CAD STUDIO */}
             <div 
                onClick={() => setActiveSoftware('cad')}
                className="group relative min-h-[400px] rounded-[2.5rem] bg-purple-50 dark:bg-[#1a1a1a] border border-transparent transition-all duration-300 overflow-hidden cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between p-8 hover:-translate-y-2 text-center items-center"
             >
                 <div className="absolute -top-10 -right-10 z-0 text-purple-50 dark:text-purple-900/10 group-hover:text-purple-100 dark:group-hover:text-purple-900/20 group-hover:scale-110 transition-all duration-500">
                     <Layers size={250} />
                 </div>

                 <div className="relative z-10">
                     <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 transition-transform shadow-sm">
                         <PenTool size={32} />
                     </div>
                     <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">CAD Studio</h2>
                     <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-3 leading-relaxed">
                         Suite de diseño industrial. Crea planos precisos y estructuras vectoriales para ecotecnias y robótica.
                     </p>
                 </div>
                 <div className="relative z-10 flex items-center gap-2 text-purple-600 dark:text-purple-500 text-[10px] font-black uppercase tracking-widest mt-8">
                     <Monitor size={14}/> Motor Gráfico
                 </div>
             </div>

         </div>
      </div>
    </div>
  );
};

export default EngineeringDashboard;

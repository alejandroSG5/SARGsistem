
import React from 'react';
import { ArrowLeft, PenTool, Brain, Radio, Hammer, Rocket, Globe } from 'lucide-react';
import VirtualWhiteboard from './VirtualWhiteboard';
import QuizGenerator from './QuizGenerator';
import RadioSARG from './RadioSARG';
import ProjectWorkshop from './ProjectWorkshop';
import ScienceSimulatorCore from './simulator/ScienceSimulatorCore';
import GlobalCommunity from './GlobalCommunity';

interface EduToolsSectionProps {
  type: 'whiteboard' | 'quiz' | 'radio' | 'library' | 'workshop' | 'visual' | 'simulator' | 'community';
  onBack: () => void;
}

const EduToolsSection: React.FC<EduToolsSectionProps> = ({ type, onBack }) => {
  return (
    <div className="bg-white dark:bg-axolotl-dark h-full w-full absolute top-0 left-0 z-40 flex flex-col">
       {/* Header */}
       <div className="sticky top-0 bg-white/95 dark:bg-axolotl-dark/95 backdrop-blur-md z-30 p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm shrink-0">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="text-gray-700 dark:text-gray-200" />
          </button>
          <h2 className="font-bold text-lg text-gray-800 dark:text-white capitalize flex items-center gap-2">
            {type === 'whiteboard' && <><PenTool size={20} className="text-blue-500"/> Pizarrón Interactivo</>}
            {type === 'quiz' && <><Brain size={20} className="text-purple-500"/> Generador de Exámenes</>}
            {type === 'radio' && <><Radio size={20} className="text-rose-500"/> Radio SARG</>}
            {type === 'workshop' && <><Hammer size={20} className="text-orange-500"/> Taller de Proyectos</>}
            {type === 'simulator' && <><Rocket size={20} className="text-red-500"/> Laboratorio 3D</>}
            {type === 'community' && <><Globe size={20} className="text-blue-500"/> Comunidad Global</>}
          </h2>
       </div>

       {/* Content Container */}
       <div className="flex-1 relative overflow-hidden">
          {type === 'whiteboard' && <VirtualWhiteboard />}
          {type === 'quiz' && <div className="h-full overflow-y-auto p-4 md:p-8"><QuizGenerator /></div>}
          {type === 'radio' && <div className="h-full overflow-y-auto p-4 md:p-8"><RadioSARG /></div>}
          {type === 'workshop' && <ProjectWorkshop />}
          {type === 'simulator' && <ScienceSimulatorCore />}
          {type === 'community' && <GlobalCommunity />}
       </div>
    </div>
  );
};

export default EduToolsSection;


import React, { useState } from 'react';
import { ArrowLeft, Activity, Leaf, AlertTriangle, Search, Filter, Info, CheckCircle, UserCheck, Map, Microscope, Pill, BookOpen } from 'lucide-react';
import AnatomyViewer3D from './AnatomyViewer3D';
import RegionMap from './RegionMap';
import SymptomWizard from './SymptomWizard';
import MicroscopeViewer from './MicroscopeViewer';
import MedicineManager from './MedicineManager';
import PlantLibrary from './PlantLibrary';
import HealthCalculators from './HealthCalculators';
import { NavigationTarget } from '../../types';

interface ToolsSectionProps {
  type: 'bmi' | 'plants' | 'symptoms' | 'map' | 'anatomy' | 'microscope' | 'medicine';
  onBack: () => void;
  mapTarget?: NavigationTarget | null; // New optional prop for routing
  onRequestMap?: (target: NavigationTarget) => void; // Call back to switch tool
  userProfile?: { name: string; gender: 'hombre' | 'mujer' | '' } | null;
}

const ToolsSection: React.FC<ToolsSectionProps> = ({ type, onBack, mapTarget, onRequestMap, userProfile }) => {

  // Full Screen wrapper logic depending on tool
  const isMap = type === 'map';

  return (
    <div className="bg-white dark:bg-axolotl-dark h-full w-full absolute top-0 left-0 z-40 flex flex-col">
       {/* Header */}
       <div className="sticky top-0 bg-white/95 dark:bg-axolotl-dark/95 backdrop-blur-md z-30 p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm shrink-0">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft className="text-gray-700 dark:text-gray-200" />
          </button>
          <h2 className="font-bold text-lg text-gray-800 dark:text-white capitalize flex items-center gap-2">
            {type === 'bmi' && <><Activity size={20} className="text-blue-500"/> Estudio de Salud</>}
            {type === 'plants' && <><Leaf size={20} className="text-green-500"/> Herbolaria Regional</>}
            {type === 'symptoms' && <><AlertTriangle size={20} className="text-orange-500"/> Triaje de Síntomas</>}
            {type === 'map' && <><Map size={20} className="text-emerald-500"/> Mapa de Recursos</>}
            {type === 'anatomy' && <><UserCheck size={20} className="text-indigo-500"/> Anatomía</>}
            {type === 'microscope' && <><Microscope size={20} className="text-teal-500"/> Lab Virtual</>}
            {type === 'medicine' && <><BookOpen size={20} className="text-purple-500"/> Libro de Apuntes</>}
          </h2>
       </div>

       {/* Content Container - Flex Grow for Maps/Anatomy */}
       <div className={`flex-1 relative ${isMap ? 'overflow-hidden' : 'p-4 md:p-8 max-w-[1400px] mx-auto w-full overflow-y-auto'}`}>
          {type === 'bmi' && <HealthCalculators userProfile={userProfile} />}
          {type === 'plants' && <PlantLibrary />}
          {type === 'symptoms' && <SymptomWizard onBack={onBack} onRequestMap={onRequestMap} />}
          {type === 'map' && <div className="absolute inset-0 w-full h-full p-2"><RegionMap initialTarget={mapTarget} /></div>}
          {type === 'anatomy' && <AnatomyViewer3D />}
          {type === 'microscope' && <MicroscopeViewer />}
          {type === 'medicine' && <MedicineManager />}
       </div>
    </div>
  );
};

export default ToolsSection;

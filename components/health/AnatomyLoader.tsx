import React from 'react';
import { Html, useProgress } from '@react-three/drei';
import { Loader2 } from 'lucide-react';

export const AnatomyLoader = () => {
  const { active, progress, errors, item, loaded, total } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl min-w-[250px]">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h3 className="text-white font-black text-lg mb-2">Cargando Modelo 3D</h3>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
            <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
        <p className="text-gray-400 text-xs font-mono">
            {Math.round(progress)}% — {loaded}/{total} recursos
        </p>
      </div>
    </Html>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { X, Box, Layers, Rotate3D, Scan, Activity } from 'lucide-react';
import { BodyPart } from '../../types';

interface Organ3DViewerProps {
  part: BodyPart;
  onClose: () => void;
}

const Organ3DViewer: React.FC<Organ3DViewerProps> = ({ part, onClose }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [scanLine, setScanLine] = useState(0);
  const [expanded, setExpanded] = useState(false);

  // Auto rotation effect
  useEffect(() => {
    if (!isDragging) {
      const interval = setInterval(() => {
        setRotation(prev => ({ ...prev, y: prev.y + 0.5 }));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [isDragging]);

  // Scanline effect
  useEffect(() => {
    const interval = setInterval(() => {
      setScanLine(prev => (prev + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMouse.x;
      const deltaY = e.clientY - lastMouse.y;
      setRotation(prev => ({ x: prev.x - deltaY * 0.5, y: prev.y + deltaX * 0.5 }));
      setLastMouse({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Generamos capas para simular volumen (Volumetric Extrusion)
  const layers = Array.from({ length: 20 }).map((_, i) => {
    const zOffset = (i - 10) * (expanded ? 4 : 1); // Expand effect
    const opacity = 1 - Math.abs(i - 10) / 15;
    return (
      <div
        key={i}
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transform: `translateZ(${zOffset}px)`,
          opacity: opacity,
          filter: `drop-shadow(0 0 2px ${part.colorHighlight})`
        }}
      >
        <svg viewBox="0 0 300 600" className="w-full h-full overflow-visible">
          <path
            d={part.paths.anterior}
            fill={part.colorBase}
            stroke={part.colorHighlight}
            strokeWidth="0.5"
            fillOpacity="0.4"
          />
        </svg>
      </div>
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-axolotl-teal/10 to-transparent"></div>
         <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-axolotl-teal/10 to-transparent"></div>
         
         {/* Grid lines */}
         <div className="w-full h-full opacity-10" 
              style={{ backgroundImage: 'linear-gradient(0deg, transparent 24%, #00ffcc 25%, #00ffcc 26%, transparent 27%, transparent 74%, #00ffcc 75%, #00ffcc 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, #00ffcc 25%, #00ffcc 26%, transparent 27%, transparent 74%, #00ffcc 75%, #00ffcc 76%, transparent 77%, transparent)', backgroundSize: '50px 50px' }}>
         </div>

         {/* Data corners */}
         <div className="absolute top-10 left-10 text-axolotl-teal font-mono text-xs">
            <div>OBJ: {part.name.toUpperCase()}</div>
            <div>SYS: {part.system.toUpperCase()}</div>
            <div className="mt-2 text-white">
                <Activity size={16} className="inline mr-2 animate-pulse" /> 
                LIVE MONITORING
            </div>
         </div>
      </div>

      <div className="relative w-full max-w-4xl h-[80vh] flex flex-col items-center">
        
        {/* Controls Header */}
        <div className="w-full flex justify-between items-center p-6 relative z-10">
           <h2 className="text-3xl font-black text-white tracking-widest flex items-center gap-3">
              <Box className="text-axolotl-teal" /> VISOR HOLOGRÁFICO
           </h2>
           <button 
             onClick={onClose}
             className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/20"
           >
              <X size={24} />
           </button>
        </div>

        {/* 3D Stage */}
        <div 
            className="flex-1 w-full relative perspective-1000 cursor-move flex items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div 
                className="relative w-64 h-[500px] transform-style-3d transition-transform duration-100 ease-linear"
                style={{ 
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.5)`
                }}
            >
                {layers}
                
                {/* Core Glow */}
                <div className="absolute inset-0 bg-axolotl-teal/20 blur-3xl rounded-full animate-pulse transform translate-z-[-20px]"></div>
            </div>

            {/* Scanning Laser Effect */}
            <div 
                className="absolute w-full h-1 bg-axolotl-pink/50 blur-sm shadow-[0_0_20px_#ec407a]"
                style={{ top: `${scanLine}%`, opacity: 0.5 }}
            ></div>
        </div>

        {/* Bottom Controls */}
        <div className="w-full p-8 flex justify-center gap-6 relative z-10">
            <button 
                onClick={() => setExpanded(!expanded)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold border transition-all ${expanded ? 'bg-axolotl-teal text-black border-axolotl-teal' : 'bg-black/50 text-axolotl-teal border-axolotl-teal/30 hover:border-axolotl-teal'}`}
            >
                <Layers size={18} />
                {expanded ? 'Colapsar Capas' : 'Expandir Tejido'}
            </button>

            <button 
                onClick={() => setRotation({x: 0, y: 0})}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-black/50 text-white border border-white/20 hover:bg-white/10 transition-all"
            >
                <Rotate3D size={18} />
                Resetear Vista
            </button>
            
            <div className="px-6 py-3 rounded-xl bg-black/50 border border-white/10 text-gray-400 font-mono text-xs flex items-center gap-4">
               <Scan size={14} className="text-axolotl-pink animate-spin-slow" />
               <span>ROT: X:{Math.round(rotation.x)} Y:{Math.round(rotation.y)}</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Organ3DViewer;

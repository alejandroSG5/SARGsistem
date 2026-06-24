
import React, { useState, useRef, useEffect } from 'react';
import { 
  Activity, AlertCircle, Info, X, Layers, ZoomIn, ZoomOut, 
  Eye, Search, Flashlight, Target, Rotate3D, Sliders, ChevronDown, 
  ChevronRight, Thermometer, Ghost, Box 
} from 'lucide-react';
import { ANATOMY_LAYERS } from '../../constants';
import { BodyPart, AnatomySystemType, BodyView } from '../../types';
import Organ3DViewer from './Organ3DViewer';

const InteractiveBody: React.FC = () => {
  // --- STATE MANAGEMENT AVANZADO ---
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [view, setView] = useState<BodyView>('anterior');
  const [ghostMode, setGhostMode] = useState(false); // Mode where non-selected parts are transparent

  // Layer Opacity Control (Mixer Board)
  const [layerOpacities, setLayerOpacities] = useState<Record<AnatomySystemType, number>>({
    skeletal: 1.0,
    muscular: 0.8,
    digestive: 1.0,
    circulatory: 1.0,
    nervous: 1.0,
    respiratory: 1.0,
    lymphatic: 0.5
  });
  
  // Camera Matrix
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Tools
  const [flashlightMode, setFlashlightMode] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  
  // New State for 3D Viewer
  const [show3DViewer, setShow3DViewer] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // --- HANDLERS ---

  const handleOpacityChange = (layer: AnatomySystemType, value: number) => {
    setLayerOpacities(prev => ({ ...prev, [layer]: value }));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 0.1;
    const newZoom = Math.max(0.8, Math.min(5, zoom + (e.deltaY > 0 ? -scaleFactor : scaleFactor)));
    setZoom(newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // X-Ray Mouse Tracking
    if (svgRef.current) {
        const CTM = svgRef.current.getScreenCTM();
        if (CTM) {
            setMousePos({
                x: (e.clientX - CTM.e) / CTM.a,
                y: (e.clientY - CTM.f) / CTM.d
            });
        }
    }
    // Panning
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const focusOnPart = (part: BodyPart) => {
     if (part.viewBoxCoords) {
         const targetZoom = part.viewBoxCoords.zoom;
         setZoom(targetZoom);
         // Centering logic based on viewBox coords and zoom
         // Formula: Center Canvas - (TargetCenter * Zoom)
         // Assuming canvas center is roughly 150, 300 (half of 300, 600)
         setPan({ 
             x: (150 * targetZoom) - (part.viewBoxCoords.x * targetZoom), 
             y: (300 * targetZoom) - (part.viewBoxCoords.y * targetZoom) + 100
         }); 
         setSelectedPart(part);
         
         // Auto-switch view if part only exists in posterior
         if (!part.paths.anterior && part.paths.posterior) setView('posterior');
     }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = ANATOMY_LAYERS.find(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (found) {
        focusOnPart(found);
        setLayerOpacities(prev => ({...prev, [found.system]: 1.0}));
    }
  };

  // --- RENDER HELPERS ---

  // Sort parts by Z-Index so deep organs are below muscles
  const sortedParts = [...ANATOMY_LAYERS].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[850px] w-full bg-slate-50 dark:bg-black rounded-[2.5rem] p-4 md:p-6 shadow-2xl border border-white/20 relative overflow-hidden">
      
      {/* 3D VIEWER MODAL */}
      {show3DViewer && selectedPart && (
          <Organ3DViewer part={selectedPart} onClose={() => setShow3DViewer(false)} />
      )}

      {/* 1. LEFT SIDEBAR: MIXING BOARD (Mejora de "Se Sobreencima") */}
      <div className={`
          flex flex-col gap-4 transition-all duration-300 z-30 shrink-0
          ${showLayerPanel ? 'w-full md:w-72' : 'w-12'}
      `}>
          <div className="bg-white dark:bg-axolotl-surface rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-full">
              
              {/* Header Toggle */}
              <button 
                  onClick={() => setShowLayerPanel(!showLayerPanel)}
                  className="p-4 flex items-center justify-between bg-axolotl-light/50 dark:bg-white/5 hover:bg-axolotl-light dark:hover:bg-white/10 transition-colors"
              >
                  {showLayerPanel && (
                      <span className="text-xs font-black uppercase tracking-widest text-axolotl-dark dark:text-white flex items-center gap-2">
                          <Sliders size={14} /> Control de Capas
                      </span>
                  )}
                  {showLayerPanel ? <ChevronRight size={16}/> : <Sliders size={16} className="mx-auto" />}
              </button>

              {/* Mixer Content */}
              {showLayerPanel && (
                  <div className="p-4 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                      
                      {/* View Controls */}
                      <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex">
                          <button 
                              onClick={() => setView('anterior')}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${view === 'anterior' ? 'bg-white shadow text-axolotl-dark' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                              Frontal
                          </button>
                          <button 
                              onClick={() => setView('posterior')}
                              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${view === 'posterior' ? 'bg-white shadow text-axolotl-dark' : 'text-gray-400 hover:text-gray-600'}`}
                          >
                              Dorsal
                          </button>
                      </div>

                      {/* Opacity Sliders */}
                      <div className="space-y-4">
                        {(['skeletal', 'muscular', 'digestive', 'circulatory', 'respiratory'] as AnatomySystemType[]).map(layer => (
                            <div key={layer} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500">
                                    <span>{layer}</span>
                                    <span>{Math.round(layerOpacities[layer] * 100)}%</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Eye size={14} className={layerOpacities[layer] > 0 ? 'text-axolotl-teal' : 'text-gray-300'} />
                                    <input 
                                        type="range" min="0" max="1" step="0.1"
                                        value={layerOpacities[layer]}
                                        onChange={(e) => handleOpacityChange(layer, parseFloat(e.target.value))}
                                        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-axolotl-teal"
                                    />
                                </div>
                            </div>
                        ))}
                      </div>

                      {/* Advanced Tools */}
                      <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button 
                            onClick={() => setFlashlightMode(!flashlightMode)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all border ${flashlightMode ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-gray-50 border-transparent text-gray-500'}`}
                          >
                             <div className={`p-1.5 rounded-md ${flashlightMode ? 'bg-amber-200' : 'bg-gray-200'}`}><Flashlight size={14} /></div>
                             Modo Rayos-X
                          </button>

                          <button 
                            onClick={() => setGhostMode(!ghostMode)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold transition-all border ${ghostMode ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-transparent text-gray-500'}`}
                          >
                             <div className={`p-1.5 rounded-md ${ghostMode ? 'bg-purple-200' : 'bg-gray-200'}`}><Ghost size={14} /></div>
                             Modo Aislamiento
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* 2. MAIN 3D VIEWPORT (WebGL Simulation via SVG) */}
      <div className="flex-1 relative bg-gradient-to-b from-gray-200 via-gray-100 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 rounded-[2rem] flex items-center justify-center overflow-hidden border border-gray-300 dark:border-gray-700 cursor-move shadow-inner group select-none">
        
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ 
                 backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }}>
        </div>

        {/* Viewport Overlay Controls */}
        <div className="absolute top-4 left-4 z-20 flex gap-2">
            <div className="bg-white/80 dark:bg-black/50 backdrop-blur rounded-lg p-1 shadow-sm border border-white/20 flex gap-1">
                <button onClick={() => setZoom(z => Math.min(z + 0.5, 5))} className="p-2 hover:bg-black/5 rounded text-gray-600 dark:text-gray-300"><ZoomIn size={18} /></button>
                <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.8))} className="p-2 hover:bg-black/5 rounded text-gray-600 dark:text-gray-300"><ZoomOut size={18} /></button>
                <button onClick={() => {setZoom(1); setPan({x:0, y:0}); setSelectedPart(null)}} className="p-2 hover:bg-black/5 rounded text-gray-600 dark:text-gray-300"><Target size={18} /></button>
            </div>
        </div>

        <div className="absolute top-4 right-4 z-20 w-64">
            <form onSubmit={handleSearch} className="relative shadow-lg rounded-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar órgano o hueso..." 
                    className="w-full pl-10 pr-4 py-2.5 rounded-full bg-white dark:bg-black/80 backdrop-blur border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-axolotl-pink font-medium"
                />
            </form>
        </div>

        {/* SVG ENGINE */}
        <svg 
            ref={svgRef}
            viewBox="0 0 300 600" 
            className="h-full w-auto transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)` }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onWheel={handleWheel}
        >
            <defs>
                {/* Advanced Filters for Realism */}
                <filter id="glow-select" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                
                {/* Organic Tissue Texture */}
                <filter id="texture-muscle">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise"/>
                    <feColorMatrix type="saturate" values="0" in="noise" result="desaturatedNoise"/>
                    <feBlend in="SourceGraphic" in2="desaturatedNoise" mode="multiply" result="blend"/>
                </filter>

                <filter id="texture-bone">
                    <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="noise"/>
                    <feDiffuseLighting in="noise" lightingColor="white" surfaceScale="2">
                         <feDistantLight azimuth="45" elevation="60" />
                    </feDiffuseLighting>
                    <feComposite operator="in" in2="SourceGraphic"/>
                </filter>

                {/* X-Ray Mask */}
                <clipPath id="flashlight-clip">
                    <circle cx={mousePos.x} cy={mousePos.y} r="60" />
                </clipPath>
                
                {/* Gradients */}
                <linearGradient id="grad-bone" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="50%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
            </defs>
            
            {/* Silhouette / Skin Base */}
            <path 
                d={view === 'anterior' 
                   ? "M 150 10 Q 110 10 100 50 Q 80 70 60 150 L 50 250 L 90 450 L 110 580 L 190 580 L 210 450 L 250 250 L 240 150 Q 220 70 200 50 Q 190 10 150 10 Z"
                   : "M 150 10 Q 110 10 100 50 Q 80 70 60 150 L 55 250 L 90 450 L 110 580 L 190 580 L 210 450 L 245 250 L 240 150 Q 220 70 200 50 Q 190 10 150 10 Z"
                }
                fill="#f1f5f9"
                className="dark:fill-slate-900 transition-all duration-500"
                stroke="#cbd5e1"
                strokeWidth="1"
            />

            {/* Render Parts Logic */}
            {sortedParts.map((part) => {
                const opacity = layerOpacities[part.system];
                const isSelected = selectedPart?.id === part.id;
                const isHovered = hoveredPartId === part.id;
                
                // Path based on current view
                const currentPath = view === 'anterior' ? part.paths.anterior : part.paths.posterior;
                if (!currentPath) return null; // Part not visible in this view

                // Opacity Logic
                let finalOpacity = opacity;
                if (ghostMode) {
                    finalOpacity = isSelected ? 1 : 0.1;
                }
                if (flashlightMode) {
                   // If XRay is on, we hide parts unless they are bones OR inside the light (complex to do purely in SVG without masking everything)
                   // Simplified: Reduce opacity of non-bones globally if flashlight is on, relying on user to explore
                   if (part.system !== 'skeletal') finalOpacity = opacity * 0.3; 
                }
                
                if (finalOpacity === 0) return null;

                return (
                    <g 
                        key={part.id} 
                        onClick={(e) => { e.stopPropagation(); focusOnPart(part); }}
                        onMouseEnter={() => setHoveredPartId(part.id)}
                        onMouseLeave={() => setHoveredPartId(null)}
                        className="cursor-pointer transition-all duration-300"
                        style={{ opacity: finalOpacity }}
                    >
                        <path 
                            d={currentPath} 
                            fill={isSelected || isHovered ? part.colorHighlight : part.colorBase}
                            stroke={isSelected ? 'white' : 'rgba(0,0,0,0.2)'}
                            strokeWidth={isSelected ? 1.5 : 0.5}
                            className="transition-colors duration-300"
                            filter={isSelected ? 'url(#glow-select)' : (part.texture === 'bone' ? 'url(#texture-bone)' : part.texture === 'muscle' ? 'url(#texture-muscle)' : undefined)}
                        />
                        
                        {/* Interactive Label */}
                        {(isHovered || isSelected) && (
                            <g pointerEvents="none">
                                <rect 
                                    x={part.viewBoxCoords?.x ? part.viewBoxCoords.x - 40 : 110} 
                                    y={(part.viewBoxCoords?.y || 0) - 25} 
                                    width="80" height="20" rx="6" 
                                    fill="#1e293b" opacity="0.9"
                                />
                                <text 
                                    x={part.viewBoxCoords?.x || 150} 
                                    y={(part.viewBoxCoords?.y || 0) - 12} 
                                    textAnchor="middle" 
                                    fill="white" 
                                    fontSize="8" 
                                    fontWeight="bold"
                                    letterSpacing="0.5"
                                >
                                    {part.name.toUpperCase()}
                                </text>
                                {/* Connecting line */}
                                <line 
                                    x1={part.viewBoxCoords?.x || 150} 
                                    y1={(part.viewBoxCoords?.y || 0) - 5}
                                    x2={part.viewBoxCoords?.x || 150}
                                    y2={part.viewBoxCoords?.y || 0}
                                    stroke="#1e293b" strokeWidth="1"
                                />
                            </g>
                        )}
                    </g>
                );
            })}

            {/* Flashlight Overlay */}
            {flashlightMode && (
                <circle cx={mousePos.x} cy={mousePos.y} r="50" fill="url(#grad-bone)" stroke="white" strokeWidth="2" strokeDasharray="4,2" opacity="0.3" pointerEvents="none" />
            )}

        </svg>

        {/* Info Overlay (Bottom Right) */}
        <div className="absolute bottom-4 right-4 pointer-events-none">
             <div className="bg-white/80 dark:bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/20 text-[10px] font-mono text-gray-500">
                ZOOM: {Math.round(zoom * 100)}% | VIEW: {view.toUpperCase()}
             </div>
        </div>
      </div>

      {/* 3. DETAILS PANEL (RIGHT) */}
      <div className={`
        bg-white dark:bg-axolotl-surface rounded-[2rem] shadow-xl border-l border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col z-20 transition-all duration-500
        ${selectedPart ? 'w-full xl:w-96 translate-x-0 opacity-100' : 'w-0 opacity-0 xl:translate-x-10 overflow-hidden hidden'}
      `}>
        {selectedPart && (
            <div className="flex flex-col h-full animate-in slide-in-from-right duration-500">
                {/* Header Image/Color */}
                <div className="h-40 w-full relative shrink-0">
                     <div className="absolute inset-0 transition-colors duration-500" style={{ backgroundColor: selectedPart.colorBase }}></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                     <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
                     
                     <button onClick={() => setSelectedPart(null)} className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white backdrop-blur transition-all hover:rotate-90">
                        <X size={20} />
                     </button>
                     
                     <div className="absolute bottom-4 left-6 right-6 text-white">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <Activity size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Sistema {selectedPart.system}</span>
                        </div>
                        <h2 className="text-3xl font-black leading-tight mb-1">{selectedPart.name}</h2>
                        {selectedPart.nativeTerm && (
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-bold uppercase">Tzotzil</span>
                                <span className="text-sm italic font-serif">"{selectedPart.nativeTerm}"</span>
                            </div>
                        )}
                     </div>
                </div>

                {/* Content Scroll */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    
                    {/* Function Card */}
                    <div className="relative p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-2xl"></div>
                        <h4 className="text-blue-800 dark:text-blue-300 font-bold text-xs uppercase mb-2 flex items-center gap-2">
                             Función Principal
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed font-medium">
                            {selectedPart.function}
                        </p>
                    </div>

                    {/* Detailed Description */}
                    <div>
                         <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Descripción Anatómica</h4>
                         <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed text-justify">
                            {selectedPart.description}
                        </p>
                    </div>

                    {/* Pathologies Accordion Style */}
                    <div>
                        <h4 className="font-black text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wide border-b border-gray-100 pb-2">
                            <AlertCircle className="text-rose-500" size={16} /> Patologías Clínicas
                        </h4>
                        <div className="space-y-3">
                            {selectedPart.commonPathologies.map((pat, idx) => (
                                <div key={idx} className="group bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-rose-200 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm text-gray-800 dark:text-gray-100 group-hover:text-rose-600 transition-colors">{pat.name}</span>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                                            pat.urgency === 'High' ? 'bg-red-500 text-white' : 
                                            pat.urgency === 'Medium' ? 'bg-orange-100 text-orange-600' : 'bg-yellow-100 text-yellow-600'
                                        }`}>
                                            {pat.urgency === 'High' ? 'Crítico' : pat.urgency}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {pat.symptoms.map(sym => (
                                            <span key={sym} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded">
                                                {sym}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Protocols */}
                    {selectedPart.treatments.length > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-800">
                             <h4 className="font-black text-emerald-800 dark:text-emerald-400 mb-3 flex items-center gap-2 text-sm">
                                <Info size={16} /> Protocolos de Tratamiento
                            </h4>
                            {selectedPart.treatments.map((t, i) => (
                                <div key={i} className="mb-3 last:mb-0 flex gap-3">
                                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-emerald-600/70 block mb-0.5">{t.type}</span>
                                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{t.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Action Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex gap-3">
                    <button 
                        onClick={() => setShow3DViewer(true)}
                        className="flex-1 py-3 bg-axolotl-dark text-white rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 group"
                    >
                        <Box size={16} className="group-hover:animate-bounce" /> Ver 3D Detallado
                    </button>
                    <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500">
                        <Rotate3D size={20} />
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveBody;

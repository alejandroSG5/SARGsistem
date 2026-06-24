import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Loader } from '@react-three/drei';
import { EffectComposer, Bloom, SSAO, ToneMapping } from '@react-three/postprocessing';
import { RealAnatomyModel, PART_LABELS } from './RealAnatomyModel';
import { CameraRig } from './CameraRig';
import { 
    Activity, Layers, Scan, ZoomIn, Eye, EyeOff, 
    RotateCcw, Zap, Box, CircleDot
} from 'lucide-react';

const AnatomyViewer3D: React.FC = () => {
    const [selectedPart, setSelectedPart] = useState<string | null>(null);
    const [xrayMode, setXrayMode] = useState(false);
    const [visibleLayers, setVisibleLayers] = useState({
        cuerpo_01: true,
        cuerpo_02: true,
        cuerpo_03: true,
        plano_transversal: true,
        plano_sagital: true,
        plano_coronal: true,
    });

    const toggleLayer = (key: keyof typeof visibleLayers) => {
        setVisibleLayers(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const layerConfig = [
        { key: 'cuerpo_01' as const, name: 'Capa Anatómica 1', color: '#f8a4a4', icon: <Box size={14}/> },
        { key: 'cuerpo_02' as const, name: 'Capa Anatómica 2', color: '#fcd5b8', icon: <Box size={14}/> },
        { key: 'cuerpo_03' as const, name: 'Capa Anatómica 3', color: '#ef4444', icon: <Box size={14}/> },
        { key: 'plano_transversal' as const, name: 'Corte Transversal', color: '#38bdf8', icon: <CircleDot size={14}/> },
        { key: 'plano_sagital' as const, name: 'Corte Sagital', color: '#a78bfa', icon: <CircleDot size={14}/> },
        { key: 'plano_coronal' as const, name: 'Corte Coronal', color: '#34d399', icon: <CircleDot size={14}/> },
    ];

    const selectedLabel = selectedPart ? (PART_LABELS[selectedPart] || selectedPart) : null;

    return (
        <div className="w-full h-[85vh] flex flex-col lg:flex-row gap-6 animate-in fade-in">
            {/* VIEWPORT 3D */}
            <div className="flex-1 bg-[#060608] rounded-[3rem] overflow-hidden relative shadow-2xl border border-gray-800">
                {/* Header */}
                <div className="absolute top-6 left-6 z-10 pointer-events-none">
                    <h3 className="font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-500 drop-shadow-md mb-1">
                        SARG Bio-Engine 5.0
                    </h3>
                    <p className="text-gray-500 text-sm font-medium tracking-wide uppercase">
                        Planos Anatómicos 3D — Motor GLTF Real
                    </p>
                </div>

                {/* HUD: Capas */}
                <div className="absolute left-6 bottom-6 z-10 flex flex-col gap-3">
                    <div className="bg-black/70 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                            <Layers size={12}/> Capas del Modelo
                        </h4>
                        <div className="flex flex-col gap-1.5">
                            {layerConfig.map(layer => (
                                <button 
                                    key={layer.key}
                                    onClick={() => toggleLayer(layer.key)}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                                        visibleLayers[layer.key] 
                                            ? 'bg-white/10 text-white' 
                                            : 'bg-transparent text-gray-600 hover:bg-white/5'
                                    }`}
                                >
                                    {visibleLayers[layer.key] ? <Eye size={14}/> : <EyeOff size={14}/>}
                                    <span 
                                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                                        style={{ backgroundColor: visibleLayers[layer.key] ? layer.color : '#333' }}
                                    />
                                    {layer.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* X-Ray Toggle */}
                    <button 
                        onClick={() => setXrayMode(!xrayMode)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-black transition-all border ${
                            xrayMode 
                                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' 
                                : 'bg-black/50 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                        } backdrop-blur-xl`}
                    >
                        <Zap size={16}/> Modo Rayos-X
                    </button>
                </div>

                {/* Badges */}
                <div className="absolute bottom-6 right-6 z-10 flex gap-2">
                    <span className="px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-bold text-gray-400 border border-white/10">
                        GLTF 2.0
                    </span>
                    <span className="px-3 py-1.5 bg-blue-500/10 backdrop-blur-md rounded-full text-[10px] font-bold text-blue-400 border border-blue-500/20">
                        6.8 MB Loaded
                    </span>
                    <span className="px-3 py-1.5 bg-emerald-500/10 backdrop-blur-md rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/20 animate-pulse">
                        ● LIVE
                    </span>
                </div>

                {/* Three.js Canvas */}
                <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
                    <color attach="background" args={['#060608']} />
                    
                    {/* Iluminación */}
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[10, 15, 10]} intensity={2.5} castShadow />
                    <directionalLight position={[-8, 10, -5]} intensity={1.2} color="#93c5fd" />
                    <pointLight position={[0, -5, 5]} intensity={0.8} color="#f87171" />
                    
                    <Suspense fallback={null}>
                        <CameraRig selectedPart={selectedPart} />
                        
                        <RealAnatomyModel 
                            selectedPart={selectedPart} 
                            onPartSelected={setSelectedPart} 
                            visibleLayers={visibleLayers}
                            xrayMode={xrayMode}
                        />
                        
                        <Environment preset="studio" />
                        <ContactShadows position={[0, -8, 0]} opacity={0.5} scale={40} blur={2} far={20} color="#000" />
                        
                        <EffectComposer multisampling={4}>
                            <Bloom luminanceThreshold={0.6} luminanceSmoothing={0.9} height={300} intensity={0.8} />
                            <SSAO radius={0.3} intensity={15} luminanceInfluence={0.5} />
                            <ToneMapping />
                        </EffectComposer>
                    </Suspense>

                    <OrbitControls 
                        makeDefault 
                        minDistance={5} 
                        maxDistance={30} 
                        minPolarAngle={Math.PI / 6} 
                        maxPolarAngle={Math.PI / 1.2} 
                        enablePan={true} 
                        enableZoom={true}
                        autoRotate={!selectedPart}
                        autoRotateSpeed={0.5}
                    />
                </Canvas>
                <Loader />
            </div>

            {/* PANEL DE INFORMACIÓN */}
            <div className="w-full lg:w-[380px] bg-white dark:bg-[#0a0a0a] rounded-[3rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]"></div>
                
                <div className="flex justify-between items-center mb-8 relative z-10">
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Scan className="text-blue-500" size={22}/> Análisis Anatómico
                    </h3>
                    {selectedPart && (
                        <button 
                            onClick={() => setSelectedPart(null)}
                            className="text-xs font-bold px-3 py-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-all flex items-center gap-1.5"
                        >
                            <RotateCcw size={12}/> Reset
                        </button>
                    )}
                </div>
                
                {selectedLabel ? (
                    <div className="animate-in slide-in-from-right-4 relative z-10 flex-1 flex flex-col">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-5 border border-blue-100 dark:border-blue-800/50">
                            <ZoomIn className="text-blue-500" size={28} />
                        </div>
                        
                        <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{selectedLabel}</h4>
                        <p className="text-xs text-gray-400 font-mono mb-6 bg-gray-50 dark:bg-gray-900 px-3 py-1.5 rounded-lg inline-block w-fit">
                            mesh: {selectedPart}
                        </p>
                        
                        <div className="space-y-4 flex-1">
                            <div className="bg-gray-50 dark:bg-[#111] p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm font-medium">
                                    Estructura seleccionada del modelo anatómico real. Este es un plano tridimensional cargado directamente desde <strong className="text-blue-500">planos_anatomicos.glb</strong>.
                                </p>
                            </div>
                            
                            <div className="bg-white dark:bg-black p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <span className="block text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Estado</span>
                                <span className="font-black text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Renderizado Activo
                                </span>
                            </div>
                            
                            <div className="bg-white dark:bg-black p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <span className="flex items-center gap-2 font-bold text-rose-500 uppercase tracking-widest text-[10px] mb-3">
                                    <Activity size={12}/> Detalle de Malla
                                </span>
                                <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-full h-2.5 overflow-hidden border border-gray-200 dark:border-gray-800">
                                    <div className="bg-gradient-to-r from-blue-400 to-indigo-600 h-full rounded-full w-[95%] animate-pulse"></div>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">Geometría completa — Resolución máxima del archivo GLB</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 relative z-10 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl m-2 p-8">
                        <Eye size={40} className="mb-4 text-gray-300 dark:text-gray-700" />
                        <p className="font-bold text-base mb-2 text-gray-600 dark:text-gray-300">Exploración Libre</p>
                        <p className="text-sm text-gray-400 max-w-[220px] leading-relaxed">
                            Haz clic en cualquier parte del modelo 3D para aislarla y obtener información detallada.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-2">
                            <span className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 font-bold">Rotar: Click + Arrastrar</span>
                            <span className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 font-bold">Zoom: Scroll</span>
                            <span className="text-[10px] px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 font-bold">Pan: Click Derecho</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnatomyViewer3D;

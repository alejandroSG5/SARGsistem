import React from 'react';
import { Play, Pause, FastForward, Rewind, RefreshCw, ZoomIn, ZoomOut, Zap, Beaker, Aperture, Globe2, Dna, Waves } from 'lucide-react';
import { Particle } from '../engine/PhysicsEngine';

export type SimulatorMode = 'ASTRO' | 'CHEMISTRY' | 'OPTICS' | 'BIOLOGY' | 'QUANTUM';

interface UltimateHUDProps {
    mode: SimulatorMode;
    setMode: (m: SimulatorMode) => void;
    // Astro props
    timeScale: number; setTimeScale: (val: number) => void;
    selectedBody: Particle | null; setSelectedBody: (body: Particle | null) => void;
    bodyCount: number; loadScenario: (name: string) => void;
    scale: number; setScale: (s: number) => void;
    engineG: number; setEngineG: (g: number) => void;
    reset: () => void;
    
    // Chem props
    chemElement: number; setChemElement: (el: number) => void;
    brushSize: number; setBrushSize: (s: number) => void;
    
    // Optics props
    opticsTool: string; setOpticsTool: (t: string) => void;
}

export const UltimateHUD: React.FC<UltimateHUDProps> = ({
    mode, setMode,
    timeScale, setTimeScale, selectedBody, setSelectedBody, bodyCount, loadScenario, scale, setScale, engineG, setEngineG, reset,
    chemElement, setChemElement, brushSize, setBrushSize,
    opticsTool, setOpticsTool,
    
    // Quantum props
    quantumTool, setQuantumTool
}) => {
    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
            {/* Top Bar - Modes & Scenarios */}
            <div className="flex justify-between items-start">
                
                {/* Mode Selector Dock */}
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-2 rounded-3xl flex gap-2 pointer-events-auto shadow-2xl">
                    <button 
                        onClick={() => setMode('ASTRO')} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all ${mode === 'ASTRO' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        <Globe2 size={18} /> Astrofísica
                    </button>
                    <button 
                        onClick={() => setMode('CHEMISTRY')} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all ${mode === 'CHEMISTRY' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        <Beaker size={18} /> Química / Fluidos
                    </button>
                    <button 
                        onClick={() => setMode('OPTICS')} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all ${mode === 'OPTICS' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        <Aperture size={18} /> Óptica (Raytracing)
                    </button>
                    <button 
                        onClick={() => setMode('BIOLOGY')} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all ${mode === 'BIOLOGY' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        <Dna size={18} /> Evolución Artificial
                    </button>
                    <button 
                        onClick={() => setMode('QUANTUM')} 
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm transition-all ${mode === 'QUANTUM' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' : 'text-gray-400 hover:bg-white/5'}`}
                    >
                        <Waves size={18} /> Mecánica Cuántica
                    </button>
                </div>

                <div className="bg-black/60 backdrop-blur-md border border-gray-700 p-3 rounded-2xl pointer-events-auto text-right flex items-center gap-4">
                    <button onClick={reset} className="p-3 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-xl transition-colors"><RefreshCw size={20}/></button>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">SARG SUSF v3.0</p>
                        <p className="text-lg font-mono text-white leading-none">Motor Activo</p>
                    </div>
                </div>
            </div>

            {/* Middle - Astro Inspector */}
            <div className="flex justify-end items-center flex-1 my-4">
                {mode === 'ASTRO' && selectedBody && (
                    <div className="w-full sm:w-full sm:w-64 bg-black/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 pointer-events-auto animate-in slide-in-from-right-4">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: selectedBody.color}}></div>
                                {selectedBody.name || selectedBody.id.substring(0,6)}
                            </h3>
                            <button onClick={() => setSelectedBody(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-3 font-mono text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Masa:</span>
                                <span className="text-yellow-400">{selectedBody.mass.toFixed(1)} kt</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Velocidad:</span>
                                <span className="text-emerald-400">{Math.sqrt(selectedBody.vel.x**2 + selectedBody.vel.y**2).toFixed(2)} km/s</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Temperatura:</span>
                                <span className="text-rose-400">{selectedBody.temperature.toFixed(0)} K</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar - Contextual Tools */}
            <div className="flex justify-center items-end w-full">
                
                {/* ASTRO CONTROLS */}
                {mode === 'ASTRO' && (
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-3 flex items-center gap-6 shadow-2xl pointer-events-auto">
                        <div className="flex flex-col gap-2">
                             <div className="flex gap-2">
                                <button onClick={() => loadScenario('solar_system')} className="px-3 py-1.5 text-xs font-bold bg-blue-900/50 hover:bg-blue-800/70 text-blue-100 rounded-lg border border-blue-500/30">Sis Solar</button>
                                <button onClick={() => loadScenario('binary_star')} className="px-3 py-1.5 text-xs font-bold bg-purple-900/50 hover:bg-purple-800/70 text-purple-100 rounded-lg border border-purple-500/30">Estrellas Binarias</button>
                                <button onClick={() => loadScenario('asteroid_field')} className="px-3 py-1.5 text-xs font-bold bg-gray-800/50 hover:bg-gray-700/70 text-gray-200 rounded-lg border border-gray-600/30">Asteroides</button>
                            </div>
                            <div className="flex items-center gap-2 w-full px-2">
                                <span className="text-[10px] text-gray-400 uppercase font-bold">Gravedad (G)</span>
                                <input type="range" min="0.1" max="5.0" step="0.1" value={engineG} onChange={(e) => setEngineG(Number(e.target.value))} className="w-full accent-blue-500 h-1" />
                            </div>
                        </div>

                        <div className="w-px h-12 bg-white/10"></div>

                        <div className="flex items-center gap-2">
                            <button onClick={() => setTimeScale(0.1)} className={`p-3 rounded-full transition-colors ${timeScale === 0.1 ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}><Rewind size={20} /></button>
                            <button onClick={() => setTimeScale(0)} className={`p-3 rounded-full transition-colors ${timeScale === 0 ? 'bg-rose-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}><Pause size={20} fill={timeScale===0?"currentColor":"none"} /></button>
                            <button onClick={() => setTimeScale(1)} className={`p-3 rounded-full transition-colors ${timeScale === 1 ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}><Play size={20} fill={timeScale===1?"currentColor":"none"} className="ml-1"/></button>
                            <button onClick={() => setTimeScale(5)} className={`p-3 rounded-full transition-colors ${timeScale === 5 ? 'bg-amber-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}><FastForward size={20} /></button>
                        </div>
                    </div>
                )}

                {/* CHEMISTRY CONTROLS */}
                {mode === 'CHEMISTRY' && (
                    <div className="bg-black/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-3 flex items-center gap-4 shadow-2xl pointer-events-auto">
                        {/* 0:EMPTY, 1:WALL, 2:SAND, 3:WATER, 4:WOOD, 5:FIRE, 6:LAVA, 7:ACID, 12:OIL */}
                        <div className="flex gap-2">
                            {[
                                { id: 2, name: 'Arena', color: '#fcd34d' },
                                { id: 3, name: 'Agua', color: '#3b82f6' },
                                { id: 4, name: 'Madera', color: '#8b5cf6' },
                                { id: 5, name: 'Fuego', color: '#ef4444' },
                                { id: 6, name: 'Lava', color: '#ea580c' },
                                { id: 7, name: 'Ácido', color: '#84cc16' },
                                { id: 12, name: 'Aceite', color: '#111827' },
                                { id: 1, name: 'Muro', color: '#6b7280' },
                                { id: 0, name: 'Borrador', color: '#000000' }
                            ].map(el => (
                                <button key={el.id} onClick={() => setChemElement(el.id)} className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${chemElement === el.id ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`} style={{backgroundColor: el.color}}>
                                    <span className={`text-[9px] font-black uppercase ${el.id===0||el.id===12 ? 'text-white' : 'text-black/50 mix-blend-overlay'}`}>{el.name}</span>
                                </button>
                            ))}
                        </div>
                        <div className="w-px h-12 bg-white/10"></div>
                        <div className="flex flex-col items-center w-24">
                            <span className="text-[10px] text-gray-400 uppercase font-bold mb-1">Pincel</span>
                            <input type="range" min="1" max="10" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="w-full accent-emerald-500" />
                        </div>
                    </div>
                )}

                {/* OPTICS CONTROLS */}
                {mode === 'OPTICS' && (
                    <div className="bg-black/80 backdrop-blur-xl border border-purple-500/30 rounded-3xl p-3 flex items-center gap-4 shadow-2xl pointer-events-auto">
                        <div className="flex gap-2">
                            {[
                                { id: 'laser_white', label: 'Láser Blanco' },
                                { id: 'laser_red', label: 'Láser Rojo' },
                                { id: 'mirror', label: 'Espejo' },
                                { id: 'prism', label: 'Prisma (Cristal)' },
                                { id: 'absorber', label: 'Pared Negra' },
                            ].map(tool => (
                                <button key={tool.id} onClick={() => setOpticsTool(tool.id)} className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${opticsTool === tool.id ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                    {tool.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* BIOLOGY CONTROLS */}
                {mode === 'BIOLOGY' && (
                    <div className="bg-black/80 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-3 flex items-center gap-4 shadow-2xl pointer-events-auto">
                        <p className="text-xs text-amber-200 font-bold px-4">Modo de Observación: Haz clic para añadir comida manualmente.</p>
                    </div>
                )}

                {/* QUANTUM CONTROLS */}
                {mode === 'QUANTUM' && (
                    <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-3 flex items-center gap-4 shadow-2xl pointer-events-auto">
                        <div className="flex gap-2">
                            {[
                                { id: 'wall', label: 'Dibujar Barrera (Pared)' },
                                { id: 'source', label: 'Colocar Emisor de Ondas' },
                            ].map(tool => (
                                <button key={tool.id} onClick={() => setQuantumTool(tool.id)} className={`px-4 py-3 rounded-xl text-xs font-bold transition-all ${quantumTool === tool.id ? 'bg-cyan-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                    {tool.label}
                                </button>
                            ))}
                            <div className="w-px h-10 bg-white/20 mx-2"></div>
                            <button onClick={reset} className="px-4 py-3 rounded-xl text-xs font-bold bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors">Limpiar Ondas</button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

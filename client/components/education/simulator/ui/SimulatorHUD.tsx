import React from 'react';
import { Play, Pause, FastForward, Rewind, Info, Settings, MousePointer2, Plus, RefreshCw, ZoomIn, ZoomOut, Zap } from 'lucide-react';
import { Particle } from '../engine/PhysicsEngine';

interface SimulatorHUDProps {
    timeScale: number;
    setTimeScale: (val: number) => void;
    selectedBody: Particle | null;
    setSelectedBody: (body: Particle | null) => void;
    bodyCount: number;
    loadScenario: (name: string) => void;
    reset: () => void;
    scale: number;
    setScale: (s: number) => void;
    engineG: number;
    setEngineG: (g: number) => void;
    useRK4: boolean;
    setUseRK4: (v: boolean) => void;
}

export const SimulatorHUD: React.FC<SimulatorHUDProps> = ({
    timeScale, setTimeScale,
    selectedBody, setSelectedBody,
    bodyCount, loadScenario, reset,
    scale, setScale,
    engineG, setEngineG,
    useRK4, setUseRK4
}) => {
    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
            {/* Top Bar - Scenarios & Engine Settings */}
            <div className="flex justify-between items-start">
                <div className="bg-black/60 backdrop-blur-md border border-blue-500/30 p-3 rounded-2xl flex flex-col gap-2 pointer-events-auto shadow-lg shadow-blue-900/20">
                    <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center gap-1">
                        <Zap size={14} /> SASE Engine v2.0
                    </h3>
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => loadScenario('solar_system')} className="px-3 py-1.5 text-xs font-bold bg-blue-900/50 hover:bg-blue-800/70 text-blue-100 rounded-lg border border-blue-500/30 transition-colors">Sistema Solar</button>
                        <button onClick={() => loadScenario('binary_star')} className="px-3 py-1.5 text-xs font-bold bg-purple-900/50 hover:bg-purple-800/70 text-purple-100 rounded-lg border border-purple-500/30 transition-colors">Sistema Binario</button>
                        <button onClick={() => loadScenario('asteroid_field')} className="px-3 py-1.5 text-xs font-bold bg-gray-800/50 hover:bg-gray-700/70 text-gray-200 rounded-lg border border-gray-600/30 transition-colors">Campo de Asteroides</button>
                        <button onClick={reset} className="px-3 py-1.5 text-xs font-bold bg-rose-900/50 hover:bg-rose-800/70 text-rose-100 rounded-lg border border-rose-500/30 transition-colors"><RefreshCw size={14}/></button>
                    </div>
                </div>

                <div className="bg-black/60 backdrop-blur-md border border-gray-700 p-3 rounded-2xl pointer-events-auto text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Cuerpos Activos</p>
                    <p className="text-3xl font-mono text-white leading-none">{bodyCount}</p>
                </div>
            </div>

            {/* Middle - Inspector (Right side) */}
            <div className="flex justify-end items-center flex-1 my-4">
                {selectedBody && (
                    <div className="w-full sm:w-64 bg-black/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-4 pointer-events-auto animate-in slide-in-from-right-4">
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
                                <span className="text-gray-400">Pos X:</span>
                                <span className="text-blue-300">{selectedBody.pos.x.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Pos Y:</span>
                                <span className="text-blue-300">{selectedBody.pos.y.toFixed(0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Temperatura:</span>
                                <span className="text-rose-400">{selectedBody.temperature.toFixed(0)} K</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10">
                           <button 
                             onClick={() => {
                                 // Make it explode or delete it (handled via wrapper logic if we pass a callback, but for now just UI)
                                 selectedBody.mass = 0; // Mark for deletion
                                 setSelectedBody(null);
                             }}
                             className="w-full py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors font-bold"
                           >
                               Destruir Objeto
                           </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar - Time Controls & Engine Tweaks */}
            <div className="flex justify-between items-end">
                
                {/* Engine Tweaks */}
                <div className="bg-black/60 backdrop-blur-md border border-gray-700/50 p-4 rounded-2xl pointer-events-auto w-full sm:w-64">
                    <h4 className="text-xs font-bold text-gray-300 mb-4 flex items-center gap-2"><Settings size={14}/> Parámetros Físicos</h4>
                    
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Constante (G)</span>
                            <span className="text-white font-mono">{engineG.toFixed(2)}</span>
                        </div>
                        <input type="range" min="0.1" max="5.0" step="0.1" value={engineG} onChange={(e) => setEngineG(Number(e.target.value))} className="w-full accent-blue-500" />
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">Integración RK4 (Precisión)</span>
                        <button onClick={() => setUseRK4(!useRK4)} className={`w-10 h-5 rounded-full relative transition-colors ${useRK4 ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${useRK4 ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>

                {/* Time Warp */}
                <div className="flex flex-col items-center pointer-events-auto">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-2xl">
                        <button onClick={() => setTimeScale(0.1)} className={`p-3 rounded-full transition-colors ${timeScale === 0.1 ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}>
                            <Rewind size={20} />
                        </button>
                        <button onClick={() => setTimeScale(0)} className={`p-3 rounded-full transition-colors ${timeScale === 0 ? 'bg-rose-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}>
                            <Pause size={20} fill={timeScale === 0 ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => setTimeScale(1)} className={`p-3 rounded-full transition-colors ${timeScale === 1 ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}>
                            <Play size={20} fill={timeScale === 1 ? "currentColor" : "none"} className="ml-1" />
                        </button>
                        <button onClick={() => setTimeScale(5)} className={`p-3 rounded-full transition-colors ${timeScale === 5 ? 'bg-amber-500 text-white' : 'text-gray-400 hover:bg-white/10'}`}>
                            <FastForward size={20} />
                        </button>
                    </div>
                    <span className="text-xs font-bold font-mono mt-2 bg-black/50 px-3 py-1 rounded-full text-white backdrop-blur-md">
                        {timeScale === 0 ? 'PAUSADO' : `TIEMPO: ${timeScale}x`}
                    </span>
                </div>

                {/* Zoom Controls */}
                <div className="flex flex-col gap-2 pointer-events-auto">
                    <button onClick={() => setScale(scale * 1.2)} className="p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
                        <ZoomIn size={20} />
                    </button>
                    <button onClick={() => setScale(scale / 1.2)} className="p-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl text-white hover:bg-white/20 transition-colors">
                        <ZoomOut size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

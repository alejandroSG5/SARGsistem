import React from 'react';
import { Radio, Play, Pause, SkipForward, Volume2, Mic, ListMusic, Signal, Wifi, WifiOff, Smartphone } from 'lucide-react';
import { REAL_RADIO_STATIONS } from '../../constants';
import { useRadioContext, OFFLINE_FM_STATIONS } from '../../contexts/RadioContext';

const RadioSARG: React.FC = () => {
  const {
    radioMode, setRadioMode,
    isPlaying, currentStation, setCurrentStation,
    offlineStation, setOfflineStation,
    volume, changeVolume,
    isLoading, error, togglePlay, currentDisplayStation
  } = useRadioContext();

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Player Card */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden border border-gray-700">
            <div className={`absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-[60px] ${radioMode === 'internet' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
            
            {/* Mode Toggle */}
            <div className="flex bg-gray-900/50 rounded-full p-1 mb-8 border border-white/10 mx-auto w-fit relative z-10 backdrop-blur-md">
                <button 
                    onClick={() => setRadioMode('internet')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${radioMode === 'internet' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    <Wifi size={14} /> Internet
                </button>
                <button 
                    onClick={() => setRadioMode('fm')} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${radioMode === 'fm' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-gray-200'}`}
                >
                    <Smartphone size={14} /> Señal Telefónica (FM)
                </button>
            </div>

            <div className="flex justify-between items-center mb-8 relative z-10">
                <div className={`flex items-center gap-2 font-bold uppercase tracking-widest text-xs ${radioMode === 'internet' ? 'text-rose-500' : 'text-blue-500'}`}>
                    {error ? <WifiOff size={16}/> : <Signal size={16} className={isPlaying ? "text-green-500" : ""} />}
                    {error ? 'Error de Conexión' : (isPlaying ? 'En Vivo' : 'Listo')}
                </div>
                <div className="bg-black/40 rounded-full px-3 py-1 text-xs font-mono text-gray-400 border border-white/10 flex items-center gap-2">
                    <Radio size={12}/> {radioMode === 'internet' ? 'STREAM' : 'FM OFFLINE'}
                </div>
            </div>

            <div className="aspect-square bg-gradient-to-br from-gray-800 to-black rounded-[2rem] mb-8 shadow-inner flex items-center justify-center relative overflow-hidden border border-white/5">
                 {/* Visualizer Effect */}
                 <div className={`w-48 h-48 rounded-full border-8 border-gray-800 flex items-center justify-center relative transition-all duration-700 ${isPlaying && !isLoading ? 'animate-spin-slow scale-110' : 'scale-100'}`}>
                     <div className={`absolute inset-0 rounded-full opacity-50 ${radioMode === 'internet' ? 'bg-[conic-gradient(from_0deg,transparent_0_deg,#ec407a_100deg,transparent_100deg)]' : 'bg-[conic-gradient(from_0deg,transparent_0_deg,#3b82f6_100deg,transparent_100deg)]'}`}></div>
                     {/* Sound waves simulation */}
                     {isPlaying && !isLoading && (
                         <>
                            <div className={`absolute inset-0 rounded-full border animate-ping ${radioMode === 'internet' ? 'border-rose-500/30' : 'border-blue-500/30'}`}></div>
                            <div className={`absolute inset-0 rounded-full border animate-ping delay-300 ${radioMode === 'internet' ? 'border-rose-500/20' : 'border-blue-500/20'}`}></div>
                         </>
                     )}
                     <div className="w-20 h-20 bg-gray-900 rounded-full z-10 flex items-center justify-center">
                         <div className={`w-4 h-4 rounded-full transition-colors ${error ? 'bg-red-500' : (isLoading ? 'bg-yellow-500 animate-pulse' : (radioMode === 'internet' ? 'bg-rose-500' : 'bg-blue-500'))}`}></div>
                     </div>
                 </div>
                 
                 {/* Frequency Bars (CSS Fake) */}
                 <div className="absolute bottom-4 left-0 right-0 flex justify-center items-end gap-1 h-12 opacity-50">
                     {[...Array(10)].map((_,i) => (
                         <div 
                           key={i} 
                           className={`w-2 rounded-t-sm transition-all duration-150 ${isPlaying ? 'animate-pulse' : 'h-1'} ${radioMode === 'internet' ? 'bg-rose-500' : 'bg-blue-500'}`}
                           style={{ height: isPlaying ? `${Math.random() * 100}%` : '4px', animationDelay: `${i*0.1}s` }}
                         ></div>
                     ))}
                 </div>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-black mb-1 leading-tight">{currentDisplayStation.title}</h2>
                <p className="text-gray-400 font-medium text-sm">{currentDisplayStation.host} • {currentDisplayStation.topic}</p>
                {error && <p className="text-red-400 text-xs mt-2 font-bold">No se puede conectar. Verifique su internet o cambie a FM Offline.</p>}
                {isLoading && <p className="text-yellow-400 text-xs mt-2 font-bold animate-pulse">Sintonizando...</p>}
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-2 group">
                    <Volume2 className="text-gray-400 group-hover:text-white transition-colors" size={20} />
                    <input 
                        type="range" min="0" max="1" step="0.1" 
                        value={volume}
                        onChange={(e) => changeVolume(parseFloat(e.target.value))}
                        className={`w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer ${radioMode === 'internet' ? 'accent-rose-500' : 'accent-blue-500'}`}
                    />
                </div>
                
                <button 
                    onClick={togglePlay}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform ${error ? 'bg-red-500 text-white' : 'bg-white text-black'}`}
                >
                    {isPlaying && !isLoading && !error ? <Pause fill="currentColor" size={32} /> : <Play fill="currentColor" size={32} className="ml-1" />}
                </button>
                
                <button className="text-gray-400 hover:text-white"><SkipForward /></button>
            </div>
        </div>

        {/* Playlist Side */}
        <div className="w-full lg:w-1/2 bg-white dark:bg-axolotl-surface rounded-[2.5rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700 h-full flex flex-col">
            <h3 className={`text-xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-2 px-2`}>
                <ListMusic className={radioMode === 'internet' ? 'text-rose-500' : 'text-blue-500'}/> 
                {radioMode === 'internet' ? 'Emisoras Globales' : 'Emisoras Locales (FM)'}
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {radioMode === 'internet' ? (
                    REAL_RADIO_STATIONS.map((station) => (
                        <div 
                            key={station.id} 
                            onClick={() => { setCurrentStation(station); if (!isPlaying || currentStation.id !== station.id) togglePlay(); }}
                            className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${currentStation.id === station.id ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'}`}
                        >
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${currentStation.id === station.id ? 'bg-rose-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                 {currentStation.id === station.id && isPlaying ? <div className="flex gap-0.5 items-end h-4"><span className="w-1 bg-white h-2 animate-pulse"></span><span className="w-1 bg-white h-4 animate-pulse delay-75"></span><span className="w-1 bg-white h-3 animate-pulse delay-150"></span></div> : <Play size={16} />}
                             </div>
                             <div className="flex-1">
                                 <h4 className={`font-bold ${currentStation.id === station.id ? 'text-rose-600 dark:text-rose-400' : 'text-gray-800 dark:text-white'}`}>{station.title}</h4>
                                 <p className="text-xs text-gray-500 line-clamp-1">{station.description}</p>
                             </div>
                             <Radio size={16} className="text-gray-300" />
                        </div>
                    ))
                ) : (
                    OFFLINE_FM_STATIONS.map((station) => (
                        <div 
                            key={station.id} 
                            onClick={() => { setOfflineStation(station); if (!isPlaying || offlineStation.id !== station.id) togglePlay(); }}
                            className={`p-4 rounded-2xl flex items-center gap-4 cursor-pointer transition-all border ${offlineStation.id === station.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-transparent'}`}
                        >
                             <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${offlineStation.id === station.id ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                 {offlineStation.id === station.id && isPlaying ? <div className="flex gap-0.5 items-end h-4"><span className="w-1 bg-white h-2 animate-pulse"></span><span className="w-1 bg-white h-4 animate-pulse delay-75"></span><span className="w-1 bg-white h-3 animate-pulse delay-150"></span></div> : <Play size={16} />}
                             </div>
                             <div className="flex-1">
                                 <h4 className={`font-bold ${offlineStation.id === station.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-white'}`}>{station.title}</h4>
                                 <p className="text-xs text-gray-500 line-clamp-1">{station.description}</p>
                             </div>
                             <Radio size={16} className="text-gray-300" />
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3">
                    <Mic className="text-gray-400 shrink-0 mt-1" size={20} />
                    <div>
                        <h4 className="font-bold text-gray-700 dark:text-gray-300 text-sm">Transmisiones Locales</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            El modo "Señal Telefónica" simula la recepción de radio comunitaria usando información local y sin requerir internet.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default RadioSARG;
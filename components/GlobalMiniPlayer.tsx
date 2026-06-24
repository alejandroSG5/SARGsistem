import React from 'react';
import { useRadioContext } from '../contexts/RadioContext';
import { Play, Pause, Radio as RadioIcon, X, Smartphone, Wifi, Loader } from 'lucide-react';

const GlobalMiniPlayer: React.FC = () => {
    const { isPlaying, isLoading, error, currentDisplayStation, togglePlay, radioMode } = useRadioContext();

    // Only show if it's playing, loading, or there's an error. We want it visible when active.
    // Also if the user just paused it, maybe keep it visible for a moment? Let's just keep it visible if there's a station selected and either playing or paused. But actually it's better if it floats anytime `isPlaying` or `isLoading` is true, or if they paused recently. For simplicity, we can just show it if `isPlaying` or `isLoading`. Wait, if they pause, they need to be able to hit play again.
    // Let's assume if currentDisplayStation is set, it might be visible. But they could want to close it.
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
        if (isPlaying || isLoading) {
            setIsVisible(true);
        }
    }, [isPlaying, isLoading]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 right-4 md:right-8 z-[100] animate-in slide-in-from-bottom-8 fade-in duration-300">
            <div className={`p-3 rounded-full flex items-center gap-3 shadow-lg border backdrop-blur-md transition-colors ${radioMode === 'internet' ? 'bg-rose-900/80 border-rose-500/30 text-white shadow-rose-500/20' : 'bg-blue-900/80 border-blue-500/30 text-white shadow-blue-500/20'}`}>
                
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-black/30 ${isPlaying ? 'animate-pulse' : ''}`}>
                    {radioMode === 'internet' ? <Wifi size={16} /> : <Smartphone size={16} />}
                </div>

                {/* Info */}
                <div className="flex flex-col max-w-[120px] md:max-w-[150px] overflow-hidden">
                    <span className="text-xs font-bold truncate">
                        {currentDisplayStation.title}
                    </span>
                    <span className="text-[10px] text-white/70 truncate">
                        {isLoading ? 'Conectando...' : (error ? 'Error' : currentDisplayStation.topic)}
                    </span>
                </div>

                {/* Controls */}
                <button 
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shrink-0"
                >
                    {isLoading ? <Loader size={20} className="animate-spin" /> : (isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />)}
                </button>

                {/* Close Button */}
                <button onClick={() => setIsVisible(false)} className="p-2 text-white/50 hover:text-white transition-colors">
                    <X size={16} />
                </button>

            </div>
        </div>
    );
};

export default GlobalMiniPlayer;


import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, AlertOctagon, Activity } from 'lucide-react';

const NoiseMeter: React.FC = () => {
    const [isListening, setIsListening] = useState(false);
    const [decibels, setDecibels] = useState(0);
    const [maxDb, setMaxDb] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const startMeter = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;

            microphone.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);

            scriptProcessor.onaudioprocess = () => {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                
                let values = 0;
                const length = array.length;
                for (let i = 0; i < length; i++) {
                    values += array[i];
                }
                const average = values / length;
                
                // Approximate mapping to dB
                // This is not scientifically calibrated but provides relative feedback
                const approxDb = Math.round((average / 255) * 100); 
                
                setDecibels(prev => {
                   // Smooth transition
                   const next = prev + (approxDb - prev) * 0.2;
                   return Math.round(next);
                });
            };

            setIsListening(true);
        } catch (err) {
            console.error("Mic Error", err);
            alert("Necesitamos acceso al micrófono para medir el ruido.");
        }
    };

    const stopMeter = () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        setIsListening(false);
        setDecibels(0);
    };

    useEffect(() => {
        if (decibels > maxDb) setMaxDb(decibels);
    }, [decibels]);

    useEffect(() => {
        return () => stopMeter();
    }, []);

    const getColor = (db: number) => {
        if (db < 40) return 'text-green-500';
        if (db < 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getMessage = (db: number) => {
        if (db < 40) return "Silencio: Saludable";
        if (db < 60) return "Ruido Moderado";
        if (db < 80) return "Ruido Alto: Molesto";
        return "Peligro: Daño Auditivo";
    };

    return (
        <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <div className={`w-64 h-64 rounded-full border-8 border-gray-100 dark:border-gray-800 flex items-center justify-center relative mb-8 shadow-2xl transition-transform duration-100 ${isListening ? 'scale-105' : 'scale-100'}`}>
                {/* Meter Circle */}
                {isListening && (
                    <div 
                        className={`absolute inset-0 rounded-full opacity-20 transition-all duration-75 ${decibels > 70 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}
                        style={{ transform: `scale(${1 + decibels/200})` }}
                    ></div>
                )}
                
                <div className="z-10">
                    <div className={`text-8xl font-black font-mono tracking-tighter transition-colors duration-200 ${getColor(decibels)}`}>
                        {decibels}
                    </div>
                    <div className="text-gray-400 font-bold text-xl uppercase tracking-widest">dB</div>
                </div>
            </div>

            <h2 className={`text-2xl font-black mb-2 transition-colors duration-300 ${getColor(decibels)}`}>
                {getMessage(decibels)}
            </h2>
            <p className="text-gray-500 mb-8">Pico Máximo: {maxDb} dB</p>

            {!isListening ? (
                <button 
                    onClick={startMeter}
                    className="w-20 h-20 bg-orange-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
                >
                    <Volume2 size={32} />
                </button>
            ) : (
                <button 
                    onClick={stopMeter}
                    className="w-20 h-20 bg-gray-200 dark:bg-gray-800 text-gray-500 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
                >
                    <VolumeX size={32} />
                </button>
            )}
            
            <div className="mt-8 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800 text-left w-full">
                <h4 className="font-bold text-orange-800 dark:text-orange-300 flex items-center gap-2 mb-2">
                    <AlertOctagon size={16}/> ¿Sabías qué?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    La exposición prolongada a más de 85 dB puede causar pérdida auditiva permanente. Protege tus oídos en zonas industriales o fiestas.
                </p>
            </div>
        </div>
    );
};

export default NoiseMeter;


import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCcw, Loader2, AlertTriangle, Recycle, CheckCircle, Lightbulb } from 'lucide-react';
import { identifyWasteImage } from '../../services/geminiService';

const WasteScanner: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const startCamera = async () => {
            try {
                const s = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
                });
                setStream(s);
                if (videoRef.current) {
                    videoRef.current.srcObject = s;
                }
            } catch (err) {
                setError("No se pudo acceder a la cámara.");
            }
        };
        startCamera();
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, []);

    const capture = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        setAnalyzing(true);
        
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        const ctx = canvasRef.current.getContext('2d');
        ctx?.drawImage(videoRef.current, 0, 0);
        
        const imageBase64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageBase64);

        try {
            const data = await identifyWasteImage(imageBase64);
            if (data) setResult(data);
            else setError("No se pudo identificar el objeto.");
        } catch (e) {
            setError("Error de conexión con IA.");
        } finally {
            setAnalyzing(false);
        }
    };

    const reset = () => {
        setCapturedImage(null);
        setResult(null);
        setError(null);
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
    };

    return (
        <div className="h-full flex flex-col bg-black relative">
            {/* Camera View */}
            <div className="flex-1 relative overflow-hidden">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover ${capturedImage ? 'hidden' : 'block'}`}
                />
                {capturedImage && (
                    <img src={capturedImage} className="w-full h-full object-cover" />
                )}
                <canvas ref={canvasRef} className="hidden" />

                {/* Overlays */}
                {!capturedImage && !analyzing && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                         <div className="w-64 h-64 border-2 border-green-500 rounded-3xl relative opacity-70">
                             <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 -mt-1 -ml-1 rounded-tl-xl"></div>
                             <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 -mt-1 -mr-1 rounded-tr-xl"></div>
                             <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 -mb-1 -ml-1 rounded-bl-xl"></div>
                             <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 -mb-1 -mr-1 rounded-br-xl"></div>
                         </div>
                         <div className="absolute bottom-20 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur font-bold text-sm">
                             Apunta a la basura u objeto
                         </div>
                     </div>
                )}
            </div>

            {/* Controls / Result */}
            <div className="bg-white dark:bg-gray-900 rounded-t-3xl -mt-6 relative z-10 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] min-h-[200px] flex flex-col items-center">
                
                {analyzing && (
                    <div className="text-center py-8">
                        <Loader2 size={48} className="text-green-500 animate-spin mx-auto mb-4" />
                        <h3 className="text-xl font-bold animate-pulse">Analizando Material...</h3>
                    </div>
                )}

                {!analyzing && !result && !error && (
                    <button 
                        onClick={capture}
                        className="w-20 h-20 rounded-full border-4 border-gray-200 p-1 hover:border-green-500 transition-colors"
                    >
                        <div className="w-full h-full bg-green-500 rounded-full"></div>
                    </button>
                )}

                {result && (
                    <div className="w-full animate-in slide-in-from-bottom">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-black text-gray-800 dark:text-white">{result.name}</h2>
                                <p className="text-gray-500 font-bold">{result.material}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${result.isRecyclable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {result.isRecyclable ? 'Reciclable' : 'Desecho General'}
                            </span>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl mb-4 border border-green-100 dark:border-green-800">
                             <h4 className="font-bold text-green-800 dark:text-green-300 flex items-center gap-2 mb-1">
                                 <CheckCircle size={16}/> Acción Recomendada
                             </h4>
                             <p className="text-sm text-green-700 dark:text-green-200">{result.action}</p>
                        </div>

                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl mb-6 border border-purple-100 dark:border-purple-800">
                             <h4 className="font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-1">
                                 <Lightbulb size={16}/> Idea Creativa
                             </h4>
                             <p className="text-sm text-purple-700 dark:text-purple-200">{result.creativeIdea}</p>
                        </div>

                        <button onClick={reset} className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold">
                            Escanear Otro
                        </button>
                    </div>
                )}

                {error && (
                    <div className="text-center w-full">
                        <AlertTriangle className="mx-auto text-red-500 mb-2" size={32} />
                        <p className="text-red-500 font-bold mb-4">{error}</p>
                        <button onClick={reset} className="px-6 py-2 bg-gray-200 rounded-xl font-bold">Reintentar</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WasteScanner;

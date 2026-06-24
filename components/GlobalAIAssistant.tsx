import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Mic, Send, X, Camera, Volume2, Sparkles, Loader2, StopCircle, Image as ImageIcon } from 'lucide-react';
import { askSARG, analyzeGeneralImage } from '../services/geminiService';

const TypewriterText = ({ text, onTypingChange }: { text: string, onTypingChange?: (isTyping: boolean) => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);
  
  useEffect(() => {
    setDisplayedText('');
    setIsDone(false);
    onTypingChange?.(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        onTypingChange?.(false);
        setIsDone(true);
      }
    }, 20);
    return () => {
        clearInterval(interval);
        onTypingChange?.(false);
    };
  }, [text]);

  return <span>{displayedText}{!isDone && <span className="inline-block w-1.5 h-4 bg-purple-500 animate-pulse ml-1 align-middle"></span>}</span>;
};

const BotAvatar = ({ isTalking }: { isTalking: boolean }) => (
    <div className="relative w-10 h-10 bg-gradient-to-b from-purple-100 to-purple-200 dark:from-purple-900/60 dark:to-purple-900/40 rounded-full flex flex-col items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.2)] overflow-hidden border border-purple-300 dark:border-purple-700/50">
        <style>{`
            @keyframes talk-ai {
                0% { height: 2px; border-radius: 10px; width: 14px; }
                100% { height: 10px; border-radius: 10px; width: 10px; }
            }
            @keyframes blink-ai {
                0%, 96%, 98% { transform: scaleY(1); }
                97% { transform: scaleY(0.1); }
            }
        `}</style>
        <div className="flex gap-2 mb-1 mt-1 z-10">
            <div className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-300 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.8)]" style={{ animation: 'blink-ai 4s infinite' }}></div>
            <div className="w-1.5 h-1.5 bg-purple-600 dark:bg-purple-300 rounded-full shadow-[0_0_5px_rgba(168,85,247,0.8)]" style={{ animation: 'blink-ai 4s infinite' }}></div>
        </div>
        <div className="bg-purple-600 dark:bg-purple-300 transition-all duration-75 z-10 shadow-[0_0_5px_rgba(168,85,247,0.5)]" style={{
            width: isTalking ? '10px' : '14px',
            height: isTalking ? '10px' : '2px',
            borderRadius: '10px',
            animation: isTalking ? 'talk-ai 0.15s ease-in-out infinite alternate' : 'none'
        }}></div>
    </div>
);

const GlobalAIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string, image?: string}[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isTypingAI, setIsTypingAI] = useState(false);
  
  // Audio
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Initial greeting
  useEffect(() => {
      if (messages.length === 0) {
          setMessages([{role: 'ai', text: '¡Hola! Soy SARG, tu asistente inteligente. ¿En qué te puedo ayudar hoy?'}]);
      }
  }, []);

  // Handle Voice Input
  const toggleListening = () => {
      if (isListening) {
          setIsListening(false);
      } else {
          setIsListening(true);
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          if (SpeechRecognition) {
              const recognition = new SpeechRecognition();
              recognition.lang = 'es-MX';
              recognition.onresult = (event: any) => {
                  const transcript = event.results[0][0].transcript;
                  setInputValue(transcript);
                  handleSend(transcript);
                  setIsListening(false);
              };
              recognition.onerror = () => setIsListening(false);
              recognition.start();
          } else {
              alert("Tu navegador no soporta reconocimiento de voz.");
              setIsListening(false);
          }
      }
  };

  // Handle Camera
  const startCamera = async () => {
      setShowCamera(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) { 
          console.error(e); 
          alert("No se pudo acceder a la cámara.");
          setShowCamera(false); 
      }
  };

  const captureImage = () => {
      if (videoRef.current) {
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          setCapturedImage(base64);
          setShowCamera(false);
          const stream = videoRef.current.srcObject as MediaStream;
          stream?.getTracks().forEach(t => t.stop());
      }
  };

  // Send Message
  const handleSend = async (textOverride?: string) => {
      const text = textOverride || inputValue;
      if (!text && !capturedImage) return;

      const userMsg = { role: 'user' as const, text: text || "(Imagen enviada)", image: capturedImage || undefined };
      setMessages(prev => [...prev, userMsg]);
      setInputValue('');
      setCapturedImage(null);
      setIsLoading(true);

      try {
          let responseText = "";
          if (userMsg.image) {
              responseText = await analyzeGeneralImage(userMsg.image, text || "Describe esta imagen.");
          } else {
              responseText = await askSARG(text);
          }

          setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
          
          if (responseText.length < 300) {
              speakResponse(responseText);
          }
      } catch (e) {
          setMessages(prev => [...prev, { role: 'ai', text: "Tuve un problema técnico. Intenta de nuevo." }]);
      } finally {
          setIsLoading(false);
      }
  };

  // TTS
  const speakResponse = (text: string) => {
      if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'es-MX';
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
      }
  };

  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[100px] lg:bottom-10 right-6 lg:right-10 w-16 h-16 bg-gradient-to-tr from-pink-400 to-purple-500 rounded-full shadow-[0_10px_30px_rgba(216,180,254,0.6)] flex items-center justify-center text-white z-[60] hover:scale-110 transition-transform animate-float border-2 border-white/50"
            title="Asistente SARG"
          >
              <Sparkles size={28} className="animate-pulse" />
          </button>
      );
  }

  return (
      <div className="fixed bottom-[100px] lg:bottom-10 right-4 lg:right-10 w-[85vw] max-w-[340px] h-[520px] max-h-[75vh] bg-white/90 dark:bg-[#121212]/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-white/60 dark:border-white/10 flex flex-col overflow-hidden z-[60] animate-in slide-in-from-bottom-8">
          
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-purple-900/30 dark:to-pink-900/30 flex justify-between items-center border-b border-white/50 dark:border-white/5">
              <div className="flex items-center gap-3">
                  <BotAvatar isTalking={isLoading || isTypingAI} />
                  <div>
                      <h3 className="font-black text-sm text-gray-800 dark:text-gray-100 tracking-wide">SARG</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> {isLoading ? 'Pensando...' : (isTypingAI ? 'Escribiendo...' : 'Activo')}
                      </p>
                  </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-full transition-colors text-gray-500"><X size={20}/></button>
          </div>

          {/* Camera View */}
          {showCamera && (
              <div className="relative flex-1 bg-black">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                  <button onClick={captureImage} className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:bg-gray-200 transition-colors shadow-lg"></button>
                  <button onClick={() => setShowCamera(false)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur-md"><X/></button>
              </div>
          )}

          {/* Chat Area */}
          {!showCamera && (
              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar bg-transparent">
                  {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-4 text-sm font-medium leading-relaxed shadow-sm ${
                              msg.role === 'user' 
                              ? 'bg-purple-600 text-white rounded-2xl rounded-br-sm' 
                              : 'bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-white/5'
                          }`}>
                              {msg.image && <img src={msg.image} alt="User upload" className="w-full h-32 object-cover rounded-xl mb-3 shadow-sm" />}
                              <p>
                                  {msg.role === 'ai' && i === messages.length - 1 ? (
                                      <TypewriterText text={msg.text} onTypingChange={setIsTypingAI} />
                                  ) : (
                                      msg.text
                                  )}
                              </p>
                              {msg.role === 'ai' && (
                                  <button onClick={() => speakResponse(msg.text)} className="mt-3 p-1.5 bg-gray-50 dark:bg-white/5 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"><Volume2 size={14}/></button>
                              )}
                          </div>
                      </div>
                  ))}
                  {isLoading && (
                      <div className="flex justify-start">
                          <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-2xl rounded-bl-sm border border-gray-100 dark:border-white/5 shadow-sm">
                              <Loader2 size={18} className="animate-spin text-purple-500"/>
                          </div>
                      </div>
                  )}
              </div>
          )}

          {/* Input Area */}
          {!showCamera && (
              <div className="p-4 bg-white/50 dark:bg-[#121212]/50 backdrop-blur-md border-t border-gray-100 dark:border-white/5">
                  {capturedImage && (
                      <div className="mb-3 relative inline-block">
                          <img src={capturedImage} className="h-16 w-16 object-cover rounded-xl border-2 border-purple-500 shadow-sm"/>
                          <button onClick={() => setCapturedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm"><X size={12}/></button>
                      </div>
                  )}
                  <div className="flex items-center gap-2">
                      <button onClick={startCamera} className="p-3 bg-white dark:bg-[#1e1e1e] text-gray-500 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors shadow-sm border border-gray-100 dark:border-white/5"><Camera size={20}/></button>
                      <div className="flex-1 relative">
                          <input 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Mensaje para SARG..."
                            className="w-full pl-4 pr-12 py-3 bg-white dark:bg-[#1e1e1e] rounded-2xl text-sm outline-none shadow-sm dark:text-white border border-gray-100 dark:border-white/5 focus:border-purple-300 dark:focus:border-purple-500 transition-colors"
                          />
                          <button onClick={toggleListening} className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-gray-400 hover:text-purple-500'}`}>
                              {isListening ? <StopCircle size={16}/> : <Mic size={16}/>}
                          </button>
                      </div>
                      <button onClick={() => handleSend()} disabled={!inputValue && !capturedImage} className="p-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-colors disabled:opacity-50 shadow-sm shadow-purple-500/20"><Send size={20}/></button>
                  </div>
              </div>
          )}
      </div>
  );
};

export default GlobalAIAssistant;

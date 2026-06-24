import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { REAL_RADIO_STATIONS, MOCK_NEWS, LEARNING_PROJECTS } from '../constants';

export const OFFLINE_FM_STATIONS = [
  { id: 'fm_sarg', title: '98.5 FM - SARG Comunitario', host: 'Antena Celular', topic: 'Noticias', description: 'Transmisión local simulada usando receptor FM del dispositivo.', type: 'news' as const },
  { id: 'fm_edu', title: '102.3 FM - Taller Axolotl', host: 'Educación SARG', topic: 'Proyectos', description: 'Cápsulas educativas offline de ciencia y tecnología.', type: 'edu' as const }
];

interface RadioContextProps {
  radioMode: 'internet' | 'fm';
  setRadioMode: (mode: 'internet' | 'fm') => void;
  isPlaying: boolean;
  currentStation: any;
  setCurrentStation: (station: any) => void;
  offlineStation: any;
  setOfflineStation: (station: any) => void;
  volume: number;
  changeVolume: (val: number) => void;
  isLoading: boolean;
  error: boolean;
  togglePlay: () => void;
  currentDisplayStation: any;
}

const RadioContext = createContext<RadioContextProps | undefined>(undefined);

export const RadioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [radioMode, setRadioMode] = useState<'internet' | 'fm'>('internet');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStation, setCurrentStation] = useState(REAL_RADIO_STATIONS[0]);
  const [offlineStation, setOfflineStation] = useState(OFFLINE_FM_STATIONS[0]);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Inicializar el elemento de audio para internet
    if (!audioRef.current) {
        audioRef.current = new Audio(currentStation.url);
    }
    audioRef.current.volume = volume;

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => { setIsLoading(false); setError(false); };
    const handleError = () => { setIsLoading(false); setError(true); setIsPlaying(false); };

    audioRef.current.addEventListener('waiting', handleWaiting);
    audioRef.current.addEventListener('playing', handlePlaying);
    audioRef.current.addEventListener('error', handleError);

    return () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.removeEventListener('waiting', handleWaiting);
            audioRef.current.removeEventListener('playing', handlePlaying);
            audioRef.current.removeEventListener('error', handleError);
            // No destruir el audioRef completo en un contexto para no perderlo al desmontar y montar partes,
            // pero sí limpiamos eventos si el provider se desmonta.
        }
        window.speechSynthesis.cancel();
    };
  }, []); // Only on mount

  // Manejar cambio de modo (Internet vs FM)
  useEffect(() => {
      if (radioMode === 'fm') {
          if (audioRef.current) audioRef.current.pause();
          setIsLoading(false);
          setError(false);
      } else {
          window.speechSynthesis.cancel();
          setIsLoading(false);
          setError(false);
          if (audioRef.current) {
              audioRef.current.src = currentStation.url;
          }
      }
      setIsPlaying(false);
  }, [radioMode]);

  // Manejar cambio de estación de internet
  useEffect(() => {
      if (radioMode === 'internet' && audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = currentStation.url;
          if (isPlaying) {
              setIsLoading(true);
              audioRef.current.play().catch(e => {
                  console.error("Play error:", e);
                  setError(true);
                  setIsLoading(false);
                  setIsPlaying(false);
              });
          }
      }
  }, [currentStation, radioMode]);

  // Manejar cambio de estación offline
  useEffect(() => {
      if (radioMode === 'fm' && isPlaying) {
          startOfflineRadio();
      }
  }, [offlineStation, radioMode]);

  const startOfflineRadio = () => {
      window.speechSynthesis.cancel();
      let textToSpeak = "Sintonizando señal F M. Estás escuchando la señal local de SARG sin necesidad de internet. ";
      
      if (offlineStation.type === 'news') {
          const news = MOCK_NEWS[Math.floor(Math.random() * MOCK_NEWS.length)];
          textToSpeak += `Titular de hoy: ${news.title}. ${news.excerpt}`;
      } else {
          const proj = LEARNING_PROJECTS[Math.floor(Math.random() * LEARNING_PROJECTS.length)];
          textToSpeak += `Cápsula del Taller Axolotl. Hoy presentamos: ${proj.title}. Categoría: ${proj.category}. Explicación científica: ${proj.explanation}`;
      }
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'es-MX';
      utterance.volume = volume;
      utterance.rate = 0.95;
      
      utterance.onend = () => {
          if (isPlaying) startOfflineRadio();
      };
      
      window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
      if (radioMode === 'internet') {
          if (!audioRef.current) return;
          if (isPlaying) {
              audioRef.current.pause();
              setIsPlaying(false);
          } else {
              setError(false);
              setIsLoading(true);
              audioRef.current.play().then(() => {
                 // started
              }).catch(e => {
                 setError(true);
                 setIsLoading(false);
              });
              setIsPlaying(true);
          }
      } else {
          // Modo FM Offline
          if (isPlaying) {
              window.speechSynthesis.pause();
              setIsPlaying(false);
          } else {
              if (window.speechSynthesis.paused) {
                  window.speechSynthesis.resume();
              } else {
                  startOfflineRadio();
              }
              setIsPlaying(true);
          }
      }
  };

  const changeVolume = (val: number) => {
      setVolume(val);
      if (audioRef.current) audioRef.current.volume = val;
  };

  const currentDisplayStation = radioMode === 'internet' ? currentStation : offlineStation;

  return (
    <RadioContext.Provider value={{
        radioMode, setRadioMode,
        isPlaying, currentStation, setCurrentStation,
        offlineStation, setOfflineStation,
        volume, changeVolume,
        isLoading, error, togglePlay, currentDisplayStation
    }}>
      {children}
    </RadioContext.Provider>
  );
};

export const useRadioContext = () => {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error('useRadioContext must be used within a RadioProvider');
  }
  return context;
};

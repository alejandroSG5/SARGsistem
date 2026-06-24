import React, { useState, useEffect } from 'react';
import { 
  Home, Grid, User, Info, Moon, Sun, Phone, Globe, WifiOff,
  ChevronRight, Sparkles, Heart, Activity, Zap, Search, Book, Bot
} from 'lucide-react';
import { Language, ModuleData, TopicData } from './types';
import { TRANSLATIONS, MODULES, MOCK_NEWS } from './constants';
import { MOTIVATIONAL_PHRASES } from './phrases';
import ModuleCard from './components/ModuleCard';
import TopicDetail from './components/TopicDetail';
import VoIPDialer from './components/VoIPDialer';
import HealthDashboard from './components/health/HealthDashboard';
import EducationDashboard from './components/education/EducationDashboard';
import EnvironmentDashboard from './components/environment/EnvironmentDashboard';
import AgroDashboard from './components/agro/AgroDashboard';
import EngineeringDashboard from './components/engineering/EngineeringDashboard';
import GlobalAIAssistant from './components/GlobalAIAssistant';
import GlobalMiniPlayer from './components/GlobalMiniPlayer';
import ProfileSettings from './components/ProfileSettings';
import SpatialNavigation from './components/SpatialNavigation';
import useGlobalTapSound from './hooks/useGlobalTapSound';

const TypewriterEraseText = ({ text, isTypingCallback }: { text: string, isTypingCallback?: (isTyping: boolean) => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [targetText, setTargetText] = useState(text);

  useEffect(() => {
    if (text !== targetText) {
      setIsDeleting(true);
    }
  }, [text, targetText]);

  useEffect(() => {
    isTypingCallback?.(true);
    let timeout: NodeJS.Timeout;

    if (isDeleting) {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(prev => prev.slice(0, -1));
        }, 15); // Erase speed
      } else {
        setIsDeleting(false);
        setTargetText(text);
      }
    } else {
      if (displayedText.length < targetText.length) {
        timeout = setTimeout(() => {
          setDisplayedText(targetText.slice(0, displayedText.length + 1));
        }, 30); // Type speed
      } else {
        isTypingCallback?.(false);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, targetText]);

  return <span>{displayedText}</span>;
};

const App: React.FC = () => {
  // Global tap sound for all interactive elements
  useGlobalTapSound();

  // State
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem('sarg_darkMode') || 'false'));
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('sarg_language') as Language || Language.ES);
  const [currentView, setCurrentView] = useState<'home' | 'modules' | 'profile' | 'about' | 'dialer'>('home');
  const [selectedModule, setSelectedModule] = useState<ModuleData | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [spatialEnabled, setSpatialEnabled] = useState(() => JSON.parse(localStorage.getItem('sarg_spatialEnabled') || 'false'));
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<{name: string, gender: 'hombre' | 'mujer' | ''} | null>(() => {
    const saved = localStorage.getItem('sarg_userProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const [profilePhoto, setProfilePhoto] = useState<string | null>(() => localStorage.getItem('sarg_profilePhoto'));
  const [profileEmoji, setProfileEmoji] = useState<string>(() => localStorage.getItem('sarg_profileEmoji') || '🦎');
  const [isMotivationalBotTalking, setIsMotivationalBotTalking] = useState(false);

  useEffect(() => { localStorage.setItem('sarg_darkMode', JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('sarg_language', language); }, [language]);
  useEffect(() => { localStorage.setItem('sarg_spatialEnabled', JSON.stringify(spatialEnabled)); }, [spatialEnabled]);
  useEffect(() => { if (userProfile) localStorage.setItem('sarg_userProfile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { if (profilePhoto) localStorage.setItem('sarg_profilePhoto', profilePhoto); }, [profilePhoto]);
  useEffect(() => { localStorage.setItem('sarg_profileEmoji', profileEmoji); }, [profileEmoji]);


  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Check PWA routing
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('open') === 'whiteboard') {
        const eduModule = MODULES.find(m => m.id === 'Educación');
        if (eduModule) setSelectedModule(eduModule);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Rotación aleatoria de noticias
  useEffect(() => {
    if (MOTIVATIONAL_PHRASES.length > 0) {
      const interval = setInterval(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
      }, 300000);
      return () => clearInterval(interval);
    }
  }, []);

  const t = TRANSLATIONS[language];

  // Handlers
  const handleModuleClick = (module: ModuleData) => {
    setSelectedModule(module);
    if (userProfile) {
      const visited = userProfile.visitedTopics || [];
      if (!visited.includes(module.id)) {
        setUserProfile({ ...userProfile, visitedTopics: [...visited, module.id], badges: (userProfile.badges || 0) + 1 });
      }
    }
  };
  const handleBackToModules = () => { setSelectedModule(null); setSelectedTopic(null); };

  // --- ARCHITECTURAL COMPONENTS ---

  // 1. CLOCK (Top Right)
  const Clock = () => {
      const [time, setTime] = useState(new Date());
  
      useEffect(() => {
          const timer = setInterval(() => setTime(new Date()), 1000);
          return () => clearInterval(timer);
      }, []);
  
      return (
          <div className="absolute top-2 right-2 md:top-4 md:right-6 z-50 text-xs md:text-base lg:text-lg font-black text-gray-900 dark:text-white pointer-events-none select-none tracking-widest bg-white/80 dark:bg-black/40 px-2 md:px-4 py-1 md:py-2 rounded-full backdrop-blur-lg shadow-md border border-gray-300 dark:border-gray-700">
              {time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
          </div>
      );
  };

  // 2. UNIFIED BOTTOM BAR (Responsive 3 Arquitecturas)
  const UnifiedBottomBar = () => {
    let bgColors = "bg-[#ffffff]/90 dark:bg-[#1e1e1e]/90";
    let glowColors = "from-transparent via-purple-300 dark:via-axolotl-gills to-transparent";
    if (userProfile?.gender === 'hombre') {
        bgColors = "bg-blue-100/90 dark:bg-[#151f2e]/90 border-blue-200 dark:border-[#1e2a40]";
        glowColors = "from-transparent via-blue-400 dark:via-blue-900/30 to-transparent";
    } else if (userProfile?.gender === 'mujer') {
        bgColors = "bg-pink-100/90 dark:bg-[#2e1520]/90 border-pink-200 dark:border-[#401e2c]";
        glowColors = "from-transparent via-pink-400 dark:via-pink-900/30 to-transparent";
    }

    return (
    <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pointer-events-none pb-4 lg:pb-8 px-4">
        {/*
          Arquitecturas Responsivas:
          - Mobile (default): Ocupa casi todo el ancho, botones compactos, padding pequeño.
          - Tablet (md): Max-width de md, más espacio entre botones.
          - Desktop (lg): Diseño dock tipo macOS flotante en el centro inferior, fondo glassmorphism muy pulido.
        */}
        <div className={`${bgColors} backdrop-blur-xl rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border border-gray-200/50 p-2 flex justify-between items-center pointer-events-auto w-full md:max-w-md lg:max-w-xl relative overflow-visible transition-all duration-300`}>
            
            {/* Soft Glow Ambient */}
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r ${glowColors} opacity-30 blur-md pointer-events-none`}></div>
            
            <BottomNavButton icon={<Home />} active={currentView === 'home'} onClick={() => setCurrentView('home')} tooltip={t.home} />
            <BottomNavButton icon={<Grid />} active={currentView === 'modules'} onClick={() => setCurrentView('modules')} tooltip={t.modules} />
            
            {/* Dialer Prominent Action */}
            <div className="relative mx-1 lg:mx-4 -top-6 lg:-top-8">
                <button 
                    onClick={() => setCurrentView('dialer')}
                    className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-pink-300 to-purple-400 dark:from-axolotl-gills dark:to-purple-600 rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center text-white border-[4px] border-[#ffffff] dark:border-[#121212] transform active:scale-90 hover:scale-105 transition-all duration-300 z-10"
                    title={t.call}
                >
                    <Phone size={24} className="animate-pulse" />
                </button>
            </div>

            <BottomNavButton icon={<Info />} active={currentView === 'about'} onClick={() => setCurrentView('about')} tooltip={t.about} />
            {profilePhoto ? (
              <button
                onClick={() => setCurrentView('profile')}
                className="flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 group relative"
                title={t.profile}
              >
                <div className={`p-0.5 rounded-full transition-all duration-300 ${currentView === 'profile' ? 'ring-2 ring-purple-500 dark:ring-axolotl-gills -translate-y-2 shadow-sm' : ''}`}>
                  <img src={profilePhoto} alt="Perfil" className="w-10 h-10 rounded-full object-cover" />
                </div>
                {currentView === 'profile' && <span className="absolute bottom-0 w-1.5 h-1.5 bg-purple-400 dark:bg-axolotl-gills rounded-full"></span>}
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('profile')}
                className="flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 group relative"
                title={t.profile}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${currentView === 'profile' ? 'bg-purple-50 dark:bg-white/10 -translate-y-2 shadow-sm ring-2 ring-purple-300 dark:ring-axolotl-gills' : 'bg-gray-100 dark:bg-white/5'}`}>
                  <span className="text-xl">{profileEmoji}</span>
                </div>
                {currentView === 'profile' && <span className="absolute bottom-0 w-1.5 h-1.5 bg-purple-400 dark:bg-axolotl-gills rounded-full"></span>}
              </button>
            )}
        </div>
    </div>
  );
  };

  const BottomNavButton = ({ icon, active, onClick, tooltip }: any) => {
    let activeColor = "bg-purple-50 text-purple-600 dark:bg-white/10 dark:text-axolotl-gills";
    let activeDotColor = "bg-purple-400 dark:bg-axolotl-gills";
    
    if (userProfile?.gender === 'hombre') {
        activeColor = "bg-blue-200 text-blue-700 dark:bg-[#1e2a40] dark:text-blue-300";
        activeDotColor = "bg-blue-500 dark:bg-blue-400";
    } else if (userProfile?.gender === 'mujer') {
        activeColor = "bg-pink-200 text-pink-700 dark:bg-[#401e2c] dark:text-pink-300";
        activeDotColor = "bg-pink-500 dark:bg-pink-400";
    }

    return (
    <button 
      onClick={onClick}
      className="flex-1 flex flex-col items-center justify-center py-2 transition-all duration-300 group relative"
      title={tooltip}
    >
      <div className={`p-3 rounded-full transition-all duration-300 ${active ? `${activeColor} -translate-y-2 shadow-sm` : 'text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'}`}>
          {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
      </div>
      {active && <span className={`absolute bottom-0 w-1.5 h-1.5 ${activeDotColor} rounded-full`}></span>}
    </button>
  );
  };

  // --- VIEWS RENDERERS ---

  const renderHome = () => {
    const currentPhrase = MOTIVATIONAL_PHRASES[currentNewsIndex] || null;
    
    return (
      <div className="w-full max-w-6xl mx-auto pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 lg:px-8 mt-4 lg:mt-8">
        
        {/* TOP HEADER */}
        <div className="text-center mb-10 mt-6">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter drop-shadow-md flex justify-center items-center gap-2 mb-4">
                <Book className="w-16 h-16 md:w-24 md:h-24 text-blue-500 drop-shadow-md" />
                <span className="text-blue-400 animate-pulse delay-75">S</span>
                <span className="text-rose-400 animate-pulse delay-100">A</span>
                <span className="text-amber-400 animate-pulse delay-150">R</span>
                <span className="text-emerald-400 animate-pulse delay-200">G</span>
            </h1>
            <p className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-rose-400 to-emerald-400 tracking-wider mb-2">
                ACELERA TU MENTE CONSTRUYE TU FUTURO
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-gray-500 dark:text-gray-400">
                Hola, {userProfile?.name}
            </h2>
        </div>

        {/* WIDGETS BELOW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            
            {/* WIDGET 1: ROSA (Educación) - AHORA ES EL PRIMERO */}
            <div 
              onClick={() => handleModuleClick(MODULES[1] || MODULES[0])}
              className="col-span-1 min-h-[140px] md:min-h-[200px] lg:min-h-[260px] bg-rose-50 dark:bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 lg:p-10 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-2 transition-all relative overflow-hidden group flex flex-col justify-center items-center text-center"
            >
                <div className="absolute -right-4 -top-4 text-rose-500/5 group-hover:text-rose-500/10 transition-colors transform rotate-12">
                    <Book className="w-16 h-16 md:w-32 md:h-32 lg:w-40 lg:h-40" />
                </div>
                <div className="relative z-10 w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white shadow-sm dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                    <Book className="text-rose-400 dark:text-rose-300 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="relative z-10 mt-2">
                    <h4 className="text-lg md:text-2xl font-black text-rose-500 dark:text-rose-400 leading-tight uppercase tracking-wider">{MODULES[1]?.title || 'Educación'}</h4>
                </div>
            </div>

            {/* WIDGET 2: AZUL (Salud) - AHORA ES EL SEGUNDO */}
            <div 
              onClick={() => handleModuleClick(MODULES[0])}
              className="col-span-1 min-h-[140px] md:min-h-[200px] lg:min-h-[260px] bg-blue-50 dark:bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 lg:p-10 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-2 transition-all relative overflow-hidden group flex flex-col justify-center items-center text-center"
            >
                <div className="absolute -right-4 -top-4 text-blue-500/5 group-hover:text-blue-500/10 transition-colors transform rotate-12">
                    <Heart className="w-16 h-16 md:w-32 md:h-32 lg:w-40 lg:h-40" />
                </div>
                <div className="relative z-10 w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white shadow-sm dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                    <Activity className="text-blue-400 dark:text-blue-300 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="relative z-10 mt-2">
                    <h4 className="text-lg md:text-2xl font-black text-blue-500 dark:text-blue-400 leading-tight uppercase tracking-wider">{MODULES[0].title}</h4>
                </div>
            </div>

            {/* WIDGET 3: AMBAR */}
            <div 
              onClick={() => handleModuleClick(MODULES[2] || MODULES[0])}
              className="col-span-1 min-h-[140px] md:min-h-[200px] lg:min-h-[260px] bg-amber-50 dark:bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 lg:p-10 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-2 transition-all relative overflow-hidden group flex flex-col justify-center items-center text-center"
            >
                <div className="absolute -right-4 -top-4 text-amber-500/5 group-hover:text-amber-500/10 transition-colors transform rotate-12">
                    <Globe className="w-16 h-16 md:w-32 md:h-32 lg:w-40 lg:h-40" />
                </div>
                <div className="relative z-10 w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white shadow-sm dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                    <Globe className="text-amber-400 dark:text-amber-300 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="relative z-10 mt-2">
                    <h4 className="text-lg md:text-2xl font-black text-amber-500 dark:text-amber-400 leading-tight uppercase tracking-wider">{MODULES[2]?.title || 'Ambiente'}</h4>
                </div>
            </div>

            {/* WIDGET 4: ESMERALDA */}
            <div 
              onClick={() => handleModuleClick(MODULES[3] || MODULES[0])}
              className="col-span-1 min-h-[140px] md:min-h-[200px] lg:min-h-[260px] bg-emerald-50 dark:bg-[#1a1a1a] rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-8 lg:p-10 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-2 transition-all relative overflow-hidden group flex flex-col justify-center items-center text-center"
            >
                <div className="absolute -right-4 -top-4 text-emerald-500/5 group-hover:text-emerald-500/10 transition-colors transform rotate-12">
                    <Zap className="w-16 h-16 md:w-32 md:h-32 lg:w-40 lg:h-40" />
                </div>
                <div className="relative z-10 w-10 h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white shadow-sm dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                    <Zap className="text-emerald-400 dark:text-emerald-300 w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="relative z-10 mt-2">
                    <h4 className="text-lg md:text-2xl font-black text-emerald-500 dark:text-emerald-400 leading-tight uppercase tracking-wider">{MODULES[3]?.title || 'Agro'}</h4>
                </div>
            </div>

            {/* NEWS WIDGET (ANIMATED MINI-BOT FULL WIDTH) */}
            <div className="col-span-2 lg:col-span-4 min-h-[160px] rounded-[2rem] md:rounded-[2.5rem] p-5 md:p-8 shadow-md border-2 border-transparent bg-gradient-to-br from-white to-gray-50 dark:from-[#1e1e1e] dark:to-[#121212] overflow-hidden flex flex-col relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-emerald-500/5 opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="flex justify-between items-center mb-2 z-10">
                    <h4 className="font-black text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} className="text-yellow-400" /> SARG Bot Motivacional
                    </h4>
                </div>
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center z-10 gap-8">
                    {/* Bot Icon designed with CSS - SCALED DOWN AND FLOATING */}
                    <div className="relative w-24 h-24 shrink-0 flex flex-col items-center justify-center mt-2 scale-90 animate-[float_3s_ease-in-out_infinite]">
                        <style>{`
                            @keyframes wave-arm {
                                0% { transform: rotate(0deg); }
                                20% { transform: rotate(60deg); }
                                40% { transform: rotate(20deg); }
                                60% { transform: rotate(60deg); }
                                80% { transform: rotate(0deg); }
                                100% { transform: rotate(0deg); }
                            }
                            .animate-wave-arm {
                                animation: wave-arm 2.5s ease-in-out infinite;
                                transform-origin: bottom center;
                            }
                            @keyframes bot-talk {
                                0% { transform: scaleY(1); }
                                100% { transform: scaleY(2.5); }
                            }
                            @keyframes float {
                                0%, 100% { transform: translateY(0px) scale(0.9); }
                                50% { transform: translateY(-10px) scale(0.9); }
                            }
                        `}</style>

                        {/* Waving Arm (Right) */}
                        <div className="absolute top-8 -right-6 z-0 animate-wave-arm">
                            <div className="w-3 h-10 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full border-2 border-gray-400 dark:border-gray-500 shadow-md relative">
                                {/* Hand */}
                                <div className="absolute -top-2 -left-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.9)]"></div>
                            </div>
                        </div>

                        {/* Static Arm (Left) */}
                        <div className="absolute top-10 -left-5 z-0 rotate-[30deg]">
                            <div className="w-3 h-8 bg-gradient-to-b from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full border-2 border-gray-400 dark:border-gray-500 shadow-md relative">
                                {/* Hand */}
                                <div className="absolute -bottom-2 -left-1 w-5 h-5 bg-blue-400 rounded-full border-2 border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.9)]"></div>
                            </div>
                        </div>

                        {/* Antennas */}
                        <div className="absolute -top-5 flex justify-center w-full gap-6 z-0">
                            <div className="w-1.5 h-6 bg-gray-300 dark:bg-gray-600 rounded-t-full relative">
                                <div className="absolute -top-2 -left-1 w-4 h-4 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,1)]"></div>
                            </div>
                            <div className="w-1.5 h-6 bg-gray-300 dark:bg-gray-600 rounded-t-full relative">
                                <div className="absolute -top-2 -left-1 w-4 h-4 rounded-full bg-emerald-500 animate-pulse delay-150 shadow-[0_0_15px_rgba(16,185,129,1)]"></div>
                            </div>
                        </div>
                        
                        {/* Head */}
                        <div className="w-20 h-16 bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-[2rem] border-[3px] border-gray-300 dark:border-gray-600 shadow-[0_10px_30px_rgba(0,0,0,0.2)] relative z-10 flex flex-col items-center justify-center overflow-hidden">
                            {/* Screen / Face */}
                            <div className="w-16 h-10 bg-black rounded-xl flex items-center justify-center gap-3 border-2 border-gray-800 shadow-inner relative overflow-hidden">
                                {/* Screen reflection */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
                                {/* Eyes */}
                                <div className="w-4 h-5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_20px_rgba(59,130,246,1)] flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full translate-x-1 -translate-y-1 opacity-80"></div>
                                </div>
                                <div className="w-4 h-5 bg-emerald-400 rounded-full animate-pulse delay-75 shadow-[0_0_20px_rgba(16,185,129,1)] flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full translate-x-1 -translate-y-1 opacity-80"></div>
                                </div>
                            </div>
                            {/* Mouth/Speaker ANIMATED */}
                            <div className="mt-1.5 w-8 h-1.5 bg-gray-400/50 dark:bg-gray-800 rounded-full opacity-80 grid grid-cols-4 gap-0.5 px-0.5 py-0.5 overflow-hidden">
                                <div className="bg-gray-700 dark:bg-emerald-400 rounded-full w-full h-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" style={{ animation: isMotivationalBotTalking ? 'bot-talk 0.2s ease-in-out infinite alternate' : 'none' }}></div>
                                <div className="bg-gray-700 dark:bg-emerald-400 rounded-full w-full h-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" style={{ animation: isMotivationalBotTalking ? 'bot-talk 0.3s ease-in-out infinite alternate-reverse' : 'none' }}></div>
                                <div className="bg-gray-700 dark:bg-emerald-400 rounded-full w-full h-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" style={{ animation: isMotivationalBotTalking ? 'bot-talk 0.15s ease-in-out infinite alternate' : 'none' }}></div>
                                <div className="bg-gray-700 dark:bg-emerald-400 rounded-full w-full h-full shadow-[0_0_5px_rgba(16,185,129,0.5)]" style={{ animation: isMotivationalBotTalking ? 'bot-talk 0.25s ease-in-out infinite alternate-reverse' : 'none' }}></div>
                            </div>
                        </div>

                        {/* Neck */}
                        <div className="w-6 h-2 bg-gray-300 dark:bg-gray-600 relative z-0 border-x-2 border-gray-400 dark:border-gray-700"></div>

                        {/* Body */}
                        <div className="w-16 h-8 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-t-2xl shadow-lg relative z-10 border-b-[4px] border-emerald-700 flex items-center justify-center">
                            {/* Core Core */}
                            <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center border border-white/50 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_15px_white]"></div>
                            </div>
                        </div>
                    </div>
                    {/* Speech Bubble */}
                    <div className="flex-1 w-full bg-white/60 dark:bg-[#1a1a1a]/60 backdrop-blur-md p-6 lg:p-8 rounded-[2rem] border border-gray-100 dark:border-white/5 relative shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none min-h-[100px] flex items-center transition-all duration-500 group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
                        {/* Bubble tail */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/60 dark:bg-[#1a1a1a]/60 backdrop-blur-md border border-gray-100 dark:border-white/5 rotate-45 hidden md:block border-t-0 border-r-0"></div>
                        
                        {currentPhrase ? (
                            <div className="relative z-10 w-full">
                                <p className="text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 leading-relaxed italic text-center md:text-left drop-shadow-sm">
                                    "<TypewriterEraseText text={currentPhrase} isTypingCallback={setIsMotivationalBotTalking} />"
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm italic text-gray-400 animate-pulse font-medium">Procesando sabiduría...</p>
                        )}
                    </div>
                </div>
            </div>

        </div>
      </div>
    );
  };

  const renderModulesList = () => (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-12 pb-32 pt-6 md:pt-10 lg:pt-16 animate-in slide-in-from-right-8 duration-500">
        <div className="mb-8 md:mb-12 lg:mb-20 text-center">
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-black mb-4 lg:mb-6 tracking-tighter drop-shadow-sm uppercase">
                <span className="text-blue-500 dark:text-blue-400">S</span>
                <span className="text-rose-500 dark:text-rose-400">A</span>
                <span className="text-amber-500 dark:text-amber-400">R</span>
                <span className="text-emerald-500 dark:text-emerald-400">G</span>
                <span className="text-blue-500 dark:text-blue-400">T</span>
                <span className="text-rose-500 dark:text-rose-400">E</span>
                <span className="text-amber-500 dark:text-amber-400">C</span>
                <span className="text-emerald-500 dark:text-emerald-400">A</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-base md:text-xl lg:text-3xl font-medium max-w-xl md:max-w-3xl mx-auto leading-relaxed">
                Explora el ecosistema de herramientas diseñadas para soberanía tecnológica offline.
            </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-8 lg:gap-12">
            {MODULES.map(module => (
                <ModuleCard key={module.id} module={module} onClick={() => handleModuleClick(module)} />
            ))}
        </div>
    </div>
  );

  const renderAbout = () => (
    <div className="min-h-full flex flex-col items-center p-4 md:p-8 lg:p-12 relative overflow-y-auto custom-scrollbar animate-in fade-in pb-48 lg:pb-56">
        
        {/* HERO MISSION */}
        <div className="max-w-4xl text-center relative z-10 mt-10 md:mt-16 mb-20">
            <h1 className="text-7xl md:text-9xl font-black mb-4 tracking-tighter drop-shadow-sm uppercase">
                <span className="text-blue-500 dark:text-blue-400">S</span>
                <span className="text-rose-500 dark:text-rose-400">A</span>
                <span className="text-amber-500 dark:text-amber-400">R</span>
                <span className="text-emerald-500 dark:text-emerald-400">G</span>
            </h1>
            <h2 className="text-xl md:text-3xl font-black text-gray-800 dark:text-gray-200 uppercase tracking-widest mb-8">
                Sistema de Aprendizaje Rápido y Gratuito
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-rose-500 to-emerald-500 mx-auto mb-8 rounded-full"></div>
            <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed font-medium mb-12 max-w-3xl mx-auto">
                Una arquitectura PWA (Progressive Web App) diseñada específicamente para localidades y entornos rurales. 
                Facilitamos el aprendizaje individual al ritmo del usuario, llevando herramientas avanzadas e inteligencia artificial 
                a lugares sin conectividad constante para garantizar la soberanía tecnológica y educativa, sin importar las barreras geográficas.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
                {['Offline First', 'Open Source', 'Alto Rendimiento', 'Educación Libre'].map((tag, i) => (
                    <div key={i} className="px-5 py-2.5 bg-gray-100 dark:bg-[#1e1e1e] rounded-full text-xs font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest shadow-sm">
                        {tag}
                    </div>
                ))}
            </div>
        </div>

        {/* TEAM SECTION */}
        <div className="w-full max-w-6xl mx-auto">
            <h3 className="text-3xl md:text-5xl font-black text-center mb-8 md:mb-12 text-gray-900 dark:text-white uppercase tracking-tighter">
                Conócenos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                
                {/* ALEJANDRO */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-white/5 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden mb-4 md:mb-6 border-4 border-blue-500/30 group-hover:border-blue-500 transition-colors shadow-lg">
                        <img src="/quienes_somos/alejandro.jpeg" alt="Jorge Alejandro" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Jorge Alejandro</h4>
                    <p className="text-blue-500 font-bold uppercase tracking-widest text-xs md:text-sm mb-4">Desarrollador</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium italic leading-relaxed">"Deku mi marido"</p>
                </div>

                {/* GISELLE */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-white/5 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden mb-4 md:mb-6 border-4 border-blue-500/30 group-hover:border-blue-500 transition-colors shadow-lg">
                        <img src="/quienes_somos/giselle.jpeg" alt="Giselle Noemi" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Giselle Noemi</h4>
                    <p className="text-blue-500 font-bold uppercase tracking-widest text-xs md:text-sm mb-4">Desarrolladora</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium italic leading-relaxed">"JAX MI LEGION"</p>
                </div>

                {/* XIMENA */}
                <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] md:rounded-[3rem] p-6 md:p-8 shadow-xl border border-gray-100 dark:border-white/5 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300 md:col-span-2 lg:col-span-1">
                    <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden mb-4 md:mb-6 border-4 border-amber-500/30 group-hover:border-amber-500 transition-colors shadow-lg">
                        <img src="/quienes_somos/ximena.jpeg" alt="Ximena Valeria" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Valeria Ximena</h4>
                    <p className="text-amber-500 font-bold uppercase tracking-widest text-xs md:text-sm mb-4">Desarrolladora</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium italic leading-relaxed">"VICIADO POR EL BRAWL"</p>
                </div>

            </div>
        </div>
    </div>
  );

  // --- MAIN RENDER SWITCH ---

  if (currentView === 'dialer') {
      return (
          <div className="h-screen w-full relative bg-[#fafafa] dark:bg-black overflow-hidden font-sans text-gray-900 dark:text-white transition-colors duration-500">
              <button 
                onClick={() => setCurrentView('home')}
                className="absolute top-6 left-6 z-50 p-4 bg-white/50 dark:bg-white/10 backdrop-blur-md rounded-full hover:bg-gray-200 dark:hover:bg-white/20 transition-all border border-gray-200 dark:border-white/10 shadow-sm"
              >
                  <ChevronRight className="rotate-180" size={24} />
              </button>
              <VoIPDialer onClose={() => setCurrentView('home')} />
          </div>
      );
  }

  if (selectedModule) {
    const ComponentMap: any = {
        'Salud': HealthDashboard,
        'Educación': EducationDashboard,
        'Ambiente': EnvironmentDashboard,
        'Agricultura': AgroDashboard,
        'Ingeniería': EngineeringDashboard
    };
    
    const SpecificDashboard = ComponentMap[selectedModule.id];

    if (SpecificDashboard) {
        return <SpecificDashboard moduleData={selectedModule} onBack={handleBackToModules} userProfile={userProfile} />;
    }

    if (selectedTopic) return <TopicDetail topicData={selectedTopic} categoryTitle={selectedModule.title} onBack={() => setSelectedTopic(null)} />;
    
    return (
      <div className="min-h-screen bg-[#fbfbfb] dark:bg-[#121212] p-4 lg:p-8 font-sans text-gray-900 dark:text-white transition-colors duration-500">
         <div className="max-w-6xl mx-auto">
             <div className="flex items-center justify-center mb-10 relative">
                <button onClick={handleBackToModules} className="absolute left-0 p-3 rounded-full bg-white dark:bg-[#1e1e1e] shadow-sm hover:scale-105 transition-transform border border-gray-100 dark:border-white/5">
                    <ChevronRight className="rotate-180" size={20} />
                </button>
                <div className="flex flex-col">
                    <span className="text-xl md:text-2xl font-black mb-1 drop-shadow-md">{t.welcome || 'Bienvenido a SARG'}</span>
                    <span className="text-xs md:text-sm font-bold opacity-90 backdrop-blur-sm">{t.subtitle || 'Conocimiento para todos, sin barreras.'}</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black tracking-tighter flex gap-1 mb-1 drop-shadow-sm">
                        <span className="text-blue-500">S</span>
                        <span className="text-rose-500">A</span>
                        <span className="text-amber-500">R</span>
                        <span className="text-emerald-500">G</span>
                   </h2>
                   <h1 className="text-xl md:text-2xl font-black uppercase tracking-widest text-center" style={{color: selectedModule.color?.replace('bg-', '').replace('-500', '').replace('-600', '') === 'rose' ? '#f43f5e' : selectedModule.color?.includes('blue') ? '#3b82f6' : selectedModule.color?.includes('green') ? '#10b981' : '#f59e0b'}}>{selectedModule.title}</h1>
                </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {selectedModule.subModules.flatMap(sub => sub.items).map((item, i) => (
                    <div key={i} onClick={() => {
                      setSelectedTopic(item);
                      if (userProfile) {
                        const visited = userProfile.visitedTopics || [];
                        if (!visited.includes(item.id)) {
                          setUserProfile({ ...userProfile, visitedTopics: [...visited, item.id], badges: (userProfile.badges || 0) + 1 });
                        }
                      }
                    }} className="bg-white dark:bg-[#1a1a1a] p-6 md:p-8 rounded-[2rem] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-center items-center text-center cursor-pointer group">
                        <h3 className="text-lg md:text-xl font-bold mb-2 group-hover:scale-105 transition-transform" style={{color: selectedModule.color?.replace('bg-', '').replace('-500', '').replace('-600', '') === 'rose' ? '#f43f5e' : selectedModule.color?.includes('blue') ? '#3b82f6' : selectedModule.color?.includes('green') ? '#10b981' : '#f59e0b'}}>{item.title}</h3>
                    </div>
                ))}
            </div>
         </div>
      </div>
    );
  }

  const renderOnboarding = () => {
      // Inline states inside render are okay here because it acts like a separate screen before main render
      // But to avoid hook rule issues, we should create a separate component or just use App's state.
      // Since App state already has userProfile, we can use local let/const or extract it.
      // Wait, let's just make it a clean inline component by not using hooks inside, or extracting to a variable.
      return <OnboardingScreen onComplete={(profile) => { setUserProfile(profile); setProfileEmoji(profile.emoji || '🦎'); }} />;
  };

  if (!userProfile) return renderOnboarding();

  return (
    <div className="flex flex-col h-screen w-full bg-[#fbfbfb] dark:bg-[#121212] transition-colors duration-1000 font-sans overflow-hidden text-gray-900 dark:text-white">
      
      <SpatialNavigation enabled={spatialEnabled} onClose={() => setSpatialEnabled(false)} />

      <main className="flex-1 relative flex flex-col overflow-hidden z-10 w-full">
          <Clock />
          <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
              {currentView === 'home' && renderHome()}
              {currentView === 'modules' && renderModulesList()}
              {currentView === 'about' && renderAbout()}
              {currentView === 'profile' && (
                  <ProfileSettings 
                    darkMode={darkMode} 
                    toggleDarkMode={() => setDarkMode(!darkMode)}
                    language={language}
                    setLanguage={setLanguage}
                    isOffline={isOffline}
                    setIsOffline={setIsOffline}
                    spatialEnabled={spatialEnabled}
                    toggleSpatial={() => setSpatialEnabled(!spatialEnabled)}
                    userName={userProfile?.name || ''}
                    profilePhoto={profilePhoto}
                    setProfilePhoto={setProfilePhoto}
                  />
              )}
          </div>
          <GlobalAIAssistant />
          <GlobalMiniPlayer />
      </main>
      
      <UnifiedBottomBar />
    </div>
  );
};

const OnboardingScreen = ({ onComplete }: { onComplete: (profile: {name: string, gender: 'hombre' | 'mujer' | '', emoji: string}) => void }) => {
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'hombre' | 'mujer' | ''>('');
    const catEmoji = '😺';

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-[#fbfbfb] dark:bg-[#121212] p-6 text-gray-900 dark:text-white overflow-y-auto">
            <div className="w-full max-w-md bg-white dark:bg-[#1e1e1e] rounded-[3rem] p-8 md:p-10 shadow-2xl border border-gray-100 dark:border-white/5 animate-in zoom-in-95 duration-500 my-auto">
                <div className="flex justify-center mb-6">
                   <div className="flex items-center text-5xl font-black tracking-tighter drop-shadow-md">
                      <Book size={48} className="text-blue-500 mr-2 drop-shadow-md" />
                      <span className="text-blue-400">S</span>
                      <span className="text-rose-400">A</span>
                      <span className="text-amber-400">R</span>
                      <span className="text-emerald-400">G</span>
                   </div>
                </div>
                <div className="space-y-5">
                    {/* Avatar Display */}
                    <div className="flex justify-center mb-3">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 p-[3px] shadow-lg shadow-blue-500/20">
                            <div className="w-full h-full rounded-full bg-white dark:bg-[#1e1e1e] flex items-center justify-center">
                                <span className="text-5xl">{catEmoji}</span>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-500 uppercase tracking-widest text-center">¿Cómo te llamas?</label>
                        <input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full bg-gray-50 dark:bg-black/20 p-4 rounded-2xl outline-none font-bold text-center text-lg border border-transparent focus:border-blue-400 transition-colors" placeholder="Escribe tu nombre..." />
                    </div>

                    {/* Gender */}
                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-500 uppercase tracking-widest text-center">Selecciona tu género</label>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setGender('hombre')}
                                className={`flex-1 py-3 rounded-2xl font-bold border-2 transition-all ${gender === 'hombre' ? 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900/50 dark:border-blue-400 dark:text-blue-200' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100 dark:bg-black/20 dark:hover:bg-white/5'}`}
                            >Hombre</button>
                            <button 
                                onClick={() => setGender('mujer')}
                                className={`flex-1 py-3 rounded-2xl font-bold border-2 transition-all ${gender === 'mujer' ? 'bg-pink-100 border-pink-500 text-pink-700 dark:bg-pink-900/50 dark:border-pink-400 dark:text-pink-200' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100 dark:bg-black/20 dark:hover:bg-white/5'}`}
                            >Mujer</button>
                        </div>
                    </div>

                    <button 
                      disabled={!name || !gender}
                      onClick={() => onComplete({name, gender, emoji: catEmoji})}
                      className="w-full py-4 mt-2 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-2xl font-black text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                        Comenzar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;

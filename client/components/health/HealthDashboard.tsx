import React, { useState, useEffect } from 'react';
import { 
  Heart, Activity, Search, ChevronRight, 
  Thermometer, Flower, ClipboardList, Stethoscope, 
  Pill, ArrowLeft, Map, UserCheck, Microscope, BookOpen, Clock
} from 'lucide-react';
import { ModuleData, TopicData, NavigationTarget } from '../../types';
import ToolsSection from './ToolsSection';
import TopicDetail from '../TopicDetail';

interface HealthDashboardProps {
  moduleData: ModuleData;
  onBack: () => void;
  userProfile?: { name: string; gender: 'hombre' | 'mujer' | '' } | null;
}

const formatTime = (totalSeconds: number) => {
    if (totalSeconds === 0) return '0s';
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const m = Math.floor(totalSeconds / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    const mRemaining = m % 60;
    return `${h}h ${mRemaining}m`;
};

const HealthDashboard: React.FC<HealthDashboardProps> = ({ moduleData, onBack, userProfile }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'tools' | 'topic'>('dashboard');
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null);
  const [toolType, setToolType] = useState<'bmi' | 'plants' | 'symptoms' | 'map' | 'anatomy' | 'microscope' | 'medicine'>('bmi');
  const [mapTarget, setMapTarget] = useState<NavigationTarget | null>(null);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
      const updateTimer = () => {
          const secs = parseInt(localStorage.getItem(`sarg_reading_time_${moduleData.title}`) || '0', 10);
          setReadingTime(secs);
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
  }, [moduleData.title]);


  const handleTopicSelect = (topic: TopicData) => {
      setSelectedTopic(topic);
      setCurrentView('topic');
  };

  const handleToolSelect = (type: 'bmi' | 'plants' | 'symptoms' | 'map' | 'anatomy' | 'microscope' | 'medicine') => {
      setToolType(type);
      setCurrentView('tools');
      if(type === 'map') setMapTarget(null);
  };

  const handleRequestMapNavigation = (target: NavigationTarget) => {
      setMapTarget(target);
      setToolType('map');
      setCurrentView('tools');
  };

    const [visibleCounts, setVisibleCounts] = useState<{[key: number]: number}>({});

    const handleLoadMore = (idx: number) => {
        setVisibleCounts(prev => ({
            ...prev,
            [idx]: (prev[idx] || 20) + 20
        }));
    };

    const renderDashboard = () => (
        <div className="animate-in slide-in-from-right-4 duration-500 min-h-screen bg-rose-50/30 dark:bg-[#0c0508] font-sans pb-32">
          
          {/* HERO HEADER - Vibrant Cohesive */}
          <div className="bg-rose-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white p-8 lg:p-16 relative overflow-hidden flex flex-col items-center justify-center text-center">
            <button onClick={onBack} className="absolute left-8 top-8 p-3 bg-white dark:bg-[#2a2a2a] shadow-sm hover:scale-105 rounded-full transition-transform">
                <ArrowLeft size={20} />
            </button>
            <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
               {/* Removed Animated Greeting Heart as requested */}
               <div className="w-16 h-16 relative mb-4">
                   <Activity className="text-rose-500 absolute w-full h-full drop-shadow-sm" strokeWidth={1} />
               </div>
               
               <h2 className="text-4xl lg:text-6xl font-black tracking-tighter flex justify-center gap-2 mb-2 drop-shadow-sm">
                    <span className="text-blue-500">S</span>
                    <span className="text-rose-500">A</span>
                    <span className="text-amber-500">R</span>
                    <span className="text-emerald-500">G</span>
               </h2>
               <h1 className="text-2xl lg:text-4xl font-black mb-4 uppercase tracking-widest text-rose-500">
                    SALUD
               </h1>
            </div>
          </div>
    
          <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-12 lg:space-y-16 mt-4 lg:mt-8">
            
            {/* TOOLS BENTO GRID */}
            <div>
               <div className="flex items-center gap-3 mb-6 px-2">
                 <Stethoscope size={20} className="text-gray-400" />
                 <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">
                    Herramientas
                 </h3>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  
                  {/* FEATURED: ANATOMY */}
                  <button 
                    onClick={() => handleToolSelect('anatomy')}
                    className="col-span-2 xl:col-span-2 row-span-2 bg-rose-50 dark:bg-[#1a1a1a] rounded-[2rem] p-6 lg:p-8 text-rose-900 dark:text-rose-100 shadow-sm relative overflow-hidden group flex flex-col justify-center items-center text-center hover:shadow-md hover:-translate-y-1 transition-all"
                  >
                      <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 text-rose-500 transition-opacity transform group-hover:scale-110">
                          <UserCheck size={180} />
                      </div>
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 bg-white shadow-sm dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <UserCheck className="text-rose-500" size={24} />
                        </div>
                        <h4 className="font-black text-2xl lg:text-3xl mb-1 text-rose-600 dark:text-rose-400">Anatomía</h4>
                        <p className="text-gray-500 text-sm font-medium opacity-90 max-w-[150px]">Exploración del cuerpo humano.</p>
                      </div>
                  </button>
    
                  <ToolCard icon={<Map />} color="emerald" title="Mapa" subtitle="Hospitales" onClick={() => handleToolSelect('map')} large={true} />
                  <ToolCard icon={<Thermometer />} color="orange" title="Triaje" subtitle="Diagnóstico" onClick={() => handleToolSelect('symptoms')} />
                  <ToolCard icon={<Microscope />} color="teal" title="Lab" subtitle="Microscopio" onClick={() => handleToolSelect('microscope')} />
                  <ToolCard icon={<Flower />} color="green" title="Plantas" subtitle="Herbolaria" onClick={() => handleToolSelect('plants')} />
                  <ToolCard icon={<BookOpen />} color="purple" title="Apuntes" subtitle="Mi Cuaderno" onClick={() => handleToolSelect('medicine')} />
                  <ToolCard icon={<Activity />} color="blue" title="IMC" subtitle="Calculadora" onClick={() => handleToolSelect('bmi')} />
               </div>
            </div>
    
            {/* LIBRARY & PROGRESS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               
               {/* LEFT: PROGRESS TRACKING */}
               <div className="col-span-1 bg-white dark:bg-[#1a0f12] rounded-[2rem] p-6 shadow-sm border border-rose-100 dark:border-rose-900/30 flex flex-col items-center justify-center text-center max-h-[300px] sticky top-8 group hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-2 mb-6">
                      <Clock size={18} className="text-rose-600 dark:text-rose-400" />
                      <h3 className="text-rose-600 dark:text-rose-400 text-sm font-black uppercase tracking-widest">Tiempo de Lectura</h3>
                  </div>
                  <div className="relative w-32 h-32 mb-4">
                      {/* Inner glowing pulse */}
                      <div className="absolute inset-2 bg-rose-500/10 rounded-full animate-pulse group-hover:bg-rose-500/20 transition-colors"></div>
                      
                      <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-rose-50 dark:text-rose-900/20" />
                          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - ((readingTime % 3600) / 3600) * 251.2} className="text-rose-500 transition-all duration-1000" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                          <span className="text-2xl md:text-3xl font-black text-rose-600 dark:text-rose-400 drop-shadow-sm">{formatTime(readingTime)}</span>
                      </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Tiempo Invertido en {moduleData.title}</p>
               </div>
    
               {/* RIGHT: BOOKSHELF */}
               <div className="col-span-1 lg:col-span-3">
                   <div className="flex items-center gap-3 mb-6 px-2">
                     <ClipboardList size={20} className="text-rose-600 dark:text-rose-400" />
                     <h3 className="text-rose-700 dark:text-rose-400 text-sm font-black uppercase tracking-widest">
                        Biblioteca General
                     </h3>
                   </div>
    
                   <div className="space-y-8">
                      {moduleData.subModules.map((sub, idx) => {
                        const currentLimit = visibleCounts[idx] || 20;
                        const visibleItems = sub.items.slice(0, currentLimit);
                        const hasMore = sub.items.length > currentLimit;

                        return (
                        <div key={idx} className="bg-rose-100/50 dark:bg-[#1f1115] rounded-3xl p-6 shadow-inner border border-rose-200/50 dark:border-rose-900/40">
                            <h3 className="font-black text-xl text-rose-900 dark:text-rose-100 mb-6 border-b-4 border-rose-200 dark:border-rose-900/50 pb-2 inline-block">{sub.categoryName}</h3>
                            
                            {/* Bookshelf Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
                              {visibleItems.map((item, i) => (
                                <button
                                  key={item.id}
                                  onClick={() => handleTopicSelect(item)}
                                  className="group relative flex flex-col items-center"
                                >
                                    {/* The Book Spine/Cover */}
                                    <div className="w-full aspect-[2/3] rounded-r-xl rounded-l-md shadow-md bg-rose-500 dark:bg-rose-600 border-l-4 border-rose-700 dark:border-rose-800 flex items-center justify-center p-3 hover:-translate-y-4 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
                                        <div className="absolute left-2 top-0 bottom-0 w-1 bg-white/10"></div>
                                        <span className="font-bold text-xs text-white text-center z-10 leading-tight drop-shadow-md group-hover:scale-105 transition-transform">{item.title}</span>
                                    </div>
                                    {/* Shelf shadow */}
                                    <div className="w-11/12 h-2 bg-black/10 dark:bg-black/30 rounded-full mt-2 blur-sm"></div>
                                </button>
                              ))}
                            </div>
                            
                            {hasMore && (
                                <div className="mt-8 flex justify-center">
                                    <button 
                                        onClick={() => handleLoadMore(idx)}
                                        className="px-6 py-2 bg-rose-200 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 rounded-full font-bold text-sm hover:bg-rose-300 dark:hover:bg-rose-800/50 transition-colors"
                                    >
                                        Cargar más libros ({sub.items.length - currentLimit} restantes)
                                    </button>
                                </div>
                            )}
                        </div>
                      )})}
                   </div>
               </div>
            </div>
          </div>
        </div>
      );

  if (currentView === 'topic' && selectedTopic) {
    return <TopicDetail topicData={selectedTopic} categoryTitle="Salud" onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'tools') {
    return <ToolsSection 
            type={toolType} 
            onBack={() => setCurrentView('dashboard')} 
            mapTarget={mapTarget}
            onRequestMap={handleRequestMapNavigation}
            userProfile={userProfile}
           />;
  }

  return renderDashboard();
};

const ToolCard = ({ icon, color, title, subtitle, onClick, large }: any) => {
    const colorStyles: any = {
        emerald: 'bg-emerald-50 text-emerald-500 dark:bg-[#1a1a1a] dark:text-emerald-400',
        orange: 'bg-orange-50 text-orange-500 dark:bg-[#1a1a1a] dark:text-orange-400',
        teal: 'bg-teal-50 text-teal-500 dark:bg-[#1a1a1a] dark:text-teal-400',
        green: 'bg-green-50 text-green-500 dark:bg-[#1a1a1a] dark:text-green-400',
        purple: 'bg-purple-50 text-purple-500 dark:bg-[#1a1a1a] dark:text-purple-400',
        blue: 'bg-blue-50 text-blue-500 dark:bg-[#1a1a1a] dark:text-blue-400',
    };

    return (
        <button 
          onClick={onClick}
          className={`
            ${colorStyles[color]} rounded-[2rem] p-5 lg:p-6 
            shadow-sm border-transparent flex flex-col justify-center items-center text-center
            hover:-translate-y-1 hover:shadow-md transition-all duration-300 group
            ${large ? 'col-span-2 md:col-span-1 lg:col-span-2' : 'col-span-1'}
            min-h-[160px] relative overflow-hidden
          `}
        >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm bg-white dark:bg-white/5 mb-4`}>
                {React.cloneElement(icon, { size: 22 })}
            </div>
            <div className="mt-2">
                <span className="font-black text-lg block mb-0.5 group-hover:scale-105 transition-transform" style={{color: 'currentColor'}}>{title}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{subtitle}</span>
            </div>
        </button>
    );
};

export default HealthDashboard;
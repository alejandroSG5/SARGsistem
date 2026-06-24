import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Leaf, Droplet, Wind, Recycle, 
  ChevronRight, Volume2, TreePine, Globe, Activity, BookOpen, Clock
} from 'lucide-react';
import { ModuleData, TopicData } from '../../types';
import EnvToolsSection from './EnvToolsSection';
import TopicDetail from '../TopicDetail';

interface EnvironmentDashboardProps {
  moduleData: ModuleData;
  onBack: () => void;
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

const EnvironmentDashboard: React.FC<EnvironmentDashboardProps> = ({ moduleData, onBack }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'tools' | 'topic'>('dashboard');
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null);
  const [toolType, setToolType] = useState<'water' | 'noise' | 'eco' | 'climate' | 'recycling' | 'solar' | 'air' | 'impact'>('water');
  const [visibleCounts, setVisibleCounts] = useState<{[key: number]: number}>({});
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

  const handleLoadMore = (idx: number) => {
      setVisibleCounts(prev => ({
          ...prev,
          [idx]: (prev[idx] || 20) + 20
      }));
  };

  const handleTopicSelect = (topic: TopicData) => {
    setSelectedTopic(topic);
    setCurrentView('topic');
  };

  const handleToolSelect = (type: 'water' | 'noise' | 'eco') => {
    setToolType(type);
    setCurrentView('tools');
  };

  const renderDashboard = () => (
    <div className="animate-in slide-in-from-right-4 duration-500 min-h-screen bg-emerald-50/30 dark:bg-[#050c08] font-sans pb-32">
      
      {/* HERO HEADER - Vibrant Cohesive */}
      <div className="bg-emerald-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-white p-8 lg:p-16 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <button onClick={onBack} className="absolute left-8 top-8 p-3 bg-white dark:bg-[#2a2a2a] shadow-sm hover:scale-105 rounded-full transition-transform">
            <ArrowLeft size={20} />
        </button>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
           <div className="w-16 h-16 relative mb-4">
               <Leaf className="text-teal-500 absolute w-full h-full animate-bounce drop-shadow-sm" strokeWidth={1} />
           </div>
           
           <h2 className="text-4xl lg:text-6xl font-black tracking-tighter flex justify-center gap-2 mb-2 drop-shadow-sm">
                <span className="text-blue-500">S</span>
                <span className="text-rose-500">A</span>
                <span className="text-amber-500">R</span>
                <span className="text-emerald-500">G</span>
           </h2>
           <h1 className="text-2xl lg:text-4xl font-black mb-4 uppercase tracking-widest text-teal-500">
                AMBIENTE
           </h1>
        </div>
      </div>

      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-12 lg:space-y-16 mt-4 lg:mt-8">
        
        {/* TOOLS BENTO GRID */}
        <div>
           <div className="flex items-center gap-3 mb-6 px-2">
             <Activity size={20} className="text-gray-400" />
             <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">
                Kit de Campo Digital
             </h3>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <ToolCard icon={<Globe />} color="cyan" title="Clima Local" subtitle="Predicción" onClick={() => handleToolSelect('eco')} large={true} />
              <ToolCard icon={<Droplet />} color="blue" title="Agua" subtitle="Calidad/Ahorro" onClick={() => handleToolSelect('water')} />
              <ToolCard icon={<Recycle />} color="green" title="Reciclaje" subtitle="Guía/Puntos" onClick={() => handleToolSelect('eco')} />
              <ToolCard icon={<Activity />} color="orange" title="Sonómetro" subtitle="Ruido" onClick={() => handleToolSelect('noise')} />
           </div>
        </div>

        {/* LIBRARY & PROGRESS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           
           {/* LEFT: PROGRESS TRACKING */}
           <div className="col-span-1 bg-white dark:bg-[#121b16] rounded-[2rem] p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/30 flex flex-col items-center justify-center text-center max-h-[300px] relative lg:sticky lg:top-8 group hover:-translate-y-1 transition-transform duration-300">
              <div className="flex items-center gap-2 mb-6">
                  <Clock size={18} className="text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-emerald-600 dark:text-emerald-400 text-sm font-black uppercase tracking-widest">Tiempo de Lectura</h3>
              </div>
              <div className="relative w-32 h-32 mb-4">
                  {/* Inner glowing pulse */}
                  <div className="absolute inset-2 bg-emerald-500/10 rounded-full animate-pulse group-hover:bg-emerald-500/20 transition-colors"></div>
                  
                  <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-emerald-50 dark:text-emerald-900/20" />
                      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - ((readingTime % 3600) / 3600) * 251.2} className="text-emerald-500 transition-all duration-1000" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                      <span className="text-2xl md:text-3xl font-black text-emerald-600 dark:text-emerald-400 drop-shadow-sm">{formatTime(readingTime)}</span>
                  </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Tiempo Invertido en {moduleData.title}</p>
           </div>

           {/* RIGHT: BOOKSHELF */}
           <div className="col-span-1 lg:col-span-3">
               <div className="flex items-center gap-3 mb-6 px-2">
                 <BookOpen size={20} className="text-emerald-600 dark:text-emerald-400" />
                 <h3 className="text-emerald-700 dark:text-emerald-400 text-sm font-black uppercase tracking-widest">
                    Biblioteca Ambiental
                 </h3>
               </div>

               <div className="space-y-8">
                  {moduleData.subModules.map((sub, idx) => {
                    const currentLimit = visibleCounts[idx] || 20;
                    const visibleItems = sub.items.slice(0, currentLimit);
                    const hasMore = sub.items.length > currentLimit;

                    return (
                    <div key={idx} className="bg-emerald-100/50 dark:bg-[#0c1813] rounded-3xl p-6 shadow-inner border border-emerald-200/50 dark:border-emerald-900/40">
                        <h3 className="font-black text-xl text-emerald-900 dark:text-emerald-100 mb-6 border-b-4 border-emerald-200 dark:border-emerald-900/50 pb-2 inline-block">{sub.categoryName}</h3>
                        
                        {/* Bookshelf Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
                          {visibleItems.map((item, i) => (
                            <button
                              key={item.id}
                              onClick={() => handleTopicSelect(item)}
                              className="group relative flex flex-col items-center"
                            >
                                {/* The Book Spine/Cover */}
                                <div className="w-full aspect-[2/3] rounded-r-xl rounded-l-md shadow-md bg-emerald-500 dark:bg-emerald-600 border-l-4 border-emerald-700 dark:border-emerald-800 flex items-center justify-center p-3 hover:-translate-y-4 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
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
                                    className="px-6 py-2 bg-emerald-200 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full font-bold text-sm hover:bg-emerald-300 dark:hover:bg-emerald-800/50 transition-colors"
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
    return <TopicDetail topicData={selectedTopic} categoryTitle="Ambiente" onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'tools') {
    return <EnvToolsSection type={toolType} onBack={() => setCurrentView('dashboard')} />;
  }

  return renderDashboard();
};

const ToolCard = ({ icon, color, title, desc, onClick }: any) => {
    const colorStyles: any = {
        cyan: 'bg-cyan-50 text-cyan-500 dark:bg-[#1a1a1a] dark:text-cyan-400',
        orange: 'bg-orange-50 text-orange-500 dark:bg-[#1a1a1a] dark:text-orange-400',
        purple: 'bg-purple-50 text-purple-500 dark:bg-[#1a1a1a] dark:text-purple-400',
    };

    return (
        <button 
          onClick={onClick}
          className={`
            ${colorStyles[color]} rounded-[2rem] p-5 lg:p-6 
            shadow-sm border-transparent flex flex-col justify-center items-center text-center
            hover:-translate-y-1 hover:shadow-md transition-all duration-300 group
            min-h-[160px] relative overflow-hidden
          `}
        >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm bg-white dark:bg-white/5 mb-4`}>
                {React.cloneElement(icon, { size: 22 })}
            </div>
            <div className="mt-2">
                <span className="font-black text-lg block mb-0.5 group-hover:scale-105 transition-transform" style={{color: 'currentColor'}}>{title}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{desc}</span>
            </div>
        </button>
    );
};

export default EnvironmentDashboard;

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Sprout, Calendar, FlaskConical, 
  Stethoscope, Search, Camera, Upload, CheckCircle,
  ChevronRight, Tractor, Leaf, Activity, AlertTriangle, Loader2, CloudRain,
  Bug, BarChart3, Globe, BookOpen, Clock
} from 'lucide-react';
import { ModuleData, TopicData } from '../../types';
import TopicDetail from '../TopicDetail';
import { diagnoseCrop } from '../../services/geminiService';
import AgroPlanner from './AgroPlanner';
import VetAI from './VetAI';
import BioLab from './BioLab';
import AgroSensors from './AgroSensors';
import AgroIrrigation from './AgroIrrigation';
import AgroMarket from './AgroMarket';
import AgroCommunity from './AgroCommunity';

interface AgroDashboardProps {
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

// --- CROP DOCTOR ---
const CropDoctor = ({ onBack }: { onBack: () => void }) => {
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState<any>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (end) => {
                if (end.target?.result) setImage(end.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const analyze = async () => {
        if (!image) return;
        setLoading(true);
        setDiagnosis(null);
        
        try {
            const result = await diagnoseCrop(image);
            if (result) {
                setDiagnosis(result);
            } else {
                setDiagnosis({
                    diagnosis: "No se pudo identificar",
                    confidence: 0,
                    symptoms: ["Imagen no clara o error de análisis"],
                    treatment_organic: "Intente subir una foto más clara del daño.",
                    prevention: "Verifique su conexión."
                });
            }
        } catch (e) {
            setDiagnosis({
                diagnosis: "Error de Conexión",
                confidence: 0,
                symptoms: [],
                treatment_organic: "Revise su red.",
                prevention: ""
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full bg-[#fbfbfb] dark:bg-[#121212] p-4 md:p-8 overflow-y-auto animate-in fade-in">
            <div className="max-w-5xl mx-auto pb-24">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="p-3 bg-white dark:bg-[#1e1e1e] shadow-sm rounded-full hover:scale-105 transition-transform border border-gray-100 dark:border-white/5">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                    <h2 className="text-2xl lg:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <Leaf size={28} className="text-green-500"/> Doctor de Cultivos IA
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Input Area */}
                    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                        {image ? (
                            <div className="w-full h-full flex flex-col">
                                <div className="relative flex-1 bg-gray-100 dark:bg-[#121212] rounded-xl overflow-hidden mb-4 border border-gray-200 dark:border-white/5">
                                    <img src={image} className="w-full h-full object-contain"/>
                                </div>
                                <div className="flex gap-3 w-full">
                                    <button onClick={() => { setImage(null); setDiagnosis(null); }} className="flex-1 py-3 bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-white rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-[#333] transition-colors">
                                        Borrar
                                    </button>
                                    <button onClick={analyze} disabled={loading} className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-green-600 transition-all active:scale-95 disabled:opacity-50">
                                        {loading ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>} DIAGNOSTICAR
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <Camera size={32} className="text-green-500"/>
                                </div>
                                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Sube una foto</h3>
                                <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">Foto clara de hoja, fruto o tallo afectado por plaga.</p>
                                <label className="cursor-pointer px-6 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 shadow-sm transition-transform hover:scale-105 inline-flex items-center gap-2">
                                    <Upload size={18}/> Seleccionar Archivo
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
                                </label>
                            </div>
                        )}
                    </div>

                    {/* Results Area */}
                    <div className="bg-white dark:bg-[#1e1e1e] p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 flex flex-col h-full min-h-[400px]">
                        {loading && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
                                <Loader2 size={48} className="text-green-500 animate-spin mb-4"/>
                                <p className="font-bold text-lg text-gray-700 dark:text-gray-300">Analizando...</p>
                            </div>
                        )}
                        
                        {!loading && !diagnosis && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                                <Activity size={48} className="mb-4 opacity-20"/>
                                <p className="font-medium text-sm">El diagnóstico aparecerá aquí.</p>
                            </div>
                        )}

                        {diagnosis && !loading && (
                            <div className="animate-in slide-in-from-right space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">
                                <div className="flex justify-between items-start border-b border-gray-100 dark:border-white/5 pb-4">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 leading-tight">{diagnosis.diagnosis}</h3>
                                        <div className="flex items-center gap-1.5 text-green-500 font-bold text-[10px] uppercase tracking-widest">
                                            <CheckCircle size={14}/> Confianza {diagnosis.confidence}%
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-bold text-gray-400 uppercase text-[10px] tracking-widest mb-3">Síntomas Detectados</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {diagnosis.symptoms.map((s: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-gray-50 dark:bg-white/5 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-white/5">{s}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-5 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                                    <h4 className="font-bold text-yellow-600 dark:text-yellow-500 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider"><Sprout size={16}/> Tratamiento Orgánico</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{diagnosis.treatment_organic}</p>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                    <h4 className="font-bold text-blue-600 dark:text-blue-500 mb-2 flex items-center gap-2 text-xs uppercase tracking-wider"><AlertTriangle size={16}/> Prevención</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{diagnosis.prevention}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const AgroDashboard: React.FC<AgroDashboardProps> = ({ moduleData, onBack }) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'topic' | 'soil' | 'vet' | 'planner' | 'sensors' | 'doctor' | 'irrigation' | 'market' | 'community'>('dashboard');
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null);
  const [toolType, setToolType] = useState<'doctor' | 'planner' | 'sensors' | 'crops' | 'pests' | 'irrigation' | 'market' | 'community'>('doctor');
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

  const handleToolSelect = (viewName: any) => {
    setCurrentView(viewName);
  };

  // --- RENDERERS ---
  if (currentView === 'doctor') return <CropDoctor onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'sensors') return <AgroSensors onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'irrigation') return <AgroIrrigation onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'market') return <AgroMarket onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'community') return <AgroCommunity onBack={() => setCurrentView('dashboard')} />;
  
  // Stubs for other tools that would follow the same minimalist redesign
  if (currentView === 'planner') return <AgroPlanner />;
  if (currentView === 'vet') return <VetAI />;
  if (currentView === 'soil') return <BioLab />;
  
  if (currentView === 'topic' && selectedTopic) return <TopicDetail topicData={selectedTopic} categoryTitle="Agronomía" onBack={() => setCurrentView('dashboard')} />;

  const renderDashboard = () => (
      <div className="animate-in slide-in-from-right-4 duration-500 min-h-screen bg-green-50/30 dark:bg-[#050c05] font-sans pb-32">
        
        <div className="bg-green-50 dark:bg-[#1a2a1a] text-gray-900 dark:text-white p-8 lg:p-16 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <button onClick={onBack} className="absolute left-8 top-8 p-3 bg-white dark:bg-[#2a3a2a] shadow-sm hover:scale-105 rounded-full transition-transform">
              <ArrowLeft size={20} />
          </button>
          <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
             <div className="w-16 h-16 relative mb-4">
                 <Leaf className="text-green-500 absolute w-full h-full drop-shadow-sm" strokeWidth={1} />
             </div>
             
             <h2 className="text-4xl lg:text-6xl font-black tracking-tighter flex justify-center gap-2 mb-2 drop-shadow-sm">
                  <span className="text-blue-500">S</span>
                  <span className="text-rose-500">A</span>
                  <span className="text-amber-500">R</span>
                  <span className="text-emerald-500">G</span>
             </h2>
             <h1 className="text-2xl lg:text-4xl font-black mb-4 uppercase tracking-widest text-green-500">
                  AGRONOMÍA
             </h1>
          </div>
        </div>
  
        <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-12 lg:space-y-16 mt-4 lg:mt-8">
          
          <div>
             <div className="flex items-center gap-3 mb-6 px-2">
               <Tractor size={20} className="text-gray-400" />
               <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">
                  Herramientas de Campo
               </h3>
             </div>
             
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <ToolCard icon={<Activity />} color="emerald" title="Sensores" subtitle="Clima y Suelo" onClick={() => handleToolSelect('sensors')} large={true} />
                <ToolCard icon={<Sprout />} color="green" title="Cultivos" subtitle="Planificador" onClick={() => handleToolSelect('planner')} />
                <ToolCard icon={<Bug />} color="rose" title="Plagas" subtitle="Identificador" onClick={() => handleToolSelect('doctor')} />
                <ToolCard icon={<CloudRain />} color="blue" title="Riego" subtitle="Calculadora" onClick={() => handleToolSelect('irrigation')} />
                <ToolCard icon={<BarChart3 />} color="amber" title="Mercado" subtitle="Precios" onClick={() => handleToolSelect('market')} />
                <ToolCard icon={<Globe />} color="teal" title="Comunidad" subtitle="Foro Agrícola" onClick={() => handleToolSelect('community')} />
             </div>
          </div>
  
          {/* LIBRARY & PROGRESS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
             
             {/* LEFT: PROGRESS TRACKING */}
             <div className="col-span-1 bg-white dark:bg-[#152015] rounded-[2rem] p-6 shadow-sm border border-green-100 dark:border-green-900/30 flex flex-col items-center justify-center text-center max-h-[300px] sticky top-8 group hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center gap-2 mb-6">
                    <Clock size={18} className="text-green-600 dark:text-green-400" />
                    <h3 className="text-green-600 dark:text-green-400 text-sm font-black uppercase tracking-widest">Tiempo de Lectura</h3>
                </div>
                <div className="relative w-32 h-32 mb-4">
                    {/* Inner glowing pulse */}
                    <div className="absolute inset-2 bg-green-500/10 rounded-full animate-pulse group-hover:bg-green-500/20 transition-colors"></div>
                    
                    <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-green-50 dark:text-green-900/20" />
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - ((readingTime % 3600) / 3600) * 251.2} className="text-green-500 transition-all duration-1000" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                        <span className="text-2xl md:text-3xl font-black text-green-600 dark:text-green-400 drop-shadow-sm">{formatTime(readingTime)}</span>
                    </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Tiempo Invertido en {moduleData.title}</p>
             </div>
  
             {/* RIGHT: BOOKSHELF */}
             <div className="col-span-1 lg:col-span-3">
                 <div className="flex items-center gap-3 mb-6 px-2">
                   <BookOpen size={20} className="text-green-600 dark:text-green-400" />
                   <h3 className="text-green-700 dark:text-green-400 text-sm font-black uppercase tracking-widest">
                      Biblioteca Agrícola
                   </h3>
                 </div>
  
                 <div className="space-y-8">
                    {moduleData.subModules.map((sub, idx) => {
                      const currentLimit = visibleCounts[idx] || 20;
                      const visibleItems = sub.items.slice(0, currentLimit);
                      const hasMore = sub.items.length > currentLimit;

                      return (
                      <div key={idx} className="bg-green-100/50 dark:bg-[#111f11] rounded-3xl p-6 shadow-inner border border-green-200/50 dark:border-green-900/40">
                          <h3 className="font-black text-xl text-green-900 dark:text-green-100 mb-6 border-b-4 border-green-200 dark:border-green-900/50 pb-2 inline-block">{sub.categoryName}</h3>
                          
                          {/* Bookshelf Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-4">
                            {visibleItems.map((item, i) => (
                              <button
                                key={item.id}
                                onClick={() => handleTopicSelect(item)}
                                className="group relative flex flex-col items-center"
                              >
                                  {/* The Book Spine/Cover */}
                                  <div className="w-full aspect-[2/3] rounded-r-xl rounded-l-md shadow-md bg-green-500 dark:bg-green-600 border-l-4 border-green-700 dark:border-green-800 flex items-center justify-center p-3 hover:-translate-y-4 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
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
                                      className="px-6 py-2 bg-green-200 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full font-bold text-sm hover:bg-green-300 dark:hover:bg-green-800/50 transition-colors"
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

  return renderDashboard();
};

const ToolCard = ({ icon, color, title, subtitle, onClick }: any) => {
    const colorStyles: any = {
        green: 'bg-emerald-50 text-emerald-500 dark:bg-[#1a1a1a] dark:text-emerald-400',
        purple: 'bg-purple-50 text-purple-500 dark:bg-[#1a1a1a] dark:text-purple-400',
        amber: 'bg-amber-50 text-amber-500 dark:bg-[#1a1a1a] dark:text-amber-400',
        blue: 'bg-blue-50 text-blue-500 dark:bg-[#1a1a1a] dark:text-blue-400',
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
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{subtitle}</span>
            </div>
        </button>
    );
};

export default AgroDashboard;
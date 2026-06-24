import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Filter, Info, Leaf, Droplet, 
  Thermometer, Clock, AlertTriangle, X, CheckCircle, Activity,
  ChevronRight, BookOpen, ChevronLeft
} from 'lucide-react';
import { MEDICINAL_PLANTS } from '../../constants';
import { MedicinalPlant, PreparationGuide } from '../../types';

const PlantLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'digestive' | 'respiratory' | 'nervous' | 'skin'>('all');
  const [selectedPlant, setSelectedPlant] = useState<MedicinalPlant | null>(null);
  const [preparationMode, setPreparationMode] = useState<PreparationGuide | null>(null);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Filter Logic
  const filteredPlants = useMemo(() => {
    return MEDICINAL_PLANTS.filter(p => {
      const matchesSearch = p.commonName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.uses.some(u => u.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (filterType === 'all') return matchesSearch;
      if (filterType === 'digestive') return matchesSearch && (p.uses.some(u => u.includes('estómago') || u.includes('Diarrea') || u.includes('Digestión') || u.includes('Estomacal')));
      if (filterType === 'respiratory') return matchesSearch && (p.uses.some(u => u.includes('Tos') || u.includes('Gripe') || u.includes('Asma') || u.includes('Bronquios')));
      if (filterType === 'nervous') return matchesSearch && (p.uses.some(u => u.includes('Nervios') || u.includes('Insomnio') || u.includes('Ansiedad')));
      if (filterType === 'skin') return matchesSearch && (p.uses.some(u => u.includes('Piel') || u.includes('Heridas') || u.includes('Salpullido')));
      
      return matchesSearch;
    });
  }, [searchTerm, filterType]);

  const paginatedPlants = useMemo(() => {
      const start = (page - 1) * ITEMS_PER_PAGE;
      return filteredPlants.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPlants, page]);

  const totalPages = Math.ceil(filteredPlants.length / ITEMS_PER_PAGE);

  // --- DIDACTIC PREPARATION WIZARD ---
  const PreparationWizard = ({ prep }: { prep: PreparationGuide }) => {
      const [currentStep, setCurrentStep] = useState(0);
      const [timer, setTimer] = useState(prep.timeMinutes * 60); // in seconds
      const [timerActive, setTimerActive] = useState(false);

      useEffect(() => {
          let interval: any;
          if (timerActive && timer > 0) {
              interval = setInterval(() => {
                  setTimer((prev) => prev - 1);
              }, 1000);
          } else if (timer === 0) {
              setTimerActive(false);
          }
          return () => clearInterval(interval);
      }, [timerActive, timer]);

      const formatTime = (seconds: number) => {
          const m = Math.floor(seconds / 60);
          const s = seconds % 60;
          return `${m}:${s < 10 ? '0' : ''}${s}`;
      };

      return (
          <div className="fixed inset-0 z-50 bg-green-900/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in">
              <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                  
                  {/* Decorative Background */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 dark:bg-green-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                  <button onClick={() => setPreparationMode(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"><X size={28}/></button>
                  
                  <div className="text-center mb-10 relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                          <Droplet size={40}/>
                      </div>
                      <h3 className="text-3xl font-black text-gray-800 dark:text-white mb-2 tracking-tight">Guía Didáctica</h3>
                      <p className="text-green-600 dark:text-green-400 font-bold text-xl uppercase tracking-widest">{prep.type}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-12 relative z-10">
                      <div className="flex justify-between text-sm font-bold text-gray-500 mb-3">
                          <span>PASO {currentStep + 1} DE {prep.steps.length}</span>
                          <span className="text-green-600">{Math.round(((currentStep + 1) / prep.steps.length) * 100)}%</span>
                      </div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 transition-all duration-500 ease-out" style={{ width: `${((currentStep + 1) / prep.steps.length) * 100}%` }}></div>
                      </div>
                  </div>

                  {/* Flashcard Step */}
                  <div className="min-h-[200px] flex flex-col items-center justify-center text-center bg-green-50/50 dark:bg-gray-800/50 rounded-3xl p-8 mb-10 border border-green-100 dark:border-gray-700 relative z-10">
                      <h4 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white leading-relaxed mb-6">
                          {prep.steps[currentStep]}
                      </h4>

                      {/* Interactive Timer (Only shows if there's a time mention in the step or just as a general tool) */}
                      {(prep.steps[currentStep].toLowerCase().includes('minuto') || prep.steps[currentStep].toLowerCase().includes('reposar')) && (
                          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4">
                              <Clock className="text-green-500" size={24}/>
                              <span className="text-2xl font-mono font-bold text-gray-700 dark:text-gray-200">{formatTime(timer)}</span>
                              <button 
                                onClick={() => setTimerActive(!timerActive)}
                                className={`px-4 py-2 rounded-xl font-bold text-sm ${timerActive ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-700'}`}
                              >
                                  {timerActive ? 'Pausar' : 'Iniciar Temporizador'}
                              </button>
                          </div>
                      )}
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-4 relative z-10">
                      <button 
                        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                        disabled={currentStep === 0}
                        className="flex-1 py-4 md:py-5 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold text-gray-500 disabled:opacity-50 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                      >
                          <ChevronLeft size={20}/> Anterior
                      </button>
                      <button 
                        onClick={() => {
                            if (currentStep < prep.steps.length - 1) {
                                setCurrentStep(currentStep + 1);
                                setTimer(prep.timeMinutes * 60); // reset timer for next step if needed
                                setTimerActive(false);
                            } else {
                                setPreparationMode(null);
                            }
                        }}
                        className="flex-[2] py-4 md:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                      >
                          {currentStep === prep.steps.length - 1 ? <><CheckCircle size={24}/> Finalizar Preparación</> : <>Siguiente Paso <ChevronRight size={20}/></>}
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
        {preparationMode && <PreparationWizard prep={preparationMode} />}

        {/* Header & Search */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden shrink-0">
             <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
             <div className="relative z-10">
                 <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
                     <Leaf className="fill-white" /> Herbolaria Regional ({filteredPlants.length} registradas)
                 </h2>
                 <p className="text-green-100 mb-6 font-medium">Base de datos enciclopédica de alta densidad. Sin imágenes para carga ultrarrápida.</p>
                 
                 <div className="flex gap-2">
                     <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl flex items-center px-4 py-4 border border-white/20 focus-within:bg-white/20 focus-within:border-white/40 transition-all">
                         <Search className="text-green-200 mr-3" size={24}/>
                         <input 
                            type="text" 
                            placeholder="Buscar planta, síntoma, nombre científico o indígena..." 
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                            className="w-full bg-transparent border-none outline-none text-white placeholder-green-200/70 font-bold text-lg"
                         />
                     </div>
                 </div>
             </div>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar shrink-0">
            {[
                {id: 'all', label: 'Todas'}, 
                {id: 'digestive', label: 'Digestivo'}, 
                {id: 'respiratory', label: 'Respiratorio'},
                {id: 'nervous', label: 'Nervioso'},
                {id: 'skin', label: 'Piel'}
            ].map(cat => (
                <button
                    key={cat.id}
                    onClick={() => { setFilterType(cat.id as any); setPage(1); }}
                    className={`px-6 py-2.5 rounded-full font-bold whitespace-nowrap transition-all border-2 ${filterType === cat.id ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-green-300'}`}
                >
                    {cat.label}
                </button>
            ))}
        </div>

        {/* HIGH DENSITY LIST */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-axolotl-surface rounded-[2rem] border border-gray-200 dark:border-gray-800 shadow-sm relative">
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur z-10 shadow-sm border-b border-gray-200 dark:border-gray-800">
                    <tr>
                        <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest w-1/3">Nombre Común / Científico</th>
                        <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest w-1/3">Usos Principales</th>
                        <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest w-1/4 hidden md:table-cell">Familia / Región</th>
                        <th className="p-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {paginatedPlants.map((plant, idx) => (
                        <tr key={plant.id} className="hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-colors group cursor-pointer" onClick={() => setSelectedPlant(plant)}>
                            <td className="p-4 align-top">
                                <div className="font-bold text-gray-900 dark:text-white text-lg">{plant.commonName}</div>
                                <div className="text-green-600 dark:text-green-400 italic text-sm font-serif mt-0.5">{plant.scientificName}</div>
                                {plant.indigenousName && <div className="text-xs font-bold text-orange-500 mt-1 uppercase">Lengua: {plant.indigenousName}</div>}
                            </td>
                            <td className="p-4 align-top">
                                <div className="flex flex-wrap gap-1">
                                    {plant.uses.slice(0, 4).map(use => (
                                        <span key={use} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] font-bold rounded uppercase tracking-wider">
                                            {use}
                                        </span>
                                    ))}
                                    {plant.uses.length > 4 && <span className="text-[10px] text-gray-400 font-bold px-1 py-0.5">+{plant.uses.length - 4}</span>}
                                </div>
                            </td>
                            <td className="p-4 align-top hidden md:table-cell">
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{plant.family}</div>
                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1"><Info size={12}/> {plant.region}</div>
                            </td>
                            <td className="p-4 align-top text-right">
                                <button className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 group-hover:bg-green-600 group-hover:text-white transition-colors">
                                    <ChevronRight size={20}/>
                                </button>
                            </td>
                        </tr>
                    ))}
                    {paginatedPlants.length === 0 && (
                        <tr>
                            <td colSpan={4} className="p-12 text-center text-gray-400 font-medium">
                                No se encontraron plantas que coincidan con la búsqueda.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="sticky bottom-0 bg-white/95 dark:bg-axolotl-surface/95 backdrop-blur border-t border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-500">
                        Mostrando {((page - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(page * ITEMS_PER_PAGE, filteredPlants.length)} de {filteredPlants.length}
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-lg font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 disabled:opacity-50 hover:bg-gray-200"
                        >
                            Anterior
                        </button>
                        <button 
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-lg font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 disabled:opacity-50 hover:bg-gray-200"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Detailed Modal (No Images) */}
        {selectedPlant && (
            <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
                <div className="w-full md:w-[600px] h-full bg-white dark:bg-gray-900 overflow-y-auto animate-in slide-in-from-right duration-500 shadow-2xl relative">
                    
                    <button onClick={() => setSelectedPlant(null)} className="absolute top-6 right-6 p-3 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full hover:bg-gray-200 hover:text-gray-800 transition-colors z-10"><X/></button>
                    
                    <div className="p-8 md:p-12">
                        {/* Header Text Only */}
                        <div className="mb-10 border-b border-gray-100 dark:border-gray-800 pb-8">
                            <div className="flex items-center gap-2 text-green-600 font-bold uppercase tracking-widest text-xs mb-4">
                                <Leaf size={14}/> Ficha Botánica
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 leading-tight">{selectedPlant.commonName}</h2>
                            <p className="text-green-600 dark:text-green-400 text-2xl italic font-serif mb-4">{selectedPlant.scientificName}</p>
                            
                            <div className="flex gap-4">
                                <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-xs font-bold text-gray-500 uppercase">FAM: {selectedPlant.family}</span>
                                <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded text-xs font-bold text-gray-500 uppercase">REG: {selectedPlant.region}</span>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {/* Native Name Badge */}
                            {selectedPlant.indigenousName && (
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-5 rounded-2xl border-l-4 border-orange-500 flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-black text-orange-600 uppercase tracking-widest block mb-1">Nombre en Lengua Originaria</span>
                                        <span className="text-xl font-bold text-gray-800 dark:text-white">{selectedPlant.indigenousName}</span>
                                    </div>
                                    <BookOpen className="text-orange-300" size={32}/>
                                </div>
                            )}

                            <div>
                                <h3 className="font-black text-gray-900 dark:text-white text-lg mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <Info size={18} className="text-blue-500"/> Descripción Clínica
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl">{selectedPlant.description}</p>
                            </div>

                            <div>
                                 <h3 className="font-black text-gray-900 dark:text-white text-lg mb-4 uppercase tracking-wider flex items-center gap-2">
                                     <Droplet size={18} className="text-green-500"/> Modos de Preparación
                                 </h3>
                                 {selectedPlant.preparations.length > 0 ? (
                                     <div className="grid gap-4">
                                         {selectedPlant.preparations.map((prep, i) => (
                                             <div key={i} className="bg-white dark:bg-gray-800 border-2 border-green-100 dark:border-green-900 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-green-500 transition-colors cursor-pointer group" onClick={() => setPreparationMode(prep)}>
                                                 <div>
                                                     <div className="font-black text-xl text-green-700 dark:text-green-400 mb-2">{prep.type}</div>
                                                     <div className="text-sm font-bold text-gray-500 flex flex-wrap gap-4">
                                                         <span className="flex items-center gap-1.5"><Clock size={14}/> {prep.timeMinutes} minutos</span>
                                                         <span className="flex items-center gap-1.5"><Activity size={14}/> Nivel: {prep.difficulty}</span>
                                                     </div>
                                                 </div>
                                                 <button className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 w-full md:w-auto px-6 py-3 rounded-xl text-sm font-black uppercase tracking-wider group-hover:bg-green-600 group-hover:text-white transition-colors">
                                                     Iniciar Guía Didáctica
                                                 </button>
                                             </div>
                                         ))}
                                     </div>
                                 ) : (
                                     <p className="text-gray-400 italic text-sm">No hay guías de preparación específicas disponibles para esta planta aún.</p>
                                 )}
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/10 p-6 rounded-2xl border border-red-200 dark:border-red-900/30">
                                 <h3 className="font-black text-red-700 dark:text-red-400 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                     <AlertTriangle size={18}/> Precauciones Toxicológicas
                                 </h3>
                                 <p className="text-red-800 dark:text-red-200 font-medium leading-relaxed">{selectedPlant.warnings}</p>
                            </div>

                            {selectedPlant.activeCompounds && (
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Compuestos Activos Identificados</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPlant.activeCompounds.map(c => (
                                            <span key={c} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-lg border border-blue-100 dark:border-blue-800/50">
                                                {c}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default PlantLibrary;

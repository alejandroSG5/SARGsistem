
import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, Sprout, Plus, Trash2, 
  CheckCircle, Droplet, Sun, Wind, AlertCircle, 
  ChevronRight, Clock, Tractor, Leaf
} from 'lucide-react';
import { CROP_DB } from '../../constants';
import { CropData } from '../../types';

interface ActiveCrop {
    id: string;
    cropId: string;
    name: string;
    plantingDate: number; // timestamp
    harvestDate: number; // timestamp
    status: 'growing' | 'ready' | 'harvested';
    tasks: CropTask[];
}

interface CropTask {
    id: string;
    title: string;
    date: number;
    completed: boolean;
    type: 'water' | 'fertilize' | 'check' | 'harvest';
}

const AgroPlanner: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'new'>('overview');
    const [myCrops, setMyCrops] = useState<ActiveCrop[]>([]);
    
    // New Crop Form
    const [selectedCropId, setSelectedCropId] = useState<string>('');
    const [plotName, setPlotName] = useState('');
    const [plantingDate, setPlantingDate] = useState(new Date().toISOString().split('T')[0]);

    // --- UTILS ---
    const parseHarvestDays = (str: string): number => {
        const match = str.match(/(\d+)/);
        return match ? parseInt(match[0]) : 90; // Default 90 days
    };

    const calculateTasks = (startDate: number, days: number): CropTask[] => {
        const tasks: CropTask[] = [];
        const add = (offset: number, title: string, type: any) => {
            tasks.push({
                id: `t_${Date.now()}_${offset}`,
                title,
                date: startDate + (offset * 24 * 60 * 60 * 1000),
                completed: false,
                type
            });
        };

        add(0, "Siembra y Riego Inicial", 'water');
        add(3, "Revisión de Germinación", 'check');
        add(15, "Primer Abonado Orgánico", 'fertilize');
        
        // Weekly watering
        for(let i=7; i<days; i+=7) {
            add(i, "Riego Semanal", 'water');
        }
        
        // Mid-cycle checks
        add(Math.floor(days/2), "Revisión de Plagas", 'check');
        add(days-7, "Preparación de Cosecha", 'check');
        add(days, "¡Día de Cosecha!", 'harvest');

        return tasks;
    };

    const handleAddCrop = () => {
        if (!selectedCropId || !plotName) return;
        
        const cropInfo = CROP_DB.find(c => c.id === selectedCropId);
        if (!cropInfo) return;

        const days = parseHarvestDays(cropInfo.harvestTime);
        const start = new Date(plantingDate).getTime();
        const end = start + (days * 24 * 60 * 60 * 1000);

        const newCrop: ActiveCrop = {
            id: Date.now().toString(),
            cropId: selectedCropId,
            name: plotName,
            plantingDate: start,
            harvestDate: end,
            status: 'growing',
            tasks: calculateTasks(start, days)
        };

        setMyCrops([...myCrops, newCrop]);
        setPlotName('');
        setSelectedCropId('');
        setActiveTab('overview');
    };

    const toggleTask = (cropId: string, taskId: string) => {
        setMyCrops(prev => prev.map(crop => {
            if (crop.id !== cropId) return crop;
            return {
                ...crop,
                tasks: crop.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
            };
        }));
    };

    const deleteCrop = (id: string) => {
        if(confirm("¿Eliminar este cultivo y su historial?")) {
            setMyCrops(prev => prev.filter(c => c.id !== id));
        }
    };

    // --- VIEWS ---

    const OverviewView = () => (
        <div className="space-y-6 animate-in slide-in-from-right">
            {myCrops.length === 0 ? (
                <div className="text-center py-20 bg-gray-100 dark:bg-gray-800 rounded-[2rem] border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <Sprout size={64} className="mx-auto text-green-500 mb-4 opacity-50" />
                    <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-300 mb-2">No hay cultivos activos</h3>
                    <p className="text-gray-500 mb-6">Comienza planificando tu primera siembra.</p>
                    <button onClick={() => setActiveTab('new')} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-500 transition-transform active:scale-95">
                        Iniciar Cultivo
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {myCrops.map(crop => {
                        const cropInfo = CROP_DB.find(c => c.id === crop.cropId);
                        const totalDuration = crop.harvestDate - crop.plantingDate;
                        const elapsed = Date.now() - crop.plantingDate;
                        const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
                        const daysLeft = Math.ceil((crop.harvestDate - Date.now()) / (1000 * 60 * 60 * 24));
                        const nextTask = crop.tasks.find(t => !t.completed && t.date >= Date.now());

                        return (
                            <div key={crop.id} className="bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-lg border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6">
                                    <button onClick={() => deleteCrop(crop.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div className="flex gap-4 mb-6">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-md bg-gray-200">
                                        <img src={cropInfo?.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase rounded-full mb-2 inline-block">
                                            {cropInfo?.name}
                                        </span>
                                        <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-none mb-1">{crop.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">Cosecha: {new Date(crop.harvestDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="mb-6">
                                    <div className="flex justify-between text-xs font-bold mb-2">
                                        <span className="text-green-600">{progress.toFixed(0)}% Completado</span>
                                        <span className={daysLeft < 0 ? "text-red-500" : "text-gray-500"}>
                                            {daysLeft < 0 ? "¡Listo para cosecha!" : `${daysLeft} días restantes`}
                                        </span>
                                    </div>
                                    <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>

                                {/* Next Task */}
                                {nextTask ? (
                                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg text-orange-600 dark:text-orange-200">
                                                <Clock size={18} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase">Próxima Tarea</div>
                                                <div className="font-bold text-gray-800 dark:text-white">{nextTask.title}</div>
                                                <div className="text-xs text-gray-500">{new Date(nextTask.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => toggleTask(crop.id, nextTask.id)}
                                            className="w-10 h-10 rounded-full border-2 border-orange-300 flex items-center justify-center hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all"
                                        >
                                            <CheckCircle size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center text-green-700 font-bold text-sm">
                                        ¡Todo al día!
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const CalendarView = () => {
        // Flatten all tasks
        const allTasks = myCrops.flatMap(c => c.tasks.map(t => ({ ...t, cropName: c.name, cropId: c.id })))
            .sort((a, b) => a.date - b.date);
        
        const upcoming = allTasks.filter(t => t.date >= Date.now() - 86400000); // From yesterday onwards

        return (
            <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 h-full overflow-y-auto custom-scrollbar animate-in slide-in-from-right">
                <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                    <CalendarIcon className="text-green-600"/> Calendario de Labores
                </h3>
                
                {upcoming.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">No hay tareas programadas.</p>
                ) : (
                    <div className="space-y-4">
                        {upcoming.map(task => (
                            <div key={task.id} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${task.completed ? 'bg-gray-50 dark:bg-gray-800 opacity-60' : 'bg-white dark:bg-black border-l-4 border-green-500 shadow-sm'}`}>
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <span className="text-xs font-bold uppercase text-green-600 tracking-wider mb-1">{task.cropName}</span>
                                        <span className="text-xs font-bold text-gray-400">{new Date(task.date).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className={`font-bold text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-white'}`}>{task.title}</h4>
                                </div>
                                <button 
                                    onClick={() => toggleTask(task.cropId, task.id)}
                                    className={`p-3 rounded-xl transition-all ${task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-green-500 hover:text-white'}`}
                                >
                                    <CheckCircle size={24} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const NewCropView = () => (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-right">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-green-100 dark:border-green-900">
                <h3 className="text-3xl font-black text-green-800 dark:text-green-400 mb-8 flex items-center gap-3">
                    <Plus size={32} className="bg-green-100 p-1 rounded-lg"/> Nueva Siembra
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 uppercase mb-2">1. Selecciona Cultivo</label>
                        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1">
                            {CROP_DB.map(crop => (
                                <button
                                    key={crop.id}
                                    onClick={() => setSelectedCropId(crop.id)}
                                    className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${selectedCropId === crop.id ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-transparent bg-gray-50 dark:bg-gray-900 hover:bg-gray-100'}`}
                                >
                                    <img src={crop.image} className="w-10 h-10 rounded-lg object-cover" />
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-white text-sm">{crop.name}</div>
                                        <div className="text-[10px] text-gray-500">{crop.harvestTime}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-500 uppercase mb-2">2. Nombre del Lote / Parcela</label>
                            <input 
                                value={plotName}
                                onChange={e => setPlotName(e.target.value)}
                                placeholder="Ej: Parcela Norte"
                                className="w-full p-4 bg-gray-100 dark:bg-gray-900 rounded-xl font-bold outline-none focus:ring-2 ring-green-500 text-gray-800 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 uppercase mb-2">3. Fecha de Siembra</label>
                            <input 
                                type="date"
                                value={plantingDate}
                                onChange={e => setPlantingDate(e.target.value)}
                                className="w-full p-4 bg-gray-100 dark:bg-gray-900 rounded-xl font-bold outline-none focus:ring-2 ring-green-500 text-gray-800 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={handleAddCrop}
                        disabled={!selectedCropId || !plotName}
                        className="px-10 py-4 bg-green-600 text-white rounded-2xl font-black text-xl shadow-lg hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Tractor /> CREAR PLAN
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col p-4 md:p-8 bg-green-50/50 dark:bg-black overflow-hidden">
            {/* Nav */}
            <div className="flex justify-center mb-8">
                <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm flex gap-2 border border-gray-200 dark:border-gray-700">
                    {[
                        {id: 'overview', label: 'Mis Cultivos', icon: <Leaf size={18}/>},
                        {id: 'calendar', label: 'Calendario', icon: <CalendarIcon size={18}/>},
                        {id: 'new', label: 'Nueva Siembra', icon: <Plus size={18}/>}
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-20">
                {activeTab === 'overview' && <OverviewView />}
                {activeTab === 'calendar' && <CalendarView />}
                {activeTab === 'new' && <NewCropView />}
            </div>
        </div>
    );
};

export default AgroPlanner;

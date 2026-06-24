
import React, { useState } from 'react';
import { 
  Stethoscope, Camera, Upload, Search, Loader2, AlertTriangle, 
  CheckCircle, Clipboard, Plus, Heart, Calendar, FileText,
  Shield, Activity, ChevronRight, Siren, X
} from 'lucide-react';
import { diagnoseLivestock } from '../../services/geminiService';

// --- TYPES ---
interface AnimalProfile {
    id: string;
    name: string;
    species: 'Bovino' | 'Porcino' | 'Avícola' | 'Ovino' | 'Equino';
    breed: string;
    age: string;
    weight: string;
    vaccines: { name: string, date: string }[];
    history: string[];
    image?: string;
}

const MOCK_ANIMALS: AnimalProfile[] = [
    { 
        id: '1', name: 'Lola', species: 'Bovino', breed: 'Holstein', age: '3 años', weight: '450kg', 
        vaccines: [{name: 'Carbunco', date: '2023-10-10'}], history: ['Parto difícil 2022'] 
    },
    { 
        id: '2', name: 'Benito', species: 'Porcino', breed: 'Landrace', age: '8 meses', weight: '90kg', 
        vaccines: [{name: 'Peste Porcina', date: '2024-01-15'}], history: [] 
    }
];

const VetAI: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'diagnosis' | 'records' | 'triage' | 'protocols'>('diagnosis');
    
    // Diagnosis State
    const [image, setImage] = useState<string | null>(null);
    const [diagnosis, setDiagnosis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Records State
    const [animals, setAnimals] = useState<AnimalProfile[]>(MOCK_ANIMALS);
    const [showAddAnimal, setShowAddAnimal] = useState(false);
    const [newAnimal, setNewAnimal] = useState<Partial<AnimalProfile>>({});

    // --- DIAGNOSIS LOGIC ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (end) => { if (end.target?.result) setImage(end.target.result as string); };
            reader.readAsDataURL(file);
        }
    };

    const runDiagnosis = async () => {
        if (!image) return;
        setLoading(true);
        const result = await diagnoseLivestock(image);
        setDiagnosis(result || {
            species: "Desconocido", condition: "Error de análisis", urgency: "Baja",
            observations: ["Intente de nuevo con otra foto"], treatment_first_aid: "", recommendation: "", contagious: false
        });
        setLoading(false);
    };

    // --- RECORDS LOGIC ---
    const handleAddAnimal = () => {
        if (newAnimal.name && newAnimal.species) {
            const animal: AnimalProfile = {
                id: Date.now().toString(),
                name: newAnimal.name,
                species: newAnimal.species as any,
                breed: newAnimal.breed || 'Criollo',
                age: newAnimal.age || 'Desconocida',
                weight: newAnimal.weight || '-',
                vaccines: [],
                history: []
            };
            setAnimals([...animals, animal]);
            setShowAddAnimal(false);
            setNewAnimal({});
        }
    };

    // --- RENDERERS ---

    const DiagnosisView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-lg border-2 border-dashed border-blue-300 dark:border-blue-700 flex flex-col items-center justify-center relative overflow-hidden">
                {image ? (
                    <div className="w-full h-full flex flex-col">
                        <div className="relative flex-1 bg-black rounded-xl overflow-hidden mb-4">
                            <img src={image} className="w-full h-full object-contain"/>
                        </div>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => { setImage(null); setDiagnosis(null); }} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-bold">Borrar</button>
                            <button onClick={runDiagnosis} disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-blue-500 disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin"/> : <Stethoscope size={20}/>} EXAMINAR
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8">
                        <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Camera size={40} className="text-blue-600"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Diagnóstico Visual</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Sube una foto del animal (ojo, pezuña, piel o postura) para detectar anomalías.</p>
                        <label className="cursor-pointer px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-2">
                            <Upload size={20}/> Subir Foto
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
                        </label>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-blue-100 dark:border-blue-900 flex flex-col overflow-y-auto custom-scrollbar">
                {diagnosis ? (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div>
                                <span className="text-xs font-black uppercase tracking-widest text-blue-500">{diagnosis.species}</span>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none mt-1">{diagnosis.condition}</h3>
                            </div>
                            <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${diagnosis.urgency === 'Alta' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-600'}`}>
                                {diagnosis.urgency}
                            </span>
                        </div>

                        <div>
                            <h4 className="font-bold text-gray-500 uppercase text-xs tracking-widest mb-3">Observaciones</h4>
                            <div className="flex flex-wrap gap-2">
                                {diagnosis.observations.map((obs: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200">{obs}</span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border-l-4 border-blue-500">
                            <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><Activity size={18}/> Primeros Auxilios</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{diagnosis.treatment_first_aid}</p>
                        </div>

                        {diagnosis.contagious && (
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300">
                                <AlertTriangle size={24} className="shrink-0"/>
                                <div>
                                    <h4 className="font-bold text-sm uppercase">Riesgo de Contagio</h4>
                                    <p className="text-xs">Aísle al animal inmediatamente del resto del rebaño.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                        <Stethoscope size={64} className="mb-4 opacity-20"/>
                        <p>Esperando análisis...</p>
                    </div>
                )}
            </div>
        </div>
    );

    const RecordsView = () => (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-gray-800 dark:text-white">Mi Ganado</h3>
                <button onClick={() => setShowAddAnimal(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg flex items-center gap-2 hover:bg-blue-500">
                    <Plus size={20}/> Nuevo Animal
                </button>
            </div>

            {showAddAnimal && (
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-200 dark:border-blue-800 animate-in slide-in-from-top">
                    <h4 className="font-bold mb-4 text-blue-800 dark:text-blue-300">Registrar Animal</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <input placeholder="Nombre / ID" className="p-3 rounded-xl bg-white dark:bg-black outline-none" value={newAnimal.name || ''} onChange={e => setNewAnimal({...newAnimal, name: e.target.value})} />
                        <select className="p-3 rounded-xl bg-white dark:bg-black outline-none" value={newAnimal.species || ''} onChange={e => setNewAnimal({...newAnimal, species: e.target.value as any})}>
                            <option value="">Especie</option>
                            <option value="Bovino">Bovino (Vaca/Toro)</option>
                            <option value="Porcino">Porcino (Cerdo)</option>
                            <option value="Avícola">Avícola (Pollo)</option>
                            <option value="Ovino">Ovino (Borrego)</option>
                        </select>
                        <input placeholder="Raza" className="p-3 rounded-xl bg-white dark:bg-black outline-none" value={newAnimal.breed || ''} onChange={e => setNewAnimal({...newAnimal, breed: e.target.value})} />
                        <input placeholder="Peso Aprox." className="p-3 rounded-xl bg-white dark:bg-black outline-none" value={newAnimal.weight || ''} onChange={e => setNewAnimal({...newAnimal, weight: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setShowAddAnimal(false)} className="px-4 py-2 text-gray-500 font-bold">Cancelar</button>
                        <button onClick={handleAddAnimal} className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Guardar</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-20 custom-scrollbar">
                {animals.map(animal => (
                    <div key={animal.id} className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 group hover:shadow-xl transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${animal.species === 'Bovino' ? 'bg-blue-100' : animal.species === 'Porcino' ? 'bg-pink-100' : 'bg-yellow-100'}`}>
                                {animal.species === 'Bovino' ? '🐮' : animal.species === 'Porcino' ? '🐷' : animal.species === 'Avícola' ? '🐔' : '🐑'}
                            </div>
                            <button className="text-gray-300 hover:text-blue-500"><FileText size={20}/></button>
                        </div>
                        <h4 className="text-xl font-black text-gray-900 dark:text-white">{animal.name}</h4>
                        <p className="text-sm text-gray-500 font-medium mb-4">{animal.breed} • {animal.age} • {animal.weight}</p>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-xl text-xs space-y-1">
                            <div className="font-bold text-gray-400 uppercase tracking-wider mb-1">Última Vacuna</div>
                            {animal.vaccines.length > 0 ? (
                                <div className="flex justify-between text-gray-700 dark:text-gray-300">
                                    <span>{animal.vaccines[0].name}</span>
                                    <span>{animal.vaccines[0].date}</span>
                                </div>
                            ) : <span className="text-red-400 italic">Sin registro</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const EmergencyView = () => (
        <div className="h-full overflow-y-auto custom-scrollbar p-2">
            <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-[2rem] mb-8 border border-red-200 dark:border-red-800">
                <h3 className="text-2xl font-black text-red-700 dark:text-red-400 flex items-center gap-3 mb-2"><Siren size={32}/> Protocolos de Emergencia</h3>
                <p className="text-red-600 dark:text-red-300">Guías rápidas para situaciones críticas sin veterinario presente.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    {title: 'Parto Distócico (Difícil)', icon: '🐮', steps: ['Lavar zona perineal', 'Verificar posición (manos y cabeza)', 'Usar guantes lubricados', 'Tracción suave sincronizada con contracción']},
                    {title: 'Timpanismo (Hinchazón)', icon: '🎈', steps: ['Pasar sonda esofágica para liberar gas', 'Administrar aceite mineral', 'En caso extremo: Trocar en ijar izquierdo']},
                    {title: 'Fractura de Pata', icon: '🦴', steps: ['Inmovilizar articulación superior e inferior', 'Usar tablillas acolchadas', 'Aislar animal', 'Controlar dolor (si hay medicación)']},
                    {title: 'Hipotermia en Crías', icon: '❄️', steps: ['Secar inmediatamente', 'Suministrar calostro tibio (antes de 2h)', 'Fuente de calor externa (lámpara/bolsas)']}
                ].map((proto, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-3xl">{proto.icon}</span>
                            <h4 className="font-bold text-lg text-gray-800 dark:text-white">{proto.title}</h4>
                        </div>
                        <ul className="space-y-2">
                            {proto.steps.map((step, k) => (
                                <li key={k} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">{k+1}</div>
                                    {step}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            {/* Header Tabs */}
            <div className="bg-white dark:bg-black p-4 border-b border-gray-200 dark:border-gray-800 flex overflow-x-auto gap-2 sticky top-0 z-20">
                <button onClick={() => setActiveTab('diagnosis')} className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'diagnosis' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <Camera size={18}/> Diagnóstico IA
                </button>
                <button onClick={() => setActiveTab('records')} className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'records' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <Clipboard size={18}/> Registros
                </button>
                <button onClick={() => setActiveTab('protocols')} className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'protocols' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <Shield size={18}/> Emergencias
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 md:p-8 overflow-hidden">
                {activeTab === 'diagnosis' && <DiagnosisView />}
                {activeTab === 'records' && <RecordsView />}
                {activeTab === 'protocols' && <EmergencyView />}
            </div>
        </div>
    );
};

export default VetAI;

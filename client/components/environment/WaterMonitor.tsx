
import React, { useState } from 'react';
import { Droplet, Plus, Save, Trash2, AlertTriangle, Check, History } from 'lucide-react';

interface WaterLog {
    id: string;
    sourceName: string;
    date: number;
    ph: number; // 0-14
    turbidity: 'Clara' | 'Leve' | 'Turbia' | 'Muy Sucia';
    smell: 'Sin Olor' | 'Tierra' | 'Huevo Podrido' | 'Químico';
}

const WaterMonitor: React.FC = () => {
    const [logs, setLogs] = useState<WaterLog[]>([
        { id: '1', sourceName: 'Río Principal', date: Date.now() - 86400000, ph: 7.2, turbidity: 'Leve', smell: 'Tierra' }
    ]);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form State
    const [newName, setNewName] = useState('');
    const [newPh, setNewPh] = useState(7);
    const [newTurb, setNewTurb] = useState('Clara');
    const [newSmell, setNewSmell] = useState('Sin Olor');

    const handleSave = () => {
        if (!newName) return;
        const newLog: WaterLog = {
            id: Date.now().toString(),
            sourceName: newName,
            date: Date.now(),
            ph: newPh,
            turbidity: newTurb as any,
            smell: newSmell as any
        };
        setLogs([newLog, ...logs]);
        setIsAdding(false);
        setNewName('');
    };

    const getStatusColor = (log: WaterLog) => {
        if (log.turbidity === 'Muy Sucia' || log.smell === 'Químico' || log.ph < 6 || log.ph > 8.5) return 'bg-red-100 text-red-700 border-red-200';
        if (log.turbidity === 'Turbia' || log.smell === 'Huevo Podrido') return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-green-50 text-green-700 border-green-200';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white">Bitácora de Agua</h2>
                    <p className="text-gray-500">Monitorea la salud de tus fuentes hídricas.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="px-6 py-3 bg-cyan-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-cyan-700 shadow-lg"
                >
                    <Plus size={20} /> Nueva Entrada
                </button>
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-xl border border-cyan-100 dark:border-cyan-900 animate-in slide-in-from-top">
                    <h3 className="font-bold text-lg mb-4">Registrar Muestra</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Fuente</label>
                            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ej: Pozo Comunitario" className="w-full p-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold outline-none" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">pH (Acidez)</label>
                            <div className="flex items-center gap-4">
                                <input type="range" min="0" max="14" step="0.1" value={newPh} onChange={e => setNewPh(parseFloat(e.target.value))} className="flex-1" />
                                <span className="font-mono font-bold text-xl">{newPh}</span>
                            </div>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Turbidez (Claridad)</label>
                             <div className="flex gap-2">
                                 {['Clara', 'Leve', 'Turbia', 'Muy Sucia'].map(t => (
                                     <button key={t} onClick={() => setNewTurb(t)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${newTurb === t ? 'bg-cyan-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{t}</button>
                                 ))}
                             </div>
                        </div>
                        <div>
                             <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Olor</label>
                             <div className="flex gap-2">
                                 {['Sin Olor', 'Tierra', 'Huevo Podrido', 'Químico'].map(t => (
                                     <button key={t} onClick={() => setNewSmell(t)} className={`flex-1 py-2 rounded-lg text-xs font-bold ${newSmell === t ? 'bg-cyan-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{t}</button>
                                 ))}
                             </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsAdding(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Cancelar</button>
                        <button onClick={handleSave} className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold shadow-lg hover:bg-cyan-700">Guardar Registro</button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {logs.map(log => (
                    <div key={log.id} className={`p-6 rounded-3xl border ${getStatusColor(log)} flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm`}>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="w-12 h-12 bg-white/50 rounded-2xl flex items-center justify-center shrink-0">
                                <Droplet size={24} className="opacity-80" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">{log.sourceName}</h4>
                                <p className="text-xs opacity-70 font-bold uppercase">{new Date(log.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-6 w-full md:w-auto justify-around bg-white/30 p-3 rounded-xl">
                            <div className="text-center">
                                <div className="text-[10px] font-black uppercase opacity-60">pH</div>
                                <div className="font-black text-xl">{log.ph}</div>
                            </div>
                            <div className="w-px bg-current opacity-20"></div>
                            <div className="text-center">
                                <div className="text-[10px] font-black uppercase opacity-60">Turbidez</div>
                                <div className="font-bold">{log.turbidity}</div>
                            </div>
                            <div className="w-px bg-current opacity-20"></div>
                            <div className="text-center">
                                <div className="text-[10px] font-black uppercase opacity-60">Olor</div>
                                <div className="font-bold">{log.smell}</div>
                            </div>
                        </div>

                        {(log.turbidity === 'Muy Sucia' || log.ph < 6) && (
                            <div className="flex items-center gap-2 text-xs font-bold bg-white/50 px-3 py-1 rounded-full">
                                <AlertTriangle size={14} /> NO BEBER
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WaterMonitor;

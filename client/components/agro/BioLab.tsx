
import React, { useState } from 'react';
import { 
  FlaskConical, Camera, Droplet, Upload, Search, Loader2, 
  Activity, Thermometer, Leaf, Info, CheckCircle, X, 
  Calculator, Sprout, Microscope, Layers
} from 'lucide-react';
import { analyzeSoil } from '../../services/geminiService';

const BioLab: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'soil-scan' | 'npk-calc' | 'microscope'>('soil-scan');

    // SOIL SCAN STATE
    const [image, setImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // NPK STATE
    const [area, setArea] = useState(1); // Hectares
    const [cropType, setCropType] = useState('Maíz');
    const [deficiency, setDeficiency] = useState<'N' | 'P' | 'K' | 'None'>('N');
    
    // --- SOIL SCAN LOGIC ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (end) => { if (end.target?.result) setImage(end.target.result as string); };
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        if (!image) return;
        setLoading(true);
        const result = await analyzeSoil(image);
        setAnalysis(result || {
            type: "Indeterminado", organic_matter: "Bajo", ph_estimate: "Neutro",
            suitability: "No se pudo determinar.", improvement: "Intente con otra muestra."
        });
        setLoading(false);
    };

    // --- RENDERERS ---

    const SoilScanView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-lg border-2 border-dashed border-amber-300 dark:border-amber-700 flex flex-col items-center justify-center relative overflow-hidden">
                {image ? (
                    <div className="w-full h-full flex flex-col">
                        <div className="relative flex-1 bg-black rounded-xl overflow-hidden mb-4">
                            <img src={image} className="w-full h-full object-cover"/>
                        </div>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => { setImage(null); setAnalysis(null); }} className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-bold">Borrar</button>
                            <button onClick={runAnalysis} disabled={loading} className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-amber-500 disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin"/> : <Search size={20}/>} ANALIZAR SUELO
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center p-8">
                        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <Layers size={40} className="text-amber-700"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">Análisis Edafológico</h3>
                        <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Sube una foto de la tierra (húmeda o seca) para estimar textura y materia orgánica.</p>
                        <label className="cursor-pointer px-8 py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-500 shadow-lg transition-transform hover:scale-105 inline-flex items-center gap-2">
                            <Upload size={20}/> Subir Muestra
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
                        </label>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-lg border border-amber-100 dark:border-amber-900 flex flex-col overflow-y-auto custom-scrollbar">
                {analysis ? (
                    <div className="space-y-6 animate-in slide-in-from-right">
                        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4">
                            <div>
                                <span className="text-xs font-black uppercase tracking-widest text-amber-600">Tipo de Suelo</span>
                                <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none mt-1">{analysis.type}</h3>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-gray-400 uppercase">Materia Orgánica</span>
                                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${analysis.organic_matter === 'Alto' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {analysis.organic_matter}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                <div className="text-gray-400 text-xs font-bold uppercase mb-1">pH Estimado</div>
                                <div className="text-xl font-black text-gray-800 dark:text-white">{analysis.ph_estimate}</div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                                <div className="text-gray-400 text-xs font-bold uppercase mb-1">Retención Agua</div>
                                <div className="text-xl font-black text-blue-500">
                                    {analysis.type.includes('Arcilloso') ? 'Alta' : analysis.type.includes('Arenoso') ? 'Baja' : 'Media'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-200 dark:border-green-800">
                            <h4 className="font-bold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider"><Sprout size={18}/> Aptitud Agrícola</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{analysis.suitability}</p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-200 dark:border-blue-800">
                            <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider"><Activity size={18}/> Plan de Mejora</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{analysis.improvement}</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                        <FlaskConical size={64} className="mb-4 opacity-20"/>
                        <p>Esperando muestra...</p>
                    </div>
                )}
            </div>
        </div>
    );

    const CalculatorView = () => (
        <div className="max-w-4xl mx-auto animate-in slide-in-from-right">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-6 flex items-center gap-3">
                    <Calculator className="text-amber-500"/> Calculadora de Fertilizante
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Cultivo</label>
                        <select className="w-full p-4 rounded-xl bg-gray-100 dark:bg-gray-900 font-bold outline-none" value={cropType} onChange={e => setCropType(e.target.value)}>
                            <option value="Maíz">Maíz (Milpa)</option>
                            <option value="Frijol">Frijol</option>
                            <option value="Café">Café</option>
                            <option value="Hortaliza">Hortalizas</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Área (Hectáreas)</label>
                        <input type="number" className="w-full p-4 rounded-xl bg-gray-100 dark:bg-gray-900 font-bold outline-none" value={area} onChange={e => setArea(parseFloat(e.target.value))}/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 uppercase mb-2">Deficiencia Principal</label>
                        <div className="flex gap-2">
                            {['N', 'P', 'K', 'None'].map(d => (
                                <button key={d} onClick={() => setDeficiency(d as any)} className={`flex-1 py-3 rounded-xl font-bold text-sm ${deficiency === d ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-900 text-gray-500'}`}>
                                    {d === 'None' ? 'OK' : d}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Results Card */}
                <div className="bg-gray-900 text-white p-8 rounded-[2rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 opacity-10 rounded-full blur-[50px]"></div>
                    <h4 className="relative z-10 font-bold uppercase tracking-widest text-sm text-gray-400 mb-6">Recomendación de Abonado</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        <div>
                            <div className="text-3xl font-black mb-1 text-green-400">Orgánico</div>
                            <div className="text-sm text-gray-400 mb-4">Composta o Estiércol maduro</div>
                            <div className="text-5xl font-black">{area * (cropType === 'Maíz' ? 3 : 1.5)} <span className="text-lg font-bold text-gray-500">Toneladas</span></div>
                        </div>
                        <div>
                            <div className="text-3xl font-black mb-1 text-amber-400">Corrector</div>
                            <div className="text-sm text-gray-400 mb-4">
                                {deficiency === 'N' ? 'Urea (Nitrógeno)' : deficiency === 'P' ? 'Superfosfato (Fósforo)' : deficiency === 'K' ? 'Cloruro Potasio' : 'Mantenimiento'}
                            </div>
                            <div className="text-5xl font-black">{deficiency === 'None' ? 0 : (area * 50)} <span className="text-lg font-bold text-gray-500">kg</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const SoilMicroscope = () => (
        <div className="h-full flex flex-col items-center justify-center bg-black rounded-[2rem] p-4 relative overflow-hidden border-8 border-gray-800 shadow-2xl">
            {/* Simulated Viewport */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dirt.png')] opacity-20 animate-pulse-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Bacteria/Nematodes Logic (Simplified Visuals) */}
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute rounded-full bg-green-500/40 blur-sm animate-float"
                        style={{
                            width: Math.random() * 20 + 5 + 'px',
                            height: Math.random() * 20 + 5 + 'px',
                            left: Math.random() * 100 + '%',
                            top: Math.random() * 100 + '%',
                            animationDuration: Math.random() * 5 + 3 + 's'
                        }}
                    ></div>
                ))}
                {[...Array(5)].map((_, i) => (
                    <div 
                        key={`worm_${i}`}
                        className="absolute w-24 h-2 bg-amber-600/60 rounded-full blur-[1px] animate-snake"
                        style={{
                            left: Math.random() * 80 + 10 + '%',
                            top: Math.random() * 80 + 10 + '%',
                            transform: `rotate(${Math.random()*360}deg)`
                        }}
                    ></div>
                ))}
            </div>
            
            {/* HUD */}
            <div className="absolute top-6 left-6 bg-black/50 backdrop-blur px-4 py-2 rounded-lg border border-green-500/30 text-green-400 font-mono text-xs">
                <div>MAG: 400x</div>
                <div>BIOTA: ACTIVA</div>
                <div>NEMATODOS: DETECTADOS</div>
            </div>

            <div className="absolute bottom-6 bg-gray-900/90 backdrop-blur px-6 py-4 rounded-2xl border border-gray-700 text-center max-w-md">
                <h4 className="text-amber-400 font-bold mb-1">Vida del Suelo</h4>
                <p className="text-gray-300 text-sm">Un suelo sano está vivo. Los microorganismos descomponen la materia orgánica y liberan nutrientes para las plantas.</p>
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-black p-4 border-b border-gray-200 dark:border-gray-800 flex overflow-x-auto gap-2 sticky top-0 z-20">
                <button onClick={() => setActiveTab('soil-scan')} className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'soil-scan' ? 'bg-amber-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <Layers size={18}/> Escáner de Suelo
                </button>
                <button onClick={() => setActiveTab('npk-calc')} className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'npk-calc' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <Calculator size={18}/> Calculadora NPK
                </button>
                <button onClick={() => setActiveTab('microscope')} className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 whitespace-nowrap transition-all ${activeTab === 'microscope' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <Microscope size={18}/> Biología del Suelo
                </button>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-hidden">
                {activeTab === 'soil-scan' && <SoilScanView />}
                {activeTab === 'npk-calc' && <CalculatorView />}
                {activeTab === 'microscope' && <SoilMicroscope />}
            </div>
        </div>
    );
};

export default BioLab;

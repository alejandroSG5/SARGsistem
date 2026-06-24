

import React, { useState } from 'react';
import { 
  Activity, Droplet, Calendar, Flame, ChevronRight, 
  Save, History, TrendingUp, Info, Search, Grid,
  Heart, Baby, Scale, Stethoscope, Brain, Smile, Zap
} from 'lucide-react';
import { HealthRecord, CalculatorResult } from '../../types';

// --- ENGINE: DEFINICIÓN DE 20 CALCULADORAS ESENCIALES ---
type CalCategory = 'General' | 'Cardiología' | 'Pediatría' | 'Obstetricia' | 'Nefrología' | 'Nutrición' | 'UCI';

interface CalculatorDef {
    id: string;
    name: string;
    category: CalCategory;
    inputs: { id: string; label: string; type: 'number' | 'date' | 'select'; unit?: string; options?: string[] }[];
    formula: (vals: any) => CalculatorResult;
}

const CALCULATORS: CalculatorDef[] = [
    // --- GENERAL & NUTRICIÓN ---
    {
        id: 'bmi', name: 'Índice de Masa Corporal (IMC)', category: 'General',
        inputs: [{id: 'weight', label: 'Peso', type: 'number', unit: 'kg'}, {id: 'height', label: 'Altura', type: 'number', unit: 'cm'}],
        formula: (v) => {
            const h = v.height/100; const bmi = v.weight/(h*h);
            let s = 'Normal', c = 'text-green-500';
            if(bmi<18.5) {s='Bajo Peso'; c='text-blue-500';} else if(bmi>=25 && bmi<30) {s='Sobrepeso'; c='text-orange-500';} else if(bmi>=30) {s='Obesidad'; c='text-red-500';}
            return { title: 'IMC', value: bmi.toFixed(1), unit: 'kg/m²', classification: s, color: c, recommendation: 'Mantén un peso saludable.' };
        }
    },
    {
        id: 'water', name: 'Requerimiento de Agua', category: 'Nutrición',
        inputs: [{id: 'weight', label: 'Peso', type: 'number', unit: 'kg'}],
        formula: (v) => ({ title: 'Agua Diaria', value: (v.weight * 0.035).toFixed(1), unit: 'Litros', recommendation: 'Bebe agua constantemente.' })
    },
    {
        id: 'bmr_hb', name: 'Calorías Diarias (Harris-Benedict)', category: 'Nutrición',
        inputs: [{id: 'weight', label: 'Peso', type: 'number', unit:'kg'}, {id: 'height', label: 'Altura', type: 'number', unit:'cm'}, {id: 'age', label: 'Edad', type: 'number'}, {id: 'sex', label: 'Sexo', type: 'select', options: ['Hombre', 'Mujer']}],
        formula: (v) => {
            const bmr = v.sex === 'Hombre' ? (10*v.weight + 6.25*v.height - 5*v.age + 5) : (10*v.weight + 6.25*v.height - 5*v.age - 161);
            return { title: 'Calorías Basales', value: Math.round(bmr), unit: 'kcal/día', recommendation: 'Energía para vivir en reposo.' };
        }
    },
    {
        id: 'ibw', name: 'Peso Ideal (Devine)', category: 'Nutrición',
        inputs: [{id: 'height', label: 'Altura', type: 'number', unit:'cm'}, {id: 'sex', label: 'Sexo', type: 'select', options: ['Hombre', 'Mujer']}],
        formula: (v) => {
            const inches = v.height / 2.54;
            const base = v.sex === 'Hombre' ? 50 : 45.5;
            const w = base + 2.3 * (inches - 60);
            return { title: 'Peso Ideal', value: w.toFixed(1), unit: 'kg', recommendation: 'Meta aproximada de salud.' };
        }
    },
    // --- CARDIOLOGÍA ---
    {
        id: 'map', name: 'Presión Arterial Media (PAM)', category: 'Cardiología',
        inputs: [{id: 'sys', label: 'Sistólica', type: 'number', unit: 'mmHg'}, {id: 'dia', label: 'Diastólica', type: 'number', unit: 'mmHg'}],
        formula: (v) => {
            const map = (parseFloat(v.sys) + 2 * parseFloat(v.dia)) / 3;
            return { title: 'PAM', value: map.toFixed(0), unit: 'mmHg', classification: map > 65 ? 'Adecuada' : 'Baja Perfusión', color: map > 65 ? 'text-green-500' : 'text-red-500', recommendation: 'Debe ser > 65 mmHg para perfusión de órganos.' };
        }
    },
    {
        id: 'qtc', name: 'QT Corregido (Bazett)', category: 'Cardiología',
        inputs: [{id: 'qt', label: 'Intervalo QT', type: 'number', unit: 'ms'}, {id: 'hr', label: 'Frecuencia Cardíaca', type: 'number', unit: 'lpm'}],
        formula: (v) => {
            const rr = 60 / v.hr;
            const qtc = v.qt / Math.sqrt(rr);
            let s = 'Normal', c = 'text-green-500';
            if(qtc > 450) { s = 'Prolongado'; c = 'text-red-500'; }
            return { title: 'QTc', value: Math.round(qtc), unit: 'ms', classification: s, color: c, recommendation: 'Riesgo de arritmia si es prolongado.' };
        }
    },
    // --- OBSTETRICIA ---
    {
        id: 'ed', name: 'Fecha Probable de Parto', category: 'Obstetricia',
        inputs: [{id: 'lmp', label: 'Última Regla', type: 'date'}],
        formula: (v) => {
            const d = new Date(v.lmp); d.setDate(d.getDate() + 280);
            return { title: 'Fecha Parto', value: d.toLocaleDateString(), unit: '', recommendation: 'Inicia control prenatal.' };
        }
    },
    {
        id: 'ga', name: 'Edad Gestacional', category: 'Obstetricia',
        inputs: [{id: 'lmp', label: 'Última Regla', type: 'date'}],
        formula: (v) => {
            const d = new Date(v.lmp); const now = new Date();
            const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24 * 7));
            return { title: 'Semanas', value: diff, unit: 'Semanas', recommendation: 'Seguimiento semanal.' };
        }
    },
    // --- PEDIATRÍA ---
    {
        id: 'apgar', name: 'Puntuación APGAR', category: 'Pediatría',
        inputs: [
            {id: 'color', label: 'Color', type: 'select', options: ['Azul', 'Cuerpo rosa', 'Todo rosa']},
            {id: 'pulse', label: 'Pulso', type: 'select', options: ['Ausente', '<100', '>100']},
            {id: 'grimace', label: 'Gestos', type: 'select', options: ['Sin respuesta', 'Mueca', 'Llanto']},
            {id: 'activity', label: 'Actividad', type: 'select', options: ['Flácido', 'Flexión', 'Activo']},
            {id: 'respiration', label: 'Respiración', type: 'select', options: ['Ausente', 'Lenta', 'Llanto fuerte']}
        ],
        formula: (v) => {
            let score = 0;
            if(v.color.includes('Todo')) score+=2; else if(v.color.includes('Cuerpo')) score+=1;
            if(v.pulse.includes('>100')) score+=2; else if(v.pulse.includes('<100')) score+=1;
            if(v.grimace.includes('Llanto')) score+=2; else if(v.grimace.includes('Mueca')) score+=1;
            if(v.activity.includes('Activo')) score+=2; else if(v.activity.includes('Flexión')) score+=1;
            if(v.respiration.includes('Llanto')) score+=2; else if(v.respiration.includes('Lenta')) score+=1;
            return { title: 'APGAR', value: score, unit: '/10', classification: score > 7 ? 'Normal' : 'Depresión', color: score > 7 ? 'text-green-500' : 'text-red-500', recommendation: 'Evaluar al minuto 1 y 5.' };
        }
    },
    {
        id: 'maintenance_fluids', name: 'Líquidos (Holliday-Segar)', category: 'Pediatría',
        inputs: [{id: 'weight', label: 'Peso', type: 'number', unit: 'kg'}],
        formula: (v) => {
            let ml = 0;
            if(v.weight <= 10) ml = v.weight * 100;
            else if(v.weight <= 20) ml = 1000 + (v.weight - 10) * 50;
            else ml = 1500 + (v.weight - 20) * 20;
            return { title: 'Líquidos/Día', value: Math.round(ml), unit: 'ml', recommendation: 'Mantenimiento basal.' };
        }
    },
    {
        id: 'ped_dose', name: 'Dosis Pediátrica (mg/kg)', category: 'Pediatría',
        inputs: [{id: 'weight', label: 'Peso', type: 'number', unit: 'kg'}, {id: 'dose', label: 'Dosis mg/kg', type: 'number'}],
        formula: (v) => ({ title: 'Dosis Total', value: (v.weight * v.dose).toFixed(0), unit: 'mg', recommendation: 'Verificar concentración del jarabe.' })
    },
    // --- NEFROLOGÍA ---
    {
        id: 'ckd_epi', name: 'Filtrado Glomerular (CKD-EPI)', category: 'Nefrología',
        inputs: [{id: 'creatinine', label: 'Creatinina', type: 'number', unit: 'mg/dL'}, {id: 'age', label: 'Edad', type: 'number'}, {id: 'sex', label: 'Sexo', type: 'select', options: ['Hombre', 'Mujer']}],
        formula: (v) => {
            const k = v.sex === 'Mujer' ? 0.7 : 0.9;
            const a = v.sex === 'Mujer' ? -0.329 : -0.411;
            const cr = v.creatinine;
            const gfr = 141 * Math.pow(Math.min(cr/k, 1), a) * Math.pow(Math.max(cr/k, 1), -1.209) * Math.pow(0.993, v.age) * (v.sex==='Mujer'?1.018:1);
            return { title: 'TFG', value: Math.round(gfr), unit: 'mL/min', classification: gfr > 60 ? 'Normal' : 'Fallo Renal', color: gfr > 60 ? 'text-green-500' : 'text-red-500', recommendation: 'Estadiaje de enfermedad renal.' };
        }
    },
    // --- UCI / EMERGENCIA ---
    {
        id: 'parkland', name: 'Fórmula de Parkland (Quemaduras)', category: 'UCI',
        inputs: [{id: 'weight', label: 'Peso', type: 'number', unit: 'kg'}, {id: 'tbsa', label: '% Quemadura', type: 'number', unit: '%'}],
        formula: (v) => {
            const total = 4 * v.weight * v.tbsa;
            return { title: 'Líquidos 24h', value: Math.round(total), unit: 'ml', recommendation: '50% en primeras 8 horas.' };
        }
    },
    {
        id: 'glasgow', name: 'Escala de Coma de Glasgow', category: 'UCI',
        inputs: [
            {id: 'eye', label: 'Ojos', type: 'select', options: ['4-Espontánea', '3-Orden', '2-Dolor', '1-Nada']},
            {id: 'verbal', label: 'Verbal', type: 'select', options: ['5-Orientado', '4-Confuso', '3-Inapropiado', '2-Sonidos', '1-Nada']},
            {id: 'motor', label: 'Motor', type: 'select', options: ['6-Obedece', '5-Localiza', '4-Retira', '3-Flexión', '2-Extensión', '1-Nada']}
        ],
        formula: (v) => {
            const score = parseInt(v.eye) + parseInt(v.verbal) + parseInt(v.motor);
            return { title: 'GCS', value: score, unit: '/15', classification: score < 9 ? 'Coma Severo' : 'Consciente', color: score < 9 ? 'text-red-500' : 'text-green-500', recommendation: 'Menor a 8 requiere intubación.' };
        }
    },
    {
        id: 'shock_index', name: 'Índice de Choque', category: 'UCI',
        inputs: [{id: 'hr', label: 'Frecuencia Cardíaca', type: 'number'}, {id: 'sbp', label: 'Presión Sistólica', type: 'number'}],
        formula: (v) => {
            const si = v.hr / v.sbp;
            return { title: 'Índice Choque', value: si.toFixed(2), unit: '', classification: si > 0.9 ? 'Choque' : 'Estable', color: si > 0.9 ? 'text-red-500' : 'text-green-500', recommendation: 'Normal 0.5 - 0.7' };
        }
    }
];
interface HealthCalculatorsProps {
  userProfile?: { name: string; gender: 'hombre' | 'mujer' | '' } | null;
}

const HealthCalculators: React.FC<HealthCalculatorsProps> = ({ userProfile }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CalCategory | 'Todas'>('Todas');
  const [activeCalc, setActiveCalc] = useState<CalculatorDef | null>(null);
  const [inputs, setInputs] = useState<any>({});
  const [result, setResult] = useState<CalculatorResult | null>(null);

  const isFemale = userProfile?.gender === 'mujer';
  
  const filteredCalcs = CALCULATORS.filter(c => 
      (selectedCategory === 'Todas' || c.category === selectedCategory) &&
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (c.category !== 'Obstetricia' || isFemale)
  );

  const availableCategories = ['Todas', 'General', 'Cardiología', 'Pediatría', 'Nefrología', 'UCI'];
  if (isFemale) availableCategories.splice(4, 0, 'Obstetricia'); // Insert before Nefrología


  const handleCalculate = () => {
      if (activeCalc) {
          try {
              const res = activeCalc.formula(inputs);
              setResult(res);
          } catch (e) {
              alert("Error en los datos de entrada.");
          }
      }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 bg-transparent h-full min-h-[800px]">
        
        {/* LEFT: SELECTION MENU */}
        <div className="w-full xl:w-96 flex flex-col gap-5 shrink-0 h-[800px]">
            <div className="bg-white/60 dark:bg-[#151515]/60 backdrop-blur-2xl rounded-3xl p-5 border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-white/5 flex flex-col gap-4 shrink-0">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="text-blue-500 group-focus-within:text-purple-500 transition-colors" size={20}/>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Buscar herramienta clínica..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl font-bold outline-none text-gray-800 dark:text-gray-100 border border-gray-200/50 dark:border-white/5 focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-gray-400"
                    />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar mask-fade-edges">
                    {availableCategories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat as any)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all duration-300 ${selectedCategory === cat ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-105' : 'bg-white/50 dark:bg-white/5 text-gray-500 hover:bg-white dark:hover:bg-white/10 hover:text-gray-800 dark:hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {filteredCalcs.map(calc => (
                    <button
                        key={calc.id}
                        onClick={() => { setActiveCalc(calc); setResult(null); setInputs({}); }}
                        className={`w-full p-4 rounded-3xl flex items-center gap-4 text-left transition-all duration-300 group ${activeCalc?.id === calc.id ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl shadow-purple-500/20 scale-[1.02] border-none' : 'bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/40 dark:border-white/5 hover:bg-white hover:scale-[1.01] hover:shadow-lg'}`}
                    >
                        <div className={`p-3 rounded-2xl transition-colors ${activeCalc?.id === calc.id ? 'bg-white/20 text-white shadow-inner' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover:bg-blue-100'}`}>
                            {calc.category === 'Cardiología' ? <Heart size={22} /> : 
                             calc.category === 'Obstetricia' ? <Baby size={22} /> : 
                             calc.category === 'Pediatría' ? <Smile size={22} /> :
                             calc.category === 'Nutrición' ? <Scale size={22} /> :
                             calc.category === 'UCI' ? <Activity size={22} /> :
                             <Stethoscope size={22} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className={`font-black text-[15px] truncate transition-colors ${activeCalc?.id === calc.id ? 'text-white' : 'text-gray-800 dark:text-gray-100 group-hover:text-blue-600'}`}>{calc.name}</h4>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 transition-colors ${activeCalc?.id === calc.id ? 'text-white/70' : 'text-gray-400'}`}>{calc.category}</p>
                        </div>
                        <ChevronRight size={18} className={`transition-transform ${activeCalc?.id === calc.id ? 'text-white translate-x-1' : 'text-gray-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`} />
                    </button>
                ))}
            </div>
        </div>

        {/* RIGHT: WORKSPACE */}
        <div className="flex-1 bg-white/70 dark:bg-[#121212]/80 backdrop-blur-3xl rounded-[3rem] p-8 flex flex-col items-center relative overflow-hidden border border-white/50 dark:border-white/5 shadow-2xl">
             {/* Decorative Background Elements */}
             <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
             <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

             {!activeCalc ? (
                 <div className="flex-1 flex flex-col justify-center items-center text-center max-w-sm animate-in fade-in duration-700">
                     <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/50 dark:border-white/10">
                         <Grid size={40} className="text-blue-500 opacity-80" />
                     </div>
                     <h3 className="text-2xl font-black text-gray-800 dark:text-white mb-3">Motor de Cálculo</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                         Selecciona una de las herramientas clínicas avanzadas en el panel lateral para comenzar el análisis computacional.
                     </p>
                     
                     {/* Suggestion Chips */}
                     <div className="mt-8 flex flex-wrap justify-center gap-2">
                         <span className="px-3 py-1.5 bg-white/50 dark:bg-white/5 rounded-full text-[10px] font-bold text-gray-400 border border-gray-200/50 dark:border-white/5">Predicción de Riesgo</span>
                         <span className="px-3 py-1.5 bg-white/50 dark:bg-white/5 rounded-full text-[10px] font-bold text-gray-400 border border-gray-200/50 dark:border-white/5">Fórmulas Médicas</span>
                         <span className="px-3 py-1.5 bg-white/50 dark:bg-white/5 rounded-full text-[10px] font-bold text-gray-400 border border-gray-200/50 dark:border-white/5">Dosificación</span>
                     </div>
                 </div>
             ) : (
                 <div className="w-full max-w-xl relative z-10 animate-in slide-in-from-bottom-8 duration-500 flex-1 flex flex-col justify-center">
                     <div className="text-center mb-10">
                         <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block border border-blue-100/50 dark:border-blue-800/30">
                             {activeCalc.category}
                         </span>
                         <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight leading-tight">
                             {activeCalc.name}
                         </h2>
                     </div>

                     <div className="bg-white/80 dark:bg-black/40 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] dark:shadow-none border border-white/60 dark:border-white/5 mb-8">
                         <div className="space-y-5">
                             {activeCalc.inputs.map(input => (
                                 <div key={input.id} className="relative group/input">
                                     <label className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2 mb-2 block group-focus-within/input:text-blue-500 transition-colors">
                                         {input.label} <span className="text-gray-300 dark:text-gray-600 font-medium ml-1">{input.unit && `[${input.unit}]`}</span>
                                     </label>
                                     {input.type === 'select' ? (
                                         <div className="relative">
                                             <select 
                                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 font-black outline-none focus:ring-2 ring-blue-500/50 text-gray-800 dark:text-gray-100 appearance-none border border-transparent focus:border-blue-500/30 transition-all cursor-pointer"
                                                onChange={e => setInputs({...inputs, [input.id]: e.target.value})}
                                                value={inputs[input.id] || ''}
                                             >
                                                 <option value="" disabled>Seleccionar opción...</option>
                                                 {input.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                             </select>
                                             <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={18}/>
                                         </div>
                                     ) : (
                                         <input 
                                            type={input.type} 
                                            placeholder={`Ingresar ${input.label.toLowerCase()}...`}
                                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-white/5 font-black outline-none focus:ring-2 ring-blue-500/50 text-gray-800 dark:text-gray-100 border border-transparent focus:border-blue-500/30 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-medium"
                                            onChange={e => setInputs({...inputs, [input.id]: e.target.value})}
                                            value={inputs[input.id] || ''}
                                         />
                                     )}
                                 </div>
                             ))}
                         </div>

                         <button 
                            onClick={handleCalculate}
                            className="w-full py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 active:translate-y-0 transition-all mt-8 relative overflow-hidden group/btn"
                         >
                             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                             <span className="relative z-10 flex items-center justify-center gap-2">
                                 EJECUTAR CÁLCULO <Zap size={18} className="animate-pulse"/>
                             </span>
                         </button>
                     </div>

                     {result && (
                         <div className="bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl border-t-4 border-blue-500 animate-in slide-in-from-bottom-8 zoom-in-95 duration-500 flex flex-col items-center text-center relative overflow-hidden">
                             {/* Result glow background */}
                             <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
                             
                             <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] relative z-10">{result.title}</span>
                             
                             <div className="text-6xl md:text-7xl font-black text-gray-900 dark:text-white my-3 tracking-tighter relative z-10">
                                 {result.value}
                                 <span className="text-2xl font-bold text-gray-400 ml-2 tracking-normal">{result.unit}</span>
                             </div>
                             
                             {result.classification && (
                                 <div className={`relative z-10 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest mb-6 border bg-white dark:bg-black shadow-sm ${
                                     result.color.includes('green') ? 'text-emerald-500 border-emerald-500/20' : 
                                     result.color.includes('red') ? 'text-rose-500 border-rose-500/20' : 
                                     result.color.includes('orange') ? 'text-amber-500 border-amber-500/20' : 
                                     'text-blue-500 border-blue-500/20'
                                 }`}>
                                     <div className={`w-2 h-2 rounded-full animate-pulse ${
                                         result.color.includes('green') ? 'bg-emerald-500' : 
                                         result.color.includes('red') ? 'bg-rose-500' : 
                                         result.color.includes('orange') ? 'bg-amber-500' : 
                                         'bg-blue-500'
                                     }`}></div>
                                     {result.classification}
                                 </div>
                             )}
                             
                             <div className="w-full bg-blue-50/50 dark:bg-blue-900/10 p-5 rounded-2xl text-sm text-blue-800 dark:text-blue-300 flex items-start gap-3 text-left border border-blue-100/50 dark:border-blue-800/20 relative z-10">
                                 <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-lg shrink-0 mt-0.5">
                                     <Info size={16} className="text-blue-600 dark:text-blue-400"/>
                                 </div>
                                 <p className="leading-relaxed font-medium">{result.recommendation}</p>
                             </div>
                         </div>
                     )}
                 </div>
             )}
        </div>
    </div>
  );
};

export default HealthCalculators;

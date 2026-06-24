import React, { useState } from 'react';
import { ArrowLeft, Droplets, CloudRain, Sun, Wind, Activity, CheckCircle, Calculator } from 'lucide-react';

interface AgroIrrigationProps {
  onBack: () => void;
}

const CROP_TYPES = [
  { id: 'maiz', name: 'Maíz', factor: 1.2 },
  { id: 'frijol', name: 'Frijol', factor: 0.9 },
  { id: 'tomate', name: 'Tomate', factor: 1.5 },
  { id: 'papa', name: 'Papa', factor: 1.1 },
  { id: 'trigo', name: 'Trigo', factor: 1.0 },
];

const SOIL_TYPES = [
  { id: 'arenoso', name: 'Arenoso (Drena rápido)', factor: 1.3 },
  { id: 'franco', name: 'Franco (Equilibrado)', factor: 1.0 },
  { id: 'arcilloso', name: 'Arcilloso (Retiene agua)', factor: 0.8 },
];

const AgroIrrigation: React.FC<AgroIrrigationProps> = ({ onBack }) => {
  const [crop, setCrop] = useState(CROP_TYPES[0]);
  const [soil, setSoil] = useState(SOIL_TYPES[1]);
  const [area, setArea] = useState(1); // Hectareas
  const [temp, setTemp] = useState(25); // Grados C
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<{ litros: number, frecuencia: string } | null>(null);

  const calculateIrrigation = () => {
    setIsCalculating(true);
    setResult(null);
    setTimeout(() => {
      // Cálculo simulado
      const baseWater = 40000; // Litros por hectárea base
      const tempFactor = 1 + ((temp - 20) * 0.05); // +5% por cada grado sobre 20
      const totalLitros = Math.round(baseWater * area * crop.factor * soil.factor * tempFactor);
      
      let freq = "Cada 3 días";
      if (soil.id === 'arenoso' || temp > 30) freq = "Diario";
      else if (soil.id === 'arcilloso' && temp < 25) freq = "Cada 5 días";

      setResult({ litros: totalLitros, frecuencia: freq });
      setIsCalculating(false);
    }, 1500);
  };

  return (
    <div className="h-full bg-blue-50/30 dark:bg-[#0a121a] p-4 md:p-8 overflow-y-auto animate-in fade-in duration-500 min-h-screen">
      <div className="max-w-5xl mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-3 bg-white dark:bg-[#1a2634] shadow-sm rounded-full hover:scale-105 transition-transform border border-blue-100 dark:border-blue-900/30 text-blue-600 dark:text-blue-400">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl lg:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Droplets size={32} className="text-blue-500" /> Calculadora de Riego
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-white dark:bg-[#1a2634] p-8 rounded-[2.5rem] shadow-lg shadow-blue-100/50 dark:shadow-none border border-blue-100 dark:border-blue-900/30 flex flex-col gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

            {/* Crop Selector */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 block">Tipo de Cultivo</label>
              <div className="flex flex-wrap gap-2">
                {CROP_TYPES.map(c => (
                  <button 
                    key={c.id} 
                    onClick={() => setCrop(c)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      crop.id === c.id 
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-105' 
                      : 'bg-blue-50 dark:bg-[#0f172a] text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-[#1e293b]'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Soil Selector */}
            <div>
              <label className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 block">Tipo de Suelo</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SOIL_TYPES.map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => setSoil(s)}
                    className={`p-4 rounded-2xl text-sm font-bold transition-all flex flex-col items-center text-center gap-2 border-2 ${
                      soil.id === s.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                      : 'border-transparent bg-gray-50 dark:bg-[#0f172a] text-gray-500 hover:bg-blue-50 dark:hover:bg-[#1e293b]'
                    }`}
                  >
                    <Activity size={20} className={soil.id === s.id ? 'text-blue-500' : 'opacity-50'} />
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Area Slider */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Área (Hectáreas)</label>
                <span className="text-2xl font-black text-gray-900 dark:text-white">{area} ha</span>
              </div>
              <input 
                type="range" min="0.5" max="50" step="0.5" 
                value={area} onChange={(e) => setArea(parseFloat(e.target.value))}
                className="w-full h-3 bg-blue-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Temp Slider */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Temperatura Promedio</label>
                <span className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-1">
                  {temp > 28 ? <Sun size={20} className="text-orange-500"/> : <Wind size={20} className="text-blue-400"/>}
                  {temp}°C
                </span>
              </div>
              <input 
                type="range" min="10" max="45" step="1" 
                value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-full h-3 bg-blue-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
              />
            </div>

            <button 
              onClick={calculateIrrigation}
              disabled={isCalculating}
              className="mt-4 w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isCalculating ? <CloudRain className="animate-bounce" /> : <Calculator />}
              {isCalculating ? 'Calculando...' : 'CALCULAR RIEGO'}
            </button>
          </div>

          {/* Results */}
          <div className="h-full">
            <div className={`bg-gradient-to-br from-blue-600 to-blue-800 dark:from-[#0f1e2f] dark:to-[#070d14] rounded-[2.5rem] p-8 lg:p-12 h-full flex flex-col justify-center text-white relative overflow-hidden transition-all duration-700 shadow-2xl shadow-blue-900/20 ${result ? 'opacity-100 translate-y-0' : 'opacity-80'}`}>
              
              {/* Background animations */}
              <div className="absolute top-10 left-10 opacity-10 animate-pulse"><Droplets size={120} /></div>
              <div className="absolute bottom-10 right-10 opacity-10 animate-bounce" style={{animationDuration: '3s'}}><Droplets size={80} /></div>

              {!result && !isCalculating && (
                <div className="text-center z-10">
                  <CloudRain size={64} className="mx-auto mb-6 text-blue-300 opacity-50" />
                  <h3 className="text-2xl font-bold mb-2">Listo para calcular</h3>
                  <p className="text-blue-200">Ajusta los parámetros y presiona calcular para obtener tu recomendación hídrica.</p>
                </div>
              )}

              {isCalculating && (
                <div className="text-center z-10 flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 border-4 border-blue-400/30 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
                    <Droplets className="absolute inset-0 m-auto text-white animate-pulse" size={32} />
                  </div>
                  <h3 className="text-xl font-bold">Analizando variables...</h3>
                </div>
              )}

              {result && !isCalculating && (
                <div className="z-10 animate-in slide-in-from-bottom-8 duration-500">
                  <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
                    <CheckCircle size={16} /> Resultados Óptimos
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <p className="text-blue-200 font-bold uppercase tracking-wider text-sm mb-1">Volumen Recomendado</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl md:text-7xl font-black tracking-tighter drop-shadow-lg">
                          {result.litros.toLocaleString()}
                        </span>
                        <span className="text-xl md:text-2xl font-bold text-blue-200">L / riego</span>
                      </div>
                    </div>

                    <div className="h-px w-full bg-blue-400/30"></div>

                    <div>
                      <p className="text-blue-200 font-bold uppercase tracking-wider text-sm mb-2">Frecuencia Sugerida</p>
                      <div className="flex items-center gap-3">
                        <div className="bg-white text-blue-800 px-6 py-3 rounded-2xl font-black text-xl shadow-lg">
                          {result.frecuencia}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-12 text-xs text-blue-200/70 max-w-sm">
                    * Estos valores son estimaciones basadas en modelos generales. Monitorea siempre la humedad del suelo de forma visual o con sensores.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgroIrrigation;

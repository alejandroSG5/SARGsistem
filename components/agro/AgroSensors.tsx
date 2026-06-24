import React, { useState, useEffect } from 'react';
import { ArrowLeft, CloudRain, Wind, ThermometerSun, Droplets, Moon, Sun } from 'lucide-react';

const AgroSensors = ({ onBack }: { onBack: () => void }) => {
    // Sensor data state (Manual Input)
    const [sensorData, setSensorData] = useState({
        temp: 24.5,
        humidity: 60,
        rain: 0,
        wind: 5.2,
        soilMoisture: 45
    });

    const handleInputChange = (field: string, value: string) => {
        setSensorData(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    // Calculate Moon phase based on current date (simple approximation)
    const getMoonPhase = () => {
        const date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        const day = date.getDate();
        
        let c = 0, e = 0, jd = 0, b = 0;
        if (month < 3) {
            year--;
            month += 12;
        }
        ++month;
        c = 365.25 * year;
        e = 30.6 * month;
        jd = c + e + day - 694039.09; 
        jd /= 29.5305882; 
        b = parseInt(jd.toString()); 
        jd -= b; 
        b = Math.round(jd * 8); 
        
        if (b >= 8) b = 0; 
        
        const phases = [
            { name: "Luna Nueva", icon: "🌑", description: "Momento ideal para podas y control de malezas." },
            { name: "Cuarto Creciente", icon: "🌒", description: "Fase de crecimiento. Buena para siembra de hortalizas de hoja." },
            { name: "Primer Cuarto", icon: "🌓", description: "Desarrollo radicular fuerte. Siembra de plantas que crecen en altura." },
            { name: "Gibosa Creciente", icon: "🌔", description: "Absorción máxima de nutrientes." },
            { name: "Luna Llena", icon: "🌕", description: "Pico de savia. Evitar podas, buena para cosechar frutos." },
            { name: "Gibosa Menguante", icon: "🌖", description: "La savia desciende. Buena para trasplantes." },
            { name: "Último Cuarto", icon: "🌗", description: "Siembra de cultivos de raíz (zanahoria, papa)." },
            { name: "Cuarto Menguante", icon: "🌘", description: "Fase de reposo. Aplicación de abonos orgánicos." }
        ];
        
        return phases[b];
    };

    const moon = getMoonPhase();

    return (
        <div className="h-full bg-[#fbfbfb] dark:bg-[#121212] p-4 md:p-8 overflow-y-auto animate-in fade-in">
            <div className="max-w-5xl mx-auto pb-24">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="p-3 bg-white dark:bg-[#1e1e1e] shadow-sm rounded-full hover:scale-105 transition-transform border border-gray-100 dark:border-white/5">
                        <ArrowLeft size={20} className="text-gray-500" />
                    </button>
                    <h2 className="text-2xl lg:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <CloudRain size={28} className="text-blue-500"/> Registro Meteorológico y Lunar
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Manual Input Widget */}
                    <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[2rem] shadow-sm border border-transparent flex flex-col">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400">Datos Manuales</h3>
                            <span className="flex items-center gap-2 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                                Registro Local
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center group">
                                <ThermometerSun className="text-orange-500 mb-2" size={32} />
                                <div className="flex items-center">
                                    <input type="number" step="0.1" value={sensorData.temp} onChange={(e) => handleInputChange('temp', e.target.value)} className="w-16 text-2xl font-black text-center bg-transparent border-b-2 border-orange-200 dark:border-orange-800 focus:outline-none focus:border-orange-500 text-gray-900 dark:text-white" />
                                    <span className="text-2xl font-black text-gray-900 dark:text-white ml-1">°C</span>
                                </div>
                                <span className="text-xs font-bold text-orange-600/70 uppercase tracking-widest mt-2">Temperatura</span>
                            </div>
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center group">
                                <Droplets className="text-blue-500 mb-2" size={32} />
                                <div className="flex items-center">
                                    <input type="number" step="1" value={sensorData.humidity} onChange={(e) => handleInputChange('humidity', e.target.value)} className="w-16 text-2xl font-black text-center bg-transparent border-b-2 border-blue-200 dark:border-blue-800 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white" />
                                    <span className="text-2xl font-black text-gray-900 dark:text-white ml-1">%</span>
                                </div>
                                <span className="text-xs font-bold text-blue-600/70 uppercase tracking-widest mt-2">Humedad Rel.</span>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center group">
                                <CloudRain className="text-emerald-500 mb-2" size={32} />
                                <div className="flex items-center">
                                    <input type="number" step="0.1" value={sensorData.rain} onChange={(e) => handleInputChange('rain', e.target.value)} className="w-16 text-2xl font-black text-center bg-transparent border-b-2 border-emerald-200 dark:border-emerald-800 focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white" />
                                    <span className="text-2xl font-black text-gray-900 dark:text-white ml-1">mm</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mt-2">Precipitación</span>
                            </div>
                            <div className="bg-purple-50 dark:bg-purple-900/10 p-4 rounded-2xl flex flex-col items-center justify-center text-center group">
                                <Wind className="text-purple-500 mb-2" size={32} />
                                <div className="flex items-center">
                                    <input type="number" step="0.5" value={sensorData.wind} onChange={(e) => handleInputChange('wind', e.target.value)} className="w-16 text-2xl font-black text-center bg-transparent border-b-2 border-purple-200 dark:border-purple-800 focus:outline-none focus:border-purple-500 text-gray-900 dark:text-white" />
                                    <span className="text-xl font-black text-gray-900 dark:text-white ml-1">km/h</span>
                                </div>
                                <span className="text-xs font-bold text-purple-600/70 uppercase tracking-widest mt-2">Viento</span>
                            </div>
                        </div>
                    </div>

                    {/* Lunar Phase Widget */}
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-8 rounded-[2rem] shadow-lg border border-[#0f3460] flex flex-col text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e94560]/10 rounded-full blur-[80px]"></div>
                        <h3 className="text-xl font-black text-blue-300 mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                            <Moon size={24} /> Fase Lunar Actual
                        </h3>
                        
                        <div className="flex-1 flex flex-col items-center justify-center text-center z-10">
                            <div className="text-8xl md:text-9xl mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-[float_4s_ease-in-out_infinite]">
                                {moon.icon}
                            </div>
                            <h4 className="text-3xl font-black mb-4 text-white tracking-wider">{moon.name}</h4>
                            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 w-full">
                                <p className="text-blue-100 font-medium leading-relaxed">
                                    {moon.description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </div>
    );
};

export default AgroSensors;



import React, { useState, useEffect, useRef } from 'react';
import { 
  CloudRain, Factory, TreePine, Droplet, Skull, 
  RefreshCcw, Wind, Sun, Thermometer, Bug, 
  Trash2, Play, Pause, AlertTriangle, Heart, Sprout, X
} from 'lucide-react';

// --- TYPES & ENGINE ---

type EntityType = 'tree' | 'axolotl' | 'cloud' | 'waste' | 'factory';
type WeatherState = 'sunny' | 'raining' | 'acid_rain' | 'heatwave';

interface Entity {
  id: string;
  type: EntityType;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  age: number;
  health: number; // 0-100
  state?: string; // 'seed', 'adult', 'sick', 'swimming_left', etc.
}

interface EnvStats {
  oxygen: number; // 0-100 (Good > 50)
  co2: number; // 0-100 (Bad > 50)
  toxicity: number; // 0-100 (Bad > 20)
  waterLevel: number; // 0-100 (Ideal 60-80)
  temperature: number; // 0-40 celsius
  biodiversityScore: number;
}

const EcoSimulator: React.FC = () => {
    // --- STATE ---
    const [isRunning, setIsRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameWon, setGameWon] = useState(false);
    const [time, setTime] = useState(0); // Ticks
    
    // Environment
    const [stats, setStats] = useState<EnvStats>({
        oxygen: 80,
        co2: 20,
        toxicity: 10,
        waterLevel: 70,
        temperature: 24,
        biodiversityScore: 50
    });
    
    const [weather, setWeather] = useState<WeatherState>('sunny');
    
    // Entities
    const [entities, setEntities] = useState<Entity[]>([]);
    
    // Feedback
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    // Refs for animation loop
    const entitiesRef = useRef<Entity[]>([]);
    const statsRef = useRef<EnvStats>(stats);

    // Init
    useEffect(() => {
        resetSimulation();
    }, []);

    // Sync Ref
    useEffect(() => {
        entitiesRef.current = entities;
        statsRef.current = stats;
    }, [entities, stats]);

    const resetSimulation = () => {
        setIsRunning(false);
        setGameOver(false);
        setGameWon(false);
        setTime(0);
        setWeather('sunny');
        setAlertMessage(null);
        
        const initialStats = { oxygen: 80, co2: 20, toxicity: 0, waterLevel: 70, temperature: 24, biodiversityScore: 50 };
        setStats(initialStats);
        statsRef.current = initialStats;

        // Initial Pop: 3 Trees, 2 Axolotls, 1 Cloud
        const initialEntities: Entity[] = [
            { id: 't1', type: 'tree', x: 10, y: 0, age: 50, health: 100, state: 'adult' },
            { id: 't2', type: 'tree', x: 25, y: 0, age: 30, health: 100, state: 'adult' },
            { id: 't3', type: 'tree', x: 80, y: 0, age: 10, health: 100, state: 'sapling' },
            { id: 'a1', type: 'axolotl', x: 20, y: 60, age: 5, health: 100, state: 'swimming_right' },
            { id: 'a2', type: 'axolotl', x: 60, y: 70, age: 5, health: 100, state: 'swimming_left' },
            { id: 'c1', type: 'cloud', x: 10, y: 10, age: 0, health: 100 },
        ];
        setEntities(initialEntities);
        entitiesRef.current = initialEntities;
    };

    // --- GAME LOOP ---
    useEffect(() => {
        let interval: any;
        if (isRunning && !gameOver && !gameWon) {
            interval = setInterval(() => {
                tick();
            }, 500); // Game Speed
        }
        return () => clearInterval(interval);
    }, [isRunning, gameOver, gameWon, weather]);

    const tick = () => {
        setTime(t => t + 1);
        const currentStats = { ...statsRef.current };
        let newEntities = [...entitiesRef.current];

        // 1. WEATHER DYNAMICS
        if (weather === 'raining') {
            currentStats.waterLevel = Math.min(100, currentStats.waterLevel + 2);
            currentStats.temperature = Math.max(15, currentStats.temperature - 0.5);
        } else if (weather === 'sunny') {
            currentStats.waterLevel = Math.max(0, currentStats.waterLevel - 0.5); // Evaporation
            currentStats.temperature = Math.min(40, currentStats.temperature + 0.1);
        } else if (weather === 'acid_rain') {
            currentStats.waterLevel += 2;
            currentStats.toxicity += 1;
        }

        // 2. ENTITY LOGIC
        let treeCount = 0;
        let axolotlCount = 0;
        let factoryCount = 0;

        newEntities = newEntities.map(ent => {
            let updates: Partial<Entity> = {};

            // --- TREES ---
            if (ent.type === 'tree') {
                treeCount++;
                // Trees clean CO2 -> O2
                if (currentStats.co2 > 5) {
                    currentStats.co2 -= 0.5;
                    currentStats.oxygen = Math.min(100, currentStats.oxygen + 0.5);
                }
                
                // Trees need water
                if (currentStats.waterLevel < 20 || currentStats.toxicity > 50) {
                    updates.health = ent.health - 2;
                } else {
                    updates.health = Math.min(100, ent.health + 1);
                    updates.age = ent.age + 1;
                }

                if (ent.age > 20 && ent.state === 'seed') updates.state = 'sapling';
                if (ent.age > 50 && ent.state === 'sapling') updates.state = 'adult';
            }

            // --- AXOLOTLS (Bio-Indicators) ---
            if (ent.type === 'axolotl') {
                axolotlCount++;
                
                // Movement (Simple AI)
                let newX = ent.x + (ent.state?.includes('right') ? 2 : -2);
                if (newX > 90) updates.state = 'swimming_left';
                if (newX < 10) updates.state = 'swimming_right';
                updates.x = newX;

                // Health Logic
                // They need clean water and oxygen
                if (currentStats.toxicity > 30 || currentStats.oxygen < 30 || currentStats.waterLevel < 30) {
                    updates.health = ent.health - 5;
                    updates.state = 'sick';
                } else {
                    updates.health = Math.min(100, ent.health + 2);
                }

                // Reproduction (Rare event)
                if (ent.health > 90 && axolotlCount < 6 && Math.random() > 0.98) {
                   setAlertMessage("¡Nació un nuevo Ajolote!");
                   // Logic handled in next tick by adding entity
                }
            }

            // --- CLOUDS ---
            if (ent.type === 'cloud') {
                updates.x = (ent.x + 0.5) % 110; // Drift
            }

            // --- FACTORIES ---
            if (ent.type === 'factory') {
                factoryCount++;
                currentStats.co2 += 2;
                currentStats.toxicity += 0.5;
                currentStats.oxygen -= 1;
            }

            // --- WASTE ---
            if (ent.type === 'waste') {
                currentStats.toxicity += 0.1;
            }

            return { ...ent, ...updates };
        });

        // 3. SPAWNING / DEATH
        // Remove dead entities
        newEntities = newEntities.filter(e => e.health > 0);

        // Random Waste Spawn
        if (Math.random() > 0.95) {
            newEntities.push({
                id: `w_${Date.now()}`, type: 'waste',
                x: Math.random() * 80 + 10, y: 90, // Bottom of lake
                age: 0, health: 100
            });
        }
        
        // Random Axolotl Spawn check from reproduction
        if (axolotlCount < 6 && axolotlCount > 1 && currentStats.oxygen > 80 && Math.random() > 0.99) {
             newEntities.push({
                id: `baby_${Date.now()}`, type: 'axolotl',
                x: 50, y: 50, age: 0, health: 50, state: 'swimming_right'
            });
        }

        // 4. WIN / LOSS CHECK
        if (axolotlCount === 0) {
            setGameOver(true);
            setAlertMessage("La especie se ha extinguido debido a las malas condiciones.");
        }
        if (axolotlCount >= 8 && currentStats.biodiversityScore > 80) {
            setGameWon(true);
            setAlertMessage("¡Has creado un ecosistema perfecto!");
        }

        // Biodiversity Calculation
        currentStats.biodiversityScore = (treeCount * 10) + (axolotlCount * 15) - (currentStats.toxicity);

        // Update State
        setEntities(newEntities);
        setStats(currentStats);
    };

    // --- ACTIONS ---

    const toggleWeather = () => {
        if (weather === 'sunny') setWeather('raining');
        else if (weather === 'raining') setWeather('sunny');
        else setWeather('sunny');
    };

    const addTree = () => {
        if (stats.waterLevel < 10) {
            setAlertMessage("No hay suficiente agua para plantar.");
            return;
        }
        const newTree: Entity = {
            id: `t_${Date.now()}`, type: 'tree',
            x: Math.random() * 90, y: 0,
            age: 0, health: 100, state: 'seed'
        };
        setEntities(prev => [...prev, newTree]);
        // Planting cost
        setStats(prev => ({...prev, waterLevel: prev.waterLevel - 5}));
    };

    const cleanWaste = (id: string) => {
        setEntities(prev => prev.filter(e => e.id !== id));
        setStats(prev => ({...prev, toxicity: Math.max(0, prev.toxicity - 5)}));
    };

    const addFactory = () => {
        const newFac: Entity = {
            id: `f_${Date.now()}`, type: 'factory',
            x: Math.random() * 90, y: 0,
            age: 0, health: 100
        };
        setEntities(prev => [...prev, newFac]);
        setAlertMessage("La industria aumenta la producción pero daña el aire.");
    };

    const cleanAir = () => {
        setStats(prev => ({...prev, co2: Math.max(0, prev.co2 - 20)}));
    };

    // --- RENDER HELPERS ---

    // Dynamic styles based on stats
    const skyColor = stats.co2 > 60 || stats.toxicity > 60 
        ? 'from-gray-500 to-gray-800' // Polluted
        : weather === 'raining' 
            ? 'from-blue-700 to-gray-600' // Raining
            : 'from-sky-300 to-blue-200'; // Sunny

    const waterColor = stats.toxicity > 50 
        ? 'bg-gradient-to-b from-green-800 to-yellow-900' // Toxic/Murky
        : 'bg-gradient-to-b from-blue-400/50 to-blue-600/50'; // Clean

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* 1. HUD (Heads Up Display) */}
            <div className="bg-gray-900 text-white p-4 flex flex-wrap justify-between items-center z-20 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Wind size={16} className={stats.co2 > 50 ? 'text-red-500' : 'text-blue-300'} />
                        <div className="text-xs">
                            <div className="font-bold uppercase text-gray-400">Aire (O2)</div>
                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${stats.oxygen}%` }}></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Droplet size={16} className={stats.toxicity > 30 ? 'text-red-500' : 'text-cyan-300'} />
                        <div className="text-xs">
                            <div className="font-bold uppercase text-gray-400">Toxicidad</div>
                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className={`h-full transition-all duration-500 ${stats.toxicity > 50 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${stats.toxicity}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                     <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-2 ${weather === 'sunny' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                         {weather === 'sunny' ? <Sun size={14}/> : <CloudRain size={14}/>} {weather === 'sunny' ? 'Soleado' : 'Lluvia'}
                     </div>
                     <div className="px-3 py-1 bg-gray-800 rounded-lg text-xs font-bold text-white font-mono">
                         T: {Math.floor(time / 10)}s
                     </div>
                </div>
            </div>

            {/* 2. THE WORLD (Visual Canvas) */}
            <div className={`flex-1 relative overflow-hidden bg-gradient-to-b transition-colors duration-2000 ${skyColor}`}>
                
                {/* Sun / Moon */}
                <div className="absolute top-10 right-10 animate-pulse">
                    <Sun size={64} className="text-yellow-300 blur-sm" />
                </div>

                {/* Background Mountains (Parallax Layer) */}
                <div className="absolute bottom-[30%] left-0 w-full h-64 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 z-0"></div>
                <div className="absolute bottom-[30%] left-0 w-full flex items-end opacity-40 z-0">
                     <div className="w-1/3 h-32 bg-green-900 rounded-tr-[100px]"></div>
                     <div className="w-1/3 h-48 bg-green-800 rounded-t-[150px] -ml-10"></div>
                     <div className="w-1/2 h-24 bg-green-900 rounded-tl-[80px]"></div>
                </div>

                {/* GAME LAYER: CLOUDS */}
                {entities.filter(e => e.type === 'cloud').map(cloud => (
                    <div 
                        key={cloud.id} 
                        className="absolute transition-all duration-1000 ease-linear cursor-pointer hover:scale-110"
                        style={{ top: `${cloud.y}%`, left: `${cloud.x}%` }}
                        onClick={toggleWeather}
                    >
                        <CloudRain size={64} className={`${weather === 'raining' ? 'text-gray-600' : 'text-white'} drop-shadow-xl`} />
                        {weather === 'raining' && (
                            <div className="absolute top-10 left-4 w-full h-20 bg-blue-400/20 blur-sm animate-pulse transform -skew-x-12"></div>
                        )}
                    </div>
                ))}

                {/* GROUND LEVEL */}
                <div className="absolute bottom-0 w-full h-[35%] bg-[#5d4037] border-t-8 border-[#3e2723] relative z-10 transition-all duration-500">
                    
                    {/* LAKE SECTION (Cutout) */}
                    <div className="absolute top-0 right-0 w-[70%] h-full bg-gradient-to-b from-[#8d6e63] to-[#5d4037] overflow-hidden rounded-bl-[100px]">
                        
                        {/* THE WATER */}
                        <div 
                            className={`absolute bottom-0 w-full transition-all duration-1000 ${waterColor}`}
                            style={{ height: `${stats.waterLevel}%` }}
                        >
                            {/* Water Surface */}
                            <div className="w-full h-2 bg-white/20 animate-pulse"></div>
                            
                            {/* Bubbles */}
                            <div className="absolute bottom-10 left-10 w-2 h-2 bg-white/40 rounded-full animate-bounce"></div>
                            <div className="absolute bottom-20 left-40 w-3 h-3 bg-white/30 rounded-full animate-bounce delay-700"></div>

                            {/* AXOLOTLS & WASTE */}
                            {entities.filter(e => e.type === 'axolotl' || e.type === 'waste').map(ent => (
                                <div 
                                    key={ent.id}
                                    className="absolute transition-all duration-500"
                                    style={{ 
                                        left: `${ent.x}%`, 
                                        bottom: `${ent.type === 'waste' ? 5 : (ent.y - 40)}%`, // Relative to water height
                                        transform: ent.state === 'swimming_left' ? 'scaleX(-1)' : 'scaleX(1)'
                                    }}
                                >
                                    {ent.type === 'axolotl' && (
                                        <div className={`relative group cursor-help transition-all ${ent.state === 'sick' ? 'grayscale opacity-80' : ''}`}>
                                            {/* Axolotl Body */}
                                            <div className="w-16 h-6 bg-pink-400 rounded-full relative shadow-sm animate-[wiggle_1s_ease-in-out_infinite]">
                                                {/* Gills */}
                                                <div className="absolute -top-3 left-2 w-2 h-4 bg-rose-500 rounded-full -rotate-45"></div>
                                                <div className="absolute -top-3 left-4 w-2 h-4 bg-rose-500 rounded-full -rotate-12"></div>
                                                <div className="absolute -top-3 left-6 w-2 h-4 bg-rose-500 rounded-full rotate-12"></div>
                                                {/* Tail */}
                                                <div className="absolute top-1 -right-4 w-6 h-4 bg-pink-300 rounded-full skew-x-12 opacity-80"></div>
                                                {/* Eye */}
                                                <div className="absolute top-2 left-2 w-1 h-1 bg-black rounded-full"></div>
                                                {ent.state === 'sick' && <div className="absolute -top-6 left-0 text-xs bg-black text-white px-1 rounded">Enfermo</div>}
                                            </div>
                                        </div>
                                    )}

                                    {ent.type === 'waste' && (
                                        <button 
                                            onClick={() => cleanWaste(ent.id)}
                                            className="animate-bounce hover:scale-125 transition-transform"
                                        >
                                            <Trash2 size={24} className="text-gray-700 bg-white/50 rounded-full p-1" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* LAND SECTION (Left Side) */}
                    {entities.filter(e => e.type === 'tree' || e.type === 'factory').map(ent => (
                        <div 
                            key={ent.id}
                            className="absolute bottom-full transition-all duration-500"
                            style={{ left: `${ent.x}%`, marginBottom: '-10px' }}
                        >
                            {ent.type === 'tree' && (
                                <div className={`flex flex-col items-center origin-bottom transition-transform duration-1000 ${ent.state === 'seed' ? 'scale-0' : ent.state === 'sapling' ? 'scale-50' : 'scale-100'}`}>
                                    <TreePine 
                                        size={ent.state === 'adult' ? 80 : 40} 
                                        className={ent.health < 50 ? "text-yellow-700" : "text-emerald-700"} 
                                        fill="currentColor"
                                    />
                                    {ent.health < 30 && <AlertTriangle size={16} className="text-red-500 absolute -top-4 animate-bounce" />}
                                </div>
                            )}

                            {ent.type === 'factory' && (
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <Factory size={64} className="text-gray-700" />
                                        <div className="absolute -top-4 right-2 space-y-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-ping"></div>
                                            <div className="w-3 h-3 bg-gray-500 rounded-full animate-ping delay-75"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* OVERLAYS (Game Over / Alerts) */}
                {alertMessage && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/80 px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-in slide-in-from-top z-50">
                        <Bug className="text-axolotl-pink" />
                        <span className="font-bold text-gray-800 dark:text-white text-sm">{alertMessage}</span>
                        <button onClick={() => setAlertMessage(null)}><X size={14}/></button>
                    </div>
                )}

                {(gameOver || gameWon) && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] text-center max-w-sm shadow-2xl animate-in zoom-in border-4 border-white/10">
                            <div className="mb-4 flex justify-center">
                                {gameWon ? <Heart size={64} className="text-pink-500 animate-bounce" fill="currentColor" /> : <Skull size={64} className="text-gray-400" />}
                            </div>
                            <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2">
                                {gameWon ? '¡Ecosistema Próspero!' : 'Colapso Ecológico'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-300 mb-6 font-medium">
                                {gameWon 
                                    ? "Has logrado mantener un equilibrio perfecto. Los ajolotes están felices." 
                                    : "La contaminación o falta de recursos ha destruido el hábitat."}
                            </p>
                            <button 
                                onClick={resetSimulation}
                                className="w-full py-4 bg-axolotl-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                            >
                                <RefreshCcw size={20} /> Reiniciar Simulación
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. CONTROL DECK */}
            <div className="bg-white dark:bg-gray-900 p-6 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="font-black text-gray-800 dark:text-white uppercase tracking-widest text-sm">Panel de Control</h3>
                     <button 
                        onClick={() => setIsRunning(!isRunning)}
                        className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${isRunning ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}
                     >
                         {isRunning ? <><Pause size={16}/> Pausar</> : <><Play size={16}/> Reanudar</>}
                     </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <ControlBtn 
                        icon={<Sprout size={24}/>} 
                        label="Reforestar" 
                        sub="-5 Agua"
                        color="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        onClick={addTree}
                        disabled={gameOver}
                    />
                    <ControlBtn 
                        icon={<Factory size={24}/>} 
                        label="Industria" 
                        sub="+2 CO2 / +Toxic"
                        color="bg-gray-100 text-gray-700 hover:bg-gray-200"
                        onClick={addFactory}
                        disabled={gameOver}
                    />
                    <ControlBtn 
                        icon={<Wind size={24}/>} 
                        label="Filtro Aire" 
                        sub="-20 CO2"
                        color="bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
                        onClick={cleanAir}
                        disabled={gameOver}
                    />
                     <ControlBtn 
                        icon={<CloudRain size={24}/>} 
                        label="Lluvia" 
                        sub="+Agua / -Temp"
                        color="bg-blue-100 text-blue-700 hover:bg-blue-200"
                        onClick={toggleWeather}
                        disabled={gameOver}
                    />
                </div>
            </div>
        </div>
    );
};

const ControlBtn = ({ icon, label, sub, color, onClick, disabled }: any) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${color}`}
    >
        {icon}
        <span className="font-black text-sm">{label}</span>
        <span className="text-[10px] opacity-70 font-mono">{sub}</span>
    </button>
);

export default EcoSimulator;

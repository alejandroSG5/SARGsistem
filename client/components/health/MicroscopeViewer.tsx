import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Microscope, ZoomIn, ZoomOut, 
  Settings, Maximize, Target, Grid, Eye, 
  FlaskConical, Droplet, Sun, 
  Aperture, Activity, Scan, FileText,
  CheckCircle, X, Search, Beaker, Pipette, Info, Book, Thermometer
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, SoftShadows } from '@react-three/drei';
import * as THREE from 'three';

import { SoundEffects } from '../../utils/soundSystem';

// --- TYPES ---
type SampleCategory = 'Hematología' | 'Parasitología' | 'Bacteriología' | 'Uroanálisis' | 'Botánica' | 'Micología';
type StainType = 'none' | 'wright' | 'lugol' | 'gram' | 'ziehl_neelsen' | 'methylene';
type ObjectivePower = 4 | 10 | 40 | 100;

interface SlideDefinition {
  id: string;
  title: string;
  category: SampleCategory;
  description: string;
  difficulty: 'Fácil' | 'Medio' | 'Difícil' | 'Experto';
  baseColor: string; 
  requiresStain?: StainType; 
  elements: {
    type: string;
    count: number;
    behavior?: 'static' | 'wobble' | 'swim' | 'flow';
    sizeVar: number;
  }[];
  objectives: string[];
  clinicalInfo: string;
}

// --- LIBRARY GENERATOR ---
const generateLibrary = (): SlideDefinition[] => {
    const library: SlideDefinition[] = [];

    // Hematología
    library.push({
        id: 'hem_1', title: 'Frotis Sangre Periférica (Normal)', category: 'Hematología', difficulty: 'Fácil',
        description: 'Muestra sanguínea estándar para evaluación morfológica básica.',
        baseColor: '#fff1f2', requiresStain: 'wright',
        elements: [{ type: 'rbc', count: 150, sizeVar: 0.1 }, { type: 'neutrophil', count: 5, sizeVar: 0.1 }, { type: 'platelet', count: 20, sizeVar: 0.5 }],
        objectives: ['Identificar eritrocitos', 'Diferenciar neutrófilos'],
        clinicalInfo: 'Paciente sano. Relación conservada.'
    });
    library.push({
        id: 'hem_2', title: 'Leucemia Mieloide Aguda', category: 'Hematología', difficulty: 'Experto',
        description: 'Frotis patológico con blastos.',
        baseColor: '#fff1f2', requiresStain: 'wright',
        elements: [{ type: 'rbc', count: 80, sizeVar: 0.1 }, { type: 'blast_cell', count: 40, sizeVar: 0.2 }],
        objectives: ['Identificar blastos', 'Notar disminución plaquetaria'],
        clinicalInfo: 'Emergencia médica.'
    });

    // Parasitología
    library.push({
        id: 'par_1', title: 'Entamoeba histolytica', category: 'Parasitología', difficulty: 'Medio',
        description: 'Quistes de amiba en heces.',
        baseColor: '#fefce8', requiresStain: 'lugol',
        elements: [{ type: 'debris', count: 40, sizeVar: 0.5 }, { type: 'cyst_amoeba', count: 8, sizeVar: 0.1 }],
        objectives: ['Buscar quistes'],
        clinicalInfo: 'Disentería amebiana.'
    });
    library.push({
        id: 'par_2', title: 'Giardia lamblia (Fresco)', category: 'Parasitología', difficulty: 'Difícil',
        description: 'Trofozoítos móviles.',
        baseColor: '#fefce8', requiresStain: 'none',
        elements: [{ type: 'debris', count: 30, sizeVar: 0.5 }, { type: 'giardia_troph', count: 10, behavior: 'swim', sizeVar: 0.1 }],
        objectives: ['Movimiento característico'],
        clinicalInfo: 'Diarrea y malabsorción.'
    });

    // Bacteriología
    library.push({
        id: 'bac_1', title: 'Staphylococcus aureus', category: 'Bacteriología', difficulty: 'Fácil',
        description: 'Cultivo Gram positivo.',
        baseColor: '#ffffff', requiresStain: 'gram',
        elements: [{ type: 'cocci_cluster', count: 60, sizeVar: 0.1 }],
        objectives: ['Agrupación en racimos', 'Gram positivos'],
        clinicalInfo: 'Infección cutánea común.'
    });
    library.push({
        id: 'bac_2', title: 'E. coli', category: 'Bacteriología', difficulty: 'Medio',
        description: 'Bacilos Gram negativos.',
        baseColor: '#ffffff', requiresStain: 'gram',
        elements: [{ type: 'bacteria_rod_gram_neg', count: 100, behavior: 'wobble', sizeVar: 0.1 }],
        objectives: ['Bacilos Gram negativos'],
        clinicalInfo: 'Infección urinaria.'
    });

    return library;
};
const LIBRARY = generateLibrary();

// --- 3D COMPONENTS ---

const BioElement3D = ({ config, idx, stain }: { config: any, idx: number, stain: StainType }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { type, x, y, z, size, speed, dirX, dirY } = config;

    useFrame((state, delta) => {
        if (!meshRef.current) return;
        
        if (config.behavior === 'swim') {
            meshRef.current.position.x += dirX * speed * delta;
            meshRef.current.position.y += dirY * speed * delta;
            meshRef.current.rotation.z += delta;
        } else if (config.behavior === 'wobble' || type.includes('bacteria')) {
            meshRef.current.position.x += (Math.random() - 0.5) * 0.05;
            meshRef.current.position.y += (Math.random() - 0.5) * 0.05;
        }
    });

    // Determine colors based on Stain
    let color = '#dddddd';
    let opacity = 0.9;
    let transparent = true;

    if (stain === 'gram') {
        if (type.includes('gram_pos') || type.includes('staph')) color = '#4c1d95'; // Purple
        else if (type.includes('gram_neg') || type.includes('coli')) color = '#db2777'; // Pink
    } else if (stain === 'wright') {
        if (type === 'rbc') color = '#fca5a5';
        else if (type.includes('neutrophil') || type.includes('blast')) color = '#4f46e5';
    } else if (stain === 'lugol') {
        color = '#ca8a04';
    } else {
        if (type === 'rbc') { color = '#ffaaaa'; opacity = 0.5; }
        else color = '#cccccc';
    }

    if (type === 'rbc') {
        return (
            <mesh ref={meshRef} position={[x, y, z]} scale={size} rotation={[0, 0, Math.random() * Math.PI]}>
                <torusGeometry args={[0.5, 0.2, 16, 32]} />
                <meshPhysicalMaterial color={color} transmission={0.5} thickness={0.5} roughness={0.2} transparent={transparent} opacity={opacity} />
            </mesh>
        );
    } else if (type === 'neutrophil' || type === 'blast_cell') {
        return (
            <mesh ref={meshRef} position={[x, y, z]} scale={size * 1.5}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshPhysicalMaterial color={color} clearcoat={1} roughness={0.4} transparent opacity={0.8} />
                {/* Nucleus */}
                <mesh position={[0, 0, 0.1]} scale={0.5}>
                    <sphereGeometry args={[0.5, 16, 16]} />
                    <meshStandardMaterial color={stain === 'wright' ? '#1e1b4b' : '#333'} />
                </mesh>
            </mesh>
        );
    } else if (type === 'cocci_cluster') {
        return (
            <group ref={meshRef} position={[x, y, z]} scale={size * 0.5}>
                {[...Array(6)].map((_, i) => (
                    <mesh key={i} position={[(Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8, (Math.random()-0.5)*0.8]}>
                        <sphereGeometry args={[0.3, 16, 16]} />
                        <meshStandardMaterial color={color} roughness={0.3} />
                    </mesh>
                ))}
            </group>
        );
    } else if (type.includes('bacteria_rod')) {
        return (
            <mesh ref={meshRef} position={[x, y, z]} scale={size * 0.4} rotation={[0, 0, Math.random() * Math.PI]}>
                <capsuleGeometry args={[0.2, 0.6, 16, 16]} />
                <meshStandardMaterial color={color} roughness={0.4} />
            </mesh>
        );
    } else if (type === 'cyst_amoeba') {
        return (
            <mesh ref={meshRef} position={[x, y, z]} scale={size * 1.2}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshPhysicalMaterial color={color} transmission={0.8} opacity={0.8} transparent roughness={0.1} />
            </mesh>
        );
    } else if (type === 'giardia_troph') {
        return (
            <mesh ref={meshRef} position={[x, y, z]} scale={size}>
                <coneGeometry args={[0.5, 1, 16]} />
                <meshPhysicalMaterial color={color} transmission={0.6} transparent opacity={0.7} />
            </mesh>
        );
    } else {
        // Debris
        return (
            <mesh ref={meshRef} position={[x, y, z]} scale={size * Math.random()} rotation={[Math.random(), Math.random(), Math.random()]}>
                <dodecahedronGeometry args={[0.4]} />
                <meshStandardMaterial color="#888" roughness={0.8} />
            </mesh>
        );
    }
};

const MicroscopeScene = ({ slide, stain, light, objective, focus }: any) => {
    const groupRef = useRef<THREE.Group>(null);

    const instances = useMemo(() => {
        const arr: any[] = [];
        slide.elements.forEach((elConfig: any) => {
            for (let i = 0; i < elConfig.count; i++) {
                arr.push({
                    id: `${elConfig.type}_${i}`,
                    type: elConfig.type,
                    behavior: elConfig.behavior,
                    x: (Math.random() - 0.5) * 20,
                    y: (Math.random() - 0.5) * 20,
                    z: (Math.random() - 0.5) * 2,
                    size: 1 + (Math.random() - 0.5) * elConfig.sizeVar,
                    speed: Math.random() * 2 + 0.5,
                    dirX: Math.random() - 0.5,
                    dirY: Math.random() - 0.5
                });
            }
        });
        return arr;
    }, [slide]);

    // Apply Focus (Z position of camera or scene)
    useFrame((state) => {
        if (groupRef.current) {
            // Focus maps from 0-100 to Z offsets.
            const targetZ = (focus - 50) * -0.1;
            groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1);
        }
    });

    const lightIntensity = (light / 100) * 2;

    // Depth of field effect could be achieved with PostProcessing, but we use simple fog and light
    let bgColor = '#ffffff';
    if (stain === 'wright') bgColor = '#fff1f2';
    if (stain === 'lugol') bgColor = '#fefce8';
    if (stain === 'gram') bgColor = '#ffffff';

    return (
        <>
            <color attach="background" args={[bgColor]} />
            <ambientLight intensity={lightIntensity * 0.5} />
            <pointLight position={[0, 0, -5]} intensity={lightIntensity * 2} color={bgColor} />
            <spotLight position={[0, 0, 10]} angle={0.5} intensity={lightIntensity} penumbra={1} />
            
            <group ref={groupRef}>
                {instances.map((config, i) => (
                    <BioElement3D key={config.id} config={config} idx={i} stain={stain} />
                ))}
            </group>
        </>
    );
};

// --- MAIN UI ---
const MicroscopeViewer: React.FC = () => {
    // --- STATE ---
    const [library] = useState(LIBRARY);
    const [selectedSlide, setSelectedSlide] = useState<SlideDefinition>(LIBRARY[0]);
    const [objective, setObjective] = useState<ObjectivePower>(40); 
    const [focus, setFocus] = useState(50);
    const [light, setLight] = useState(80);
    
    const [appliedStain, setAppliedStain] = useState<StainType>('none');
    const [hasOil, setHasOil] = useState(false);
    const [isIdentifying, setIsIdentifying] = useState(false);
    const [identifiedItems, setIdentifiedItems] = useState<string[]>([]);
    const [filterCategory, setFilterCategory] = useState<SampleCategory | 'Todas'>('Todas');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setAppliedStain('none');
        setHasOil(false);
        setObjective(40);
        setFocus(50);
        setIdentifiedItems([]);
    }, [selectedSlide]);

    const handleIdentify = () => {
        if (!isIdentifying) return;
        const visibleTypes = [...new Set(selectedSlide.elements.map(e => e.type))];
        const randomFind = visibleTypes[Math.floor(Math.random() * visibleTypes.length)];
        
        let name = randomFind;
        if (name === 'rbc') name = 'Eritrocito';
        if (name === 'neutrophil') name = 'Neutrófilo';
        if (name === 'blast_cell') name = 'Blasto Inmaduro';
        if (name === 'cyst_amoeba') name = 'Quiste Amibiano';
        if (name === 'bacteria_rod_gram_neg') name = 'Bacilo Gram (-)';
        if (name === 'giardia_troph') name = 'Trofozoíto Giardia';
        if (name === 'cocci_cluster') name = 'Cocos (Racimo)';
        
        if (!identifiedItems.includes(name)) {
            setIdentifiedItems([...identifiedItems, name]);
            SoundEffects.success();
        }
    };

    const filteredSlides = library.filter(s => 
        (filterCategory === 'Todas' || s.category === filterCategory) &&
        (s.title.toLowerCase().includes(searchTerm.toLowerCase()) || s.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Compute Camera FOV based on Objective
    const fov = 1000 / objective;

    return (
        <div className="flex flex-col xl:flex-row h-[90vh] gap-6 p-4 bg-slate-100 dark:bg-black overflow-hidden">
            
            {/* LEFT: SLIDE CABINET */}
            <div className="w-full xl:w-80 bg-white dark:bg-gray-900 rounded-3xl shadow-xl flex flex-col border border-gray-200 dark:border-gray-800 overflow-hidden shrink-0">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                    <h2 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                        <Book size={20} className="text-rose-500"/> Laboratorio 3D
                    </h2>
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16}/>
                            <input 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Buscar muestra..."
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 ring-rose-500"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {['Todas', 'Hematología', 'Parasitología', 'Bacteriología'].map(c => (
                                <button 
                                    key={c}
                                    onClick={() => setFilterCategory(c as any)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filterCategory === c ? 'bg-rose-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-500'}`}
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {filteredSlides.map(slide => (
                        <button
                            key={slide.id}
                            onClick={() => setSelectedSlide(slide)}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all group hover:shadow-md ${selectedSlide.id === slide.id ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20' : 'border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-800'}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${selectedSlide.id === slide.id ? 'text-rose-600' : 'text-gray-400'}`}>{slide.category}</span>
                                {slide.requiresStain !== 'none' && <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Droplet size={8}/> Tinción</span>}
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-white text-sm leading-tight">{slide.title}</h3>
                        </button>
                    ))}
                </div>
            </div>

            {/* CENTER: 3D MICROSCOPE */}
            <div className="flex-1 flex flex-col gap-4 relative">
                <div 
                    className="flex-1 bg-black rounded-[2.5rem] relative overflow-hidden border-8 border-gray-800 shadow-2xl group cursor-crosshair"
                    onClick={handleIdentify}
                >
                    {/* 3D CANVAS */}
                    <Canvas camera={{ position: [0, 0, 10], fov: fov }} style={{ background: '#000' }}>
                        <MicroscopeScene 
                            slide={selectedSlide} 
                            stain={appliedStain} 
                            light={light} 
                            objective={objective} 
                            focus={focus} 
                        />
                        {/* Pan and Tilt Controls */}
                        <OrbitControls 
                            enableRotate={true} 
                            enableZoom={false} 
                            enablePan={true}
                            maxPolarAngle={Math.PI / 2.2} // Prevent looking completely from the side
                            minPolarAngle={Math.PI / 3}
                        />
                    </Canvas>
                    
                    {/* Ocular Overlay (Vignette) */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_45%,black_100%)] opacity-90 rounded-[2rem]"></div>
                    
                    {/* HUD Info */}
                    <div className="absolute top-6 left-6 text-white/70 font-mono text-xs space-y-1 pointer-events-none">
                        <div className="flex items-center gap-2"><Maximize size={14}/> MAG: {objective * 10}x</div>
                        <div className="flex items-center gap-2"><Sun size={14}/> LUZ: {light}%</div>
                        <div className="flex items-center gap-2"><Activity size={14}/> Z-POS: {focus.toFixed(1)}µm</div>
                        {hasOil && <div className="text-yellow-400 font-bold flex items-center gap-2"><Droplet size={14}/> ACEITE DE INMERSIÓN</div>}
                    </div>

                    {isIdentifying && (
                        <div className="absolute top-6 right-6 bg-rose-600 text-white px-4 py-2 rounded-full font-bold text-xs animate-pulse shadow-lg flex items-center gap-2 pointer-events-none">
                            <Target size={16}/> MODO ANÁLISIS ACTIVO (Clic para aislar)
                        </div>
                    )}

                    {/* Blur Warning */}
                    {objective === 100 && !hasOil && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none backdrop-blur-md">
                            <div className="bg-black/80 text-white p-6 rounded-2xl text-center border border-white/20">
                                <Info className="mx-auto mb-2 text-yellow-400" size={32}/>
                                <h3 className="font-bold text-xl">Desenfoque Óptico</h3>
                                <p className="text-sm text-gray-300 mt-2">1000x requiere Aceite de Inmersión.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls Deck */}
                <div className="bg-white dark:bg-gray-900 p-4 rounded-[2rem] shadow-lg border border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        {[4, 10, 40, 100].map(m => (
                            <button
                                key={m}
                                onClick={() => setObjective(m as ObjectivePower)}
                                className={`w-12 h-10 rounded-lg font-bold text-sm transition-all border-b-2 ${objective === m ? 'bg-white dark:bg-gray-700 text-rose-600 border-rose-500 shadow-sm' : 'text-gray-500 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                {m}x
                            </button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

                    <div className="flex gap-6 flex-1">
                        <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 mb-1">
                                <span>Enfoque Micrométrico</span>
                                <span>{focus}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" step="0.5" 
                                value={focus} 
                                onChange={e => setFocus(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400 mb-1">
                                <span>Luz Transmitida</span>
                                <span>{light}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" 
                                value={light} 
                                onChange={e => setLight(parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-yellow-500"
                            />
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => setHasOil(!hasOil)}
                            className={`p-3 rounded-xl transition-all ${hasOil ? 'bg-yellow-100 text-yellow-700 border-yellow-300 border' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}
                            title="Aceite de Inmersión"
                        >
                            <Droplet size={20}/>
                        </button>
                        <button 
                            onClick={() => setIsIdentifying(!isIdentifying)}
                            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${isIdentifying ? 'bg-rose-600 text-white shadow-lg animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                        >
                            <Scan size={18}/> {isIdentifying ? 'Escaneando...' : 'Analizar 3D'}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT: PREP STATION */}
            <div className="w-full xl:w-80 flex flex-col gap-4 shrink-0 h-full overflow-y-auto custom-scrollbar">
                
                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-800">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FlaskConical size={14}/> Tinciones y Reactivos
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            {id: 'none', label: 'Fresco', color: 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'},
                            {id: 'gram', label: 'Gram', color: 'bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'},
                            {id: 'wright', label: 'Wright', color: 'bg-rose-200 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'},
                            {id: 'lugol', label: 'Lugol', color: 'bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'}
                        ].map(stain => (
                            <button
                                key={stain.id}
                                onClick={() => setAppliedStain(stain.id as StainType)}
                                className={`p-3 rounded-xl text-xs font-bold transition-all border-2 ${appliedStain === stain.id ? 'border-rose-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'} ${stain.color}`}
                            >
                                {stain.label}
                            </button>
                        ))}
                    </div>
                    {selectedSlide.requiresStain && selectedSlide.requiresStain !== 'none' && appliedStain !== selectedSlide.requiresStain && (
                        <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 text-xs p-3 rounded-xl flex gap-2 items-start">
                            <Info size={14} className="shrink-0 mt-0.5"/>
                            La simulación 3D requiere tinción de <b>{selectedSlide.requiresStain}</b> para mostrar estructuras óptimas.
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-black text-blue-900 dark:text-blue-100 leading-tight">{selectedSlide.title}</h3>
                        <span className="bg-white/50 dark:bg-black/20 px-2 py-1 rounded text-[10px] font-bold uppercase text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700">{selectedSlide.difficulty}</span>
                    </div>
                    <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed mb-4 font-medium">
                        {selectedSlide.clinicalInfo}
                    </p>
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase text-blue-400 tracking-wider">Objetivos 3D</h4>
                        {selectedSlide.objectives.map((obj, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
                                <CheckCircle size={12} className="mt-0.5 shrink-0"/> {obj}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-800 flex-1">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText size={14}/> Escaneo 3D
                    </h3>
                    
                    {identifiedItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-xs">
                            <Scan size={32} className="mx-auto mb-2 opacity-20"/>
                            <p>Activa el modo de Análisis y haz clic en las partículas 3D.</p>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {identifiedItems.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg border border-emerald-100 dark:border-emerald-800 animate-in slide-in-from-left">
                                    <CheckCircle size={14}/> {item}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

            </div>
        </div>
    );
};

export default MicroscopeViewer;
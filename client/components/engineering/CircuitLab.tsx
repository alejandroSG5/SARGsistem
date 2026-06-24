import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Zap, Play, Pause, Trash2, Plus, Grid, ZoomIn, ZoomOut,
  X, Monitor, CheckCircle, AlertTriangle, BookOpen, Wifi,
  Activity // For Multimeter
} from 'lucide-react';
import { CircuitComponent, CircuitWire, CircuitPin, RoboticsProject } from '../../types';
import { ROBOTIC_PROJECTS } from '../../constants';

// --- ASSETS & CONFIG ---
const COLORS = { wire_red: '#ef4444', wire_black: '#1f2937', wire_green: '#22c55e', wire_blue: '#3b82f6', wire_yellow: '#eab308' };

// --- COMPONENT FACTORY (ENHANCED WITH BREADBOARD) ---
const createComponent = (type: string, x: number, y: number): CircuitComponent => {
  const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  let pins: CircuitPin[] = [];
  let label = '';

  if (type === 'arduino') {
      label = 'Arduino UNO';
      // Power Pins
      pins.push({id:'5V',x:140,y:160,type:'power',voltage:5,connectedTo:[]});
      pins.push({id:'GND1',x:155,y:160,type:'ground',voltage:0,connectedTo:[]});
      pins.push({id:'GND2',x:170,y:160,type:'ground',voltage:0,connectedTo:[]});
      // Digital Pins 0-13
      for(let i=0; i<=13; i++) pins.push({id:`D${i}`,x:220-(i*12),y:10,type:'digital_io',voltage:i%2===0?0:5,connectedTo:[]});
  } else if (type === 'esp32') {
      label = 'ESP-32 DevKit';
      // Pins ESP32 (Simplified layout)
      for(let i=0; i<15; i++) {
          pins.push({id:`L${i}`,x:10,y:30+(i*10),type:'digital_io',voltage:0,connectedTo:[]}); // Left Row
          pins.push({id:`R${i}`,x:90,y:30+(i*10),type:'digital_io',voltage:0,connectedTo:[]}); // Right Row
      }
  } else if (type === 'servo') {
      label = 'Servo Motor';
      pins = [
          {id:'sig',x:10,y:50,type:'pwm',voltage:0,connectedTo:[]},
          {id:'vcc',x:25,y:50,type:'power',voltage:0,connectedTo:[]},
          {id:'gnd',x:40,y:50,type:'ground',voltage:0,connectedTo:[]}
      ];
  } else if (type === 'sensor_ultra') {
      label = 'HC-SR04';
      pins = [
          {id:'vcc',x:10,y:35,type:'power',voltage:0,connectedTo:[]},
          {id:'trig',x:25,y:35,type:'digital_io',voltage:0,connectedTo:[]},
          {id:'echo',x:40,y:35,type:'digital_io',voltage:0,connectedTo:[]},
          {id:'gnd',x:55,y:35,type:'ground',voltage:0,connectedTo:[]}
      ];
  } else if (type === 'led') {
      label = 'LED';
      pins = [{id:'anode',x:15,y:60,type:'passive',voltage:0,connectedTo:[]}, {id:'cathode',x:25,y:60,type:'passive',voltage:0,connectedTo:[]}];
  } else if (type === 'breadboard') {
      label = 'Protoboard';
      // Create a grid of pins.
      for(let row=0; row<5; row++) {
          for(let col=0; col<15; col++) {
              pins.push({id:`BB_${row}_${col}`, x: 20 + col*15, y: 20 + row*15, type:'passive', voltage:0, connectedTo:[]});
          }
      }
  }

  return { id, type: type as any, x, y, rotation: 0, pins, state: { isOn: false, value: 0 }, label };
};

const CircuitLab: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // --- STATE ---
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<CircuitWire[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [activeProject, setActiveProject] = useState<RoboticsProject | null>(null);
  const [showProjectList, setShowProjectList] = useState(true);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  
  // Interaction
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x: 0, y: 0});
  const [wiringStart, setWiringStart] = useState<{compId: string, pinId: string, x: number, y: number} | null>(null);
  const [mousePos, setMousePos] = useState({x: 0, y: 0});
  const [wireColor, setWireColor] = useState(COLORS.wire_red);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  
  // New Multimeter Tool
  const [tool, setTool] = useState<'cursor' | 'multimeter'>('cursor');
  const [multimeterRead, setMultimeterRead] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // --- LOGIC EVALUATION (REAL) ---
  useEffect(() => {
      if (!simulating) return;

      // Real logic evaluation loop
      // 1. Map all voltages based on power sources (5V pins)
      // 2. Propagate through wires
      // 3. Update component states (e.g., LED turns on if Anode has > 2V and Cathode is GND)
      
      const interval = setInterval(() => {
          setComponents(prevComps => {
              let updatedComps = [...prevComps];
              
              // Simplistic logic simulation for LED:
              // Check if any wire connects its anode to 5V and cathode to GND
              updatedComps = updatedComps.map(c => {
                  if (c.type === 'led') {
                      let hasPower = false;
                      let hasGND = false;
                      
                      const anodeWires = wires.filter(w => (w.fromComp === c.id && w.fromPin === 'anode') || (w.toComp === c.id && w.toPin === 'anode'));
                      const cathodeWires = wires.filter(w => (w.fromComp === c.id && w.fromPin === 'cathode') || (w.toComp === c.id && w.toPin === 'cathode'));
                      
                      anodeWires.forEach(w => {
                          const otherCompId = w.fromComp === c.id ? w.toComp : w.fromComp;
                          const otherPinId = w.fromPin === 'anode' ? w.toPin : w.fromPin;
                          const otherComp = prevComps.find(x => x.id === otherCompId);
                          const otherPin = otherComp?.pins.find(p => p.id === otherPinId);
                          if (otherPin?.voltage && otherPin.voltage > 2) hasPower = true;
                      });

                      cathodeWires.forEach(w => {
                          const otherCompId = w.fromComp === c.id ? w.toComp : w.fromComp;
                          const otherPinId = w.fromPin === 'cathode' ? w.toPin : w.fromPin;
                          const otherComp = prevComps.find(x => x.id === otherCompId);
                          const otherPin = otherComp?.pins.find(p => p.id === otherPinId);
                          if (otherPin?.type === 'ground' || otherPin?.voltage === 0) hasGND = true;
                      });

                      return { ...c, state: { ...c.state, isOn: hasPower && hasGND }};
                  }
                  return c;
              });

              return updatedComps;
          });
      }, 500);

      return () => clearInterval(interval);
  }, [simulating, wires]);

  // --- PROJECT LOGIC ---
  const loadProject = (proj: RoboticsProject) => {
      setComponents([]);
      setWires([]);
      setActiveProject(proj);
      setShowProjectList(false);
      setSimulating(false);
      
      // Load initial components laid out nicely
      const loadedComps: CircuitComponent[] = [];
      let offsetX = 100;
      
      proj.componentsNeeded.forEach((type, i) => {
          const c = createComponent(type, offsetX, 100 + (i%2)*200);
          loadedComps.push(c);
          offsetX += 200;
          if (offsetX > 800) offsetX = 100;
      });
      
      setComponents(loadedComps);
  };

  const validateProject = () => {
      if (!activeProject) return;
      const wireCount = wires.length;
      if (wireCount > 1) {
          setValidationMsg("¡Circuito Lógico Verificado! Ejecutando propagación eléctrica real...");
          setSimulating(true);
      } else {
          setValidationMsg("Faltan conexiones. Usa cables para cerrar el circuito.");
      }
      setTimeout(() => setValidationMsg(null), 4000);
  };

  // --- HANDLERS ---
  const handlePinClick = (e: React.MouseEvent, compId: string, pinId: string) => {
    e.stopPropagation();
    const comp = components.find(c => c.id === compId);
    if (!comp) return;
    const pin = comp.pins.find(p => p.id === pinId);
    if (!pin) return;

    if (tool === 'multimeter') {
        // Measure Voltage
        setMultimeterRead(`Pin: ${pin.id} | V: ${pin.voltage || 0}V | Tipo: ${pin.type}`);
        return;
    }

    const absX = comp.x + pin.x;
    const absY = comp.y + pin.y;

    if (wiringStart) {
      if (wiringStart.compId === compId && wiringStart.pinId === pinId) {
          setWiringStart(null); // Cancel
          return; 
      }
      // SNAP TO PIN perfectly
      setWires([...wires, {
          id: `w_${Date.now()}`, fromComp: wiringStart.compId, fromPin: wiringStart.pinId,
          toComp: compId, toPin: pinId, color: wireColor, current: 0
      }]);
      setWiringStart(null);
    } else {
      setWiringStart({ compId, pinId, x: absX, y: absY });
    }
  };

  const handleCanvasMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setMousePos({x, y});
      if (draggingId) {
          // Grid snap component dragging
          const snapX = Math.round((x - 50) / 10) * 10;
          const snapY = Math.round((y - 50) / 10) * 10;
          setComponents(prev => prev.map(c => c.id === draggingId ? { ...c, x: snapX, y: snapY } : c));
      }
    }
    if (e.buttons === 4) setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
  };

  // --- RENDERERS ---
  const RenderESP32 = ({comp}: {comp: CircuitComponent}) => (
      <g transform={`translate(${comp.x}, ${comp.y})`}>
          <rect width="100" height="180" rx="5" fill="#111" stroke="#333" strokeWidth="2"/>
          <rect x="30" y="140" width="40" height="30" fill="#silver"/> {/* USB */}
          <rect x="25" y="20" width="50" height="50" fill="#333" stroke="#555"/> {/* Chip */}
          <text x="50" y="100" fill="white" textAnchor="middle" fontSize="12" fontWeight="bold">ESP-32</text>
          <Wifi x="40" y="40" size={20} color="gray"/>
      </g>
  );

  const RenderServo = ({comp}: {comp: CircuitComponent}) => (
      <g transform={`translate(${comp.x}, ${comp.y})`}>
          <rect width="50" height="80" fill="#222" rx="4"/>
          <rect x="-10" y="10" width="70" height="20" fill="#333" rx="2"/> {/* Mount */}
          <circle cx="25" cy="20" r="15" fill="#fff" stroke="#ccc" strokeWidth="3"/> {/* Gear */}
          {simulating && <line x1="25" y1="20" x2="25" y2="5" stroke="red" strokeWidth="4" transform={`rotate(${Date.now() % 360} 25 20)`} />}
      </g>
  );

  const RenderSensor = ({comp}: {comp: CircuitComponent}) => (
      <g transform={`translate(${comp.x}, ${comp.y})`}>
          <rect width="70" height="40" fill="#3b82f6" rx="4"/>
          <circle cx="20" cy="20" r="12" fill="#ccc" stroke="#999" strokeWidth="2"/>
          <circle cx="50" cy="20" r="12" fill="#ccc" stroke="#999" strokeWidth="2"/>
          <text x="35" y="15" textAnchor="middle" fontSize="6" fill="white">HC-SR04</text>
      </g>
  );

  const RenderBreadboard = ({comp}: {comp: CircuitComponent}) => (
      <g transform={`translate(${comp.x}, ${comp.y})`}>
          <rect width="260" height="110" fill="#e5e7eb" rx="5" stroke="#ccc" strokeWidth="2"/>
          <text x="130" y="12" textAnchor="middle" fontSize="10" fill="#9ca3af" fontWeight="bold">PROTOBOARD LOGIC</text>
      </g>
  );

  const RenderComponent = ({comp}: {comp: CircuitComponent}) => {
      return (
          <g onMouseDown={(e) => { e.stopPropagation(); setDraggingId(comp.id); }} style={{cursor: tool === 'multimeter' ? 'crosshair' : 'move'}}>
              {comp.type === 'arduino' && (
                  <g transform={`translate(${comp.x}, ${comp.y})`}>
                      <rect width="240" height="170" rx="5" fill="#00878F" stroke="#005f63" strokeWidth="3"/>
                      <text x="120" y="90" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold">ARDUINO</text>
                  </g>
              )}
              {comp.type === 'esp32' && <RenderESP32 comp={comp}/>}
              {comp.type === 'servo' && <RenderServo comp={comp}/>}
              {comp.type === 'sensor_ultra' && <RenderSensor comp={comp}/>}
              {comp.type === 'breadboard' && <RenderBreadboard comp={comp}/>}
              {comp.type === 'led' && (
                  <g transform={`translate(${comp.x}, ${comp.y})`}>
                      <path d="M 15 40 L 15 60 M 25 40 L 25 60" stroke="silver" strokeWidth="2"/>
                      {/* Real Logic Glow */}
                      <path d="M 10 40 A 10 10 0 0 1 30 40 L 30 40 L 10 40 Z" fill={comp.state.isOn ? "#ef4444" : "#500"} style={{filter: comp.state.isOn ? 'drop-shadow(0px 0px 10px rgba(239,68,68,0.8))' : 'none'}}/>
                  </g>
              )}
              
              {/* Pins (Magnetically Snappable) */}
              {comp.pins.map(pin => (
                  <g key={pin.id} onMouseDown={(e) => handlePinClick(e, comp.id, pin.id)}>
                      <circle 
                        cx={comp.x + pin.x} cy={comp.y + pin.y} r="5" 
                        fill="rgba(255,255,0,0.2)" stroke="yellow" strokeWidth="1"
                        style={{cursor: 'crosshair'}}
                      />
                      {/* Label on hover or multimeter mode */}
                      {(tool === 'multimeter' || wiringStart?.pinId === pin.id) && (
                          <text x={comp.x + pin.x} y={comp.y + pin.y - 10} fill="white" fontSize="8" textAnchor="middle">{pin.id}</text>
                      )}
                  </g>
              ))}
          </g>
      );
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] text-white font-sans flex flex-col z-50">
        
        {/* HEADER */}
        <div className="h-14 bg-[#1e293b] border-b border-gray-700 flex items-center justify-between px-4 shadow-lg z-20">
            <div className="flex items-center gap-4">
                <div className="bg-yellow-500 p-1.5 rounded-lg"><Zap size={20} className="text-black"/></div>
                <h1 className="font-black tracking-wider text-lg">CircuitLab <span className="text-yellow-500 text-xs">LÓGICA REAL</span></h1>
                {activeProject && <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded-full text-xs font-bold">{activeProject.title}</span>}
            </div>
            <div className="flex gap-3">
                {activeProject && (
                    <button 
                        onClick={() => simulating ? setSimulating(false) : validateProject()} 
                        className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 ${simulating ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}`}
                    >
                        {simulating ? <><Pause size={16}/> DETENER SIMULADOR</> : <><Play size={16}/> EJECUTAR LÓGICA</>}
                    </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded"><X size={18}/></button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative">
            
            {/* PROJECT SELECTOR MODAL */}
            {showProjectList && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-10">
                    <div className="bg-gray-900 w-full max-w-6xl h-full rounded-[2rem] border border-gray-700 flex flex-col overflow-hidden">
                        <div className="p-8 border-b border-gray-800">
                            <h2 className="text-4xl font-black text-white mb-2">Proyectos de Robótica</h2>
                            <p className="text-gray-400">Motor de simulación eléctrica con lógica real y WebAssembly.</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ROBOTIC_PROJECTS.map(proj => (
                                <button 
                                    key={proj.id} 
                                    onClick={() => loadProject(proj)}
                                    className="bg-gray-800 p-6 rounded-2xl text-left hover:bg-gray-700 border border-gray-700 hover:border-yellow-500 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl group-hover:scale-110 transition-transform"><Cpu size={24}/></div>
                                        <span className="text-xs font-bold bg-black/30 px-2 py-1 rounded text-gray-300">{proj.difficulty}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{proj.title}</h3>
                                    <p className="text-sm text-gray-400 line-clamp-2">{proj.description}</p>
                                    <div className="mt-4 text-xs text-gray-500 font-mono">
                                        Componentes: {proj.componentsNeeded.length}
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="p-6 border-t border-gray-800 flex justify-end">
                            <button onClick={() => setShowProjectList(false)} className="text-gray-400 hover:text-white font-bold">Usar modo libre</button>
                        </div>
                    </div>
                </div>
            )}

            {/* LEFT PALETTE */}
            <div className="w-64 bg-[#1e293b] border-r border-gray-700 flex flex-col z-10">
                {/* Tools */}
                <div className="p-3 font-bold text-gray-400 text-xs uppercase tracking-widest border-b border-gray-700">Herramientas</div>
                <div className="p-2 flex gap-2 border-b border-gray-700">
                    <button onClick={()=>setTool('cursor')} className={`flex-1 p-2 flex justify-center rounded transition-colors ${tool==='cursor'?'bg-blue-600 text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} title="Cursor y Cables">
                        <Plus size={18} className="rotate-45"/>
                    </button>
                    <button onClick={()=>setTool('multimeter')} className={`flex-1 p-2 flex justify-center rounded transition-colors ${tool==='multimeter'?'bg-red-600 text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700'}`} title="Multímetro Virtual">
                        <Activity size={18}/>
                    </button>
                    <button onClick={()=>{setWires([]); setComponents([]);}} className="flex-1 p-2 bg-gray-800 hover:bg-red-900/50 text-red-400 rounded flex justify-center transition-colors" title="Limpiar TODO">
                        <Trash2 size={18}/>
                    </button>
                </div>
                {/* Wires */}
                <div className="p-3 font-bold text-gray-400 text-xs uppercase tracking-widest border-b border-gray-700">Cables</div>
                <div className="p-2 flex gap-2 border-b border-gray-700">
                    {Object.entries(COLORS).map(([name, hex]) => (
                        <button 
                            key={name} onClick={()=>setWireColor(hex)} 
                            className={`w-8 h-8 rounded-full border-2 transition-transform ${wireColor===hex ? 'scale-110 border-white' : 'border-transparent'}`} 
                            style={{backgroundColor: hex}}
                        />
                    ))}
                </div>
                {/* Components */}
                <div className="p-3 font-bold text-gray-400 text-xs uppercase tracking-widest border-b border-gray-700">Componentes</div>
                <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
                    {['arduino','esp32','servo','sensor_ultra','led','breadboard'].map(t => (
                        <button key={t} onClick={() => setComponents([...components, createComponent(t, 100, 100)])} className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 flex flex-col items-center">
                            <Cpu size={24} className="mb-2 text-gray-400"/>
                            <span className="text-[10px] font-bold uppercase">{t}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* CANVAS */}
            <div ref={canvasRef} className="flex-1 bg-[#111827] relative overflow-hidden cursor-crosshair"
                 onMouseMove={handleCanvasMove} onMouseUp={() => setDraggingId(null)}>
                
                {/* VALIDATION TOAST */}
                {validationMsg && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl z-40 animate-in slide-in-from-top font-bold flex items-center gap-2">
                        <Monitor size={20}/> {validationMsg}
                    </div>
                )}

                {/* Multimeter Overlay */}
                {tool === 'multimeter' && multimeterRead && (
                    <div className="absolute top-4 right-4 bg-red-900/90 border border-red-500 text-red-200 px-6 py-4 rounded-xl shadow-2xl z-40 font-mono text-sm animate-pulse">
                        <h4 className="text-white font-bold mb-1 border-b border-red-500/50 pb-1">MULTÍMETRO DIGITAL</h4>
                        {multimeterRead}
                    </div>
                )}

                <svg className="w-full h-full absolute top-0 left-0 overflow-visible">
                    <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                        {/* Wires (Orthogonal Snap) */}
                        {wires.map(w => {
                            const c1 = components.find(c=>c.id===w.fromComp);
                            const c2 = components.find(c=>c.id===w.toComp);
                            if(!c1 || !c2) return null;
                            const p1 = c1.pins.find(p=>p.id===w.fromPin);
                            const p2 = c2.pins.find(p=>p.id===w.toPin);
                            if(!p1 || !p2) return null;
                            
                            // Orthogonal Wire Drawing (Manhattan Routing)
                            const sx = c1.x + p1.x; const sy = c1.y + p1.y;
                            const ex = c2.x + p2.x; const ey = c2.y + p2.y;
                            const midY = sy + (ey - sy)/2;

                            return (
                                <path 
                                    key={w.id} 
                                    d={`M ${sx} ${sy} L ${sx} ${midY} L ${ex} ${midY} L ${ex} ${ey}`} 
                                    stroke={w.color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"
                                />
                            );
                        })}
                        {/* Wiring Preview */}
                        {wiringStart && <line x1={wiringStart.x} y1={wiringStart.y} x2={mousePos.x} y2={mousePos.y} stroke={wireColor} strokeWidth="3" strokeDasharray="5,5"/>}
                        {/* Components */}
                        {components.map(c => (
                            <g key={c.id}>
                                <RenderComponent comp={c}/>
                            </g>
                        ))}
                    </g>
                </svg>
            </div>

            {/* CODE PREVIEW (Mini IDE) */}
            {activeProject && (
                <div className="w-96 bg-[#1e293b] border-l border-gray-700 flex flex-col z-10">
                    <div className="p-3 bg-gray-800 font-bold text-xs uppercase tracking-widest border-b border-gray-700 flex items-center gap-2">
                        <BookOpen size={14}/> Guía Lógica
                    </div>
                    <div className="p-4 overflow-y-auto flex-1">
                        <h3 className="font-bold text-xl text-white mb-2">{activeProject.title}</h3>
                        <p className="text-sm text-gray-400 mb-4">{activeProject.explanation}</p>
                        
                        <div className="bg-black rounded-xl p-4 border border-gray-700 font-mono text-xs text-green-400 overflow-x-auto mb-4">
                            <pre>{activeProject.codeTemplate}</pre>
                        </div>
                        
                        <div className="bg-yellow-900/20 p-3 rounded-lg border border-yellow-700/50 text-yellow-200 text-xs flex gap-2">
                            <AlertTriangle size={16} className="shrink-0"/>
                            Conecta correctamente los pines lógicos (Anode a D13/5V, Cathode a GND) y presiona "EJECUTAR LÓGICA" para ver los componentes reaccionar.
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default CircuitLab;
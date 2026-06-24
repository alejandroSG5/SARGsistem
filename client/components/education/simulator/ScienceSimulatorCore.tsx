import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PhysicsEngine, Particle } from './engine/PhysicsEngine';
import { Renderer } from './engine/Renderer';
import { AutomataEngine, ElementType } from './engine/AutomataEngine';
import { OpticsEngine, OpticsObjType, LaserSource, OpticsObject } from './engine/OpticsEngine';
import { EvoEngine } from './engine/EvoEngine';
import { QuantumEngine } from './engine/QuantumEngine';
import { SCENARIOS, generateId } from './data/Scenarios';
import { UltimateHUD, SimulatorMode } from './ui/UltimateHUD';
import { VecMath, Vec2 } from './engine/Math';

export const ScienceSimulatorCore: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [mode, setMode] = useState<SimulatorMode>('ASTRO');

    // ==========================================
    // ENGINE REFS
    // ==========================================
    const astroEngineRef = useRef(new PhysicsEngine());
    const astroRendererRef = useRef<Renderer | null>(null);
    const automataRef = useRef<AutomataEngine | null>(null);
    const opticsRef = useRef(new OpticsEngine());
    const evoRef = useRef<EvoEngine | null>(null);
    const quantumRef = useRef<QuantumEngine | null>(null);

    // ==========================================
    // ASTRO STATE
    // ==========================================
    const [bodies, setBodies] = useState<Particle[]>([]);
    const bodiesRef = useRef<Particle[]>([]);
    const [timeScale, setTimeScale] = useState<number>(1);
    const timeScaleRef = useRef(1);
    const [selectedBodyId, setSelectedBodyId] = useState<string | null>(null);
    const [engineG, setEngineG] = useState<number>(0.5);
    const [useRK4, setUseRK4] = useState<boolean>(true);
    const [scale, setScale] = useState(1.0);
    const [offset, setOffset] = useState<Vec2>({ x: 0, y: 0 });

    // ==========================================
    // CHEMISTRY STATE
    // ==========================================
    const [chemElement, setChemElement] = useState<number>(2); // Default Sand
    const [brushSize, setBrushSize] = useState<number>(3);
    const CHEM_CELL_SIZE = 4;

    // ==========================================
    // OPTICS STATE
    // ==========================================
    const [opticsTool, setOpticsTool] = useState<string>('laser_red');

    // ==========================================
    // QUANTUM STATE
    // ==========================================
    const [quantumTool, setQuantumTool] = useState<string>('source');
    const QUANTUM_CELL_SIZE = 4;
    
    // ==========================================
    // GLOBAL INTERACTION STATE
    // ==========================================
    const [isDragging, setIsDragging] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const dragStartRef = useRef<Vec2>({ x: 0, y: 0 });
    const dragCurrentRef = useRef<Vec2>({ x: 0, y: 0 });

    // Sync refs
    useEffect(() => { bodiesRef.current = bodies; }, [bodies]);
    useEffect(() => { timeScaleRef.current = timeScale; }, [timeScale]);
    useEffect(() => { astroEngineRef.current.G = engineG; }, [engineG]);
    useEffect(() => {
        if (astroRendererRef.current) {
            astroRendererRef.current.scale = scale;
            astroRendererRef.current.offset = offset;
        }
    }, [scale, offset]);

    // Init global
    useEffect(() => {
        if (canvasRef.current) {
            astroRendererRef.current = new Renderer(canvasRef.current);
            handleResize();
            loadScenario('solar_system');
        }
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleResize = () => {
        if (canvasRef.current) {
            const parent = canvasRef.current.parentElement;
            if (parent) {
                const w = parent.clientWidth;
                const h = parent.clientHeight;
                canvasRef.current.width = w;
                canvasRef.current.height = h;
                
                if (astroRendererRef.current) {
                    astroRendererRef.current.resize(w, h);
                }
                
                automataRef.current = new AutomataEngine(Math.ceil(w / CHEM_CELL_SIZE), Math.ceil(h / CHEM_CELL_SIZE));
                
                if (!evoRef.current) {
                    evoRef.current = new EvoEngine();
                }
                evoRef.current.width = w;
                evoRef.current.height = h;

                quantumRef.current = new QuantumEngine(Math.ceil(w / QUANTUM_CELL_SIZE), Math.ceil(h / QUANTUM_CELL_SIZE));
            }
        }
    };

    const loadScenario = useCallback((name: string) => {
        if (mode === 'ASTRO' && SCENARIOS[name]) {
            setBodies(SCENARIOS[name]());
            setOffset({ x: 0, y: 0 });
            setScale(1.0);
            setSelectedBodyId(null);
        }
    }, [mode]);

    const resetAll = useCallback(() => {
        if (mode === 'ASTRO') setBodies([]);
        if (mode === 'CHEMISTRY' && canvasRef.current) {
            const w = canvasRef.current.width;
            const h = canvasRef.current.height;
            automataRef.current = new AutomataEngine(Math.ceil(w / CHEM_CELL_SIZE), Math.ceil(h / CHEM_CELL_SIZE));
        }
        if (mode === 'OPTICS') {
            opticsRef.current.lasers = [];
            opticsRef.current.objects = [];
        }
        if (mode === 'BIOLOGY' && evoRef.current) {
            evoRef.current.init();
        }
        if (mode === 'QUANTUM' && quantumRef.current) {
            quantumRef.current.sources = [];
            quantumRef.current.clearWalls();
        }
    }, [mode]);

    // Main Engine Loop
    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();

        const loop = (time: number) => {
            const dtRaw = (time - lastTime) / 1000;
            lastTime = time;

            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d', { alpha: false });

            if (canvas && ctx) {
                // Background
                ctx.fillStyle = '#050814';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                if (mode === 'ASTRO') {
                    const dt = Math.min(dtRaw, 0.1) * timeScaleRef.current;
                    if (dt > 0) {
                        const subSteps = timeScaleRef.current > 1 ? 2 : 1;
                        const subDt = dt / subSteps;
                        for(let i=0; i<subSteps; i++) {
                            astroEngineRef.current.step(bodiesRef.current, subDt, useRK4);
                        }
                    }
                    if (astroRendererRef.current) {
                        astroRendererRef.current.render(bodiesRef.current, isDragging, dragStartRef.current, dragCurrentRef.current);
                    }
                } 
                else if (mode === 'CHEMISTRY') {
                    if (automataRef.current) {
                        // Apply continuous brush if dragging
                        if (isDragging) {
                            const gridX = Math.floor(dragCurrentRef.current.x / CHEM_CELL_SIZE);
                            const gridY = Math.floor(dragCurrentRef.current.y / CHEM_CELL_SIZE);
                            for(let dy = -brushSize; dy <= brushSize; dy++) {
                                for(let dx = -brushSize; dx <= brushSize; dx++) {
                                    if (dx*dx + dy*dy <= brushSize*brushSize) {
                                        // Random noise placement for organics like fire/gas/water
                                        if (chemElement !== 0 && chemElement !== 1 && Math.random() > 0.5) continue; 
                                        automataRef.current.set(gridX + dx, gridY + dy, chemElement);
                                    }
                                }
                            }
                        }
                        
                        // Physics step
                        automataRef.current.step();
                        // Render
                        automataRef.current.render(ctx, CHEM_CELL_SIZE);
                    }
                }
                else if (mode === 'OPTICS') {
                    // Draw Optics Objects
                    ctx.lineWidth = 2;
                    for (const obj of opticsRef.current.objects) {
                        ctx.beginPath();
                        ctx.moveTo(obj.p1.x, obj.p1.y);
                        ctx.lineTo(obj.p2.x, obj.p2.y);
                        
                        if (obj.type === OpticsObjType.MIRROR) {
                            ctx.strokeStyle = '#9ca3af'; // silver
                            ctx.lineWidth = 4;
                        } else if (obj.type === OpticsObjType.GLASS_PRISM) {
                            ctx.strokeStyle = 'rgba(167, 139, 250, 0.5)'; // clear purple tint
                            ctx.lineWidth = 6;
                        } else {
                            ctx.strokeStyle = '#1f2937'; // black absorber
                            ctx.lineWidth = 10;
                        }
                        ctx.stroke();
                    }

                    // Draw Lasers Sources
                    for (const laser of opticsRef.current.lasers) {
                        ctx.beginPath();
                        ctx.arc(laser.pos.x, laser.pos.y, 6, 0, Math.PI * 2);
                        ctx.fillStyle = '#374151';
                        ctx.fill();
                        ctx.strokeStyle = laser.color;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }

                    // Compute & Draw Rays
                    const rays = opticsRef.current.step();
                    ctx.globalCompositeOperation = 'screen'; // Additive blending for light
                    for (const ray of rays) {
                        ctx.beginPath();
                        ctx.moveTo(ray.start.x, ray.start.y);
                        ctx.lineTo(ray.end.x, ray.end.y);
                        ctx.strokeStyle = ray.color;
                        ctx.globalAlpha = ray.intensity;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        
                        // Core beam
                        ctx.strokeStyle = '#ffffff';
                        ctx.globalAlpha = ray.intensity * 0.5;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    ctx.globalAlpha = 1.0;
                    ctx.globalCompositeOperation = 'source-over';

                    // Draw drag preview
                    if (isDragging) {
                        ctx.beginPath();
                        ctx.moveTo(dragStartRef.current.x, dragStartRef.current.y);
                        ctx.lineTo(dragCurrentRef.current.x, dragCurrentRef.current.y);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.setLineDash([5, 5]);
                        ctx.stroke();
                        ctx.setLineDash([]);
                    }
                }
                else if (mode === 'BIOLOGY') {
                    if (evoRef.current) {
                        evoRef.current.step();
                        evoRef.current.render(ctx);
                    }
                }
                else if (mode === 'QUANTUM') {
                    if (quantumRef.current) {
                        if (isDragging && quantumTool === 'wall') {
                            const gridX = Math.floor(dragCurrentRef.current.x / QUANTUM_CELL_SIZE);
                            const gridY = Math.floor(dragCurrentRef.current.y / QUANTUM_CELL_SIZE);
                            quantumRef.current.addWall(gridX, gridY, 2);
                        }
                        
                        // Physics step (run multiple steps for faster waves)
                        for(let i=0; i<3; i++) {
                            quantumRef.current.step();
                        }
                        // Render
                        quantumRef.current.render(ctx, QUANTUM_CELL_SIZE);
                    }
                }
            }

            animationFrameId = requestAnimationFrame(loop);
        };

        animationFrameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationFrameId);
    }, [mode, useRK4, isDragging, chemElement, brushSize]);

    // UI React Loop for Astro
    useEffect(() => {
        const interval = setInterval(() => {
            if (mode === 'ASTRO' && selectedBodyId) {
                setBodies(b => [...b]); 
            }
        }, 100);
        return () => clearInterval(interval);
    }, [mode, selectedBodyId]);

    // Input Handling
    const getScreenPos = (e: React.MouseEvent | React.TouchEvent): Vec2 => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        let cx, cy;
        if ('touches' in e) {
            cx = e.touches[0].clientX; cy = e.touches[0].clientY;
        } else {
            cx = (e as React.MouseEvent).clientX; cy = (e as React.MouseEvent).clientY;
        }
        return { x: cx - rect.left, y: cy - rect.top };
    };

    const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
        const pos = getScreenPos(e);
        dragStartRef.current = pos;
        dragCurrentRef.current = pos;
        
        if (mode === 'ASTRO') {
            if ('button' in e && (e.button === 1 || e.button === 2)) {
                setIsPanning(true);
                return;
            }
            const worldPos = astroRendererRef.current?.toWorld(pos) || { x: 0, y: 0 };
            let clickedBody = null;
            for (const body of bodiesRef.current) {
                if (VecMath.distance(worldPos, body.pos) <= body.radius + 10 / scale) {
                    clickedBody = body; break;
                }
            }
            if (clickedBody) setSelectedBodyId(clickedBody.id);
            else setIsDragging(true);
        } else if (mode === 'CHEMISTRY') {
            setIsDragging(true); // Brushing starts
        } else if (mode === 'OPTICS') {
            setIsDragging(true); // Drawing lines/lasers
        } else if (mode === 'BIOLOGY') {
            if (evoRef.current) {
                evoRef.current.foods.push({
                    id: generateId(),
                    pos: pos,
                    nutrition: 50
                });
            }
        } else if (mode === 'QUANTUM') {
            if (quantumTool === 'source' && quantumRef.current) {
                const gridX = Math.floor(pos.x / QUANTUM_CELL_SIZE);
                const gridY = Math.floor(pos.y / QUANTUM_CELL_SIZE);
                quantumRef.current.addSource(gridX, gridY, 2.0); // frequency 2.0
            } else if (quantumTool === 'wall') {
                setIsDragging(true);
            }
        }
    };

    const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
        const pos = getScreenPos(e);
        if (mode === 'ASTRO' && isPanning) {
            const dx = (pos.x - dragStartRef.current.x) / scale;
            const dy = (pos.y - dragStartRef.current.y) / scale;
            setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            dragStartRef.current = pos;
            return;
        }
        if (isDragging) {
            dragCurrentRef.current = pos;
        }
    };

    const handlePointerUp = () => {
        setIsPanning(false);
        if (isDragging) {
            setIsDragging(false);
            
            if (mode === 'ASTRO' && astroRendererRef.current) {
                const startW = astroRendererRef.current.toWorld(dragStartRef.current);
                const endW = astroRendererRef.current.toWorld(dragCurrentRef.current);
                const dx = startW.x - endW.x;
                const dy = startW.y - endW.y;
                if (VecMath.mag({x: dx, y: dy}) > 1) {
                    setBodies(prev => [...prev, {
                        id: generateId(), name: 'Planeta Artificial',
                        pos: startW, vel: { x: dx * 0.05, y: dy * 0.05 }, acc: { x: 0, y: 0 },
                        mass: Math.random() * 20 + 5, radius: Math.random() * 5 + 4,
                        color: ['#60a5fa', '#34d399', '#f472b6', '#c084fc', '#fcd34d'][Math.floor(Math.random() * 5)],
                        isStatic: false, temperature: 200, trail: []
                    }]);
                }
            } 
            else if (mode === 'OPTICS') {
                const dx = dragCurrentRef.current.x - dragStartRef.current.x;
                const dy = dragCurrentRef.current.y - dragStartRef.current.y;
                
                if (VecMath.mag({x: dx, y: dy}) > 5) {
                    if (opticsTool.startsWith('laser')) {
                        opticsRef.current.lasers.push({
                            id: generateId(),
                            pos: dragStartRef.current,
                            dir: VecMath.normalize({x: dx, y: dy}),
                            color: opticsTool === 'laser_red' ? '#ef4444' : '#ffffff'
                        });
                    } else {
                        let type = OpticsObjType.MIRROR;
                        if (opticsTool === 'prism') type = OpticsObjType.GLASS_PRISM;
                        if (opticsTool === 'absorber') type = OpticsObjType.ABSORBER;
                        
                        opticsRef.current.objects.push({
                            id: generateId(),
                            type,
                            p1: dragStartRef.current,
                            p2: dragCurrentRef.current,
                            ior: 1.5
                        });
                    }
                }
            }
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (mode !== 'ASTRO') return;
        const zoomFactor = 1.1;
        if (e.deltaY < 0) setScale(s => s * zoomFactor);
        else setScale(s => s / zoomFactor);
    };

    const selectedBody = bodies.find(b => b.id === selectedBodyId) || null;

    return (
        <div className="w-full h-full relative bg-[#050814] overflow-hidden">
            <UltimateHUD 
                mode={mode} setMode={setMode}
                timeScale={timeScale} setTimeScale={setTimeScale}
                selectedBody={selectedBody} setSelectedBody={(b) => setSelectedBodyId(b ? b.id : null)}
                bodyCount={bodies.length} loadScenario={loadScenario}
                scale={scale} setScale={setScale}
                engineG={engineG} setEngineG={setEngineG}
                reset={resetAll}
                chemElement={chemElement} setChemElement={setChemElement}
                brushSize={brushSize} setBrushSize={setBrushSize}
                opticsTool={opticsTool} setOpticsTool={setOpticsTool}
                quantumTool={quantumTool} setQuantumTool={setQuantumTool}
            />
            
            <div className="absolute inset-0 z-0"
                 onPointerDown={handlePointerDown}
                 onPointerMove={handlePointerMove}
                 onPointerUp={handlePointerUp}
                 onPointerLeave={handlePointerUp}
                 onWheel={handleWheel}
                 onContextMenu={(e) => e.preventDefault()}
                 style={{ touchAction: 'none', cursor: mode === 'ASTRO' ? 'crosshair' : 'default' }}
            >
                <canvas ref={canvasRef} className="w-full h-full block" />
            </div>
        </div>
    );
};

export default ScienceSimulatorCore;

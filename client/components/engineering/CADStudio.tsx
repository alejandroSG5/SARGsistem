import React, { useState, useRef, useEffect } from 'react';
import { 
  Pencil, Square, Circle, Type, MousePointer, Trash2, 
  Layers, Grid, Save, Download, Move, RotateCw, 
  ZoomIn, ZoomOut, Undo, Redo, Settings, FilePlus, PenTool, X,
  Ruler, Magnet
} from 'lucide-react';
import { CADShape } from '../../types';

// Extended Shape Type for CAD
interface ExtendedShape extends CADShape {
  text?: string;
  isDimension?: boolean;
}

const CADStudio: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [shapes, setShapes] = useState<ExtendedShape[]>([]);
  const [tool, setTool] = useState<'select' | 'line' | 'rect' | 'circle' | 'text' | 'dimension'>('select');
  const [activeLayer, setActiveLayer] = useState('Layer 0');
  const [gridSnap, setGridSnap] = useState(true);
  const [osnap, setOsnap] = useState(true); // Object Snap
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, realX: 0, realY: 0 });
  
  // Interaction State
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{x: number, y: number} | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>(["AxolotlCAD v5.0 (MOTOR LÓGICO) Inicializado..."]);
  const [cmdInput, setCmdInput] = useState('');

  // --- LOGIC & MATH ---
  const distance = (x1: number, y1: number, x2: number, y2: number) => Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

  const getSnapPoints = () => {
      const points: {x: number, y: number, type: string}[] = [];
      shapes.forEach(s => {
          if (s.type === 'line' && s.x2 !== undefined && s.y2 !== undefined) {
              points.push({x: s.x, y: s.y, type: 'endpoint'});
              points.push({x: s.x2, y: s.y2, type: 'endpoint'});
              points.push({x: (s.x + s.x2)/2, y: (s.y + s.y2)/2, type: 'midpoint'});
          } else if (s.type === 'rect' && s.w !== undefined && s.h !== undefined) {
              points.push({x: s.x, y: s.y, type: 'endpoint'});
              points.push({x: s.x + s.w, y: s.y, type: 'endpoint'});
              points.push({x: s.x, y: s.y + s.h, type: 'endpoint'});
              points.push({x: s.x + s.w, y: s.y + s.h, type: 'endpoint'});
              points.push({x: s.x + s.w/2, y: s.y + s.h/2, type: 'center'});
          } else if (s.type === 'circle' && s.r !== undefined) {
              points.push({x: s.x, y: s.y, type: 'center'});
          }
      });
      return points;
  };

  const calculateSnap = (wx: number, wy: number) => {
      let finalX = wx;
      let finalY = wy;
      let snapped = false;

      // 1. OSNAP (Object Snap)
      if (osnap) {
          const points = getSnapPoints();
          let closestDist = 15 / zoom;
          let closestPt = null;

          points.forEach(pt => {
              const d = distance(wx, wy, pt.x, pt.y);
              if (d < closestDist) {
                  closestDist = d;
                  closestPt = pt;
              }
          });

          if (closestPt) {
              finalX = (closestPt as any).x;
              finalY = (closestPt as any).y;
              snapped = true;
          }
      }

      // 2. GRID SNAP (if not OSNAPPED)
      if (gridSnap && !snapped) {
          finalX = Math.round(wx / 20) * 20;
          finalY = Math.round(wy / 20) * 20;
      }

      return { x: finalX, y: finalY };
  };


  // Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize
    const parent = canvas.parentElement;
    if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    }

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    const gridSize = 20 * zoom;
    const offsetX = pan.x % gridSize;
    const offsetY = pan.y % gridSize;
    
    ctx.beginPath();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 0.5;
    
    for(let x = offsetX; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
    }
    for(let y = offsetY; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();

    // Origin Axis
    const originX = pan.x;
    const originY = pan.y;
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444'; // Red X
    ctx.lineWidth = 2;
    ctx.moveTo(originX, originY); ctx.lineTo(originX + 50, originY);
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = '#22c55e'; // Green Y
    ctx.moveTo(originX, originY); ctx.lineTo(originX, originY - 50); // Y up
    ctx.stroke();

    // Shapes
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    shapes.forEach(shape => {
        const isSel = selectedIds.includes(shape.id);
        ctx.strokeStyle = isSel ? '#fbbf24' : shape.color;
        ctx.lineWidth = shape.strokeWidth / zoom;
        if (isSel) ctx.setLineDash([5, 5]); else ctx.setLineDash([]);

        ctx.beginPath();
        if (shape.type === 'line' && shape.x2 !== undefined && shape.y2 !== undefined) {
            ctx.moveTo(shape.x, shape.y);
            ctx.lineTo(shape.x2, shape.y2);
            
            // Draw dimension specifics if it's a dimension line
            if (shape.isDimension) {
                ctx.stroke(); // draw line first
                
                // Draw text
                const dist = distance(shape.x, shape.y, shape.x2, shape.y2);
                const midX = (shape.x + shape.x2) / 2;
                const midY = (shape.y + shape.y2) / 2;
                const angle = Math.atan2(shape.y2 - shape.y, shape.x2 - shape.x);
                
                ctx.save();
                ctx.translate(midX, midY);
                ctx.rotate(angle);
                ctx.fillStyle = shape.color;
                ctx.font = `${12/zoom}px monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(`${dist.toFixed(2)} mm`, 0, -2/zoom);
                ctx.restore();
                
                // Arrows (simplified)
                const arrowSize = 6 / zoom;
                ctx.beginPath();
                ctx.moveTo(shape.x, shape.y); ctx.arc(shape.x, shape.y, arrowSize/2, 0, Math.PI*2); ctx.fill();
                ctx.moveTo(shape.x2, shape.y2); ctx.arc(shape.x2, shape.y2, arrowSize/2, 0, Math.PI*2); ctx.fill();
            }

        } else if (shape.type === 'rect' && shape.w !== undefined && shape.h !== undefined) {
            ctx.rect(shape.x, shape.y, shape.w, shape.h);
        } else if (shape.type === 'circle' && shape.r !== undefined) {
            ctx.arc(shape.x, shape.y, shape.r, 0, Math.PI * 2);
        }
        if (!shape.isDimension) ctx.stroke();
        
        // Draw Handles if selected
        if(isSel) {
            ctx.fillStyle = '#3b82f6';
            const handleSize = 6 / zoom;
            ctx.fillRect(shape.x - handleSize/2, shape.y - handleSize/2, handleSize, handleSize);
            if(shape.x2) ctx.fillRect(shape.x2 - handleSize/2, shape.y2 - handleSize/2, handleSize, handleSize);
        }
    });

    // Preview Shape
    if (isDrawing && startPoint) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1 / zoom;
        ctx.setLineDash([2, 2]);
        const mx = mousePos.realX;
        const my = mousePos.realY;

        ctx.beginPath();
        if (tool === 'line' || tool === 'dimension') {
            ctx.moveTo(startPoint.x, startPoint.y);
            ctx.lineTo(mx, my);
            
            if (tool === 'dimension') {
                const dist = distance(startPoint.x, startPoint.y, mx, my);
                ctx.fillStyle = '#fff';
                ctx.font = `${12/zoom}px monospace`;
                ctx.fillText(`${dist.toFixed(2)}`, mx, my - 10/zoom);
            }

        } else if (tool === 'rect') {
            ctx.rect(startPoint.x, startPoint.y, mx - startPoint.x, my - startPoint.y);
        } else if (tool === 'circle') {
            const r = distance(startPoint.x, startPoint.y, mx, my);
            ctx.arc(startPoint.x, startPoint.y, r, 0, Math.PI * 2);
        }
        ctx.stroke();
    }

    ctx.restore();

  }, [shapes, pan, zoom, mousePos, isDrawing, startPoint, selectedIds, tool]);

  // Handle Inputs
  const handleMouseDown = (e: React.MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;
      
      const wx = (rx - pan.x) / zoom;
      const wy = (ry - pan.y) / zoom;
      const snappedPt = calculateSnap(wx, wy);

      if (tool === 'select') {
          // Simple hit detection (proximity)
          const hit = shapes.find(s => {
              const dist = distance(s.x, s.y, wx, wy);
              return dist < 10 / zoom; // Detection radius
          });
          if (hit) {
              if(e.shiftKey) setSelectedIds([...selectedIds, hit.id]);
              else setSelectedIds([hit.id]);
              
              // Calculate Area/Perimeter dynamically if selected
              let info = `ID: ${hit.id.substring(0,4)}`;
              if (hit.type === 'rect' && hit.w && hit.h) {
                  info += ` | Area: ${Math.abs(hit.w * hit.h).toFixed(2)} | Perim: ${Math.abs(2*hit.w + 2*hit.h).toFixed(2)}`;
              } else if (hit.type === 'circle' && hit.r) {
                  info += ` | Area: ${(Math.PI * hit.r * hit.r).toFixed(2)} | Circ: ${(2 * Math.PI * hit.r).toFixed(2)}`;
              } else if (hit.type === 'line' && hit.x2 && hit.y2) {
                  info += ` | Length: ${distance(hit.x, hit.y, hit.x2, hit.y2).toFixed(2)}`;
              }

              addCmd(`Selected: ${info}`);
          } else {
              setSelectedIds([]);
          }
      } else {
          setIsDrawing(true);
          setStartPoint({ x: snappedPt.x, y: snappedPt.y });
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const rx = e.clientX - rect.left;
      const ry = e.clientY - rect.top;
      
      // Pan with middle mouse
      if (e.buttons === 4) {
          setPan(p => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
      }

      const wx = (rx - pan.x) / zoom;
      const wy = (ry - pan.y) / zoom;
      
      // Snap only while drawing or just to show coords
      const snappedPt = calculateSnap(wx, wy);

      setMousePos({ x: rx, y: ry, realX: snappedPt.x, realY: snappedPt.y });
  };

  const handleMouseUp = () => {
      if (isDrawing && startPoint) {
          const ex = mousePos.realX;
          const ey = mousePos.realY;
          
          // Don't create zero size shapes
          if (Math.abs(ex - startPoint.x) > 0.1 || Math.abs(ey - startPoint.y) > 0.1) {
              const newShape: ExtendedShape = {
                  id: Date.now().toString(),
                  type: tool === 'dimension' ? 'line' : tool as any,
                  x: startPoint.x, y: startPoint.y,
                  color: tool === 'dimension' ? '#10b981' : '#ffffff', // Green for dimensions
                  strokeWidth: tool === 'dimension' ? 1 : 2, 
                  layer: activeLayer,
                  isDimension: tool === 'dimension'
              };

              if (tool === 'line' || tool === 'dimension') {
                  newShape.x2 = ex; newShape.y2 = ey;
                  addCmd(`${tool.toUpperCase()} from (${newShape.x},${newShape.y}) to (${ex},${ey}) L=${distance(newShape.x, newShape.y, ex, ey).toFixed(2)}`);
              } else if (tool === 'rect') {
                  newShape.w = ex - startPoint.x; newShape.h = ey - startPoint.y;
                  addCmd(`RECT ${newShape.w}x${newShape.h}`);
              } else if (tool === 'circle') {
                  newShape.r = distance(startPoint.x, startPoint.y, ex, ey);
                  addCmd(`CIRCLE R=${newShape.r.toFixed(2)}`);
              }

              setShapes([...shapes, newShape]);
          }
      }
      setIsDrawing(false);
      setStartPoint(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
      const scaleBy = 1.1;
      const newZoom = e.deltaY > 0 ? zoom / scaleBy : zoom * scaleBy;
      setZoom(Math.max(0.1, Math.min(10, newZoom)));
  };

  const addCmd = (txt: string) => {
      setCmdHistory(prev => [...prev.slice(-5), txt]);
  };

  const runCmd = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          const cmd = cmdInput.trim().toUpperCase();
          addCmd(`> ${cmdInput}`);
          if (cmd === 'LINE' || cmd === 'L') setTool('line');
          else if (cmd === 'CIRCLE' || cmd === 'C') setTool('circle');
          else if (cmd === 'RECT' || cmd === 'R') setTool('rect');
          else if (cmd === 'DIM' || cmd === 'D') setTool('dimension');
          else if (cmd === 'ERASE' || cmd === 'DELETE') {
              setShapes(shapes.filter(s => !selectedIds.includes(s.id)));
              setSelectedIds([]);
          }
          else if (cmd === 'CLEAR') setShapes([]);
          else if (cmd === 'OSNAP') setOsnap(!osnap);
          else if (cmd === 'GRID') setGridSnap(!gridSnap);
          else addCmd('Unknown command');
          setCmdInput('');
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f172a] flex flex-col text-gray-200 font-sans">
        {/* Top Bar */}
        <div className="h-14 bg-[#1e293b] border-b border-gray-700 flex items-center px-4 justify-between select-none shadow-md z-20">
            <div className="flex items-center gap-4">
                <div className="bg-purple-600/20 p-2 rounded-lg border border-purple-600/50">
                    <PenTool className="text-purple-400" size={20}/>
                </div>
                <span className="font-black text-lg tracking-widest text-white">CAD Studio <span className="text-purple-500 text-xs align-top">MOTOR REAL</span></span>
                
                <div className="h-6 w-px bg-gray-600 mx-2"></div>

                <div className="flex gap-1 bg-gray-800 p-1 rounded-lg">
                    <button title="Nuevo" onClick={()=>setShapes([])} className="p-2 hover:bg-gray-700 rounded transition-colors"><FilePlus size={16}/></button>
                    <button title="Guardar" className="p-2 hover:bg-gray-700 rounded transition-colors"><Save size={16}/></button>
                    <button title="Exportar DXF" className="p-2 hover:bg-gray-700 rounded transition-colors"><Download size={16}/></button>
                </div>
                
                <div className="flex gap-1">
                    <button title="Deshacer" className="p-2 hover:bg-gray-700 rounded text-gray-400"><Undo size={16}/></button>
                    <button title="Rehacer" className="p-2 hover:bg-gray-700 rounded text-gray-400"><Redo size={16}/></button>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="bg-gray-800 px-3 py-1 rounded text-xs font-mono text-purple-400 border border-gray-700">
                    X: {mousePos.realX.toFixed(2)} Y: {mousePos.realY.toFixed(2)}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-colors"><X/></button>
            </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
            {/* Left Toolbar */}
            <div className="w-16 bg-[#1e293b] border-r border-gray-700 flex flex-col items-center py-4 gap-4 z-10">
                <ToolBtn icon={<MousePointer/>} active={tool==='select'} onClick={() => setTool('select')} label="Select"/>
                <div className="h-px w-8 bg-gray-700"></div>
                <ToolBtn icon={<Pencil/>} active={tool==='line'} onClick={() => setTool('line')} label="Line"/>
                <ToolBtn icon={<Square/>} active={tool==='rect'} onClick={() => setTool('rect')} label="Rect"/>
                <ToolBtn icon={<Circle/>} active={tool==='circle'} onClick={() => setTool('circle')} label="Circle"/>
                <ToolBtn icon={<Ruler/>} active={tool==='dimension'} onClick={() => setTool('dimension')} label="Dimension (Cota)"/>
                
                <div className="mt-auto flex flex-col gap-2 w-full px-2">
                    <button 
                        onClick={() => setOsnap(!osnap)} 
                        title="OSNAP (Object Snap)"
                        className={`w-full p-2 flex justify-center rounded-lg transition-colors border ${osnap ? 'bg-blue-900/50 border-blue-500 text-blue-400' : 'bg-gray-800 border-transparent text-gray-500'}`}
                    >
                        <Magnet size={18}/>
                    </button>
                    <button onClick={() => { setShapes(shapes.filter(s => !selectedIds.includes(s.id))); setSelectedIds([]); }} className="p-3 hover:bg-red-900/50 text-red-400 rounded-xl transition-colors flex justify-center w-full"><Trash2 size={20}/></button>
                </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-[#0f172a] cursor-crosshair overflow-hidden">
                <canvas 
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onWheel={handleWheel}
                    onContextMenu={e => e.preventDefault()}
                    className="block touch-none w-full h-full outline-none"
                />
                
                {/* Command Line Interface */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#1e293b]/95 backdrop-blur p-2 border-t border-gray-700 flex flex-col shadow-lg">
                    <div className="h-28 overflow-y-auto text-xs font-mono text-gray-400 p-2 space-y-1 pointer-events-none select-none">
                        {cmdHistory.map((cmd, i) => <div key={i}>{cmd}</div>)}
                    </div>
                    <div className="flex items-center gap-2 px-2 py-1 bg-black/30 rounded border border-gray-700">
                        <span className="text-purple-500 font-bold text-sm">{'>'}</span>
                        <input 
                            className="flex-1 bg-transparent outline-none text-white font-mono text-sm h-6 uppercase" 
                            value={cmdInput}
                            onChange={e => setCmdInput(e.target.value)}
                            onKeyDown={runCmd}
                            autoFocus
                            placeholder="Comando (ej. LINE, RECT, DIM, OSNAP)..."
                        />
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-72 bg-[#1e293b] border-l border-gray-700 flex flex-col z-10">
                <div className="p-4 bg-gray-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-gray-700">
                    <Layers size={14}/> Capas
                </div>
                <div className="p-2 space-y-1 border-b border-gray-700 max-h-48 overflow-y-auto">
                    {['Layer 0', 'Construction', 'Dimensions', 'Annotations'].map(l => (
                        <div key={l} onClick={() => setActiveLayer(l)} className={`px-4 py-3 rounded-lg text-sm cursor-pointer flex items-center justify-between transition-all ${activeLayer===l ? 'bg-purple-600 text-white shadow-lg' : 'hover:bg-gray-700 text-gray-400'}`}>
                            {l}
                            <div className={`w-3 h-3 rounded-full border ${activeLayer===l ? 'bg-white border-white' : 'border-gray-500'}`}></div>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2 border-b border-gray-700 mt-auto">
                    <Settings size={14}/> Propiedades & Snap
                </div>
                <div className="p-4 text-xs text-gray-400 space-y-6 bg-[#1e293b]">
                    <div>
                        <div className="flex justify-between mb-2">
                            <label>Grid Snap</label>
                            <span className={gridSnap ? "text-green-400" : "text-red-400"}>{gridSnap ? "ON" : "OFF"}</span>
                        </div>
                        <button onClick={() => setGridSnap(!gridSnap)} className={`w-full py-2 rounded font-bold transition-all ${gridSnap ? 'bg-green-900/50 border border-green-600 text-green-400' : 'bg-gray-800 border border-gray-600'}`}>
                            <Grid size={14} className="inline mr-2"/> Toggle Snap
                        </button>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <label>Object Snap (OSNAP)</label>
                            <span className={osnap ? "text-blue-400" : "text-red-400"}>{osnap ? "ON" : "OFF"}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-2">Snaps to endpoints, midpoints, and centers using mathematical vectors.</p>
                    </div>
                    <div>
                        <label className="block mb-2">Zoom Level</label>
                        <div className="flex items-center gap-2 bg-gray-800 p-1 rounded border border-gray-700">
                            <button onClick={() => setZoom(z => z*0.9)} className="p-2 hover:bg-gray-700 rounded"><ZoomOut size={14}/></button>
                            <span className="flex-1 text-center font-mono text-white">{(zoom*100).toFixed(0)}%</span>
                            <button onClick={() => setZoom(z => z*1.1)} className="p-2 hover:bg-gray-700 rounded"><ZoomIn size={14}/></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

const ToolBtn = ({icon, active, onClick, label}: any) => (
    <button 
        onClick={onClick}
        title={label}
        className={`p-3 rounded-xl transition-all ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20 scale-110' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
    >
        {React.cloneElement(icon, { size: 24 })}
    </button>
);

export default CADStudio;

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
    Pencil, Eraser, Trash2, Download, Undo, Redo, Square, Circle, 
    Type, Hand, MousePointer2, FileText, Image as ImageIcon, 
    Triangle, Minus, ArrowRight, Settings, X, BookOpen, PenTool, Highlighter,
    Palette, ZoomIn, ZoomOut, Maximize
} from 'lucide-react';
import { jsPDF } from 'jspdf';

type ToolType = 'pencil' | 'eraser' | 'rect' | 'circle' | 'text' | 'triangle' | 'line' | 'arrow' | 'highlighter' | 'spray' | 'pan';
type PaperType = 'blank' | 'grid' | 'dots' | 'lined' | 'dark';

interface DrawAction {
    tool: ToolType;
    color: string;
    lineWidth: number;
    path: {x: number, y: number}[]; 
    text?: string;
}

const CANVAS_SIZE = 3000; // Safe limit for cross-browser memory (mobile Safari limit is ~4096)

const VirtualWhiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // States
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<ToolType>('pencil');
  const [paper, setPaper] = useState<PaperType>('grid');
  
  // History (Path-based to save RAM)
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);

  // PDF Split View
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Pan & Zoom State
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });
  const [zoom, setZoom] = useState(1);

  // Init
  useEffect(() => {
    initCanvas();
    
    // Check IndexedDB for shared PWA files
    const request = indexedDB.open('SargSharedFiles', 1);
    request.onsuccess = (e: any) => {
        const db = e.target.result;
        if (db.objectStoreNames.contains('files')) {
            const tx = db.transaction('files', 'readwrite');
            const store = tx.objectStore('files');
            const getReq = store.get('shared-pdf');
            getReq.onsuccess = () => {
                const file = getReq.result;
                if (file) {
                    const url = URL.createObjectURL(file);
                    setPdfUrl(url);
                    store.delete('shared-pdf'); // Clean up
                }
            };
        }
    };
  }, [paper, zoom]);

  const drawPaperPattern = (ctx: CanvasRenderingContext2D, type: PaperType) => {
      // Optimizacion: Limpiar el canvas. El patron visual real se maneja via CSS en el div contenedor para no saturar el GPU redibujando 15,000 puntos cada frame.
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      
      // Solo pintamos un fondo opaco si es dark, sino lo dejamos transparente para que se vea el CSS de fondo.
      if (type === 'dark') {
          ctx.fillStyle = '#151b23';
          ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      } else if (type === 'blank') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      }
  };

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = CANVAS_SIZE;
      canvas.height = CANVAS_SIZE;
      const ctx = canvas.getContext('2d');
      if (ctx) {
          ctx.scale(zoom, zoom);
          redrawCanvas(ctx);
          
          if (containerRef.current && historyStep === -1 && actions.length === 0) {
              containerRef.current.scrollLeft = (CANVAS_SIZE * zoom) / 2 - containerRef.current.clientWidth / 2;
              containerRef.current.scrollTop = (CANVAS_SIZE * zoom) / 2 - containerRef.current.clientHeight / 2;
          }
      }
    }
  }, [paper, zoom, actions, historyStep]);

  const drawActionOnCtx = (ctx: CanvasRenderingContext2D, action: DrawAction) => {
      if (action.path.length === 0) return;
      
      ctx.beginPath();
      ctx.strokeStyle = action.tool === 'eraser' ? (paper === 'dark' ? '#151b23' : '#ffffff') : action.color;
      ctx.lineWidth = action.tool === 'eraser' ? action.lineWidth * 5 : action.lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (action.tool === 'highlighter') {
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = action.lineWidth * 3;
      } else {
          ctx.globalAlpha = 1.0;
      }

      const start = action.path[0];
      const end = action.path[action.path.length - 1];

      if (action.tool === 'pencil' || action.tool === 'eraser' || action.tool === 'highlighter') {
          ctx.moveTo(start.x, start.y);
          for (let i = 1; i < action.path.length; i++) {
              ctx.lineTo(action.path[i].x, action.path[i].y);
          }
          ctx.stroke();
      } else if (action.tool === 'spray') {
          ctx.fillStyle = action.color;
          action.path.forEach(p => {
              for(let i=0; i<10; i++){
                  const offsetX = (Math.random() - 0.5) * action.lineWidth * 4;
                  const offsetY = (Math.random() - 0.5) * action.lineWidth * 4;
                  ctx.fillRect(p.x + offsetX, p.y + offsetY, 1, 1);
              }
          });
      } else if (action.tool === 'line') {
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.stroke();
      } else if (action.tool === 'rect') {
          ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (action.tool === 'circle') {
          const r = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
          ctx.arc(start.x, start.y, r, 0, 2 * Math.PI);
          ctx.stroke();
      } else if (action.tool === 'triangle') {
          ctx.moveTo(start.x + (end.x - start.x)/2, start.y);
          ctx.lineTo(start.x, end.y);
          ctx.lineTo(end.x, end.y);
          ctx.closePath();
          ctx.stroke();
      } else if (action.tool === 'arrow') {
          const headlen = action.lineWidth * 3;
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const angle = Math.atan2(dy, dx);
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.lineTo(end.x - headlen * Math.cos(angle - Math.PI / 6), end.y - headlen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(end.x, end.y);
          ctx.lineTo(end.x - headlen * Math.cos(angle + Math.PI / 6), end.y - headlen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
      } else if (action.tool === 'text' && action.text) {
          ctx.fillStyle = action.color;
          ctx.font = `bold ${action.lineWidth * 5}px sans-serif`;
          ctx.fillText(action.text, start.x, start.y);
      }
      
      ctx.globalAlpha = 1.0;
  };

  const redrawCanvas = (ctx: CanvasRenderingContext2D) => {
      drawPaperPattern(ctx, paper);
      for (let i = 0; i <= historyStep; i++) {
          drawActionOnCtx(ctx, actions[i]);
      }
  };

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      let x, y;
      if ('touches' in e) {
          x = (e.touches[0].clientX - rect.left) / zoom;
          y = (e.touches[0].clientY - rect.top) / zoom;
      } else {
          x = ((e as React.MouseEvent).clientX - rect.left) / zoom;
          y = ((e as React.MouseEvent).clientY - rect.top) / zoom;
      }
      return { x, y };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (tool === 'pan') {
        setIsPanning(true);
        const touch = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
        setPanStart({ x: touch.clientX, y: touch.clientY });
        if (containerRef.current) {
            setScrollStart({ left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop });
        }
        return;
    }

    setIsDrawing(true);
    const pos = getCoords(e);
    
    if (tool === 'text') {
        const text = prompt("Escribe tu texto:");
        if (text) {
            const newAction: DrawAction = { tool, color, lineWidth, path: [pos], text };
            commitAction(newAction);
        }
        setIsDrawing(false);
        return;
    }

    setCurrentAction({ tool, color, lineWidth, path: [pos] });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPanning && containerRef.current) {
        const touch = 'touches' in e ? e.touches[0] : (e as React.MouseEvent);
        const dx = touch.clientX - panStart.x;
        const dy = touch.clientY - panStart.y;
        containerRef.current.scrollLeft = scrollStart.left - dx;
        containerRef.current.scrollTop = scrollStart.top - dy;
        return;
    }

    if (!isDrawing || !currentAction) return;
    const pos = getCoords(e);
    
    const updatedAction = { ...currentAction, path: [...currentAction.path, pos] };
    
    if (tool === 'pencil' || tool === 'eraser' || tool === 'highlighter' || tool === 'spray') {
        setCurrentAction(updatedAction);
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.scale(zoom, zoom);
            drawActionOnCtx(ctx, { ...updatedAction, path: [currentAction.path[currentAction.path.length-1], pos] });
            ctx.scale(1/zoom, 1/zoom);
        }
    } else {
        // Shapes preview (redraw everything + current shape)
        setCurrentAction({ ...currentAction, path: [currentAction.path[0], pos] });
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx) {
            ctx.scale(zoom, zoom);
            redrawCanvas(ctx);
            drawActionOnCtx(ctx, { ...currentAction, path: [currentAction.path[0], pos] });
            ctx.scale(1/zoom, 1/zoom);
        }
    }
  };

  const stopDrawing = () => {
    if (isPanning) { setIsPanning(false); return; }
    if (isDrawing && currentAction) {
        commitAction(currentAction);
    }
    setIsDrawing(false);
    setCurrentAction(null);
  };

  const commitAction = (action: DrawAction) => {
      const newActions = actions.slice(0, historyStep + 1);
      newActions.push(action);
      setActions(newActions);
      setHistoryStep(newActions.length - 1);
      
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
          ctx.scale(zoom, zoom);
          redrawCanvas(ctx);
          ctx.scale(1/zoom, 1/zoom);
      }
  };

  const undo = () => {
      if (historyStep > -1) {
          setHistoryStep(prev => prev - 1);
      }
  };

  const redo = () => {
      if (historyStep < actions.length - 1) {
          setHistoryStep(prev => prev + 1);
      }
  };

  // Re-render when history changes for undo/redo
  useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
          ctx.scale(zoom, zoom);
          redrawCanvas(ctx);
          ctx.scale(1/zoom, 1/zoom);
      }
  }, [historyStep]);

  const clearCanvas = () => {
      if (confirm("¿Estás seguro de borrar todo el pizarrón?")) {
          setActions([]);
          setHistoryStep(-1);
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (ctx) {
              ctx.scale(zoom, zoom);
              drawPaperPattern(ctx, paper);
              ctx.scale(1/zoom, 1/zoom);
          }
      }
  };

  const exportPNG = () => {
      const canvas = canvasRef.current;
      if(canvas) {
          // Fusionar con el papel para exportar en PNG transparente/blanco
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = CANVAS_SIZE;
          tempCanvas.height = CANVAS_SIZE;
          const tCtx = tempCanvas.getContext('2d');
          if (tCtx) {
              if (paper === 'dark') tCtx.fillStyle = '#151b23';
              else tCtx.fillStyle = '#ffffff';
              tCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
              tCtx.drawImage(canvas, 0, 0);
              
              const link = document.createElement('a');
              link.download = 'Pizarron-SARG.png';
              link.href = tempCanvas.toDataURL('image/png');
              link.click();
          }
      }
  };

  const exportPDF = () => {
      const canvas = canvasRef.current;
      if (canvas) {
          // Crear un canvas temporal para el export, fusionando el fondo de papel si es transparente.
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = CANVAS_SIZE;
          tempCanvas.height = CANVAS_SIZE;
          const tCtx = tempCanvas.getContext('2d');
          if (tCtx) {
              if (paper === 'dark') tCtx.fillStyle = '#151b23';
              else tCtx.fillStyle = '#ffffff';
              tCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
              
              if (paper === 'grid' || paper === 'lined' || paper === 'dots') {
                  tCtx.strokeStyle = 'rgba(0,0,0,0.1)';
                  tCtx.fillStyle = 'rgba(0,0,0,0.1)';
                  tCtx.beginPath();
                  for (let x = 0; x < CANVAS_SIZE; x += 40) {
                      if (paper === 'grid') { tCtx.moveTo(x, 0); tCtx.lineTo(x, CANVAS_SIZE); } 
                      else if (paper === 'dots') { for (let y = 0; y < CANVAS_SIZE; y += 40) tCtx.fillRect(x, y, 2, 2); }
                  }
                  for (let y = 0; y < CANVAS_SIZE; y += 40) {
                      if (paper === 'grid' || paper === 'lined') { tCtx.moveTo(0, y); tCtx.lineTo(CANVAS_SIZE, y); }
                  }
                  if (paper === 'grid' || paper === 'lined') tCtx.stroke();
              }
              tCtx.drawImage(canvas, 0, 0);
              
              const imgData = tempCanvas.toDataURL('image/jpeg', 0.5);
              const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [CANVAS_SIZE, CANVAS_SIZE] });
              pdf.addImage(imgData, 'JPEG', 0, 0, CANVAS_SIZE, CANVAS_SIZE);
              pdf.save('Pizarron-SARG.pdf');
          }
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === 'application/pdf') {
          const url = URL.createObjectURL(file);
          setPdfUrl(url);
      }
  };

  return (
    <div className="w-full h-full flex bg-gray-100 dark:bg-gray-950 relative overflow-hidden">
        
        {/* PDF SPLIT VIEW */}
        {pdfUrl && (
            <div className="w-full md:w-1/3 absolute md:relative min-w-0 md:min-w-[300px] max-w-full md:max-w-[600px] h-full bg-gray-200 dark:bg-gray-800 border-r-4 border-gray-300 dark:border-gray-700 flex flex-col shadow-2xl z-50 animate-in slide-in-from-left">
                <div className="bg-white dark:bg-gray-900 p-3 flex justify-between items-center border-b border-gray-300 dark:border-gray-700">
                    <h3 className="font-black text-gray-700 dark:text-gray-200 flex items-center gap-2"><BookOpen size={18} className="text-blue-500"/> Documento PDF</h3>
                    <button onClick={() => setPdfUrl(null)} className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"><X size={18}/></button>
                </div>
                <div className="flex-1 w-full bg-white relative">
                    <embed src={`${pdfUrl}#toolbar=0`} type="application/pdf" className="absolute top-0 left-0 w-full h-full" />
                </div>
            </div>
        )}

        {/* RIGHT AREA (TOOLBAR + CANVAS) */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* TOP TOOLBAR */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-2xl p-2 md:p-3 flex gap-2 md:gap-4 items-center border border-gray-200/50 dark:border-gray-700/50 z-40 flex-wrap justify-center w-[95%] md:w-auto transition-all">
                
                {/* Draw Tools */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 border border-gray-200 dark:border-gray-700">
                    <button title="Lápiz" onClick={() => setTool('pencil')} className={`p-2 rounded-lg transition-all ${tool === 'pencil' ? 'bg-white dark:bg-gray-700 shadow-md text-purple-600 dark:text-purple-400 scale-105' : 'text-gray-500 hover:text-purple-500'}`}><Pencil size={18} /></button>
                    <button title="Marcatextos" onClick={() => setTool('highlighter')} className={`p-2 rounded-lg transition-all ${tool === 'highlighter' ? 'bg-white dark:bg-gray-700 shadow-md text-yellow-500 scale-105' : 'text-gray-500 hover:text-yellow-500'}`}><Highlighter size={18} /></button>
                    <button title="Aerógrafo" onClick={() => setTool('spray')} className={`p-2 rounded-lg transition-all ${tool === 'spray' ? 'bg-white dark:bg-gray-700 shadow-md text-pink-500 scale-105' : 'text-gray-500 hover:text-pink-500'}`}><PenTool size={18} /></button>
                    <button title="Borrador" onClick={() => setTool('eraser')} className={`p-2 rounded-lg transition-all ${tool === 'eraser' ? 'bg-white dark:bg-gray-700 shadow-md text-gray-800 dark:text-white scale-105' : 'text-gray-500 hover:text-gray-800'}`}><Eraser size={18} /></button>
                </div>
                
                {/* Shapes */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 border border-gray-200 dark:border-gray-700 hidden sm:flex">
                    <button title="Rectángulo" onClick={() => setTool('rect')} className={`p-2 rounded-lg ${tool === 'rect' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}><Square size={18} /></button>
                    <button title="Círculo" onClick={() => setTool('circle')} className={`p-2 rounded-lg ${tool === 'circle' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}><Circle size={18} /></button>
                    <button title="Triángulo" onClick={() => setTool('triangle')} className={`p-2 rounded-lg ${tool === 'triangle' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}><Triangle size={18} /></button>
                    <button title="Flecha" onClick={() => setTool('arrow')} className={`p-2 rounded-lg ${tool === 'arrow' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}><ArrowRight size={18} /></button>
                    <button title="Línea" onClick={() => setTool('line')} className={`p-2 rounded-lg ${tool === 'line' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}><Minus size={18} className="rotate-45" /></button>
                </div>

                <button title="Texto" onClick={() => setTool('text')} className={`p-3 rounded-xl border border-gray-200 dark:border-gray-700 ${tool === 'text' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><Type size={18} /></button>

                <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 hidden md:block"></div>

                {/* Color & Size */}
                <div className="flex gap-3 items-center bg-gray-100 dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-600 cursor-pointer overflow-hidden p-0" />
                    <input type="range" min="1" max="50" value={lineWidth} onChange={(e) => setLineWidth(parseInt(e.target.value))} className="w-16 md:w-24 accent-purple-500" />
                </div>

                <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 hidden lg:block"></div>

                {/* Paper & Pan */}
                <div className="flex gap-1 hidden md:flex">
                    <select 
                        value={paper} 
                        onChange={(e) => setPaper(e.target.value as PaperType)}
                        className="p-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer"
                    >
                        <option value="grid">Cuadrícula</option>
                        <option value="lined">Rayado</option>
                        <option value="dots">Puntos</option>
                        <option value="blank">Blanco</option>
                        <option value="dark">Pizarra Oscura</option>
                    </select>
                    <button title="Mano (Mover)" onClick={() => setTool('pan')} className={`p-2 rounded-lg ml-2 ${tool === 'pan' ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}><Hand size={20}/></button>
                </div>

                <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 hidden xl:block"></div>

                {/* Actions */}
                <div className="flex gap-1">
                    <button onClick={undo} disabled={historyStep <= -1} className="p-2 text-gray-500 hover:text-blue-500 disabled:opacity-30 transition-colors"><Undo size={20} /></button>
                    <button onClick={redo} disabled={historyStep >= actions.length - 1} className="p-2 text-gray-500 hover:text-blue-500 disabled:opacity-30 transition-colors"><Redo size={20} /></button>
                    <button onClick={clearCanvas} title="Borrar Todo" className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={20} /></button>
                </div>

                {/* Export & PDF */}
                <div className="flex gap-2 ml-auto">
                    <div className="relative group">
                        <button className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg transition-colors"><Download size={20} /></button>
                        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-2 hidden group-hover:flex flex-col gap-1 w-32">
                            <button onClick={exportPNG} className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left">Exportar PNG</button>
                            <button onClick={exportPDF} className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left">Exportar PDF</button>
                        </div>
                    </div>
                    
                    {!pdfUrl && (
                        <label className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg transition-colors cursor-pointer flex items-center gap-2">
                            <FileText size={20} /> <span className="hidden sm:inline font-bold text-sm">Abrir PDF</span>
                            <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                        </label>
                    )}
                </div>
            </div>

            {/* INFINITE CANVAS CONTAINER */}
            <div 
                ref={containerRef}
                className="flex-1 h-full overflow-auto bg-gray-300 dark:bg-gray-950 relative mt-20 md:mt-24"
                style={{ cursor: tool === 'pan' ? (isPanning ? 'grabbing' : 'grab') : (tool === 'eraser' ? 'cell' : 'crosshair') }}
            >
                {/* Zoom Controls Overlay */}
                <div className="fixed bottom-6 right-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col gap-2 z-30">
                    <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"><ZoomIn size={20}/></button>
                    <div className="text-xs font-black text-center text-gray-500">{Math.round(zoom * 100)}%</div>
                    <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.2))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300"><ZoomOut size={20}/></button>
                </div>

                <div 
                    style={{ 
                        width: CANVAS_SIZE * zoom, 
                        height: CANVAS_SIZE * zoom,
                        transformOrigin: '0 0',
                        backgroundImage: paper === 'grid' 
                            ? 'linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)' 
                            : paper === 'lined'
                            ? 'linear-gradient(to bottom, transparent 39px, rgba(0,0,0,0.1) 39px)'
                            : paper === 'dots'
                            ? 'radial-gradient(rgba(0,0,0,0.2) 2px, transparent 2px)'
                            : 'none',
                        backgroundSize: '40px 40px'
                    }}
                    className={`shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-[0_0_50px_rgba(0,0,0,0.5)] m-10 ${paper === 'dark' ? 'bg-[#151b23]' : 'bg-white'}`}
                >
                    <canvas 
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="touch-none w-full h-full"
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

export default VirtualWhiteboard;

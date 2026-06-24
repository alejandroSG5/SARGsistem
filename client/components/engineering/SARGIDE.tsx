import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, Play, Book, CheckCircle, Award, 
  Code, ChevronRight, Star, Shield, Layout, 
  Download, X, Monitor, File, Folder, 
  Settings, RefreshCcw, Sparkles, Send, Menu,
  FileJson, FileCode, AlertTriangle
} from 'lucide-react';
import { CODING_COURSES } from '../../constants';
import { CodingCourse, CodingLesson, IDEFile } from '../../types';
import { jsPDF } from 'jspdf';

// Declare Pyodide global types
declare global {
  interface Window {
    loadPyodide: (config: any) => Promise<any>;
  }
}

const SARGIDE: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeCourse, setActiveCourse] = useState<CodingCourse | null>(null);
  const [activeLesson, setActiveLesson] = useState<CodingLesson | null>(null);
  
  // File System
  const [files, setFiles] = useState<IDEFile[]>([
      { name: 'main.py', language: 'python', content: '', active: true }
  ]);
  
  // UI State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [output, setOutput] = useState<string[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  // Pyodide State
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load Pyodide
  useEffect(() => {
    let script: HTMLScriptElement;
    if (!window.loadPyodide) {
      script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js';
      script.onload = async () => {
        try {
          const py = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
          });
          setPyodide(py);
          setIsPyodideLoading(false);
        } catch (err) {
          console.error("Error loading Pyodide:", err);
          setIsPyodideLoading(false);
        }
      };
      document.body.appendChild(script);
    } else {
       // Already loaded
       window.loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" })
         .then(py => { setPyodide(py); setIsPyodideLoading(false); });
    }

    return () => {
        if (script && document.body.contains(script)) {
            document.body.removeChild(script);
        }
    }
  }, []);

  // Load Lesson Content
  useEffect(() => {
      if (activeLesson) {
          const newFiles = [
              { name: `lesson_${activeLesson.id}.py`, language: activeCourse?.language as any, content: activeLesson.starterCode, active: true },
              { name: 'notes.txt', language: 'txt', content: `Notas para: ${activeLesson.title}\n-------------------\n`, active: false }
          ];
          setFiles(newFiles);
          setOutput([]);
      }
  }, [activeLesson]);

  // --- LOGIC & HELPERS ---

  const getActiveFile = () => files.find(f => f.active) || files[0];

  const updateFileContent = (newContent: string) => {
      setFiles(prev => prev.map(f => f.active ? { ...f, content: newContent } : f));
  };

  const switchFile = (fileName: string) => {
      setFiles(prev => prev.map(f => ({ ...f, active: f.name === fileName })));
  };

  // --- EXECUTION ENGINE (REAL PYTHON VIA PYODIDE) ---
  const runCode = async () => {
      if (!activeLesson) return;
      setIsRunning(true);
      const currentCode = getActiveFile().content;
      
      setOutput([`> Ejecutando ${getActiveFile().name} con Python Real...`, '-----------------------------------']);
      
      if (!pyodide) {
          setOutput(prev => [...prev, "❌ ERROR: El motor de Python no se pudo inicializar o sigue cargando."]);
          setIsRunning(false);
          return;
      }

      // We override sys.stdout to capture prints
      try {
          pyodide.setStdout({ batched: (msg: string) => setOutput(prev => [...prev, msg]) });
          pyodide.setStderr({ batched: (msg: string) => setOutput(prev => [...prev, `[ERR] ${msg}`]) });
          
          await pyodide.runPythonAsync(currentCode);
          
          setOutput(prev => [...prev, "", "✨ EJECUCIÓN EXITOSA - El programa terminó sin errores."]);
          
          if (!activeLesson.completed) {
              activeLesson.completed = true;
              // Check if course is finished
              const allDone = activeCourse?.lessons.every(l => l.completed);
              if (allDone) setTimeout(() => setShowCertificate(true), 1500);
          }
      } catch (err: any) {
          setOutput(prev => [...prev, "❌ ERROR EN TIEMPO DE EJECUCIÓN:", err.toString()]);
      } finally {
          setIsRunning(false);
      }
  };

  // --- CERTIFICATE GENERATOR ---
  const generateCertificate = () => {
      const doc = new jsPDF('landscape');
      const width = doc.internal.pageSize.getWidth();
      const height = doc.internal.pageSize.getHeight();

      // Background
      doc.setFillColor(10, 10, 15);
      doc.rect(0, 0, width, height, 'F');
      
      // Ornamental Border
      doc.setDrawColor(212, 175, 55); // Gold
      doc.setLineWidth(2);
      doc.rect(10, 10, width - 20, height - 20);
      doc.setLineWidth(0.5);
      doc.rect(12, 12, width - 24, height - 24);

      // Header
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(42);
      doc.text("CERTIFICADO DE EXCELENCIA", width / 2, 50, { align: 'center' });
      
      // Logo Placeholder
      doc.setTextColor(236, 64, 122); // SARG Pink
      doc.setFontSize(60);
      doc.text("SARG ACADEMY", width / 2, 80, { align: 'center' });

      // Body
      doc.setTextColor(200, 200, 200);
      doc.setFont("times", "normal");
      doc.setFontSize(18);
      doc.text("Se otorga el presente reconocimiento a:", width / 2, 110, { align: 'center' });

      // User Name
      doc.setTextColor(212, 175, 55); // Gold
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.text("ESTUDIANTE DE INGENIERÍA", width / 2, 130, { align: 'center' });

      // Course Info
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("times", "normal");
      doc.text("Por haber completado satisfactoriamente el curso intensivo de:", width / 2, 150, { align: 'center' });
      
      doc.setTextColor(0, 255, 100); // Green
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text(activeCourse?.title.toUpperCase() || "PROGRAMACIÓN", width / 2, 165, { align: 'center' });

      // Footer
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const dateStr = new Date().toLocaleDateString();
      doc.text(`Fecha de Expedición: ${dateStr}`, 40, 185);
      doc.text("ID Credencial: AX-" + Date.now().toString().slice(-6), width - 80, 185);

      // Signature Line
      doc.setDrawColor(255, 255, 255);
      doc.line(width / 2 - 40, 185, width / 2 + 40, 185);
      doc.text("Director de Educación IA", width / 2, 192, { align: 'center' });

      doc.save(`Certificado_${activeCourse?.title}.pdf`);
  };

  // --- COURSE SELECTOR VIEW ---
  if (!activeCourse) {
      return (
          <div className="fixed inset-0 bg-[#09090b] z-50 overflow-y-auto animate-in fade-in">
              {/* Decorative Background */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
                  <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-green-900/20 rounded-full blur-[120px]"></div>
                  <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px]"></div>
              </div>

              <div className="max-w-7xl mx-auto p-8 relative z-10">
                  <div className="flex justify-between items-center mb-16">
                      <div>
                          <div className="flex items-center gap-3 mb-2">
                              <Terminal className="text-green-500 w-10 h-10" />
                              <h1 className="text-5xl font-black text-white tracking-tight">SARG <span className="text-green-500">IDE</span></h1>
                          </div>
                          <p className="text-gray-400 text-xl font-light">Plataforma de desarrollo profesional con Motor Lógico Real.</p>
                      </div>
                      <button onClick={onClose} className="p-4 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 text-white transition-colors"><X/></button>
                  </div>

                  <h3 className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                      <Layout size={16}/> Rutas de Certificación
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {CODING_COURSES.map((course, i) => (
                          <div 
                            key={course.id} 
                            onClick={() => { setActiveCourse(course); setActiveLesson(course.lessons[0]); }}
                            className="group relative bg-[#18181b] rounded-[2.5rem] p-8 border border-[#27272a] hover:border-green-500/50 transition-all cursor-pointer hover:-translate-y-2 hover:shadow-2xl overflow-hidden"
                          >
                              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 transform duration-500">
                                  <Code size={120} />
                              </div>
                              
                              <div className="relative z-10">
                                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-3xl shadow-lg ${
                                      course.language === 'python' ? 'bg-blue-600/20 text-blue-400' : 
                                      course.language === 'java' ? 'bg-orange-600/20 text-orange-400' : 
                                      'bg-purple-600/20 text-purple-400'
                                  }`}>
                                      {course.language === 'python' ? '🐍' : course.language === 'java' ? '☕' : 'C++'}
                                  </div>
                                  
                                  <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{course.title}</h3>
                                  
                                  <div className="flex flex-wrap gap-3 mb-8">
                                      <span className="bg-[#27272a] text-gray-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/5">{course.level}</span>
                                      <span className="bg-[#27272a] text-gray-300 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/5">{course.lessons.length} Módulos</span>
                                  </div>

                                  <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden mb-4">
                                      <div className="bg-green-500 h-full w-[5%] group-hover:w-[15%] transition-all duration-1000"></div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
                                      <Shield size={12} className="text-green-500"/> Certificación Incluida
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  // --- IDE WORKSPACE VIEW ---
  const activeFile = getActiveFile();

  return (
      <div className="fixed inset-0 bg-[#09090b] z-50 flex text-gray-300 font-mono overflow-hidden animate-in fade-in">
          
          {/* LEFT SIDEBAR: NAVIGATION */}
          <div className={`flex flex-col border-r border-[#27272a] bg-[#09090b] transition-all duration-300 ${leftSidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
              <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-widest text-gray-500">Explorador</span>
                  <button onClick={() => setActiveCourse(null)} className="text-xs hover:text-white">Salir</button>
              </div>
              
              {/* File Tree */}
              <div className="p-2 border-b border-[#27272a]">
                  <div className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-200 hover:bg-[#27272a] rounded cursor-pointer">
                      <Folder size={14} className="text-blue-400"/> {activeCourse.title.replace(/\s/g,'_')}
                  </div>
                  {files.map((file, i) => (
                      <div 
                        key={i} 
                        onClick={() => switchFile(file.name)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs ml-4 rounded cursor-pointer ${file.active ? 'bg-[#27272a] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                          {file.language === 'python' ? <span className="text-yellow-400">py</span> : <FileCode size={12}/>} {file.name}
                      </div>
                  ))}
              </div>

              {/* Lessons List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="p-4 font-bold text-xs uppercase tracking-widest text-gray-500">Plan de Estudios</div>
                  {activeCourse.lessons.map((lesson, i) => (
                      <button 
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={`w-full text-left px-4 py-3 border-l-2 transition-all hover:bg-[#18181b] ${activeLesson?.id === lesson.id ? 'border-green-500 bg-[#18181b] text-white' : 'border-transparent text-gray-500'}`}
                      >
                          <div className="flex justify-between items-start">
                              <span className="text-xs font-bold mb-1 block">Lección {i + 1}</span>
                              {lesson.completed && <CheckCircle size={12} className="text-green-500"/>}
                          </div>
                          <div className="text-sm line-clamp-1">{lesson.title}</div>
                      </button>
                  ))}
              </div>
          </div>

          {/* MAIN EDITOR AREA */}
          <div className="flex-1 flex flex-col min-w-0 relative">
              
              {/* Top Bar */}
              <div className="h-10 bg-[#09090b] border-b border-[#27272a] flex items-center px-4 justify-between select-none">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} className="hover:text-white"><Menu size={16}/></button>
                      <div className="flex gap-1">
                          {files.map(f => (
                              <div key={f.name} onClick={() => switchFile(f.name)} className={`px-3 py-1.5 text-xs rounded-t-md cursor-pointer flex items-center gap-2 ${f.active ? 'bg-[#1e1e1e] text-white' : 'hover:bg-[#1e1e1e]/50'}`}>
                                  {f.name} <X size={10} className="hover:text-red-400"/>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="flex items-center gap-3">
                      {isPyodideLoading && <span className="text-xs text-yellow-500 flex items-center gap-1"><RefreshCcw size={12} className="animate-spin"/> Cargando Motor Python...</span>}
                      <button 
                        onClick={runCode}
                        disabled={isRunning || isPyodideLoading}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-bold transition-colors disabled:opacity-50"
                      >
                          {isRunning ? <RefreshCcw size={12} className="animate-spin"/> : <Play size={12} fill="white"/>} Ejecutar (Python Real)
                      </button>
                  </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 relative bg-[#1e1e1e] flex">
                  {/* Line Numbers */}
                  <div className="w-10 bg-[#1e1e1e] border-r border-[#27272a] flex flex-col items-end pr-2 pt-4 text-gray-600 text-sm font-mono select-none">
                      {activeFile.content.split('\n').map((_, i) => <div key={i}>{i + 1}</div>)}
                  </div>
                  <textarea 
                      ref={textareaRef}
                      className="flex-1 bg-transparent text-gray-300 p-4 outline-none resize-none text-sm font-mono leading-6 whitespace-pre"
                      value={activeFile.content}
                      onChange={(e) => updateFileContent(e.target.value)}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoComplete="off"
                  />
              </div>

              {/* Terminal / Lesson Info */}
              <div className="h-48 bg-[#09090b] border-t border-[#27272a] flex flex-col">
                  <div className="flex border-b border-[#27272a]">
                      <div className="px-4 py-1 text-xs font-bold text-green-400 bg-[#1e1e1e] border-r border-[#27272a]">PYODIDE TERMINAL</div>
                      <div className="px-4 py-1 text-xs font-bold text-gray-500 hover:text-gray-300 cursor-pointer">PROBLEMA</div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1">
                      <div className="text-green-500 mb-2">$ python {activeFile.name}</div>
                      {output.length === 0 && <span className="text-gray-600 italic">Motor Pyodide Listo. Escribe código Python y presiona Ejecutar.</span>}
                      {output.map((line, i) => (
                          <div key={i} className={`${line.includes('ERROR') ? 'text-red-400 font-bold' : line.includes('Advertencia') ? 'text-yellow-400' : line.includes('EXITOSA') ? 'text-green-400 font-bold' : 'text-gray-300 whitespace-pre-wrap'}`}>
                              {line}
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* CERTIFICATE MODAL */}
          {showCertificate && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-[60] p-4 animate-in fade-in">
                  <div className="bg-[#18181b] rounded-[2rem] p-1 max-w-3xl w-full shadow-2xl border border-yellow-500/30 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-purple-600/10 rounded-[2rem] pointer-events-none"></div>
                      <div className="bg-[#09090b] rounded-[1.9rem] p-12 text-center relative overflow-hidden">
                          
                          {/* Confetti / Particles */}
                          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                          
                          <Award size={80} className="mx-auto text-yellow-400 mb-6 animate-bounce drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"/>
                          
                          <h2 className="text-4xl font-black text-white mb-2">¡Curso Completado!</h2>
                          <p className="text-gray-400 mb-8 text-lg">Has dominado los fundamentos de <span className="text-yellow-400 font-bold">{activeCourse.title}</span> usando lógica real.</p>
                          
                          <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                              <button onClick={generateCertificate} className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl font-black flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-105">
                                  <Download size={20}/> RECLAMAR CERTIFICADO
                              </button>
                              <button onClick={() => { setShowCertificate(false); onClose(); }} className="px-8 py-4 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-xl font-bold transition-colors">
                                  Volver al Menú
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          )}

      </div>
  );
};

export default SARGIDE;

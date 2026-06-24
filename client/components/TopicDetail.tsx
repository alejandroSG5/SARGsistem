import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Share2, Lightbulb, Users, Microscope, Palette, Activity, 
  BookOpen, Layers, ArrowRight, FileText, Download, Printer, PlayCircle, 
  CheckCircle, XCircle, Brain
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { TopicData, SixPillars, FlowchartNode } from '../types';
import { askSARG, generateManualStructure, generateSimulationCase } from '../services/geminiService';
import { FALLBACK_CONTENT } from '../constants';

interface TopicDetailProps {
  topicData: TopicData;
  categoryTitle: string;
  onBack: () => void;
}

const TopicDetail: React.FC<TopicDetailProps> = ({ topicData, categoryTitle, onBack }) => {
  const pillarKeys: (keyof SixPillars)[] = [
    'investigacion', 
    'impactoSocial', 
    'innovacion', 
    'divulgacion', 
    'creatividad', 
    'desarrollo'
  ];

  const [activeTab, setActiveTab] = useState<string>('investigacion');
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // PDF Generation State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfPageCount, setPdfPageCount] = useState(5); 

  // Simulation State
  const [simulationData, setSimulationData] = useState<any>(null);
  const [simAnswer, setSimAnswer] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Reading Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
        const storageKey = `sarg_reading_time_${categoryTitle}`;
        const currentSeconds = parseInt(localStorage.getItem(storageKey) || '0', 10);
        localStorage.setItem(storageKey, (currentSeconds + 1).toString());
    }, 1000);
    return () => clearInterval(timer);
  }, [categoryTitle]);

  const getIcon = (key: string) => {
    switch (key) {
      case 'investigacion': return <Microscope size={18} />;
      case 'impactoSocial': return <Users size={18} />;
      case 'innovacion': return <Lightbulb size={18} />;
      case 'divulgacion': return <Share2 size={18} />;
      case 'creatividad': return <Palette size={18} />;
      case 'desarrollo': return <Layers size={18} />;
      case 'flowchart': return <Activity size={18} />;
      case 'simulation': return <Brain size={18} />;
      default: return <Activity size={18} />;
    }
  };

  const handleAsk = async () => {
    if (!aiQuery.trim()) return;
    setIsLoading(true);
    const answer = await askSARG(aiQuery, `${topicData.title} - ${activeTab}`);
    setAiResponse(answer);
    setIsLoading(false);
  };

  // --- PDF GENERATOR ENGINE (SAME AS BEFORE) ---
  const handleGeneratePDF = async () => {
    setIsGeneratingPdf(true);
    setPdfProgress(10);

    try {
        let manualData: any;
        // Try AI Generation First
        try {
            manualData = await generateManualStructure(topicData.title);
            if (!manualData || !manualData.chapters || manualData.chapters.length === 0) {
                throw new Error("Respuesta IA incompleta");
            }
        } catch (e) {
            console.warn("AI Generation Failed, activating OFFLINE BACKUP mode.");
            manualData = {
                title: topicData.title,
                author: "Biblioteca Offline SARG",
                introduction: `Compendio completo de información sobre ${topicData.title}. Este documento ha sido generado automáticamente utilizando la base de datos local segura de SARG, garantizando el acceso a la información sin necesidad de internet.`,
                chapters: [
                    { title: "1. Investigación y Fundamentos", content: topicData.pillars.investigacion.content },
                    { title: "2. Impacto Social", content: topicData.pillars.impactoSocial.content },
                    { title: "3. Innovación y Tecnología", content: topicData.pillars.innovacion.content },
                    { title: "4. Divulgación", content: topicData.pillars.divulgacion.content },
                    { title: "5. Creatividad Aplicada", content: topicData.pillars.creatividad.content },
                    { title: "6. Desarrollo Futuro", content: topicData.pillars.desarrollo.content }
                ],
                conclusion: "Documento oficial de SARG. El conocimiento es un derecho universal."
            };
        }
        setPdfProgress(40);

        const doc = new jsPDF();
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 20;
        let y = margin;

        const addHeader = (pageNum: number) => {
             doc.setFillColor(240, 98, 146);
             doc.rect(0, 0, pageWidth, 20, 'F');
             doc.setTextColor(255, 255, 255);
             doc.setFontSize(10);
             doc.text("SARG - BIBLIOTECA DIGITAL", margin, 13);
             doc.text(`Página ${pageNum}`, pageWidth - margin - 20, 13);
             doc.setTextColor(0, 0, 0);
             y = 40;
        };

        // PAGE 1: COVER
        doc.setFillColor(26, 16, 31); // Dark bg
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(36);
        doc.setFont("helvetica", "bold");
        const titleLines = doc.splitTextToSize(topicData.title.toUpperCase(), pageWidth - (margin * 2));
        doc.text(titleLines, margin, 100);
        
        doc.setFontSize(18);
        doc.setFont("helvetica", "normal");
        doc.text("MANUAL MAESTRO", margin, 130);
        
        doc.setFontSize(12);
        doc.text(`Autor: ${manualData.author}`, margin, 250);
        doc.text(`Generado: ${new Date().toLocaleDateString()}`, margin, 260);
        
        doc.addPage();
        
        // PAGE 2: INTRO & INDEX
        addHeader(2);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("INTRODUCCIÓN", margin, y);
        y += 15;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const introText = doc.splitTextToSize(manualData.introduction || "Introducción no disponible.", pageWidth - (margin * 2));
        doc.text(introText, margin, y);
        
        y += (introText.length * 6) + 20;
        
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("ÍNDICE DE CONTENIDOS", margin, y);
        y += 15;
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        manualData.chapters.forEach((chap: any, i: number) => {
            doc.text(`${i+1}. ${chap.title}`, margin, y);
            y += 10;
        });

        // PAGES 3+: CHAPTERS
        let currentPage = 3;
        setPdfProgress(60);
        
        manualData.chapters.forEach((chap: any) => {
            if (currentPage > pdfPageCount + 2) return; 

            doc.addPage();
            addHeader(currentPage);
            currentPage++;

            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(236, 64, 122); // Pink accent
            doc.text(chap.title, margin, y);
            y += 15;

            doc.setTextColor(0,0,0);
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            
            const contentLines = doc.splitTextToSize(chap.content || "Contenido no disponible.", pageWidth - (margin * 2));
            
            for (let i = 0; i < contentLines.length; i++) {
                if (y > pageHeight - margin) {
                    doc.addPage();
                    addHeader(currentPage);
                    currentPage++;
                }
                doc.text(contentLines[i], margin, y);
                y += 6;
            }
        });

        setPdfProgress(100);
        doc.save(`${topicData.title.replace(/\s/g, '_')}_Manual.pdf`);

    } catch (e) {
        console.error(e);
        alert("Error inesperado al generar el PDF. Intenta de nuevo.");
    } finally {
        setIsGeneratingPdf(false);
    }
  };

  const handleSimulation = async () => {
      setIsSimulating(true);
      setSimulationData(null);
      setSimAnswer(null);
      try {
        const data = await generateSimulationCase(topicData.title);
        setSimulationData(data);
      } catch(e) {
        setSimulationData({
            patientDescription: "Modo Offline: Simulación de prueba.",
            symptoms: ["Síntoma A", "Síntoma B"],
            correctDiagnosis: "Diagnóstico Offline",
            options: ["Opción A", "Diagnóstico Offline", "Opción C"],
            explanation: "Esta es una simulación generada localmente debido a falta de conexión."
        });
      }
      setIsSimulating(false);
  };

  // --- RENDERERS ---

  const SimulationRenderer = () => {
      if (!simulationData && !isSimulating) return (
          <div className="text-center py-12">
              <Brain size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-6 font-medium">Pon a prueba tus conocimientos con un caso generado por IA.</p>
              <button onClick={handleSimulation} className="px-8 py-3 bg-axolotl-dark text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform">
                  Generar Caso Nuevo
              </button>
          </div>
      );

      if (isSimulating) return (
          <div className="flex flex-col items-center justify-center py-20">
              <Brain size={48} className="text-axolotl-pink animate-bounce mb-4" />
              <h3 className="text-xl font-bold animate-pulse text-gray-800 dark:text-white">Generando Escenario...</h3>
          </div>
      );

      return (
          <div className="bg-white dark:bg-gray-800 p-6 lg:p-8 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 text-blue-600 p-2 rounded-xl"><Users size={24}/></div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Caso de Estudio</h3>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl mb-8 text-gray-700 dark:text-gray-300 leading-relaxed font-medium text-lg">
                  {simulationData.patientDescription}
                  <div className="mt-4 flex flex-wrap gap-2">
                      {simulationData.symptoms.map((s: string, i: number) => (
                          <span key={i} className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold uppercase tracking-wide">{s}</span>
                      ))}
                  </div>
              </div>

              <div className="space-y-4 mb-8">
                  {simulationData.options.map((opt: string, i: number) => (
                      <button 
                        key={i}
                        onClick={() => setSimAnswer(opt)}
                        disabled={!!simAnswer}
                        className={`w-full p-5 text-left rounded-2xl border-2 font-bold transition-all text-sm lg:text-base ${
                            simAnswer === opt 
                              ? (opt.includes('(Correcta)') || opt === simulationData.correctDiagnosis ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800')
                              : 'border-gray-100 hover:border-axolotl-teal bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300'
                        }`}
                      >
                          <div className="flex justify-between items-center">
                              {opt.replace('(Correcta)', '').replace('(Incorrecta)', '')}
                              {simAnswer === opt && (
                                  <span>
                                      {opt.includes('(Correcta)') || opt === simulationData.correctDiagnosis ? <CheckCircle size={20}/> : <XCircle size={20}/>}
                                  </span>
                              )}
                          </div>
                      </button>
                  ))}
              </div>

              {simAnswer && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 animate-in slide-in-from-bottom-4">
                      <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2"><Lightbulb size={18}/> Explicación</h4>
                      <p className="text-sm lg:text-base text-blue-900 dark:text-blue-200 leading-relaxed">{simulationData.explanation}</p>
                      <button onClick={handleSimulation} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Intentar otro caso</button>
                  </div>
              )}
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f0f0f] animate-in fade-in duration-300 overflow-y-auto pb-24 fixed inset-0 z-50">
      
      {/* HERO HEADER (PC & Mobile) */}
      <div className="relative bg-axolotl-surface h-[30vh] lg:h-[40vh] shrink-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-axolotl-pink to-purple-900 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="absolute top-6 left-6 z-20">
          <button onClick={onBack} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/20 group">
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 lg:p-12 z-20 text-white bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-5xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                 <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
                    {categoryTitle}
                 </span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight drop-shadow-lg">
                 {topicData.title}
              </h1>
              
              {/* PDF Tool (Desktop) */}
              <div className="flex flex-wrap gap-4 items-center">
                 <div className="hidden md:flex items-center bg-black/40 rounded-xl p-1 gap-2 backdrop-blur-md border border-white/10">
                     <span className="text-[10px] font-bold pl-3 uppercase text-gray-400">Páginas:</span>
                     <input 
                        type="number" 
                        min="1" 
                        max="50"
                        value={pdfPageCount} 
                        onChange={(e) => setPdfPageCount(parseInt(e.target.value))}
                        className="w-12 bg-transparent text-center font-bold border-b border-white/50 focus:outline-none text-sm py-1"
                     />
                 </div>
                 <button 
                    onClick={handleGeneratePDF}
                    disabled={isGeneratingPdf}
                    className="px-5 py-2.5 bg-white text-axolotl-dark rounded-xl font-bold text-xs lg:text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg hover:scale-105 transform"
                 >
                     {isGeneratingPdf ? `Generando ${pdfProgress}%...` : <><Printer size={18}/> Descargar Manual PDF</>}
                 </button>
              </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS (Sticky) */}
      <div className="sticky top-0 bg-white/95 dark:bg-[#0f0f0f]/95 z-40 border-b border-gray-100 dark:border-gray-800 backdrop-blur-md">
        <div className="flex overflow-x-auto no-scrollbar py-4 px-4 lg:px-10 gap-2 max-w-5xl mx-auto">
          {pillarKeys.map((key) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as string)}
              className={`shrink-0 px-4 py-2 rounded-full flex items-center gap-2 text-xs lg:text-sm font-bold transition-all whitespace-nowrap border ${
                activeTab === key
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-black border-transparent shadow-md transform scale-105'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
              }`}
            >
              {getIcon(key)}
              <span className="capitalize">{topicData.pillars[key].title.split('.')[1] || topicData.pillars[key].title}</span>
            </button>
          ))}
          <div className="w-px bg-gray-300 h-6 mx-2 self-center"></div>
          <button onClick={() => setActiveTab('simulation')} className={`shrink-0 px-4 py-2 rounded-full flex items-center gap-2 text-xs lg:text-sm font-bold border ${activeTab === 'simulation' ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>{getIcon('simulation')} Simulación</button>
        </div>
      </div>

      {/* CONTENT BODY */}
      <div className="flex-1 bg-white dark:bg-[#0f0f0f]">
          <div className="max-w-4xl mx-auto p-6 lg:p-12 grid grid-cols-1 gap-12">
            
            {/* Main Text / Simulation */}
            {activeTab === 'simulation' ? (
                <SimulationRenderer />
            ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4 mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <div className="p-4 bg-white dark:bg-black/40 rounded-2xl text-axolotl-gills shadow-sm">
                            {React.cloneElement(getIcon(activeTab) as React.ReactElement<any>, { size: 32 })}
                        </div>
                        <div>
                            <h3 className="font-black text-xl lg:text-2xl text-gray-900 dark:text-white m-0">{topicData.pillars[activeTab as keyof SixPillars].title}</h3>
                            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Módulo Oficial Verificado</span>
                        </div>
                    </div>
                    
                    <div className="prose prose-lg dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-loose max-w-none font-serif md:font-sans text-justify">
                        {topicData.pillars[activeTab as keyof SixPillars].content}
                    </div>
                </div>
            )}

            {/* AI Contextual Assistant (Bottom / Floating) */}
            <div className="mt-8 bg-gradient-to-br from-gray-900 to-black dark:from-gray-800 dark:to-gray-900 rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10 animate-pulse"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="text-4xl">🦎</div>
                    <div>
                        <h3 className="font-black text-2xl">Axolote Tutor</h3>
                        <p className="text-sm text-gray-400 font-medium">Asistente Contextual Inteligente</p>
                    </div>
                </div>
                
                <p className="text-base text-gray-300 mb-8 font-medium max-w-2xl leading-relaxed">
                    ¿Tienes dudas sobre cómo aplicar <span className="text-purple-400">{activeTab}</span> en tu comunidad? Pregúntame y adaptaré la respuesta a la región de Chiapas.
                </p>
                
                <div className="space-y-6">
                  <div className="relative group">
                      <input
                        type="text"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Ej: ¿Cómo afecta esto a la cosecha de maíz?"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-base focus:outline-none focus:ring-2 focus:ring-axolotl-teal placeholder-gray-500 text-white backdrop-blur-sm transition-all group-hover:bg-white/10"
                      />
                      <button 
                        onClick={handleAsk}
                        disabled={isLoading}
                        className="absolute right-2 top-2 bottom-2 bg-axolotl-teal text-black font-black px-6 rounded-xl hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
                      >
                        {isLoading ? <span className="animate-spin">⌛</span> : <ArrowRight size={20} />}
                      </button>
                  </div>
                </div>

                {aiResponse && (
                  <div className="mt-8 p-8 bg-white/5 rounded-3xl border border-white/10 animate-in slide-in-from-bottom-4 shadow-inner">
                    <p className="text-base lg:text-lg leading-relaxed text-gray-200 font-medium">{aiResponse}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
      </div>
    </div>
  );
};

export default TopicDetail;
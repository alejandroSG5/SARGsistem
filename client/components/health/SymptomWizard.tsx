import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Brain, Trophy, X, CheckCircle, XCircle, FileText, Printer, ShieldAlert, Award, ChevronRight, Activity
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { SoundEffects } from '../../utils/soundSystem';
import { HEALTH_QUESTIONS, HealthQuestion } from './questions';

interface SymptomWizardProps {
  onBack: () => void;
  onRequestMap?: any; // kept for compatibility
}

type WizardStep = 'intro' | 'intro_quiz' | 'intro_analyzing' | 'intro_result' | 'main_quiz' | 'analyzing' | 'result';
type DifficultyLevel = 'Básico' | 'Intermedio' | 'Avanzado';

const SymptomWizard: React.FC<SymptomWizardProps> = ({ onBack }) => {
  const [step, setStep] = useState<WizardStep>('intro');
  
  // Question sets
  const [introQuestions, setIntroQuestions] = useState<HealthQuestion[]>([]);
  const [mainQuestions, setMainQuestions] = useState<HealthQuestion[]>([]);
  
  // Current execution state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Scores & Metrics
  const [introScore, setIntroScore] = useState(0);
  const [assignedLevel, setAssignedLevel] = useState<DifficultyLevel | null>(null);
  const [mainScore, setMainScore] = useState(0);
  const [topicStats, setTopicStats] = useState<Record<string, { total: number; correct: number }>>({});
  
  const INTRO_QUESTIONS_COUNT = 3;
  const MAIN_QUESTIONS_COUNT = 10;
  
  useEffect(() => {
    initQuizzes();
  }, []);

  const initQuizzes = () => {
    const shuffled = [...HEALTH_QUESTIONS].sort(() => 0.5 - Math.random());
    setIntroQuestions(shuffled.slice(0, INTRO_QUESTIONS_COUNT));
    setMainQuestions(shuffled.slice(INTRO_QUESTIONS_COUNT, INTRO_QUESTIONS_COUNT + MAIN_QUESTIONS_COUNT));
    setIntroScore(0);
    setMainScore(0);
    setTopicStats({});
    setCurrentQuestionIndex(0);
    setAssignedLevel(null);
  };

  const loadQuestionOptions = (q: HealthQuestion) => {
    const opts = [q.correctAnswer, ...q.incorrectAnswers];
    setShuffledOptions(opts.sort(() => 0.5 - Math.random()));
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  // Intro Quiz Effects
  useEffect(() => {
    if (step === 'intro_quiz' && introQuestions.length > 0 && currentQuestionIndex < introQuestions.length) {
      loadQuestionOptions(introQuestions[currentQuestionIndex]);
    }
  }, [step, currentQuestionIndex, introQuestions]);

  // Main Quiz Effects
  useEffect(() => {
    if (step === 'main_quiz' && mainQuestions.length > 0 && currentQuestionIndex < mainQuestions.length) {
      loadQuestionOptions(mainQuestions[currentQuestionIndex]);
    }
  }, [step, currentQuestionIndex, mainQuestions]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answer);
    
    const isIntro = step === 'intro_quiz';
    const q = isIntro ? introQuestions[currentQuestionIndex] : mainQuestions[currentQuestionIndex];
    const correct = answer === q.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      SoundEffects.success();
      if (isIntro) setIntroScore(prev => prev + 1);
      else setMainScore(prev => prev + 1);
    } else {
      SoundEffects.click();
    }

    // Record topic stats for main quiz
    if (!isIntro) {
        setTopicStats(prev => {
            const topic = q.topic;
            const currentStats = prev[topic] || { total: 0, correct: 0 };
            return {
                ...prev,
                [topic]: {
                    total: currentStats.total + 1,
                    correct: currentStats.correct + (correct ? 1 : 0)
                }
            };
        });
    }

    setTimeout(() => {
      const qArray = isIntro ? introQuestions : mainQuestions;
      if (currentQuestionIndex < qArray.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        if (isIntro) {
            setStep('intro_analyzing');
            setTimeout(() => {
                // Assign level based on intro score (3 questions)
                let level: DifficultyLevel = 'Básico';
                if (introScore + (correct ? 1 : 0) === 2) level = 'Intermedio';
                if (introScore + (correct ? 1 : 0) === 3) level = 'Avanzado';
                setAssignedLevel(level);
                setStep('intro_result');
                SoundEffects.success();
            }, 2000);
        } else {
            setStep('analyzing');
            setTimeout(() => {
                setStep('result');
                SoundEffects.success();
            }, 2000);
        }
      }
    }, 1500);
  };

  const getFinalGrade = () => {
    const percentage = (mainScore / MAIN_QUESTIONS_COUNT) * 100;
    if (percentage >= 90) return 'Sobresaliente';
    if (percentage >= 70) return 'Notable';
    if (percentage >= 50) return 'Suficiente';
    return 'Requiere Mejora';
  };

  // --- PDF GENERATION ENGINE ---
  const generateLevelPDF = () => {
    SoundEffects.click();
    const doc = new jsPDF();
    const pageWidth = 210;
    const margin = 20;
    let y = 20;

    // HEADER CLINICAL STYLE
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102);
    doc.setFont("helvetica", "bold");
    doc.text("SARG BIO-ENGINE", margin, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Reporte Métrico de Certificación de Nivel en Salud", margin, 32);
    doc.text(`Folio: ${Date.now().toString().slice(-8)} | Nivel: ${assignedLevel} | Fecha: ${new Date().toLocaleDateString()}`, margin, 38);

    y = 60;

    // SCORE BOX
    const grade = getFinalGrade();
    doc.setDrawColor(200);
    doc.rect(margin, y, pageWidth - (margin * 2), 35);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text("MÉTRICA GLOBAL DE EVALUACIÓN", margin + 5, y + 6);
    
    y += 15;
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Aciertos: ${mainScore} / ${MAIN_QUESTIONS_COUNT} (${(mainScore/MAIN_QUESTIONS_COUNT*100).toFixed(0)}%)`, margin + 5, y);
    y += 10;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Calificación Diagnóstica: ${grade}`, margin + 5, y);

    y += 30;

    // BREAKDOWN BY TOPIC
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Desglose de Conocimiento por Área Temática:", margin, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const topics = Object.keys(topicStats);
    let weakTopics: string[] = [];

    topics.forEach(topic => {
        const stat = topicStats[topic];
        const percentage = (stat.correct / stat.total) * 100;
        if (percentage < 60) weakTopics.push(topic);

        doc.text(`- ${topic}: ${stat.correct}/${stat.total} (${percentage.toFixed(0)}%)`, margin + 5, y);
        y += 7;
    });

    y += 10;

    // RECOMMENDATION & POINTS TO LEARN
    doc.setFillColor(245, 240, 245);
    doc.rect(margin, y, pageWidth - (margin * 2), 45, 'F');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PUNTOS CLAVE PARA APRENDIZAJE:", margin + 5, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    let recommendationText = "Excelente desempeño. Mantén tu conocimiento repasando periódicamente nuestros módulos interactivos de SARG.";
    if (weakTopics.length > 0) {
        recommendationText = `Se han detectado áreas de oportunidad en: ${weakTopics.join(', ')}. Te recomendamos priorizar el estudio de estos temas en la sección de módulos educativos. Enfócate en comprender los conceptos base antes de pasar a temas avanzados.`;
    }

    doc.text(recommendationText, margin + 5, y + 16, { maxWidth: pageWidth - (margin * 2) - 10 });

    // SIGNATURE SECTION
    y = 260;
    doc.setDrawColor(0);
    doc.line(margin + 20, y, pageWidth - margin - 20, y);
    doc.setFontSize(10);
    doc.text("Firma Digital - Motor Evaluativo SARG", pageWidth / 2, y + 5, { align: 'center' });

    doc.save(`certificacion_sarg_${Date.now()}.pdf`);
  };

  const IntroView = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in zoom-in">
        <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-6 animate-pulse border border-blue-200">
            <Brain size={64} className="text-blue-500" />
        </div>
        <h2 className="text-4xl font-black text-gray-800 dark:text-white mb-4 tracking-tight">Triaje de Aprendizaje</h2>
        <p className="text-gray-500 max-w-md mb-8 text-lg leading-relaxed">
            Antes de comenzar tu certificación, realizaremos un pequeño <strong className="text-blue-500">Examen de Ubicación</strong> de 3 preguntas para asignar tu nivel (Básico, Intermedio o Avanzado).
        </p>
        <button onClick={() => { setCurrentQuestionIndex(0); setStep('intro_quiz'); }} className="px-12 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/30 hover:scale-105 transition-all flex items-center gap-3">
            EXAMEN DE UBICACIÓN <ArrowRight/>
        </button>
    </div>
  );

  const SharedQuizView = ({ isIntro }: { isIntro: boolean }) => {
      const qArray = isIntro ? introQuestions : mainQuestions;
      if (qArray.length === 0) return null;
      const question = qArray[currentQuestionIndex];
      const progress = ((currentQuestionIndex) / qArray.length) * 100;
      
      const badgeText = isIntro ? 'UBICACIÓN' : `NIVEL: ${assignedLevel?.toUpperCase()}`;

      return (
          <div className="h-full flex flex-col p-6 md:p-12 animate-in slide-in-from-right duration-300 relative">
              <div className="flex justify-between items-center mb-8 relative z-10">
                  <div>
                      <div className="flex items-center gap-2 mb-2">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-[10px] rounded-full tracking-widest">{badgeText}</span>
                          <span className="font-bold text-gray-400 uppercase tracking-widest text-xs">{question.topic}</span>
                      </div>
                      <div className="h-2 w-48 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-500 ${isIntro ? 'bg-indigo-400' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                      </div>
                  </div>
                  <div className="w-14 h-14 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/5 rounded-full shadow-lg flex items-center justify-center font-black text-xl text-gray-800 dark:text-white">
                      {currentQuestionIndex + 1}<span className="text-gray-300 text-sm">/{qArray.length}</span>
                  </div>
              </div>

              <div className="flex-1 flex flex-col justify-center max-w-3xl mx-auto w-full text-center relative z-10">
                   <h2 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-12 leading-tight py-2">
                       {question.text}
                   </h2>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {shuffledOptions.map((opt, idx) => {
                           let btnClass = "p-6 rounded-2xl border-2 font-bold text-lg md:text-xl transition-all flex items-center justify-center gap-3 ";
                           if (selectedAnswer === null) {
                               btnClass += "border-gray-100 dark:border-white/5 bg-white dark:bg-black/20 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-800 dark:text-white shadow-sm hover:shadow-md hover:-translate-y-1";
                           } else {
                               if (opt === question.correctAnswer) {
                                   btnClass += "bg-emerald-500 text-white border-emerald-600 shadow-xl shadow-emerald-500/20";
                               } else if (opt === selectedAnswer && !isCorrect) {
                                   btnClass += "bg-rose-500 text-white border-rose-600 shadow-xl shadow-rose-500/20";
                               } else {
                                   btnClass += "bg-gray-50 dark:bg-black/10 border-gray-100 dark:border-white/5 text-gray-400 dark:text-gray-600 opacity-50";
                               }
                           }

                           return (
                               <button 
                                 key={idx} 
                                 onClick={() => handleAnswer(opt)} 
                                 disabled={selectedAnswer !== null}
                                 className={btnClass}
                               >
                                   {selectedAnswer !== null && opt === question.correctAnswer && <CheckCircle size={24} className="animate-in zoom-in" />}
                                   {selectedAnswer !== null && opt === selectedAnswer && !isCorrect && <XCircle size={24} className="animate-in zoom-in" />}
                                   {opt}
                               </button>
                           );
                       })}
                   </div>
              </div>
          </div>
      );
  };

  const SharedAnalyzingView = ({ text }: { text: string }) => (
      <div className="h-full flex flex-col items-center justify-center bg-transparent">
          <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse"></div>
              <Activity className="animate-pulse text-blue-500 mb-6 relative z-10" size={80} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-white animate-pulse tracking-tight">{text}</h2>
      </div>
  );

  const IntroResultView = () => (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in slide-in-from-bottom">
          <div className="mb-8">
              <span className="text-sm font-black text-gray-400 uppercase tracking-widest block mb-2">ANÁLISIS COMPLETADO</span>
              <h2 className="text-5xl font-black text-gray-900 dark:text-white">Nivel Asignado:</h2>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-blue-500/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter relative z-10 mb-4 group-hover:scale-105 transition-transform">{assignedLevel}</h1>
              <p className="text-blue-100 font-medium text-lg max-w-sm mx-auto relative z-10">Has obtenido {introScore} de {INTRO_QUESTIONS_COUNT} aciertos en tu ubicación.</p>
          </div>

          <button onClick={() => { setCurrentQuestionIndex(0); setStep('main_quiz'); }} className="mt-12 px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-3">
              COMENZAR EXAMEN {assignedLevel?.toUpperCase()} <ChevronRight/>
          </button>
      </div>
  );

  const ResultView = () => {
      const grade = getFinalGrade();
      const isGood = mainScore >= (MAIN_QUESTIONS_COUNT * 0.6);

      return (
          <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-transparent animate-in slide-in-from-bottom">
              <div className={`rounded-[3rem] p-8 md:p-12 text-white shadow-2xl mb-8 relative overflow-hidden ${isGood ? 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-500/20' : 'bg-gradient-to-br from-indigo-500 to-purple-800 shadow-indigo-500/20'}`}>
                   
                   <div className="absolute top-0 right-0 w-full h-full bg-white/5 animate-pulse rounded-[3rem] pointer-events-none"></div>

                   <div className="relative z-10">
                       <div className="flex items-start justify-between mb-8">
                           <div className="bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest border border-white/20">
                               CERTIFICACIÓN COMPLETADA
                           </div>
                           <Trophy size={48} className="opacity-80" />
                       </div>

                       <h1 className="text-5xl md:text-7xl font-black mb-2 uppercase tracking-tight leading-none">
                           {grade}
                       </h1>
                       <p className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl leading-relaxed mb-8 border-l-4 border-white/30 pl-4">
                           Has completado el examen de nivel {assignedLevel}. Tu diagnóstico ha sido procesado exitosamente.
                       </p>

                       <div className="mb-8 bg-black/20 p-6 rounded-3xl backdrop-blur-md border border-white/10 flex items-center justify-between">
                           <div>
                               <h4 className="font-bold text-sm uppercase mb-1 opacity-70 tracking-wider">Aciertos Totales</h4>
                               <p className="text-5xl font-black">{mainScore} <span className="text-2xl opacity-60">/ {MAIN_QUESTIONS_COUNT}</span></p>
                           </div>
                           <Award size={72} className="text-yellow-400 opacity-90" />
                       </div>

                       <div className="flex flex-col md:flex-row gap-4 mt-8">
                           <button 
                             onClick={() => generateLevelPDF()}
                             className="px-8 py-5 bg-white text-gray-900 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform flex items-center gap-3 justify-center w-full md:w-auto hover:bg-gray-50"
                           >
                               <Printer size={24} /> OBTENER REPORTE MÉTRICO
                           </button>
                           
                           <button 
                             onClick={() => { setStep('intro'); initQuizzes(); }}
                             className="px-8 py-5 bg-black/20 backdrop-blur text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-black/30 transition-colors flex items-center gap-3 justify-center w-full md:w-auto"
                           >
                               REINTENTAR TRIAGE
                           </button>
                       </div>
                   </div>
              </div>
          </div>
      );
  };

  return (
    <div className="w-full h-full bg-white/80 dark:bg-[#121212]/80 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col relative border border-gray-200/50 dark:border-white/5">
        {step !== 'intro' && step !== 'intro_analyzing' && step !== 'analyzing' && step !== 'result' && step !== 'intro_result' && (
            <div className="absolute top-6 left-6 z-50">
                <button onClick={onBack} className="p-4 bg-white dark:bg-black/50 backdrop-blur shadow-xl border border-gray-100 dark:border-white/5 rounded-full hover:scale-110 transition-transform group">
                    <X size={20} className="text-gray-800 dark:text-white group-hover:text-red-500 transition-colors" />
                </button>
            </div>
        )}
        {step === 'intro' && <IntroView />}
        {step === 'intro_quiz' && <SharedQuizView isIntro={true} />}
        {step === 'intro_analyzing' && <SharedAnalyzingView text="Evaluando competencias base..." />}
        {step === 'intro_result' && <IntroResultView />}
        {step === 'main_quiz' && <SharedQuizView isIntro={false} />}
        {step === 'analyzing' && <SharedAnalyzingView text="Procesando métricas y nivel..." />}
        {step === 'result' && <ResultView />}
    </div>
  );
};

export default SymptomWizard;

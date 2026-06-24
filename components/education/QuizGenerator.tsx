

import React, { useState, useEffect, useRef } from 'react';
import {
    Brain, CheckCircle, XCircle, ArrowRight, RefreshCcw, Loader2,
    Award, FileText, Download, PlayCircle, BookOpen, Clock,
    Zap, Heart, HelpCircle, Shield, Sparkles, Trophy, Star,
    Flame, Lock, Unlock, ChevronRight, Palette, Microscope, Globe, Music, Lightbulb
} from 'lucide-react';
import { generateQuiz, generateStudyMaterial } from '../../services/geminiService';
import { QuizData } from '../../types';
import { jsPDF } from 'jspdf';

// --- 100+ MUESTRAS / PRESETS ---
const QUIZ_SAMPLES = [
    { id: 'chiapas_1', title: 'Cultura Maya', icon: <Globe />, color: 'from-emerald-500 to-teal-500' },
    { id: 'bio_1', title: 'Células y ADN', icon: <Microscope />, color: 'from-pink-500 to-rose-500' },
    { id: 'hist_1', title: 'Revolución Mexicana', icon: <BookOpen />, color: 'from-orange-500 to-red-500' },
    { id: 'space_1', title: 'Sistema Solar', icon: <Sparkles />, color: 'from-indigo-500 to-purple-500' },
    { id: 'art_1', title: 'Muralismo Mexicano', icon: <Palette />, color: 'from-blue-500 to-cyan-500' },
    { id: 'math_1', title: 'Álgebra Básica', icon: <Brain />, color: 'from-yellow-500 to-orange-500' },
    { id: 'geo_1', title: 'Ríos de Chiapas', icon: <Globe />, color: 'from-cyan-500 to-blue-600' },
    { id: 'chem_1', title: 'Tabla Periódica', icon: <Zap />, color: 'from-green-500 to-lime-500' },
    { id: 'mus_1', title: 'Marimba', icon: <Music />, color: 'from-amber-500 to-yellow-600' },
];

const QuizGenerator: React.FC = () => {
    // --- CORE STATE ---
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState<'Básico' | 'Intermedio' | 'Avanzado'>('Intermedio');
    const [mode, setMode] = useState<'input' | 'study' | 'quiz' | 'result'>('input');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');

    // --- DATA ---
    const [studyData, setStudyData] = useState<any>(null);
    const [quizData, setQuizData] = useState<QuizData | null>(null);

    // --- GAME STATE ---
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0); // Racha de aciertos
    const [maxCombo, setMaxCombo] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [lives, setLives] = useState(3);
    const [isPaused, setIsPaused] = useState(false);

    // --- INTERACTION STATE ---
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [answerStatus, setAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
    const [visibleOptions, setVisibleOptions] = useState<number[]>([0, 1, 2, 3]); // Para el 50/50
    const [hintVisible, setHintVisible] = useState(false);

    // --- LIFELINES USED ---
    const [used5050, setUsed5050] = useState(false);
    const [usedTime, setUsedTime] = useState(false);
    const [usedHint, setUsedHint] = useState(false);

    // --- REFS ---
    const timerRef = useRef<any>(null);

    // --- AUDIO VISUALS ---
    const playSound = (type: 'correct' | 'wrong' | 'click') => {
        if (navigator.vibrate) {
            if (type === 'correct') navigator.vibrate([50, 50, 50]);
            if (type === 'wrong') navigator.vibrate(300);
        }
    };

    // --- ACTIONS ---

    const startProcess = async (customTopic?: string) => {
        const finalTopic = customTopic || topic;
        if (!finalTopic.trim()) return;

        setIsLoading(true);
        setLoadingStep(`Generando Guía (${difficulty})...`);

        const material = await generateStudyMaterial(finalTopic, difficulty);
        if (material) {
            setStudyData(material);
            setMode('study');
        } else {
            setLoadingStep('Error en red. Modo Offline activo...');
            setStudyData({
                topic: finalTopic,
                isOffline: true,
                modules: [
                    { title: "Módulo Base", content: "El sistema no pudo conectarse para generar el material.", keyPoints: ["Verifica tu conexión"] }
                ]
            });
            setMode('study');
        }
        setIsLoading(false);
    };

    const startQuiz = async () => {
        setIsLoading(true);
        setLoadingStep(`Diseñando Desafío (${difficulty})...`);

        const quiz = await generateQuiz(studyData?.topic || topic, difficulty);
        if (quiz) {
            setQuizData(quiz);
            resetGame();
            setMode('quiz');
        } else {
            setQuizData({
                title: studyData?.topic || topic,
                isOffline: true,
                questions: [{ id: 1, type: "multiple_choice", question: "Modo Offline: ¿Estás conectado?", options: ["Sí", "No", "Tal vez", "No sé"], correctIndex: 1, explanation: "Revisa tu conexión a internet para disfrutar de SARG al 100%." }]
            } as any);
            resetGame();
            setMode('quiz');
        }
        setIsLoading(false);
    };

    const resetGame = () => {
        setScore(0);
        setCombo(0);
        setMaxCombo(0);
        setCurrentQuestion(0);
        setLives(3);
        setTimeLeft(30);
        setUsed5050(false);
        setUsedTime(false);
        setUsedHint(false);
        resetQuestionState();
    };

    const resetQuestionState = () => {
        setSelectedOption(null);
        setAnswerStatus('idle');
        setVisibleOptions([0, 1, 2, 3]);
        setHintVisible(false);
        setTimeLeft(30);
        setIsPaused(false);
    };

    // --- TIMER LOGIC ---
    useEffect(() => {
        if (mode === 'quiz' && !isPaused && answerStatus === 'idle') {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleTimeOut();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [mode, isPaused, answerStatus, currentQuestion]);

    const handleTimeOut = () => {
        playSound('wrong');
        setAnswerStatus('wrong');
        setLives(l => l - 1);
        setCombo(0);
    };

    // --- GAMEPLAY LOGIC ---

    const handleOptionClick = (index: number) => {
        if (answerStatus !== 'idle' || lives <= 0) return;

        setSelectedOption(index);
        const isCorrect = index === quizData?.questions[currentQuestion].correctIndex;

        if (isCorrect) {
            setAnswerStatus('correct');
            playSound('correct');
            const points = 100 + (combo * 20) + (timeLeft * 5);
            setScore(s => s + points);
            setCombo(c => {
                const newCombo = c + 1;
                if (newCombo > maxCombo) setMaxCombo(newCombo);
                return newCombo;
            });
        } else {
            setAnswerStatus('wrong');
            playSound('wrong');
            setLives(l => l - 1);
            setCombo(0);
        }
    };

    const nextQuestion = () => {
        if (!quizData) return;

        if (lives <= 0) {
            setMode('result');
            return;
        }

        if (currentQuestion < quizData.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            resetQuestionState();
        } else {
            setMode('result');
        }
    };

    // --- LIFELINES ---

    const use5050 = () => {
        if (used5050 || !quizData) return;
        setUsed5050(true);
        const correct = quizData.questions[currentQuestion].correctIndex;
        const allIndices = [0, 1, 2, 3].filter(i => i !== correct);
        const randomWrong = allIndices[Math.floor(Math.random() * allIndices.length)];
        setVisibleOptions([correct, randomWrong]);
    };

    const useTime = () => {
        if (usedTime) return;
        setUsedTime(true);
        setTimeLeft(prev => prev + 15);
    };

    const useHint = () => {
        if (usedHint) return;
        setUsedHint(true);
        setHintVisible(true);
    };

    const generatePDF = () => {
        if (!studyData) return;
        const doc = new jsPDF();
        const pageWidth = 210;
        const margin = 20;
        let y = margin;

        doc.setFillColor(26, 16, 31);
        doc.rect(0, 0, pageWidth, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("AXOLOTL LEARNING", margin, 20);

        y = 45;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(22);
        doc.text(studyData.topic.toUpperCase(), margin, y);
        y += 10;

        studyData.modules.forEach((mod: any) => {
            if (y > 260) { doc.addPage(); y = margin + 10; }

            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(236, 64, 122);
            doc.text(mod.title, margin, y);
            y += 8;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.setTextColor(0);

            const lines = doc.splitTextToSize(mod.content, pageWidth - (margin * 2));
            doc.text(lines, margin, y);
            y += (lines.length * 6) + 10;
        });

        doc.save(`SARG_Guia_${studyData.topic}.pdf`);
    };

    // --- RENDERERS ---

    const LoadingScreen = () => (
        <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white rounded-[2rem] p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 animate-pulse"></div>
            <Loader2 size={64} className="text-blue-500 animate-spin mb-6 relative z-10" />
            <h3 className="text-2xl font-black animate-pulse text-center relative z-10">{loadingStep}</h3>
            <p className="text-gray-400 mt-2 relative z-10 font-mono text-sm">Conectando con la Red Neuronal de SARG...</p>
        </div>
    );

    const ResultScreen = () => {
        const maxScore = (quizData?.questions.length || 0) * 150;
        const percentage = (score / maxScore) * 100;
        let medal = '🥉';
        let message = '¡Buen intento!';

        if (percentage > 80) { medal = '🥇'; message = '¡Maestro del Tema!'; }
        else if (percentage > 50) { medal = '🥈'; message = '¡Gran trabajo!'; }

        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 md:p-8 animate-in zoom-in-95 duration-700 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-black text-white rounded-[2rem] relative overflow-hidden">
                {/* Confetti BG */}
                {percentage > 50 && (
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="absolute w-2 h-2 md:w-3 md:h-3 bg-random rounded-full animate-blob" style={{
                                left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                                backgroundColor: ['#ec407a', '#26c6da', '#ab47bc', '#fbbf24'][Math.floor(Math.random() * 4)],
                                animationDelay: `${Math.random() * 2}s`
                            }}></div>
                        ))}
                    </div>
                )}

                <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-[0_0_50px_rgba(251,191,36,0.6)] animate-bounce text-6xl md:text-8xl border-4 md:border-8 border-white">
                    {medal}
                </div>

                <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-2 md:mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 drop-shadow-lg">{message}</h2>
                <div className="text-2xl md:text-4xl font-bold text-gray-300 mb-8 md:mb-10">Puntos: <span className="text-white font-black">{score}</span></div>

                <div className="grid grid-cols-2 gap-3 md:gap-6 w-full max-w-lg mb-8 md:mb-12 px-4 md:px-0">
                    <div className="bg-white/5 md:bg-white/10 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-[10px] md:text-xs text-gray-400 uppercase font-black tracking-widest mb-1 md:mb-2">Mejor Racha</div>
                        <div className="text-3xl md:text-5xl font-black text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]">{maxCombo}x</div>
                    </div>
                    <div className="bg-white/5 md:bg-white/10 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors">
                        <div className="text-[10px] md:text-xs text-gray-400 uppercase font-black tracking-widest mb-1 md:mb-2">Preguntas</div>
                        <div className="text-3xl md:text-5xl font-black text-pink-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.5)]">{currentQuestion + (lives > 0 ? 1 : 0)} / {quizData?.questions.length}</div>
                    </div>
                </div>

                <button
                    onClick={() => { setMode('input'); setTopic(''); }}
                    className="w-full sm:w-auto px-10 md:px-12 py-4 md:py-5 bg-gradient-to-r from-axolotl-pink to-purple-600 text-white rounded-[1.5rem] md:rounded-full font-black text-lg md:text-xl shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <RefreshCcw size={24} className="md:w-7 md:h-7" /> Jugar de Nuevo
                </button>
            </div>
        );
    };

    if (isLoading) return <LoadingScreen />;
    if (mode === 'result') return <ResultScreen />;

    // --- INPUT MODE (MAIN MENU) ---
    if (mode === 'input') {
        return (
            <div className="flex flex-col h-full p-4 md:p-8 bg-gray-50/50 dark:bg-[#0d1117] rounded-[2rem] overflow-y-auto custom-scrollbar animate-in fade-in duration-500">

                {/* Hero Section */}
                <div className="text-center mb-8 md:mb-12 relative mt-4 md:mt-8">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-72 md:h-72 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[60px] md:blur-[100px] pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="inline-block p-4 rounded-full bg-white dark:bg-gray-800 shadow-xl mb-6 animate-[bounce_3s_ease-in-out_infinite] border border-gray-100 dark:border-gray-700">
                            <Brain size={48} className="text-axolotl-pink md:w-16 md:h-16" />
                        </div>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter leading-none">
                            Arena de <span className="text-transparent bg-clip-text bg-gradient-to-r from-axolotl-pink to-purple-600 block sm:inline">Conocimiento</span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-base md:text-xl font-medium max-w-2xl mx-auto px-4 leading-relaxed">
                            Elige un tema o desafía a la IA con cualquier tópico que imagines. <br className="hidden md:block" /> ¡Supera el test y gana medallas!
                        </p>
                    </div>
                </div>

                {/* Search Input */}
                <div className="max-w-3xl mx-auto w-full mb-12 relative z-20 px-2 md:px-0">
                    <div className="bg-white dark:bg-gray-800 p-2 md:p-3 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-2 transition-all focus-within:ring-4 ring-purple-500/30 mb-6 group hover:shadow-purple-500/10">
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Escribe cualquier tema... (Ej: Ajolotes)"
                            className="flex-1 bg-transparent px-6 py-4 sm:py-5 outline-none font-black text-xl md:text-2xl text-gray-900 dark:text-white placeholder-gray-400/70 text-center sm:text-left transition-colors"
                            onKeyDown={(e) => e.key === 'Enter' && startProcess()}
                        />
                        <button
                            onClick={() => startProcess()}
                            disabled={!topic.trim()}
                            className="w-full sm:w-auto px-8 md:px-10 py-4 sm:py-5 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-axolotl-dark dark:to-purple-900 text-white rounded-[1.5rem] font-black text-lg md:text-xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gray-900/20"
                        >
                            JUGAR <ArrowRight strokeWidth={4} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Difficulty Selector */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 md:gap-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl py-3 px-6 rounded-[2rem] border border-gray-200/50 dark:border-gray-700/50 max-w-fit mx-auto shadow-sm">
                        <span className="text-xs md:text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Flame size={14} className="text-orange-500" /> Nivel:
                        </span>
                        <div className="flex bg-gray-100 dark:bg-[#0d1117] p-1.5 rounded-full w-full sm:w-auto justify-between sm:justify-start">
                            {['Básico', 'Intermedio', 'Avanzado'].map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level as any)}
                                    className={`flex-1 sm:flex-none px-4 md:px-6 py-2.5 rounded-full text-xs md:text-sm font-black transition-all duration-300 ${difficulty === level
                                            ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-md scale-105 ring-1 ring-black/5 dark:ring-white/10'
                                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Samples Grid */}
                <div className="max-w-6xl mx-auto w-full px-2 md:px-6 pb-10">
                    <h3 className="text-gray-400 font-black uppercase tracking-widest text-xs md:text-sm mb-6 flex items-center gap-2 justify-center md:justify-start">
                        <Sparkles size={16} className="text-yellow-400 animate-pulse" /> Muestras Destacadas
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
                        {QUIZ_SAMPLES.map(sample => (
                            <button
                                key={sample.id}
                                onClick={() => startProcess(sample.title)}
                                className="group relative overflow-hidden rounded-[1.5rem] p-[2px] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-4 ring-purple-500/30 active:scale-95"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${sample.color} opacity-20 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md h-full rounded-[22px] p-5 sm:p-6 flex flex-col items-center justify-center gap-3 sm:gap-4 border border-gray-100 dark:border-gray-800 relative z-10 transition-colors duration-500 group-hover:bg-transparent group-hover:border-transparent">
                                    <div className={`p-3 md:p-4 rounded-full bg-gradient-to-br ${sample.color} text-white shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-300`}>
                                        {React.cloneElement(sample.icon as any, { className: "w-6 h-6 md:w-8 md:h-8" })}
                                    </div>
                                    <span className="font-black text-gray-800 dark:text-gray-100 text-center text-sm md:text-base leading-tight group-hover:text-white transition-colors duration-300 drop-shadow-sm">
                                        {sample.title}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // --- STUDY MODE ---
    if (mode === 'study' && studyData) {
        return (
            <div className="h-full flex flex-col p-4 md:p-8 max-w-6xl mx-auto animate-in slide-in-from-bottom-8 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-5 md:p-8 rounded-[2rem] shadow-xl border border-gray-100/50 dark:border-gray-700/50">
                    <div className="w-full md:w-auto">
                        <div className="text-[10px] md:text-xs font-black text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <BookOpen size={14} className="animate-pulse" /> Guía de Estudio
                            {studyData.isOffline && <span className="ml-2 px-2.5 py-1 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-[9px] md:text-[10px]">Modo Offline</span>}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">{studyData.topic}</h2>
                    </div>
                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                        <button onClick={generatePDF} className="w-full sm:w-auto px-6 py-3.5 md:py-4 bg-blue-50/80 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-[1.25rem] font-black flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200/50 dark:border-blue-800/50 active:scale-95">
                            <Download size={20} /> PDF
                        </button>
                        <button onClick={startQuiz} className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-[1.25rem] font-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105 active:scale-95 transition-all">
                            <Zap size={20} className="fill-white animate-pulse" /> ¡DESAFÍO QUIZ!
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-6 md:space-y-8 pr-1 md:pr-4 custom-scrollbar pb-24 md:pb-10">
                    {studyData.modules.map((mod: any, i: number) => (
                        <div key={i} className="bg-white dark:bg-[#151b23] p-6 md:p-10 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group hover:border-purple-100 dark:hover:border-purple-900/50 transition-colors">
                            <div className="absolute top-0 right-0 w-24 h-24 md:w-40 md:h-40 bg-purple-500/5 dark:bg-purple-500/10 rounded-bl-[100px] transition-transform duration-500 group-hover:scale-125"></div>
                            <div className="relative z-10">
                                <h3 className="text-xl md:text-3xl font-black text-purple-600 dark:text-purple-400 mb-4 md:mb-6 flex items-center gap-3 md:gap-4">
                                    <span className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center text-sm md:text-base border border-purple-200 dark:border-purple-800 shrink-0">{i + 1}</span>
                                    <span className="leading-tight">{mod.title}</span>
                                </h3>
                                <div className="prose dark:prose-invert prose-base md:prose-lg max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-6 md:mb-8 font-medium">
                                    {mod.content}
                                </div>
                                {mod.keyPoints && (
                                    <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-900/10 dark:to-pink-900/10 p-5 md:p-8 rounded-[1.5rem] border border-purple-100/50 dark:border-purple-800/30">
                                        <h4 className="font-black text-[10px] md:text-xs uppercase text-purple-800 dark:text-purple-300 mb-4 flex items-center gap-2">
                                            <Star size={16} className="fill-purple-500 text-purple-500" /> Puntos Clave
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                            {mod.keyPoints.map((kp: string, k: number) => (
                                                <div key={k} className="flex items-start gap-3 text-sm md:text-base font-bold text-purple-900 dark:text-purple-200 bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/50 dark:border-white/5">
                                                    <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 md:mt-2 shrink-0"></span>
                                                    <span className="leading-snug">{kp}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- QUIZ MODE (GAMIFIED) ---
    if (mode === 'quiz' && quizData) {
        const q = quizData.questions[currentQuestion];
        const isCritical = timeLeft <= 10;

        return (
            <div className="h-full flex flex-col bg-[#0a0a0a] text-white p-3 md:p-8 overflow-hidden relative animate-in fade-in zoom-in-95 duration-500">

                {/* Animated BG */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-[#0a0a0a] to-black -z-10"></div>
                <div className="absolute top-0 left-0 w-full h-1 md:h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 animate-[shimmer_2s_infinite]"></div>

                {/* TOP HUD */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-10 bg-white/5 backdrop-blur-xl p-3 md:p-5 rounded-2xl md:rounded-[2rem] border border-white/10 gap-4 shadow-lg">
                    <div className="flex gap-4 md:gap-6 items-center w-full sm:w-auto justify-between sm:justify-start">
                        {quizData.isOffline && (
                            <div className="bg-gray-800 text-gray-400 border border-gray-600 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-inner">
                                Modo Offline
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-black/40 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/5 shadow-inner">
                            <Heart className={`fill-red-500 text-red-500 ${lives < 2 ? 'animate-ping' : ''}`} size={16} />
                            <span className="font-black text-base md:text-xl">{lives}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-black/40 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-white/5 shadow-inner">
                            <Trophy className="text-yellow-400" size={16} />
                            <span className="font-black text-base md:text-xl">{score}</span>
                        </div>
                        {combo > 1 && (
                            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-black italic animate-bounce flex items-center gap-1 shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                                <Flame size={14} fill="white" /> {combo}x
                            </div>
                        )}
                    </div>

                    {/* Timer Bar */}
                    <div className="flex items-center gap-3 w-full sm:w-1/3 md:w-1/4 bg-black/40 p-2 md:p-3 rounded-full border border-white/5">
                        <Clock size={18} className={isCritical ? 'text-red-500 animate-pulse' : 'text-gray-400'} />
                        <div className="flex-1 h-3 md:h-4 bg-gray-900 rounded-full overflow-hidden relative shadow-inner">
                            <div
                                className={`h-full transition-all duration-1000 ease-linear shadow-[0_0_10px_currentColor] ${isCritical ? 'bg-red-500 text-red-500' : 'bg-cyan-400 text-cyan-400'}`}
                                style={{ width: `${(timeLeft / 30) * 100}%` }}
                            ></div>
                        </div>
                        <span className={`font-mono font-black text-sm md:text-lg w-8 text-right ${isCritical ? 'text-red-500' : 'text-cyan-400'}`}>{timeLeft}</span>
                    </div>
                </div>

                {/* MAIN GAME AREA */}
                <div className="flex-1 flex flex-col justify-center max-w-5xl mx-auto w-full relative z-10 pb-24 md:pb-0">

                    {/* Question Card - ELIMINADO EL bg-white */}
                    <div className={`bg-black/40 backdrop-blur-xl p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-white/5 text-center mb-6 md:mb-10 transition-all duration-300 relative overflow-hidden ${answerStatus === 'wrong' ? 'animate-[shake_0.5s_ease-in-out] border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)]' : ''} ${answerStatus === 'correct' ? 'border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : ''}`}>
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                        <span className="inline-block bg-white/5 px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest mb-4 md:mb-8 text-gray-400 border border-white/5 shadow-inner">
                            Pregunta {currentQuestion + 1} de {quizData.questions.length}
                        </span>
                        <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-2 md:mb-4 tracking-tight">
                            {q.question}
                        </h2>
                        {/* Hint Area */}
                        {hintVisible && (
                            <div className="mt-6 md:mt-8 p-3 md:p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-yellow-300 text-xs md:text-sm font-bold animate-in slide-in-from-top flex items-center justify-center gap-2 max-w-2xl mx-auto backdrop-blur-md">
                                <Lightbulb size={18} className="text-yellow-400 animate-pulse shrink-0" /> PISTA: {q.explanation.substring(0, 80)}...
                            </div>
                        )}
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                        {q.options.map((opt, idx) => {
                            if (!visibleOptions.includes(idx)) return <div key={idx} className="invisible hidden md:block"></div>;

                            let btnClass = "bg-white/5 hover:bg-white/10 border-white/5 text-gray-300 hover:text-white hover:border-white/20";
                            if (selectedOption === idx) {
                                if (answerStatus === 'correct') btnClass = "bg-green-600 text-white border-green-400 shadow-[0_0_40px_rgba(34,197,94,0.6)] scale-[1.02] md:scale-105 z-20";
                                else if (answerStatus === 'wrong') btnClass = "bg-red-600 text-white border-red-400 shadow-[0_0_40px_rgba(239,68,68,0.6)] scale-[0.98] md:scale-95 opacity-90";
                            } else if (answerStatus !== 'idle' && idx === q.correctIndex) {
                                btnClass = "bg-green-600/30 text-green-100 border-green-400/50 border-dashed animate-pulse";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleOptionClick(idx)}
                                    disabled={answerStatus !== 'idle'}
                                    className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 font-black text-sm sm:text-base md:text-xl transition-all duration-300 flex items-center justify-between group relative overflow-hidden backdrop-blur-sm ${btnClass}`}
                                >
                                    <span className="text-left relative z-10">{opt}</span>
                                    <div className="relative z-10 shrink-0 ml-4">
                                        {selectedOption === idx && answerStatus === 'correct' && <CheckCircle className="animate-in zoom-in text-white drop-shadow-md" size={28} />}
                                        {selectedOption === idx && answerStatus === 'wrong' && <XCircle className="animate-in zoom-in text-white drop-shadow-md" size={28} />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation / Next Button Overlay */}
                    {answerStatus !== 'idle' && (
                        <div className="mt-6 md:mt-10 animate-in slide-in-from-bottom-8 bg-gray-900/95 backdrop-blur-xl p-5 md:p-8 rounded-[2rem] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-cyan-400 to-purple-500"></div>
                            <div className="flex-1 text-left pl-4">
                                <h4 className="font-black uppercase text-[10px] md:text-xs text-cyan-400 mb-2 flex items-center gap-2"><BookOpen size={14} /> Aprende Más</h4>
                                <p className="text-xs sm:text-sm md:text-base font-medium text-gray-300 leading-relaxed">{q.explanation}</p>
                            </div>
                            <button
                                onClick={nextQuestion}
                                className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-black rounded-[1.5rem] font-black hover:scale-105 active:scale-95 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center gap-3 whitespace-nowrap hover:bg-gray-100 text-sm md:text-lg"
                            >
                                {currentQuestion < quizData.questions.length - 1 ? 'SIGUIENTE' : 'VER RESULTADOS'} <ArrowRight size={24} strokeWidth={3} />
                            </button>
                        </div>
                    )}
                </div>

                {/* LIFELINES DOCK */}
                <div className="fixed md:absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 md:gap-5 z-30 bg-black/50 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-3 md:p-0 rounded-full border border-white/10 md:border-transparent shadow-2xl md:shadow-none">
                    <button
                        onClick={use5050}
                        disabled={used5050 || answerStatus !== 'idle'}
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center border-2 font-black text-[10px] md:text-xs transition-all shadow-lg ${used5050 ? 'bg-gray-900 border-gray-800 text-gray-600 opacity-50 grayscale scale-95' : 'bg-purple-900/90 border-purple-500 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(168,85,247,0.4)] text-purple-100 backdrop-blur-md active:scale-95'}`}
                    >
                        <span className="text-sm md:text-lg">50:50</span>
                    </button>
                    <button
                        onClick={useTime}
                        disabled={usedTime || answerStatus !== 'idle'}
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center border-2 font-black text-[10px] md:text-xs transition-all shadow-lg ${usedTime ? 'bg-gray-900 border-gray-800 text-gray-600 opacity-50 grayscale scale-95' : 'bg-blue-900/90 border-blue-500 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(59,130,246,0.4)] text-blue-100 backdrop-blur-md active:scale-95'}`}
                    >
                        <Clock size={18} className="md:w-5 md:h-5" /> <span className="hidden md:inline">+15s</span>
                    </button>
                    <button
                        onClick={useHint}
                        disabled={usedHint || answerStatus !== 'idle'}
                        className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex flex-col items-center justify-center border-2 font-black text-[10px] md:text-xs transition-all shadow-lg ${usedHint ? 'bg-gray-900 border-gray-800 text-gray-600 opacity-50 grayscale scale-95' : 'bg-yellow-900/90 border-yellow-500 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(234,179,8,0.4)] text-yellow-100 backdrop-blur-md active:scale-95'}`}
                    >
                        <HelpCircle size={18} className="md:w-5 md:h-5" /> <span className="hidden md:inline">PISTA</span>
                    </button>
                </div>

                {/* Axolotl Mascot (Enhanced SVG) */}
                <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 pointer-events-none z-0 hidden md:block">
                    <svg viewBox="0 0 200 200" className={`w-full h-full transition-all duration-500 ${answerStatus === 'correct' ? 'animate-bounce' : answerStatus === 'wrong' ? 'translate-y-4' : 'animate-float'}`}>
                        {/* Head */}
                        <path d="M 60 80 Q 100 40 140 80 Q 160 120 100 160 Q 40 120 60 80" fill="#f06292" />
                        {/* Gills (Animated) */}
                        <g className={answerStatus === 'idle' ? 'animate-pulse' : ''}>
                            <path d="M 60 80 Q 40 60 30 70" stroke="#ec407a" strokeWidth="8" strokeLinecap="round" />
                            <path d="M 60 90 Q 35 90 30 100" stroke="#ec407a" strokeWidth="8" strokeLinecap="round" />
                            <path d="M 140 80 Q 160 60 170 70" stroke="#ec407a" strokeWidth="8" strokeLinecap="round" />
                            <path d="M 140 90 Q 165 90 170 100" stroke="#ec407a" strokeWidth="8" strokeLinecap="round" />
                        </g>
                        {/* Face */}
                        {answerStatus === 'correct' ? (
                            <>
                                <circle cx="80" cy="100" r="5" fill="black" />
                                <circle cx="120" cy="100" r="5" fill="black" />
                                <path d="M 90 120 Q 100 130 110 120" stroke="black" strokeWidth="3" fill="none" />
                            </>
                        ) : answerStatus === 'wrong' ? (
                            <>
                                <path d="M 75 95 L 85 105 M 85 95 L 75 105" stroke="black" strokeWidth="3" />
                                <path d="M 115 95 L 125 105 M 125 95 L 115 105" stroke="black" strokeWidth="3" />
                                <path d="M 90 130 Q 100 120 110 130" stroke="black" strokeWidth="3" fill="none" />
                                <path d="M 50 90 Q 40 110 50 130" stroke="#64b5f6" strokeWidth="3" fill="none" opacity="0.8" /> {/* Tear */}
                            </>
                        ) : (
                            <>
                                <circle cx="80" cy="100" r="6" fill="black" />
                                <circle cx="120" cy="100" r="6" fill="black" />
                                <path d="M 95 120 Q 100 125 105 120" stroke="black" strokeWidth="3" fill="none" />
                            </>
                        )}
                    </svg>
                </div>

            </div>
        );
    }

    return null;
};

export default QuizGenerator;

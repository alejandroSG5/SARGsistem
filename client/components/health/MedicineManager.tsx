import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Edit3, Trash2, Plus, 
  Layers, Search, CheckCircle, ChevronRight, BookMarked, BrainCircuit, X, Lightbulb
} from 'lucide-react';
import { SoundEffects } from '../../utils/soundSystem';

// --- TYPES ---
interface Note {
    id: string;
    title: string;
    content: string;
    date: number;
}

interface Flashcard {
    id: string;
    question: string;
    answer: string;
}

interface GlossaryItem {
    id: string;
    term: string;
    definition: string;
}

const MedicineManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards' | 'glossary'>('notes');
  
  // --- STATE ---
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [glossary, setGlossary] = useState<GlossaryItem[]>([]);

  // Modals / Forms
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const [showCardForm, setShowCardForm] = useState(false);
  const [newCard, setNewCard] = useState({ question: '', answer: '' });

  const [showTermForm, setShowTermForm] = useState(false);
  const [newTerm, setNewTerm] = useState({ term: '', definition: '' });

  // Flashcard Play Mode
  const [playingCards, setPlayingCards] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // --- LOCAL STORAGE SYNC ---
  useEffect(() => {
      const savedNotes = localStorage.getItem('sarg_notes');
      const savedCards = localStorage.getItem('sarg_flashcards');
      const savedGlossary = localStorage.getItem('sarg_glossary');

      if (savedNotes) setNotes(JSON.parse(savedNotes));
      else setNotes([{ id: '1', title: 'Bienvenido al Cuaderno', content: 'Aquí puedes guardar todos tus apuntes clínicos, descubrimientos del microscopio o usos de plantas medicinales.', date: Date.now() }]);
      
      if (savedCards) setFlashcards(JSON.parse(savedCards));
      else setFlashcards([{ id: '1', question: '¿Cuál es la función principal de los eritrocitos?', answer: 'Transportar oxígeno desde los pulmones a los tejidos del cuerpo usando hemoglobina.' }]);
      
      if (savedGlossary) setGlossary(JSON.parse(savedGlossary));
      else setGlossary([{ id: '1', term: 'Hemoglobina', definition: 'Proteína en los glóbulos rojos que transporta el oxígeno.' }]);
  }, []);

  const saveNotes = (newNotes: Note[]) => {
      setNotes(newNotes);
      localStorage.setItem('sarg_notes', JSON.stringify(newNotes));
  };

  const saveFlashcards = (newCards: Flashcard[]) => {
      setFlashcards(newCards);
      localStorage.setItem('sarg_flashcards', JSON.stringify(newCards));
  };

  const saveGlossary = (newGlossary: GlossaryItem[]) => {
      setGlossary(newGlossary);
      localStorage.setItem('sarg_glossary', JSON.stringify(newGlossary));
  };

  // --- ACTIONS ---
  const handleSaveNote = () => {
      if (!newNote.title || !newNote.content) return;
      if (editingNoteId) {
          saveNotes(notes.map(n => n.id === editingNoteId ? { ...n, title: newNote.title, content: newNote.content, date: Date.now() } : n));
      } else {
          saveNotes([{ id: Date.now().toString(), title: newNote.title, content: newNote.content, date: Date.now() }, ...notes]);
      }
      setNewNote({ title: '', content: '' });
      setShowNoteForm(false);
      setEditingNoteId(null);
      SoundEffects.success();
  };

  const handleDeleteNote = (id: string) => {
      saveNotes(notes.filter(n => n.id !== id));
      SoundEffects.click();
  };

  const handleSaveCard = () => {
      if (!newCard.question || !newCard.answer) return;
      saveFlashcards([{ id: Date.now().toString(), question: newCard.question, answer: newCard.answer }, ...flashcards]);
      setNewCard({ question: '', answer: '' });
      setShowCardForm(false);
      SoundEffects.success();
  };

  const handleDeleteCard = (id: string) => {
      saveFlashcards(flashcards.filter(n => n.id !== id));
      SoundEffects.click();
  };

  const handleSaveTerm = () => {
      if (!newTerm.term || !newTerm.definition) return;
      saveGlossary([{ id: Date.now().toString(), term: newTerm.term, definition: newTerm.definition }, ...glossary]);
      setNewTerm({ term: '', definition: '' });
      setShowTermForm(false);
      SoundEffects.success();
  };

  const handleDeleteTerm = (id: string) => {
      saveGlossary(glossary.filter(n => n.id !== id));
      SoundEffects.click();
  };

  // --- RENDERERS ---

  const renderNotesView = () => {
      const filtered = notes.filter(n => n.title.toLowerCase().includes(searchTerm.toLowerCase()) || n.content.toLowerCase().includes(searchTerm.toLowerCase()));

      return (
          <div className="space-y-6 animate-in fade-in">
              {!showNoteForm ? (
                <div className="bg-orange-50 dark:bg-orange-900/10 p-6 md:p-8 rounded-3xl border border-orange-100 dark:border-orange-800/30 flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-orange-200/50 dark:bg-orange-800/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                    <div className="relative z-10">
                        <h3 className="font-black text-orange-800 dark:text-orange-300 text-2xl mb-1 flex items-center gap-2"><Edit3 size={24}/> Mis Apuntes Clínicos</h3>
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Escribe y guarda tus descubrimientos para no olvidarlos.</p>
                    </div>
                    <button onClick={() => setShowNoteForm(true)} className="relative z-10 w-full md:w-auto px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider flex justify-center items-center gap-2 shadow-lg hover:-translate-y-1 transition-all">
                        <Plus size={20} /> Escribir Apunte
                    </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-orange-200 dark:border-orange-900/50 animate-in slide-in-from-top-4">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-2xl text-gray-800 dark:text-white flex items-center gap-2">
                            <BookOpen className="text-orange-500"/> {editingNoteId ? 'Editar Apunte' : 'Nuevo Apunte'}
                        </h3>
                        <button onClick={() => {setShowNoteForm(false); setEditingNoteId(null); setNewNote({title:'', content:''})}} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full"><X size={24}/></button>
                    </div>
                    <div className="space-y-4 mb-6">
                        <input 
                            placeholder="Título del apunte..." 
                            className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 w-full outline-none font-black text-xl text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-orange-500 transition-colors" 
                            value={newNote.title} 
                            onChange={e => setNewNote({...newNote, title: e.target.value})} 
                        />
                        <textarea 
                            placeholder="Escribe tus notas, descubrimientos o diagnósticos aquí..." 
                            className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900 w-full outline-none font-medium text-gray-700 dark:text-gray-300 min-h-[200px] resize-y border border-gray-200 dark:border-gray-700 focus:border-orange-500 transition-colors leading-relaxed" 
                            value={newNote.content} 
                            onChange={e => setNewNote({...newNote, content: e.target.value})} 
                        />
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => {setShowNoteForm(false); setEditingNoteId(null); setNewNote({title:'', content:''})}} className="px-6 py-3 text-gray-500 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">Cancelar</button>
                        <button onClick={handleSaveNote} className="px-8 py-3 bg-orange-500 text-white rounded-xl font-black shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors">Guardar en Cuaderno</button>
                    </div>
                </div>
              )}

              {/* Notes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filtered.map(note => (
                      <div key={note.id} className="bg-yellow-50/50 dark:bg-yellow-900/5 p-6 rounded-[2rem] shadow-sm border border-yellow-100 dark:border-yellow-900/20 relative group hover:shadow-md transition-all flex flex-col min-h-[250px]">
                          {/* Note lines aesthetic */}
                          <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.01]" style={{backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #000 31px, #000 32px)'}}></div>
                          
                          <div className="relative z-10 flex-1">
                              <h4 className="font-black text-gray-800 dark:text-white text-xl mb-3 leading-tight">{note.title}</h4>
                              <p className="text-gray-600 dark:text-gray-400 font-medium whitespace-pre-wrap text-sm leading-relaxed line-clamp-6">{note.content}</p>
                          </div>
                          
                          <div className="relative z-10 mt-6 pt-4 border-t border-yellow-200/50 dark:border-yellow-800/30 flex justify-between items-center text-xs text-gray-400 font-bold uppercase tracking-wider">
                              <span>{new Date(note.date).toLocaleDateString()}</span>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => {setNewNote({title: note.title, content: note.content}); setEditingNoteId(note.id); setShowNoteForm(true);}} className="p-2 hover:bg-orange-100 hover:text-orange-600 rounded-lg transition-colors"><Edit3 size={16}/></button>
                                  <button onClick={() => handleDeleteNote(note.id)} className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={16}/></button>
                              </div>
                          </div>
                      </div>
                  ))}
                  {filtered.length === 0 && (
                      <div className="col-span-full py-20 text-center text-gray-400 font-medium">
                          <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                          <p>No tienes apuntes guardados aún.</p>
                      </div>
                  )}
              </div>
          </div>
      );
  };

  const renderFlashcardsView = () => {
      const filtered = flashcards.filter(c => c.question.toLowerCase().includes(searchTerm.toLowerCase()) || c.answer.toLowerCase().includes(searchTerm.toLowerCase()));

      if (playingCards && flashcards.length > 0) {
          const current = flashcards[currentCardIndex];
          return (
              <div className="animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center min-h-[600px] p-4">
                  <div className="w-full max-w-2xl">
                      <div className="flex justify-between items-center mb-8">
                          <span className="font-bold text-gray-400 uppercase tracking-widest text-sm">Tarjeta {currentCardIndex + 1} de {flashcards.length}</span>
                          <button onClick={() => {setPlayingCards(false); setShowAnswer(false); setCurrentCardIndex(0);}} className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"><X size={20}/></button>
                      </div>
                      
                      {/* The Card */}
                      <div 
                          className={`w-full min-h-[300px] rounded-[3rem] p-12 flex flex-col items-center justify-center text-center cursor-pointer shadow-2xl transition-all duration-500 transform ${showAnswer ? 'bg-indigo-600 text-white rotate-1' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-2 border-indigo-100 dark:border-indigo-900/50'}`}
                          onClick={() => setShowAnswer(!showAnswer)}
                      >
                          {showAnswer ? (
                              <div className="animate-in fade-in zoom-in-95">
                                  <Lightbulb size={48} className="text-indigo-300 mb-6 mx-auto"/>
                                  <p className="text-2xl md:text-3xl font-black leading-relaxed">{current.answer}</p>
                              </div>
                          ) : (
                              <div className="animate-in fade-in zoom-in-95">
                                  <BrainCircuit size={48} className="text-indigo-400 mb-6 mx-auto opacity-50"/>
                                  <h3 className="text-3xl md:text-4xl font-black leading-tight mb-8">{current.question}</h3>
                                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-full">Toca para revelar</span>
                              </div>
                          )}
                      </div>

                      <div className="flex gap-4 mt-8">
                          <button 
                            onClick={() => {setCurrentCardIndex(Math.max(0, currentCardIndex - 1)); setShowAnswer(false);}}
                            disabled={currentCardIndex === 0}
                            className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 rounded-2xl font-bold text-gray-500 disabled:opacity-30 hover:bg-gray-200 transition-colors"
                          >
                              Anterior
                          </button>
                          <button 
                            onClick={() => {
                                if (currentCardIndex < flashcards.length - 1) {
                                    setCurrentCardIndex(currentCardIndex + 1);
                                    setShowAnswer(false);
                                } else {
                                    setPlayingCards(false);
                                    setCurrentCardIndex(0);
                                    setShowAnswer(false);
                                }
                            }}
                            className="flex-[2] py-5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-500/30 transition-all"
                          >
                              {currentCardIndex === flashcards.length - 1 ? 'Terminar Repaso' : 'Siguiente Tarjeta'}
                          </button>
                      </div>
                  </div>
              </div>
          );
      }

      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                  <div className="flex-1 bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800/30">
                      <h3 className="font-black text-indigo-800 dark:text-indigo-300 text-xl mb-1">Tarjetas de Estudio</h3>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-4">Memoriza conceptos clave de salud y biología.</p>
                      <div className="flex gap-3">
                          <button onClick={() => setShowCardForm(true)} className="px-5 py-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl font-bold text-sm hover:bg-indigo-200 transition-colors flex items-center gap-2">
                              <Plus size={18}/> Crear Tarjeta
                          </button>
                          {flashcards.length > 0 && (
                              <button onClick={() => setPlayingCards(true)} className="px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-600 transition-colors flex items-center gap-2">
                                  <BrainCircuit size={18}/> Iniciar Repaso
                              </button>
                          )}
                      </div>
                  </div>
                  
                  {/* Quick Add Form inside view */}
                  {showCardForm && (
                      <div className="flex-[2] bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg animate-in slide-in-from-right">
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold text-gray-800 dark:text-white">Nueva Flashcard</h4>
                              <button onClick={() => setShowCardForm(false)} className="text-gray-400 hover:text-red-500"><X size={20}/></button>
                          </div>
                          <div className="space-y-3 mb-4">
                              <input placeholder="Pregunta (Cara A)" className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 w-full outline-none font-bold text-gray-800 dark:text-white border border-transparent focus:border-indigo-300" value={newCard.question} onChange={e => setNewCard({...newCard, question: e.target.value})} />
                              <textarea placeholder="Respuesta (Cara B)" className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 w-full outline-none text-gray-700 dark:text-gray-300 border border-transparent focus:border-indigo-300 min-h-[80px] resize-none" value={newCard.answer} onChange={e => setNewCard({...newCard, answer: e.target.value})} />
                          </div>
                          <button onClick={handleSaveCard} className="w-full py-3 bg-gray-900 dark:bg-white dark:text-black text-white font-bold rounded-xl hover:opacity-90">Guardar Tarjeta</button>
                      </div>
                  )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {filtered.map(card => (
                      <div key={card.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm relative group flex flex-col justify-between min-h-[160px]">
                          <div>
                              <div className="text-[10px] font-black text-indigo-500 mb-2 uppercase tracking-widest">Pregunta</div>
                              <h4 className="font-bold text-gray-800 dark:text-white leading-snug mb-4">{card.question}</h4>
                          </div>
                          <button onClick={() => handleDeleteCard(card.id)} className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const renderGlossaryView = () => {
      const filtered = glossary.filter(g => g.term.toLowerCase().includes(searchTerm.toLowerCase()) || g.definition.toLowerCase().includes(searchTerm.toLowerCase()));

      // Sort alphabetically
      filtered.sort((a, b) => a.term.localeCompare(b.term));

      return (
          <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-end mb-6">
                  <div>
                      <h3 className="font-black text-2xl text-gray-800 dark:text-white mb-1">Glosario Médico</h3>
                      <p className="text-gray-500 font-medium">Diccionario personal de términos clínicos.</p>
                  </div>
                  <button onClick={() => setShowTermForm(!showTermForm)} className="px-5 py-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-bold rounded-xl hover:bg-teal-100 transition-colors flex items-center gap-2">
                      <Plus size={18}/> Nuevo Término
                  </button>
              </div>

              {showTermForm && (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-teal-100 dark:border-teal-900/50 shadow-md mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center animate-in slide-in-from-top-4">
                      <input placeholder="Término (Ej. Leucocito)" className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 flex-1 w-full outline-none font-black text-gray-800 dark:text-white" value={newTerm.term} onChange={e => setNewTerm({...newTerm, term: e.target.value})} />
                      <input placeholder="Definición breve..." className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 flex-[2] w-full outline-none text-gray-700 dark:text-gray-300" value={newTerm.definition} onChange={e => setNewTerm({...newTerm, definition: e.target.value})} />
                      <button onClick={handleSaveTerm} className="px-6 py-3 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors w-full md:w-auto">Guardar</button>
                  </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse">
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {filtered.map(item => (
                              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 group transition-colors">
                                  <td className="p-6 w-1/3 align-top">
                                      <span className="font-black text-lg text-teal-700 dark:text-teal-400">{item.term}</span>
                                  </td>
                                  <td className="p-6 align-top">
                                      <p className="text-gray-600 dark:text-gray-300 font-medium">{item.definition}</p>
                                  </td>
                                  <td className="p-6 w-16 text-right">
                                      <button onClick={() => handleDeleteTerm(item.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18}/></button>
                                  </td>
                              </tr>
                          ))}
                          {filtered.length === 0 && (
                              <tr>
                                  <td colSpan={3} className="p-12 text-center text-gray-400">No hay términos guardados.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  return (
    <div className="bg-white dark:bg-axolotl-surface rounded-[2.5rem] p-6 shadow-xl border border-gray-100 dark:border-gray-700 min-h-[800px] flex flex-col">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 shrink-0">
            <div className="flex bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl overflow-x-auto max-w-full">
                {[
                    {id: 'notes', label: 'Mis Apuntes', icon: <Edit3 size={18}/>, count: notes.length},
                    {id: 'flashcards', label: 'Tarjetas de Estudio', icon: <Layers size={18}/>, count: flashcards.length},
                    {id: 'glossary', label: 'Glosario', icon: <BookMarked size={18}/>, count: glossary.length}
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id as any); SoundEffects.click(); }}
                        className={`py-3 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                    >
                        {tab.icon} {tab.label} <span className="bg-gray-200 dark:bg-gray-800 text-xs px-2 py-0.5 rounded-full ml-1">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Global Search inside Notebook */}
            {!playingCards && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-200 dark:border-gray-800 w-full md:w-64 focus-within:border-gray-400 transition-colors">
                    <Search className="text-gray-400" size={18}/>
                    <input 
                        className="bg-transparent w-full border-none outline-none font-bold text-sm text-gray-700 dark:text-white" 
                        placeholder="Buscar en cuaderno..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            )}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-transparent rounded-3xl relative">
            {activeTab === 'notes' && renderNotesView()}
            {activeTab === 'flashcards' && renderFlashcardsView()}
            {activeTab === 'glossary' && renderGlossaryView()}
        </div>
    </div>
  );
};

export default MedicineManager;

import React, { useState } from 'react';
import { 
  Hammer, BookOpen, Clock, Lightbulb, 
  CheckCircle, ArrowRight, X, Filter, Zap,
  Droplet, Leaf, Microscope, Palette, LayoutGrid
} from 'lucide-react';
import { LEARNING_PROJECTS } from '../../constants';
import { DIYProject } from '../../types';

const ProjectWorkshop: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<DIYProject | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(i => i !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const categories = ['all', ...Array.from(new Set(LEARNING_PROJECTS.map(p => p.category)))];

  const filteredProjects = selectedCategory === 'all' 
    ? LEARNING_PROJECTS 
    : LEARNING_PROJECTS.filter(p => p.category === selectedCategory);

  const getIcon = (iconName: string) => {
      // Map string names to Lucide components
      switch(iconName) {
          case 'rocket': return <Zap className="text-orange-500" />;
          case 'leaf': return <Leaf className="text-green-500" />;
          case 'droplet': return <Droplet className="text-blue-500" />;
          case 'microscope': return <Microscope className="text-purple-500" />;
          case 'palette': return <Palette className="text-pink-500" />;
          default: return <Lightbulb className="text-yellow-500" />;
      }
  };

  // --- DETAIL VIEW ---
  if (selectedProject) {
      const progress = Math.round((completedSteps.length / selectedProject.steps.length) * 100);

      return (
          <div className="h-full bg-white dark:bg-axolotl-surface p-4 md:p-8 animate-in slide-in-from-right duration-300 overflow-y-auto">
              <button 
                onClick={() => { setSelectedProject(null); setCompletedSteps([]); }}
                className="mb-6 flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                  <ArrowRight className="rotate-180" size={20} /> Volver al Taller
              </button>

              <div className="max-w-4xl mx-auto">
                  <div className="flex flex-col md:flex-row gap-8 mb-10">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center shrink-0 shadow-lg">
                          {React.cloneElement(getIcon(selectedProject.iconName) as React.ReactElement<any>, { size: 48 })}
                      </div>
                      <div>
                          <div className="flex gap-2 mb-2">
                              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                                  {selectedProject.category}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                  selectedProject.difficulty === 'Fácil' ? 'bg-green-100 text-green-700' : 
                                  selectedProject.difficulty === 'Medio' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                              }`}>
                                  {selectedProject.difficulty}
                              </span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                  <Clock size={12} /> {selectedProject.duration}
                              </span>
                          </div>
                          <h1 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white mb-4">{selectedProject.title}</h1>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Left Column: Steps */}
                      <div className="lg:col-span-2 space-y-8">
                          
                          <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                              <div className="flex justify-between items-end mb-6">
                                  <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                                      <Hammer className="text-axolotl-teal" /> Instrucciones
                                  </h3>
                                  <span className="text-2xl font-black text-axolotl-teal">{progress}%</span>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full mb-8 overflow-hidden">
                                  <div className="h-full bg-axolotl-teal transition-all duration-500" style={{ width: `${progress}%` }}></div>
                              </div>

                              <div className="space-y-4">
                                  {selectedProject.steps.map((step, idx) => (
                                      <div 
                                        key={idx}
                                        onClick={() => toggleStep(idx)}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${
                                            completedSteps.includes(idx) 
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-axolotl-teal'
                                        }`}
                                      >
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                                              completedSteps.includes(idx)
                                              ? 'bg-green-500 border-green-500 text-white'
                                              : 'border-gray-300 text-gray-400'
                                          }`}>
                                              {completedSteps.includes(idx) ? <CheckCircle size={16}/> : <span className="font-bold text-sm">{idx + 1}</span>}
                                          </div>
                                          <p className={`font-medium ${completedSteps.includes(idx) ? 'text-green-800 dark:text-green-300 line-through opacity-70' : 'text-gray-800 dark:text-gray-200'}`}>
                                              {step}
                                          </p>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {progress === 100 && (
                              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-3xl text-white shadow-xl animate-in zoom-in text-center">
                                  <div className="text-5xl mb-4">🎉</div>
                                  <h2 className="text-3xl font-black mb-2">¡Proyecto Completado!</h2>
                                  <p className="font-medium opacity-90">Has dominado este concepto científico. ¡Sigue explorando!</p>
                              </div>
                          )}

                      </div>

                      {/* Right Column: Materials & Science */}
                      <div className="space-y-6">
                          
                          {/* Materials */}
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-3xl border border-yellow-100 dark:border-yellow-800">
                              <h3 className="font-bold text-yellow-800 dark:text-yellow-400 mb-4 flex items-center gap-2">
                                  <LayoutGrid size={20} /> Materiales
                              </h3>
                              <ul className="space-y-2">
                                  {selectedProject.materials.map((mat, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0"></span>
                                          {mat}
                                      </li>
                                  ))}
                              </ul>
                          </div>

                          {/* Scientific Explanation */}
                          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-3xl border border-indigo-100 dark:border-indigo-800">
                              <h3 className="font-bold text-indigo-800 dark:text-indigo-300 mb-4 flex items-center gap-2">
                                  <Lightbulb size={20} /> ¿Por qué funciona?
                              </h3>
                              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                  {selectedProject.explanation}
                              </p>
                          </div>

                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // --- GALLERY VIEW ---
  return (
    <div className="h-full flex flex-col p-4 md:p-8">
        <div className="text-center mb-8">
            <h2 className="text-4xl font-black text-gray-800 dark:text-white mb-2">Taller Axolotl</h2>
            <p className="text-gray-500">50 Proyectos prácticos para aprender haciendo.</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-4 justify-center">
            {categories.map(cat => (
                <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full font-bold capitalize transition-all whitespace-nowrap ${
                        selectedCategory === cat 
                        ? 'bg-axolotl-dark text-white shadow-lg scale-105' 
                        : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    {cat === 'all' ? 'Todos' : cat}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-20">
            {filteredProjects.map(project => (
                <div 
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="bg-white dark:bg-axolotl-surface p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                >
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-axolotl-teal group-hover:text-white transition-colors">
                                {React.cloneElement(getIcon(project.iconName) as React.ReactElement<any>, { size: 24 })}
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                                project.difficulty === 'Fácil' ? 'bg-green-100 text-green-600' : 
                                project.difficulty === 'Medio' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                            }`}>
                                {project.difficulty}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 leading-tight">{project.title}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2">{project.explanation}</p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs font-bold text-gray-400">
                        <span className="flex items-center gap-1"><Clock size={12}/> {project.duration}</span>
                        <span className="group-hover:text-axolotl-teal transition-colors flex items-center gap-1">Ver Proyecto <ArrowRight size={12}/></span>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
};

export default ProjectWorkshop;
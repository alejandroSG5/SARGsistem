import React from 'react';
import { Activity, BookOpen, Leaf, Cpu, Sprout } from 'lucide-react';
import { ModuleData } from '../types';

interface ModuleCardProps {
  module: ModuleData;
  onClick: () => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const getTheme = (id: string) => {
    switch (id) {
      case 'Salud': return { base: 'blue', Icon: Activity, sub: 'Salud' };
      case 'Educación': return { base: 'rose', Icon: BookOpen, sub: 'Educación' };
      case 'Ambiente': return { base: 'amber', Icon: Leaf, sub: 'Ecología' };
      case 'Ingeniería': return { base: 'emerald', Icon: Cpu, sub: 'Técnica' };
      case 'Agricultura': return { base: 'lime', Icon: Sprout, sub: 'Agro' };
      default: return { base: 'purple', Icon: Activity, sub: 'General' };
    }
  };

  const { base, Icon, sub } = getTheme(module.id);

  const themeClasses: any = {
      blue: { bg: 'bg-blue-100/80 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900/30', textHead: 'text-blue-900 dark:text-gray-100', textSub: 'text-blue-600 dark:text-blue-500', iconBg: 'bg-blue-200 dark:bg-blue-900/50', iconColor: 'text-blue-600 dark:text-blue-500', bgIcon: 'text-blue-500/10 group-hover:text-blue-500/20' },
      rose: { bg: 'bg-rose-100/80 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-900/30', textHead: 'text-rose-900 dark:text-gray-100', textSub: 'text-rose-600 dark:text-rose-500', iconBg: 'bg-rose-200 dark:bg-rose-900/50', iconColor: 'text-rose-600 dark:text-rose-500', bgIcon: 'text-rose-500/10 group-hover:text-rose-500/20' },
      amber: { bg: 'bg-amber-100/80 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-900/30', textHead: 'text-amber-900 dark:text-gray-100', textSub: 'text-amber-600 dark:text-amber-500', iconBg: 'bg-amber-200 dark:bg-amber-900/50', iconColor: 'text-amber-600 dark:text-amber-500', bgIcon: 'text-amber-500/10 group-hover:text-amber-500/20' },
      emerald: { bg: 'bg-emerald-100/80 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-900/30', textHead: 'text-emerald-900 dark:text-gray-100', textSub: 'text-emerald-600 dark:text-emerald-500', iconBg: 'bg-emerald-200 dark:bg-emerald-900/50', iconColor: 'text-emerald-600 dark:text-emerald-500', bgIcon: 'text-emerald-500/10 group-hover:text-emerald-500/20' },
      lime: { bg: 'bg-lime-100/80 dark:bg-lime-900/20', border: 'border-lime-200 dark:border-lime-900/30', textHead: 'text-lime-900 dark:text-gray-100', textSub: 'text-lime-600 dark:text-lime-500', iconBg: 'bg-lime-200 dark:bg-lime-900/50', iconColor: 'text-lime-600 dark:text-lime-500', bgIcon: 'text-lime-500/10 group-hover:text-lime-500/20' },
      purple: { bg: 'bg-purple-100/80 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-900/30', textHead: 'text-purple-900 dark:text-gray-100', textSub: 'text-purple-600 dark:text-purple-500', iconBg: 'bg-purple-200 dark:bg-purple-900/50', iconColor: 'text-purple-600 dark:text-purple-500', bgIcon: 'text-purple-500/10 group-hover:text-purple-500/20' },
  };

  const tc = themeClasses[base];

  return (
    <div 
      onClick={onClick}
      className={`col-span-1 min-h-[150px] md:min-h-[280px] lg:min-h-[420px] ${tc.bg} rounded-[1.5rem] md:rounded-[2.5rem] lg:rounded-[3rem] p-4 md:p-8 lg:p-12 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-2 transition-all relative overflow-hidden group border-2 ${tc.border} flex flex-col justify-between active:scale-95 touch-manipulation`}
    >
        <div className={`absolute -right-4 -top-4 ${tc.bgIcon} transition-colors transform rotate-12 pointer-events-none`}>
            <Icon className="w-24 h-24 md:w-48 md:h-48 lg:w-72 lg:h-72" />
        </div>
        <div className={`relative z-10 w-10 h-10 md:w-16 md:h-16 lg:w-24 lg:h-24 rounded-full ${tc.iconBg} flex items-center justify-center group-hover:scale-110 transition-transform pointer-events-none`}>
            <Icon className={`${tc.iconColor} w-5 h-5 md:w-8 md:h-8 lg:w-12 lg:h-12`} />
        </div>
        <div className="relative z-10 mt-auto pointer-events-none">
            <h4 className={`text-base md:text-3xl lg:text-5xl font-black mb-1 md:mb-2 lg:mb-4 ${tc.textHead} leading-tight drop-shadow-sm`}>{module.title}</h4>
            <p className={`${tc.textSub} font-bold text-[10px] md:text-sm lg:text-xl uppercase tracking-widest`}>{sub}</p>
            <p className={`${tc.textHead} opacity-70 mt-2 text-xs md:text-base lg:text-xl font-medium leading-relaxed line-clamp-2 md:line-clamp-3 hidden md:block max-w-[90%]`}>
              {module.description}
            </p>
        </div>
    </div>
  );
};

export default ModuleCard;
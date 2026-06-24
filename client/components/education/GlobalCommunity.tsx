import React, { useState } from 'react';
import { 
    Globe, Heart, MessageCircle, Share2, 
    TrendingUp, Award, Users, User, Search,
    Star, Flame, BookOpen
} from 'lucide-react';

const MOCK_POSTS = [
    {
        id: 1,
        author: "Ana López",
        avatar: "https://i.pravatar.cc/150?u=1",
        badge: "Científico Novato",
        content: "¡Acabo de completar mi primer proyecto en el Laboratorio 3D de Axolotl! 🎉 Pude simular la trayectoria de un cohete con las ecuaciones que aprendimos. ¿Alguien más está en ese módulo?",
        likes: 124,
        comments: 18,
        time: "Hace 2h",
        tags: ["Física", "Simulación"]
    },
    {
        id: 2,
        author: "Carlos Méndez",
        avatar: "https://i.pravatar.cc/150?u=2",
        badge: "Investigador",
        content: "¿Alguien me puede recomendar libros sobre Inteligencia Artificial para principiantes? Estoy atascado en el módulo 4.",
        likes: 45,
        comments: 32,
        time: "Hace 5h",
        tags: ["IA", "Duda"]
    },
    {
        id: 3,
        author: "Dra. Sofía Reyes",
        avatar: "https://i.pravatar.cc/150?u=3",
        badge: "Mentor SARG",
        content: "Recuerden que mañana a las 18:00 hrs tendremos una transmisión en vivo por SARG-Fm sobre los avances en computación cuántica. ¡No se lo pierdan!",
        likes: 389,
        comments: 55,
        time: "Hace 1d",
        tags: ["Anuncio", "RadioSARG"]
    }
];

const LEADERBOARD = [
    { rank: 1, name: "María G.", pts: 15420, trend: "up" },
    { rank: 2, name: "Juan P.", pts: 14200, trend: "up" },
    { rank: 3, name: "Tú", pts: 12500, trend: "neutral" },
    { rank: 4, name: "Luis F.", pts: 11800, trend: "down" },
    { rank: 5, name: "Elena R.", pts: 10200, trend: "up" },
];

const GlobalCommunity: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed');

    return (
        <div className="h-full bg-gray-50 dark:bg-[#050814] p-4 md:p-8 overflow-y-auto animate-in fade-in">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
                
                {/* Main Feed Column */}
                <div className="flex-1 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                                <Globe className="text-blue-500" /> Comunidad Global
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base mt-1">
                                Conecta, comparte y aprende con miles de estudiantes en la plataforma SARG.
                            </p>
                        </div>
                        
                        {/* Mobile Tab Switcher */}
                        <div className="flex lg:hidden bg-gray-200 dark:bg-gray-800 p-1 rounded-xl w-full sm:w-auto">
                            <button 
                                onClick={() => setActiveTab('feed')}
                                className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-white dark:bg-gray-700 text-blue-500 shadow-sm' : 'text-gray-500'}`}
                            >
                                Foro
                            </button>
                            <button 
                                onClick={() => setActiveTab('leaderboard')}
                                className={`flex-1 sm:px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-white dark:bg-gray-700 text-amber-500 shadow-sm' : 'text-gray-500'}`}
                            >
                                Ranking
                            </button>
                        </div>
                    </div>

                    {/* Search & Compose */}
                    <div className={`space-y-4 ${activeTab === 'leaderboard' ? 'hidden lg:block' : 'block'}`}>
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Buscar temas, proyectos o estudiantes..."
                                className="w-full bg-white dark:bg-[#1a1c2a] border border-gray-200 dark:border-gray-800 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow shadow-sm dark:text-white"
                            />
                        </div>
                        
                        <div className="bg-white dark:bg-[#1a1c2a] rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-sm bg-blue-500 flex items-center justify-center text-white shrink-0">
                                    <User size={20} />
                                </div>
                                <div className="flex-1">
                                    <textarea 
                                        placeholder="¿Qué estás aprendiendo hoy?"
                                        className="w-full bg-gray-50 dark:bg-[#111625] rounded-xl p-3 md:p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow dark:text-gray-200 h-24"
                                    ></textarea>
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex gap-2">
                                            <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"><BookOpen size={18}/></button>
                                        </div>
                                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold text-sm transition-transform hover:scale-105 shadow-md">
                                            Publicar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Posts */}
                        <div className="space-y-6">
                            {MOCK_POSTS.map(post => (
                                <div key={post.id} className="bg-white dark:bg-[#1a1c2a] rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-800/50 hover:border-blue-200 dark:hover:border-blue-900/50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full shadow-sm bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                                                {post.author.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                                                    {post.author} 
                                                    {post.author.includes('Dra') && <span className="text-blue-500"><Award size={14}/></span>}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-gray-500 dark:text-gray-400">{post.time}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                                                    <span className="font-bold text-blue-600 dark:text-blue-400">{post.badge}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base mb-4 leading-relaxed">
                                        {post.content}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {post.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-700">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <button className="flex items-center gap-2 text-gray-400 hover:text-rose-500 transition-colors group">
                                            <Heart size={18} className="group-hover:fill-rose-500" /> 
                                            <span className="text-sm font-bold">{post.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                                            <MessageCircle size={18} /> 
                                            <span className="text-sm font-bold">{post.comments}</span>
                                        </button>
                                        <button className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors ml-auto">
                                            <Share2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar (Leaderboard) */}
                <div className={`w-full lg:w-80 shrink-0 space-y-6 ${activeTab === 'feed' ? 'hidden lg:block' : 'block'}`}>
                    
                    {/* Your Stats */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><Award size={80}/></div>
                        <h3 className="font-bold text-blue-100 uppercase tracking-widest text-xs mb-1">Tu Rango Global</h3>
                        <div className="text-4xl font-black mb-4 flex items-end gap-2">
                            #3 <span className="text-lg font-bold text-blue-200 mb-1">Top 1%</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/20 rounded-xl p-3 border border-white/10">
                            <div>
                                <div className="text-xs text-blue-200">Puntos Totales</div>
                                <div className="font-bold">12,500 XP</div>
                            </div>
                            <Flame className="text-orange-400 animate-pulse" />
                        </div>
                    </div>

                    {/* Leaderboard List */}
                    <div className="bg-white dark:bg-[#1a1c2a] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/50">
                        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                            <TrendingUp className="text-amber-500" />
                            <h3 className="font-black text-gray-900 dark:text-white text-lg">Top Estudiantes</h3>
                        </div>
                        
                        <div className="space-y-4">
                            {LEADERBOARD.map((user, i) => (
                                <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${user.name === 'Tú' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'hover:bg-gray-50 dark:hover:bg-[#111625]'}`}>
                                    <div className={`w-8 font-black text-center ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-300 dark:text-gray-600'}`}>
                                        #{user.rank}
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shrink-0">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`font-bold text-sm ${user.name === 'Tú' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                            {user.name}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">{user.pts.toLocaleString()} XP</div>
                                    </div>
                                    <div className="text-xs">
                                        {user.trend === 'up' && <TrendingUp size={14} className="text-green-500"/>}
                                        {user.trend === 'down' && <TrendingUp size={14} className="text-red-500 rotate-180"/>}
                                        {user.trend === 'neutral' && <span className="text-gray-400">-</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <button className="w-full mt-6 py-3 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                            Ver Ranking Completo
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GlobalCommunity;

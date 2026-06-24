import React, { useState } from 'react';
import { ArrowLeft, Globe, MessageSquare, ThumbsUp, Share2, Plus, X, Send } from 'lucide-react';

interface AgroCommunityProps {
  onBack: () => void;
}

const INITIAL_POSTS = [
  {
    id: 1,
    author: 'Juan Pérez',
    role: 'Agricultor Experto',
    avatar: '👨‍🌾',
    time: 'Hace 2 horas',
    content: '¿Alguien más ha notado un aumento en la presencia de pulgón verde esta temporada en la zona norte? He estado aplicando extracto de neem pero me gustaría saber si tienen otras recomendaciones orgánicas.',
    tags: ['Plagas', 'Neem', 'Orgánico'],
    likes: 24,
    comments: 8,
    isLiked: false
  },
  {
    id: 2,
    author: 'María González',
    role: 'Ingeniera Agrónoma',
    avatar: '👩‍🔬',
    time: 'Hace 5 horas',
    content: 'Les comparto los resultados de mi última cosecha usando el método de siembra directa. El ahorro de agua fue de casi el 30% y la calidad del suelo mejoró notablemente. Adjunto gráfica de rendimiento.',
    tags: ['Siembra Directa', 'Ahorro de Agua', 'Rendimiento'],
    likes: 89,
    comments: 15,
    isLiked: true
  },
  {
    id: 3,
    author: 'Carlos Ruiz',
    role: 'Productor Citrícola',
    avatar: '🍊',
    time: 'Ayer',
    content: 'Busco recomendaciones para proveedores de riego por goteo que instalen en la zona bajío. ¡Gracias de antemano!',
    tags: ['Riego', 'Proveedores', 'Bajío'],
    likes: 5,
    comments: 12,
    isLiked: false
  }
];

const AgroCommunity: React.FC<AgroCommunityProps> = ({ onBack }) => {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [isComposing, setIsComposing] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');

  const handleLike = (id: number) => {
    setPosts(posts.map(p => {
      if (p.id === id) {
        return { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked };
      }
      return p;
    }));
  };

  const handleSubmitPost = () => {
    if (!newPostContent.trim()) return;
    
    const newPost = {
      id: Date.now(),
      author: 'Tú (Usuario)',
      role: 'Miembro',
      avatar: '👤',
      time: 'Justo ahora',
      content: newPostContent,
      tags: ['Nuevo'],
      likes: 0,
      comments: 0,
      isLiked: false
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsComposing(false);
  };

  return (
    <div className="h-full bg-teal-50/30 dark:bg-[#0a1413] p-4 md:p-8 overflow-y-auto animate-in fade-in duration-500 min-h-screen relative">
      <div className="max-w-3xl mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-3 bg-white dark:bg-[#152422] shadow-sm rounded-full hover:scale-105 transition-transform border border-teal-100 dark:border-teal-900/30 text-teal-600 dark:text-teal-500">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl lg:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <Globe size={32} className="text-teal-500" /> Foro Comunitario
          </h2>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white dark:bg-[#152422] p-6 sm:p-8 rounded-[2rem] shadow-sm shadow-teal-100/50 dark:shadow-none border border-teal-50 dark:border-teal-900/20 group hover:shadow-md transition-all">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-50 dark:bg-[#1d3330] rounded-full flex items-center justify-center text-2xl shadow-inner">
                    {post.avatar}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 dark:text-white leading-tight">{post.author}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-bold text-teal-600 dark:text-teal-400">{post.role}</span>
                      <span>•</span>
                      <span>{post.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                {post.content}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-white/5">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 font-bold text-sm transition-colors ${post.isLiked ? 'text-teal-500' : 'text-gray-500 hover:text-teal-500'}`}
                >
                  <ThumbsUp size={18} className={post.isLiked ? 'fill-current' : ''} />
                  {post.likes}
                </button>
                <button className="flex items-center gap-2 font-bold text-sm text-gray-500 hover:text-teal-500 transition-colors">
                  <MessageSquare size={18} />
                  {post.comments}
                </button>
                <button className="flex items-center gap-2 font-bold text-sm text-gray-500 hover:text-teal-500 transition-colors ml-auto">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsComposing(true)}
        className={`fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-tr from-teal-500 to-emerald-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/40 hover:scale-110 active:scale-95 transition-all z-40 ${isComposing ? 'scale-0' : 'scale-100'}`}
      >
        <Plus size={32} />
      </button>

      {/* Compose Modal Overlay */}
      {isComposing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#152422] w-full max-w-lg rounded-[2rem] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-xl text-gray-900 dark:text-white">Nueva Publicación</h3>
              <button onClick={() => setIsComposing(false)} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="¿Qué quieres compartir con la comunidad agrícola?"
              className="w-full h-32 p-4 bg-gray-50 dark:bg-[#0a1413] border border-gray-200 dark:border-white/5 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white transition-all placeholder:text-gray-400 mb-6"
              autoFocus
            />

            <div className="flex justify-end">
              <button 
                onClick={handleSubmitPost}
                disabled={!newPostContent.trim()}
                className="px-6 py-3 bg-teal-500 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:hover:bg-teal-500"
              >
                <Send size={18} /> Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgroCommunity;

import React, { useState } from 'react';
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Search, Filter, Minus } from 'lucide-react';

interface AgroMarketProps {
  onBack: () => void;
}

const MARKET_DATA = [
  { id: 1, name: 'Maíz Blanco', category: 'Cereales', price: 6.50, unit: 'kg', trend: 'up', change: '+2.4%' },
  { id: 2, name: 'Frijol Negro', category: 'Leguminosas', price: 22.00, unit: 'kg', trend: 'down', change: '-1.1%' },
  { id: 3, name: 'Tomate Saladette', category: 'Hortalizas', price: 18.50, unit: 'kg', trend: 'up', change: '+15.2%' },
  { id: 4, name: 'Aguacate Hass', category: 'Frutas', price: 55.00, unit: 'kg', trend: 'stable', change: '0.0%' },
  { id: 5, name: 'Limón Persa', category: 'Frutas', price: 12.00, unit: 'kg', trend: 'down', change: '-5.4%' },
  { id: 6, name: 'Cebolla Blanca', category: 'Hortalizas', price: 24.00, unit: 'kg', trend: 'up', change: '+8.7%' },
  { id: 7, name: 'Chile Jalapeño', category: 'Hortalizas', price: 30.00, unit: 'kg', trend: 'up', change: '+3.2%' },
  { id: 8, name: 'Trigo', category: 'Cereales', price: 5.80, unit: 'kg', trend: 'stable', change: '0.0%' },
];

const CATEGORIES = ['Todos', 'Frutas', 'Hortalizas', 'Cereales', 'Leguminosas'];

const AgroMarket: React.FC<AgroMarketProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredData = MARKET_DATA.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <TrendingUp size={18} className="text-emerald-500" />;
    if (trend === 'down') return <TrendingDown size={18} className="text-rose-500" />;
    return <Minus size={18} className="text-gray-400" />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400';
    if (trend === 'down') return 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-500/10 dark:text-gray-400';
  };

  return (
    <div className="h-full bg-[#faf9f6] dark:bg-[#14120f] p-4 md:p-8 overflow-y-auto animate-in fade-in duration-500 min-h-screen">
      <div className="max-w-5xl mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-3 bg-white dark:bg-[#1e1a15] shadow-sm rounded-full hover:scale-105 transition-transform border border-amber-100 dark:border-amber-900/30 text-amber-600 dark:text-amber-500">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl lg:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 size={32} className="text-amber-500" /> Mercado y Precios
          </h2>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar cultivo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-[#1e1a15] border-none shadow-sm shadow-amber-100/50 dark:shadow-none text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:text-gray-400 font-medium"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedCategory === cat 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                  : 'bg-white dark:bg-[#1e1a15] text-gray-600 dark:text-gray-300 hover:bg-amber-50 dark:hover:bg-[#2a241c] shadow-sm'
                }`}
              >
                {cat === 'Todos' && <Filter size={16} />}
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main Highlights - just picking the top 2 trending up for demo */}
          {filteredData.filter(i => i.trend === 'up').slice(0, 2).map((item, idx) => (
             <div key={`highlight-${idx}`} className={`col-span-1 md:col-span-2 lg:col-span-1 p-6 rounded-[2rem] bg-gradient-to-br ${idx === 0 ? 'from-amber-400 to-orange-500' : 'from-emerald-400 to-teal-500'} text-white shadow-lg shadow-${idx === 0 ? 'amber' : 'emerald'}-500/30 relative overflow-hidden group hover:scale-[1.02] transition-transform`}>
               <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-110 transition-transform"><TrendingUp size={80}/></div>
               <p className="font-bold text-white/80 uppercase tracking-widest text-xs mb-1">Mayor Subida</p>
               <h3 className="text-2xl font-black mb-4">{item.name}</h3>
               <div className="flex items-end gap-2">
                 <span className="text-4xl font-black">${item.price.toFixed(2)}</span>
                 <span className="text-white/80 font-bold">/ {item.unit}</span>
               </div>
               <div className="mt-4 inline-flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md">
                 {item.change}
               </div>
             </div>
          ))}
        </div>

        {/* Price List */}
        <div className="mt-8 bg-white dark:bg-[#1e1a15] rounded-[2rem] shadow-sm shadow-amber-100/30 dark:shadow-none border border-amber-50 dark:border-amber-900/20 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-black text-lg text-gray-900 dark:text-white">Precios Promedio Nacional</h3>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Actualizado hoy</span>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {filteredData.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <Search size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-medium">No se encontraron cultivos</p>
              </div>
            ) : (
              filteredData.map(item => (
                <div key={item.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-[#2a241c] flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                      {item.category === 'Frutas' ? '🍎' : item.category === 'Hortalizas' ? '🥬' : item.category === 'Cereales' ? '🌾' : '🫘'}
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-white text-lg">{item.name}</h4>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-black text-xl text-gray-900 dark:text-white">${item.price.toFixed(2)} <span className="text-sm text-gray-400 font-bold">/ {item.unit}</span></div>
                      <div className={`text-xs font-bold flex items-center justify-end gap-1 mt-0.5 ${getTrendColor(item.trend).split(' ')[0]}`}>
                        {getTrendIcon(item.trend)} {item.change}
                      </div>
                    </div>
                    <div className={`hidden sm:flex px-3 py-1.5 rounded-lg text-xs font-bold items-center gap-1.5 ${getTrendColor(item.trend)}`}>
                       {item.trend === 'up' ? 'Subiendo' : item.trend === 'down' ? 'Bajando' : 'Estable'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgroMarket;


import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  User, Moon, Sun, Globe, Wifi, WifiOff,
  Database, Bell, Shield, LogOut, Edit3, Save,
  ChevronRight, Trash2, DownloadCloud, Award, Zap, Hand, XCircle,
  MapPin, Check, Smartphone, Camera
} from 'lucide-react';
import { Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../constants';

interface ProfileSettingsProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  spatialEnabled: boolean;
  toggleSpatial: () => void;
  userProfile?: UserProfile;
  userName?: string;
  profilePhoto: string | null;
  setProfilePhoto: (photo: string | null) => void;
}

const LANGUAGE_LABELS: Record<Language, { label: string; flag: string }> = {
  [Language.ES]: { label: 'Español', flag: '🇲🇽' },
  [Language.TZOTZIL]: { label: 'Tzotzil', flag: '🌿' },
  [Language.TZELTAL]: { label: 'Tzeltal', flag: '🌽' },
  [Language.CHOL]: { label: "Ch'ol", flag: '🌺' },
  [Language.TOJOLABAL]: { label: 'Tojolabal', flag: '🏔️' },
};

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  darkMode, toggleDarkMode, language, setLanguage, isOffline, setIsOffline, spatialEnabled, toggleSpatial,
  userName, profilePhoto, setProfilePhoto
}) => {
  const [name, setName] = useState(userName || 'SARG User');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState('Detectando ubicación...');
  const [bio, setBio] = useState('Aprendiz apasionado por la ciencia y la cultura.');
  const [isEditing, setIsEditing] = useState(false);
  const [storageUsed, setStorageUsed] = useState(245);
  const [storageMax] = useState(1024);
  const [showSpatialTutorial, setShowSpatialTutorial] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  const t = TRANSLATIONS[language];

  const [notifications, setNotifications] = useState({
    updates: true,
    reminders: false,
    news: true
  });

  // Real geolocation
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`
            );
            const data = await res.json();
            const addr = data.address;
            const city = addr.city || addr.town || addr.village || addr.municipality || addr.county || '';
            const state = addr.state || '';
            setLocation(city ? `${city}, ${state}` : state || 'Ubicación obtenida');
          } catch {
            setLocation('Chiapas, México');
          } finally {
            setLocationLoading(false);
          }
        },
        () => {
          setLocation('Chiapas, México');
          setLocationLoading(false);
        },
        { timeout: 8000, enableHighAccuracy: false }
      );
    } else {
      setLocation('Chiapas, México');
      setLocationLoading(false);
    }
  }, []);

  const handleSaveProfile = () => {
    setIsEditing(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleClearCache = () => {
    if (confirm('¿Estás seguro de borrar los datos descargados?')) {
      setStorageUsed(0);
      alert('Caché limpiada con éxito.');
    }
  };

  const handleSpatialToggle = () => {
    toggleSpatial();
    if (!spatialEnabled) {
      setShowSpatialTutorial(true);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const storagePercent = Math.round((storageUsed / storageMax) * 100);

  return (
    <div className="w-full h-full bg-[#f5f5f7] dark:bg-[#0a0a0a] overflow-y-auto custom-scrollbar pb-28">

      {/* SAVED TOAST */}
      {savedToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl flex items-center gap-2 animate-[slideDown_0.3s_ease-out]">
          <Check size={18} /> Perfil guardado correctamente
        </div>
      )}

      {/* SPATIAL TUTORIAL MODAL */}
      {showSpatialTutorial && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="bg-gradient-to-b from-[#0c1222] to-[#0a0a18] text-white max-w-2xl w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-cyan-500/20 relative">

            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-violet-500/10 blur-[80px] rounded-full pointer-events-none"></div>

            <button onClick={() => setShowSpatialTutorial(false)} className="absolute top-5 right-5 z-10 text-gray-500 hover:text-white transition-colors">
              <XCircle size={28} />
            </button>

            <div className="p-8 md:p-12 relative z-10">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-cyan-500/15 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-cyan-500/30">
                  <Hand className="text-cyan-400" size={32} />
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-3 tracking-tight">
                  Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Espacial</span>
                </h2>
                <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                  Controla la interfaz con gestos de mano a través de la cámara.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-10">
                {[
                  { emoji: '👆', title: 'Apuntar', desc: 'Índice extendido para mover cursor', color: 'text-cyan-400' },
                  { emoji: '👌', title: 'Click', desc: 'Pellizco rápido para seleccionar', color: 'text-violet-400' },
                  { emoji: '✊', title: 'Scroll', desc: 'Puño cerrado arriba/abajo', color: 'text-amber-400' },
                ].map((g, i) => (
                  <div key={i} className="bg-white/5 p-5 rounded-2xl text-center border border-white/5 hover:border-white/15 transition-all">
                    <div className="text-4xl mb-3">{g.emoji}</div>
                    <h3 className={`font-bold text-sm mb-1 ${g.color}`}>{g.title}</h3>
                    <p className="text-[11px] text-gray-500 leading-snug">{g.desc}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowSpatialTutorial(false)}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black text-base hover:scale-[1.02] transition-transform shadow-lg uppercase tracking-wider"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE HEADER */}
      <div className="relative pt-12 pb-8 px-6">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-br from-blue-500/8 via-violet-500/5 to-transparent dark:from-blue-500/10 dark:via-violet-500/8 pointer-events-none"></div>

        <div className="relative max-w-lg mx-auto flex flex-col items-center">
          {/* Avatar */}
          <div className="relative mb-5 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 p-[3px] shadow-xl shadow-blue-500/20">
              <div className="w-full h-full rounded-full bg-[#f5f5f7] dark:bg-[#1a1a1a] flex items-center justify-center overflow-hidden relative">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl md:text-6xl">🦎</span>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera size={24} className="text-white" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-400 rounded-full border-[3px] border-[#f5f5f7] dark:border-[#0a0a0a]"></div>
          </div>

          {/* Name & Info */}
          {isEditing ? (
            <div className="w-full max-w-sm space-y-3 text-center">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-center text-2xl font-black bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 ring-blue-500 text-gray-900 dark:text-white"
                placeholder="Tu nombre"
              />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-center text-sm bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 resize-none focus:outline-none focus:ring-2 ring-blue-500 text-gray-600 dark:text-gray-300"
                rows={2}
                placeholder="Tu bio"
              />
              <button
                onClick={handleSaveProfile}
                className="px-8 py-2.5 bg-emerald-500 text-white rounded-full font-bold text-sm shadow-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <Save size={15} /> Guardar
              </button>
            </div>
          ) : (
            <div className="text-center relative">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-1">{name}</h1>
              <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs font-semibold mb-2">
                <MapPin size={12} className={locationLoading ? 'animate-pulse text-blue-400' : 'text-blue-500'} />
                <span>{location}</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">{bio}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-3 px-5 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 rounded-full text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/15 transition-colors flex items-center gap-1.5 mx-auto"
              >
                <Edit3 size={12} /> Editar perfil
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STATS BAR */}
      <div className="max-w-lg mx-auto px-6 mb-8">
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Award size={20} />, value: '12', label: t.profile_badges || 'Insignias', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { icon: <Zap size={20} />, value: '85%', label: t.profile_progress || 'Progreso', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
            { icon: <DownloadCloud size={20} />, value: `${storageUsed}MB`, label: t.profile_offline_status || 'Datos', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-4 flex flex-col items-center`}>
              <div className={`${s.color} mb-1.5`}>{s.icon}</div>
              <div className="text-xl font-black text-gray-900 dark:text-white">{s.value}</div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SETTINGS SECTIONS */}
      <div className="max-w-lg mx-auto px-6 space-y-4">

        {/* SECTION: Language */}
        <SettingsSection title={t.settings_language || 'Idioma'} icon={<Globe size={18} />} iconColor="text-violet-500">
          <div className="space-y-1.5">
            {Object.entries(LANGUAGE_LABELS).map(([lang, info]) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang as Language)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  language === lang
                    ? 'bg-violet-50 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/30'
                    : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="text-lg">{info.flag}</span>
                <span className={`flex-1 text-sm font-semibold ${language === lang ? 'text-violet-600 dark:text-violet-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {info.label}
                </span>
                {language === lang && <Check size={16} className="text-violet-500" />}
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* SECTION: Appearance */}
        <SettingsCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-blue-500/10' : 'bg-amber-500/10'}`}>
                {darkMode ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-amber-500" />}
              </div>
              <div>
                <span className="text-sm font-bold text-gray-800 dark:text-white">{t.settings_appearance || 'Apariencia'}</span>
                <p className="text-[11px] text-gray-400">{darkMode ? 'Modo oscuro activo' : 'Modo claro activo'}</p>
              </div>
            </div>
            <ToggleSwitch active={darkMode} onToggle={toggleDarkMode} />
          </div>
        </SettingsCard>

        {/* SECTION: Spatial Gestures */}
        <div className="bg-gradient-to-br from-[#0c1222] to-[#111827] p-5 rounded-[1.5rem] border border-cyan-500/15 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/8 blur-[60px] rounded-full pointer-events-none"></div>
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                <Hand size={18} className="text-cyan-400" />
              </div>
              <div>
                <span className="text-sm font-bold text-white">{t.settings_spatial || 'Gestos Espaciales'}</span>
                <p className="text-[11px] text-gray-400">{t.settings_spatial_desc || 'Control por cámara y manos'}</p>
              </div>
            </div>
            <ToggleSwitch active={spatialEnabled} onToggle={handleSpatialToggle} color="cyan" />
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={() => setShowSpatialTutorial(true)}
              className="text-[11px] font-bold text-cyan-400 border border-cyan-500/30 px-4 py-1.5 rounded-full hover:bg-cyan-500/10 transition-colors"
            >
              Ver Tutorial
            </button>
            <span className={`text-[11px] font-black uppercase tracking-widest ${spatialEnabled ? 'text-emerald-400' : 'text-gray-600'}`}>
              {spatialEnabled ? (t.spatial_on || 'Activo') : (t.spatial_off || 'Inactivo')}
            </span>
          </div>
        </div>

        {/* SECTION: Notifications */}
        <SettingsSection title={t.settings_notifications || 'Notificaciones'} icon={<Bell size={18} />} iconColor="text-red-500">
          <div className="space-y-4">
            <ToggleRow label={t.notif_updates || 'Actualizaciones'} active={notifications.updates} onToggle={() => setNotifications({...notifications, updates: !notifications.updates})} />
            <ToggleRow label={t.notif_reminders || 'Recordatorios'} active={notifications.reminders} onToggle={() => setNotifications({...notifications, reminders: !notifications.reminders})} />
            <ToggleRow label={t.notif_news || 'Noticias'} active={notifications.news} onToggle={() => setNotifications({...notifications, news: !notifications.news})} />
          </div>
        </SettingsSection>

        {/* SECTION: Offline Mode */}
        <SettingsCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOffline ? 'bg-gray-500/10' : 'bg-emerald-500/10'}`}>
                {isOffline ? <WifiOff size={18} className="text-gray-400" /> : <Wifi size={18} className="text-emerald-500" />}
              </div>
              <div>
                <span className="text-sm font-bold text-gray-800 dark:text-white">{t.settings_offline_mode || 'Modo Offline'}</span>
                <p className="text-[11px] text-gray-400 max-w-[200px]">{t.settings_offline_desc || 'Accede al contenido sin internet'}</p>
              </div>
            </div>
            <ToggleSwitch active={isOffline} onToggle={() => setIsOffline(!isOffline)} />
          </div>
        </SettingsCard>

        {/* SECTION: Storage */}
        <SettingsSection title={t.settings_storage || 'Almacenamiento'} icon={<Database size={18} />} iconColor="text-indigo-500">
          <div className="mb-4">
            <div className="flex justify-between text-xs font-semibold text-gray-500 mb-2">
              <span>{storageUsed} MB usados</span>
              <span>{storagePercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                style={{ width: `${storagePercent}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5">{storageUsed} de {storageMax} MB</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors">
              <DownloadCloud size={14} /> {t.settings_download || 'Descargar'}
            </button>
            <button
              onClick={handleClearCache}
              className="flex-1 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
            >
              <Trash2 size={14} /> {t.settings_clear || 'Limpiar'}
            </button>
          </div>
        </SettingsSection>

        {/* SECTION: System */}
        <SettingsCard noPadding>
          <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors rounded-t-[1.25rem]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                <Shield size={16} className="text-gray-500" />
              </div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t.settings_privacy || 'Privacidad'}</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
          <div className="h-px bg-gray-100 dark:bg-white/5 mx-4"></div>
          <button className="w-full p-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-500/5 transition-colors rounded-b-[1.25rem]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
                <LogOut size={16} className="text-red-500" />
              </div>
              <span className="text-sm font-semibold text-red-500">{t.settings_logout || 'Cerrar Sesión'}</span>
            </div>
            <ChevronRight size={16} className="text-red-300" />
          </button>
        </SettingsCard>

        {/* VERSION */}
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-1.5 text-gray-300 dark:text-gray-600 mb-1">
            <Smartphone size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">SARG v2.0.0</span>
          </div>
          <p className="text-[10px] text-gray-300 dark:text-gray-700">Sistema de Aprendizaje Rápido y Gratuito</p>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

// --- SUB COMPONENTS ---

const SettingsCard = ({ children, noPadding }: { children: React.ReactNode; noPadding?: boolean }) => (
  <div className={`bg-white dark:bg-[#1a1a1a] rounded-[1.25rem] shadow-sm border border-gray-100 dark:border-white/5 ${noPadding ? '' : 'p-5'}`}>
    {children}
  </div>
);

const SettingsSection = ({ title, icon, iconColor, children }: { title: string; icon: React.ReactNode; iconColor: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-[#1a1a1a] rounded-[1.25rem] shadow-sm border border-gray-100 dark:border-white/5 p-5">
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <span className="text-sm font-bold text-gray-800 dark:text-white">{title}</span>
    </div>
    {children}
  </div>
);

const ToggleSwitch = ({ active, onToggle, color = 'blue' }: { active: boolean; onToggle: () => void; color?: string }) => {
  const bgActive = color === 'cyan' ? 'bg-cyan-500' : 'bg-blue-500';
  return (
    <button
      onClick={onToggle}
      className={`w-12 h-7 rounded-full p-1 transition-all duration-300 flex items-center ${active ? `${bgActive} justify-end` : 'bg-gray-200 dark:bg-gray-700 justify-start'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${active ? 'scale-110' : ''}`}></div>
    </button>
  );
};

const ToggleRow = ({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) => (
  <div className="flex justify-between items-center">
    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}</span>
    <ToggleSwitch active={active} onToggle={onToggle} />
  </div>
);

export default ProfileSettings;

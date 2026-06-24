import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Delete, User, ShieldAlert, Hospital, Star, Volume2, VolumeX, Signal, Grid, Plus, X, Image as ImageIcon, Copy, Check, AlertCircle } from 'lucide-react';
import { Device, Call } from '@twilio/voice-sdk';

interface VoIPDialerProps {
  onClose: () => void;
}

interface Contact {
  id: string;
  name: string;
  number: string;
  type: string;
  image?: string;
}

const DEFAULT_CONTACTS: Contact[] = [
  { id: '1', name: 'Protección Civil (Emergencia)', number: '911', type: 'Emergency' },
  { id: '2', name: 'Centro de Salud SCLC', number: '+529671234567', type: 'Hospital' },
  { id: '3', name: 'Soporte SARG', number: '+18001232222', type: 'Support' },
];

const VoIPDialer: React.FC<VoIPDialerProps> = ({ onClose }) => {
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [view, setView] = useState<'keypad' | 'contacts'>('keypad');
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_CONTACTS);
  
  // Twilio State
  const [deviceReady, setDeviceReady] = useState(false);
  const [twilioError, setTwilioError] = useState<string>('');
  const [myIdentity, setMyIdentity] = useState<string>('');
  
  const deviceRef = useRef<Device | null>(null);
  const currentCallRef = useRef<Call | null>(null);

  // Modals
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState<Partial<Contact>>({ type: 'User' });
  const [isCopied, setIsCopied] = useState(false);
  const sfxCtx = useRef<AudioContext | null>(null);

  // Load Contacts
  useEffect(() => {
    const saved = localStorage.getItem('sarg_voip_contacts_tw');
    if (saved) {
      try { setContacts(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sarg_voip_contacts_tw', JSON.stringify(contacts));
  }, [contacts]);

  // AudioContext init for DTMF
  useEffect(() => {
    try {
        const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
        if (AudioContextClass) sfxCtx.current = new AudioContextClass();
    } catch (e) {}
    return () => { sfxCtx.current?.close(); };
  }, []);

  // Timer
  useEffect(() => {
    let interval: any;
    if (status === 'connected') {
      interval = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Twilio Setup
  useEffect(() => {
      const initTwilio = async () => {
          try {
              // Connect to local backend to get Twilio Access Token
              const response = await fetch('/api/token');
              if (!response.ok) throw new Error("Backend devolvió error");
              
              const data = await response.json();
              
              if (data.error) throw new Error(data.error);

              setMyIdentity(data.identity);

              const device = new Device(data.token, {
                  logLevel: 1,
                  codecPreferences: [Call.Codec.Opus, Call.Codec.PCMU]
              });

              device.on('ready', () => {
                  setDeviceReady(true);
                  setTwilioError('');
              });

              device.on('error', (twilioErr) => {
                  console.error('Twilio Error:', twilioErr);
                  setTwilioError(twilioErr.message);
              });

              device.on('incoming', (call) => {
                  setStatus('ringing');
                  currentCallRef.current = call;
                  
                  call.on('cancel', () => {
                      setStatus('idle');
                      currentCallRef.current = null;
                  });
                  call.on('reject', () => {
                      setStatus('idle');
                      currentCallRef.current = null;
                  });
                  call.on('disconnect', () => {
                      setStatus('idle');
                      setDuration(0);
                      currentCallRef.current = null;
                  });
              });

              device.register();
              deviceRef.current = device;

          } catch (err: any) {
              console.error("No se pudo iniciar Twilio", err);
              setTwilioError("Error conectando a Twilio. ¿El servidor local está corriendo en el puerto 3001?");
          }
      };

      initTwilio();

      return () => {
          if (deviceRef.current) {
              deviceRef.current.destroy();
          }
      };
  }, []);

  const handleCall = async () => {
    if (!number || !deviceRef.current) return;
    setStatus('calling');
    
    try {
        const cleanNumber = number.replace(/\s+/g, '');
        const call = await deviceRef.current.connect({
            params: {
                To: cleanNumber
            }
        });

        call.on('accept', () => {
            setStatus('connected');
        });

        call.on('disconnect', () => {
            setStatus('idle');
            setDuration(0);
            currentCallRef.current = null;
        });

        call.on('error', (err) => {
            alert("Error en la llamada: " + err.message);
            setStatus('idle');
            currentCallRef.current = null;
        });

        currentCallRef.current = call;
    } catch (e: any) {
        alert("Error al intentar llamar: " + e.message);
        setStatus('idle');
    }
  };

  const answerIncomingCall = () => {
      if (currentCallRef.current) {
          currentCallRef.current.accept();
          setStatus('connected');
      }
  };

  const rejectIncomingCall = () => {
      if (currentCallRef.current) {
          currentCallRef.current.reject();
          setStatus('idle');
          currentCallRef.current = null;
      }
  };

  const handleHangup = () => {
    if (currentCallRef.current) {
        currentCallRef.current.disconnect();
    }
    setStatus('idle'); 
    setDuration(0);
  };

  const toggleMute = () => {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      if (currentCallRef.current) {
          currentCallRef.current.mute(nextMuted);
      }
  };

  // --- UI FEEDBACK SOUNDS ---
  const playTone = (freq: number) => {
    if (!sfxCtx.current || sfxCtx.current.state === 'suspended') {
        sfxCtx.current?.resume().catch(() => {});
    }
    if (!sfxCtx.current) return;

    try {
        const osc = sfxCtx.current.createOscillator();
        const gain = sfxCtx.current.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.1, sfxCtx.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, sfxCtx.current.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(sfxCtx.current.destination);
        
        osc.start();
        osc.stop(sfxCtx.current.currentTime + 0.2);
    } catch (e) {}
  };

  const handlePress = (num: string) => {
    if (number.length < 20) {
      setNumber(prev => prev + num);
      const tones: {[key: string]: number} = { '1': 1209, '2': 1336, '3': 1477, '4': 1209, '5': 1336, '6': 1477, '7': 1209, '8': 1336, '9': 1477, '0': 1336, '*': 1209, '#': 1477, '+': 1336 };
      playTone(tones[num] || 1000);
      
      // If connected, send DTMF digits
      if (status === 'connected' && currentCallRef.current) {
          currentCallRef.current.sendDigits(num);
      }
    }
  };

  const handleDelete = () => setNumber(prev => prev.slice(0, -1));
  const handleContactSelect = (num: string) => { setNumber(num); setView('keypad'); };
  const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  
  const getContactInfo = (num: string) => {
      const c = contacts.find(c => c.number === num);
      return c || { name: num, image: undefined, type: 'Unknown' };
  };

  const saveNewContact = () => {
      if (newContact.name && newContact.number) {
          setContacts([...contacts, { ...newContact, id: Date.now().toString() } as Contact]);
          setShowAddContact(false);
          setNewContact({ type: 'User' });
      }
  };

  const copyMyNumber = () => {
      navigator.clipboard.writeText(myIdentity);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  // --- IN-CALL VIEW ---
  if (status !== 'idle') {
    const contactInfo = getContactInfo(number);
    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-indigo-950 to-black text-white animate-in fade-in duration-500 relative overflow-hidden font-sans">

          {/* Animated Background (Radar/Ripple effect) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <div className={`w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl absolute transition-transform duration-1000 ${status === 'connected' ? 'scale-150 animate-pulse' : 'scale-100'}`}></div>
              {(status === 'calling' || status === 'ringing') && (
                  <>
                      <div className="absolute w-64 h-64 border border-indigo-500/30 rounded-full animate-ping"></div>
                      <div className="absolute w-96 h-96 border border-indigo-500/10 rounded-full animate-ping delay-300"></div>
                  </>
              )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-6 pt-16">
            
            {/* Avatar */}
            <div className="relative mb-8">
                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-indigo-900 to-gray-900 border-4 ${status === 'connected' ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-indigo-500/50'} shadow-2xl overflow-hidden flex items-center justify-center z-10 relative transition-all duration-500`}>
                    {contactInfo.image ? (
                        <img src={contactInfo.image} alt={contactInfo.name} className="w-full h-full object-cover" />
                    ) : (
                        <User size={64} className="text-gray-400"/>
                    )}
                </div>
                {status === 'connected' && !isMuted && (
                    <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-black flex items-center justify-center animate-bounce">
                        <Mic size={14} className="text-white"/>
                    </div>
                )}
            </div>

            <h2 className="text-3xl md:text-4xl font-black mb-2 text-center drop-shadow-md">{contactInfo.name}</h2>
            <p className="text-xl text-indigo-300/80 font-mono mb-8">{number}</p>
            
            <div className={`flex items-center gap-2 px-5 py-2 rounded-full mb-12 backdrop-blur-md border ${status === 'connected' ? 'bg-green-500/20 border-green-500/30' : 'bg-white/10 border-white/10'}`}>
                {status === 'calling' && <><Signal className="animate-pulse text-indigo-400" size={18}/><span className="text-indigo-100 font-bold tracking-widest text-sm">LLAMANDO...</span></>}
                {status === 'ringing' && <><Signal className="animate-pulse text-yellow-400" size={18}/><span className="text-yellow-100 font-bold tracking-widest text-sm">LLAMADA ENTRANTE</span></>}
                {status === 'connected' && <><Signal className="text-green-400" size={18}/><span className="text-green-100 font-mono font-bold text-lg">{formatTime(duration)}</span></>}
            </div>

            {status === 'ringing' ? (
                <div className="flex gap-8 mt-8">
                    <button onClick={rejectIncomingCall} className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group">
                        <PhoneOff size={32} fill="currentColor" className="group-hover:animate-shake" />
                    </button>
                    <button onClick={answerIncomingCall} className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 shadow-[0_0_30px_rgba(34,197,94,0.4)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group">
                        <Phone size={32} fill="currentColor" className="animate-pulse" />
                    </button>
                </div>
            ) : (
                <>
                    {/* Simulated Controls */}
                    <div className="grid grid-cols-3 gap-8 w-full max-w-[280px] mt-4">
                        <ControlBtn icon={isMuted ? <MicOff/> : <Mic />} label="Silenciar" active={isMuted} onClick={toggleMute} color="amber" />
                        <ControlBtn icon={<Grid />} label="Teclado" />
                        <ControlBtn icon={isSpeaker ? <Volume2/> : <VolumeX/>} label="Altavoz" active={isSpeaker} onClick={() => setIsSpeaker(!isSpeaker)} color="blue" />
                    </div>
                    
                    <button onClick={handleHangup} className="mt-16 w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 shadow-[0_0_40px_rgba(239,68,68,0.5)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
                        <PhoneOff size={32} fill="currentColor" />
                    </button>
                </>
            )}
          </div>
        </div>
      );
  }

  // --- DIALPAD & CONTACTS VIEW ---
  return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0b0f19] animate-in slide-in-from-bottom duration-300 relative font-sans text-gray-900 dark:text-white">
        
        {/* Top Header (Status) */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${twilioError ? 'bg-red-500' : (deviceReady ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-yellow-500')}`}></div>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                        {twilioError ? 'Sin Conexión Twilio' : (deviceReady ? 'Red Twilio Activa' : 'Conectando...')}
                    </span>
                </div>
                {twilioError && <span className="text-[10px] text-red-500 mt-1 max-w-[200px] truncate">{twilioError}</span>}
            </div>
            {myIdentity && (
                <button onClick={copyMyNumber} className="flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors text-xs font-bold group border border-indigo-200 dark:border-indigo-800">
                    ID Local: <span className="font-mono">{myIdentity.substring(0,8)}...</span>
                    {isCopied ? <Check size={14}/> : <Copy size={14} className="opacity-50 group-hover:opacity-100" />}
                </button>
            )}
        </div>

        <div className="flex-1 flex flex-col justify-start pt-4 px-6 overflow-hidden">
          
          {view === 'keypad' && (
            <div className="animate-in fade-in h-full flex flex-col">
              <div className="text-center mb-10 mt-2 h-20 flex flex-col justify-center bg-white dark:bg-[#151a2a] rounded-3xl shadow-inner border border-gray-100 dark:border-gray-800/50">
                 <span className="text-3xl md:text-5xl font-mono font-bold tracking-widest text-indigo-600 dark:text-indigo-400 break-all transition-all">
                    {number || <span className="text-gray-300 dark:text-gray-600/50 font-sans text-xl md:text-2xl font-normal">Número / SIP...</span>}
                 </span>
              </div>

              <div className="grid grid-cols-3 gap-y-4 md:gap-y-6 gap-x-6 md:gap-x-8 max-w-[280px] md:max-w-xs mx-auto flex-1">
                {[
                    {num: '1', sub: ''}, {num: '2', sub: 'ABC'}, {num: '3', sub: 'DEF'},
                    {num: '4', sub: 'GHI'}, {num: '5', sub: 'JKL'}, {num: '6', sub: 'MNO'},
                    {num: '7', sub: 'PQRS'}, {num: '8', sub: 'TUV'}, {num: '9', sub: 'WXYZ'},
                    {num: '*', sub: ''}, {num: '0', sub: '+'}, {num: '#', sub: ''}
                ].map((item) => (
                  <button key={item.num} onClick={() => handlePress(item.num === '0' && number === '' ? '+' : item.num)} onDoubleClick={() => item.num==='0' ? handlePress('+') : null} className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full bg-white dark:bg-[#1a1f33] text-gray-800 dark:text-white mx-auto flex flex-col items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-600 transition-all duration-200 active:scale-95 shadow-sm border border-gray-100 dark:border-white/5 group relative overflow-hidden">
                    <span className="absolute inset-0 bg-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity"></span>
                    <span className="text-3xl font-light">{item.num}</span>
                    {item.sub && <span className="text-[9px] font-bold text-gray-400 tracking-widest -mt-1 group-hover:text-indigo-300">{item.sub}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'contacts' && (
             <div className="flex-1 flex flex-col h-full animate-in fade-in pb-4">
                 <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-black">Contactos</h2>
                     <button onClick={() => setShowAddContact(true)} className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"><Plus size={20}/></button>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2 -mr-2">
                    {contacts.length === 0 && <div className="text-center text-gray-400 mt-10">No hay contactos guardados.</div>}
                    {contacts.map(c => {
                       const Icon = c.type === 'Hospital' ? Hospital : c.type === 'Emergency' ? ShieldAlert : c.type === 'Support' ? Star : User;
                       return (
                          <div key={c.id} className="w-full flex items-center justify-between p-3 md:p-4 rounded-3xl bg-white dark:bg-[#1a1f33] hover:bg-indigo-50 dark:hover:bg-[#222942] transition-colors border border-gray-100 dark:border-gray-800/50 shadow-sm group">
                              <div className="flex items-center gap-4 flex-1 overflow-hidden" onClick={() => handleContactSelect(c.number)}>
                                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-gray-500 shrink-0 overflow-hidden shadow-inner cursor-pointer">
                                     {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : <Icon size={20}/>}
                                 </div>
                                 <div className="truncate cursor-pointer">
                                    <div className="font-bold text-gray-900 dark:text-white truncate">{c.name}</div>
                                    <div className="text-sm font-mono text-indigo-500 dark:text-indigo-400">{c.number}</div>
                                 </div>
                              </div>
                              <button onClick={() => setContacts(contacts.filter(con => con.id !== c.id))} className="p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                                  <Delete size={18}/>
                              </button>
                          </div>
                       );
                    })}
                 </div>
             </div>
          )}
        </div>
        
        {/* Bottom Bar */}
        <div className="pb-6 md:pb-8 pt-4 px-6 relative z-10">
          {view === 'keypad' && (
              <div className="flex justify-center items-center gap-8 mb-8">
                  <div className="w-14"></div> {/* Spacer */}
                  <button
                    onClick={handleCall} disabled={number.length === 0 || !deviceReady}
                    className={`w-[72px] h-[72px] md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(34,197,94,0.3)] transform transition-all active:scale-95 ${number.length > 0 && deviceReady ? 'bg-green-500 text-white hover:bg-green-400 hover:scale-105 hover:shadow-[0_15px_30px_rgba(34,197,94,0.4)]' : 'bg-gray-300 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none'}`}
                  >
                    <Phone size={32} fill="currentColor" />
                  </button>
                  <button onClick={handleDelete} onContextMenu={(e) => { e.preventDefault(); setNumber(''); }} className={`w-14 h-14 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 ${number.length === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                      <Delete size={24} />
                  </button>
              </div>
          )}

          <div className="bg-white/80 dark:bg-[#1a1f33]/80 backdrop-blur-xl p-1.5 rounded-full flex justify-center gap-1 max-w-[280px] mx-auto border border-gray-200 dark:border-white/5 shadow-lg">
             <button onClick={() => setView('keypad')} className={`flex-1 py-3 rounded-full font-bold text-sm transition-all ${view==='keypad' ? 'bg-indigo-600 shadow-md text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Teclado</button>
             <button onClick={() => setView('contacts')} className={`flex-1 py-3 rounded-full font-bold text-sm transition-all ${view==='contacts' ? 'bg-indigo-600 shadow-md text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Contactos</button>
          </div>
        </div>

        {/* Add Contact Modal */}
        {showAddContact && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white dark:bg-[#151a2a] w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-8 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-xl text-gray-900 dark:text-white">Nuevo Contacto</h3>
                        <button onClick={() => setShowAddContact(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={18}/></button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2 mb-1 block">Nombre</label>
                            <input type="text" value={newContact.name || ''} onChange={(e) => setNewContact({...newContact, name: e.target.value})} placeholder="Ej. Juan Pérez" className="w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2 mb-1 block">Número Telefónico / SIP</label>
                            <input type="text" value={newContact.number || ''} onChange={(e) => setNewContact({...newContact, number: e.target.value})} placeholder="Ej. +521234567890" className="w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2 mb-1 block">URL de Foto (Opcional)</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                                <input type="text" value={newContact.image || ''} onChange={(e) => setNewContact({...newContact, image: e.target.value})} placeholder="https://..." className="w-full bg-gray-50 dark:bg-[#0b0f19] border border-gray-200 dark:border-gray-800 rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
                            </div>
                            {newContact.image && (
                                <div className="mt-3 flex justify-center">
                                    <img src={newContact.image} alt="Preview" className="w-16 h-16 rounded-full object-cover border-4 border-gray-100 dark:border-gray-800" onError={(e) => { (e.target as any).src = ''; alert('Imagen no válida'); setNewContact({...newContact, image: ''}); }} />
                                </div>
                            )}
                        </div>

                        <button onClick={saveNewContact} disabled={!newContact.name || !newContact.number} className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-300 disabled:dark:bg-gray-800 text-white rounded-2xl font-black transition-colors disabled:cursor-not-allowed shadow-lg">
                            Guardar Contacto
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
};

const ControlBtn = ({ icon, label, active, onClick, color = 'indigo' }: any) => {
    const colorMap: any = {
        indigo: active ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-white/10 text-white hover:bg-white/20',
        amber: active ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]' : 'bg-white/10 text-white hover:bg-white/20',
    };
    
    return (
        <button onClick={onClick} className="flex flex-col items-center justify-center gap-3 group">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${colorMap[color]} backdrop-blur-md`}>
                {React.cloneElement(icon, { size: 26 })}
            </div>
            <span className={`text-xs font-bold tracking-wider uppercase ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{label}</span>
        </button>
    );
};

export default VoIPDialer;

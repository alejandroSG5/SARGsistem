import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search, Hospital, X, Loader2, Rotate3D, Keyboard, LocateFixed, Car, Clock, Activity, Compass, Volume2 } from 'lucide-react';
import { MAP_LOCATIONS } from '../../constants';
import { MapLocation, GeoPoint, NavigationTarget, UserPosition } from '../../types';

interface RegionMapProps {
    initialTarget?: NavigationTarget | null;
}

const RegionMap: React.FC<RegionMapProps> = ({ initialTarget }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const userMarker = useRef<L.Marker | null>(null);
  const destMarker = useRef<L.Marker | null>(null);
  const routeLayer = useRef<L.GeoJSON | null>(null);
  
  const [userPosition, setUserPosition] = useState<UserPosition | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<MapLocation | null>(null);
  const [searchResults, setSearchResults] = useState<MapLocation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const isNavigatingRef = useRef(false);
  
  useEffect(() => { isNavigatingRef.current = isNavigating; }, [isNavigating]);

  const [is3DMode, setIs3DMode] = useState(false); // 3D is limited in standard Leaflet, but we can toggle tilt styles if needed
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualLocationInput, setManualLocationInput] = useState('');
  
  const [routeMetrics, setRouteMetrics] = useState<{distance: number, duration: number, nextStep?: string} | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  const speak = (text: string) => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (map.current) return;
    
    // Configuración Inicial del Mapa con Leaflet (OpenStreetMap)
    map.current = L.map(mapContainer.current!, {
        zoomControl: false // Escondemos controles por defecto para UI más limpia
    }).setView([16.7370, -92.6376], 14);

    // OpenStreetMap Tiles (Soporte Offline básico vía caché del navegador)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map.current);

    // Añadir controles abajo a la izquierda
    L.control.zoom({ position: 'bottomleft' }).addTo(map.current);

    // Add static locations to map
    MAP_LOCATIONS.forEach(loc => {
        const el = document.createElement('div');
        el.className = 'w-6 h-6 rounded-full shadow-lg border-2 border-white flex items-center justify-center';
        el.style.backgroundColor = loc.type === 'Hospital' ? '#ef4444' : '#10b981';
        el.innerHTML = loc.type === 'Hospital' ? '🏥' : '💊';
        
        const icon = L.divIcon({
            html: el,
            className: '',
            iconSize: [24, 24]
        });

        const marker = L.marker([loc.lat, loc.lng], { icon }).addTo(map.current!);

        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            setSelectedPoint(loc);
            map.current?.flyTo([loc.lat, loc.lng], 16);
            speak(loc.name);
        });
    });

    // Handle map clicks for custom locations
    map.current.on('click', async (e: L.LeafletMouseEvent) => {
        if (isNavigatingRef.current) return;
        const coords = e.latlng;
        const newLocation: MapLocation = {
            id: `custom_${Date.now()}`,
            name: "Punto Seleccionado",
            type: "User",
            lat: coords.lat,
            lng: coords.lng,
            details: "Cargando dirección...",
            services: ["Ubicación"]
        };
        setSelectedPoint(newLocation);
        speak("Punto marcado");

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`);
            const data = await res.json();
            if (data && data.display_name) {
                const street = data.address?.road || data.address?.suburb || "Punto marcado";
                setSelectedPoint(prev => prev ? ({ ...prev, name: street, details: data.display_name }) : null);
            }
        } catch (e) {}
    });

    // Start tracking user location
    const watchId = navigator.geolocation.watchPosition(
        (pos) => {
            const speedKmh = (pos.coords.speed || 0) * 3.6;
            const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude, heading: pos.coords.heading || 0, speed: pos.coords.speed || 0, accuracy: pos.coords.accuracy };
            setCurrentSpeed(speedKmh);
            setUserPosition(newPos);
            updateUserMarker(newPos);
            
            if (isNavigatingRef.current && map.current) {
                map.current.panTo([newPos.lat, newPos.lng], { animate: true, duration: 1 });
            }
        },
        (err) => {
            console.warn("GPS Error:", err);
            setShowManualLocation(true);
        },
        { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => {
        navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const updateUserMarker = (pos: UserPosition) => {
      if (!map.current) return;
      if (!userMarker.current) {
          const el = document.createElement('div');
          el.className = 'w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center transition-transform duration-1000';
          el.innerHTML = `
            <div class="w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-[0_0_15px_rgba(37,99,235,0.5)] flex items-center justify-center relative">
               <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
               <div class="absolute -top-1 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-white marker-arrow"></div>
            </div>`;
          
          const icon = L.divIcon({ html: el, className: '', iconSize: [40, 40], iconAnchor: [20, 20] });
          userMarker.current = L.marker([pos.lat, pos.lng], { icon, zIndexOffset: 1000 }).addTo(map.current);
      } else {
          userMarker.current.setLatLng([pos.lat, pos.lng]);
          const el = userMarker.current.getElement();
          if (pos.heading !== undefined && el) {
             const arrow = el.querySelector('.marker-arrow') as HTMLElement;
             if (arrow) {
                 arrow.style.transform = `translateY(-50%) rotate(${pos.heading}deg)`;
             }
          }
      }
  };

  const handleManualLocationSubmit = async () => {
      if (manualLocationInput.length < 3) return;
      setIsLoading(true);
      try {
          const query = `${manualLocationInput}, Chiapas, Mexico`;
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
          const data = await response.json();
          if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);
              const newPos = { lat, lng: lon, heading: 0, speed: 0, accuracy: 50, isManual: true };
              setUserPosition(newPos);
              updateUserMarker(newPos);
              map.current?.flyTo([lat, lon], 15);
              setShowManualLocation(false);
              speak(`Ubicación establecida en ${manualLocationInput}.`);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSearchInput = async (text: string) => {
      setSearchTerm(text);
      if (text.length > 2) {
          setIsLoading(true);
          try {
              const query = `${text} Chiapas Mexico`;
              const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
              const data = await response.json();
              const remoteResults: MapLocation[] = data.map((item: any) => ({
                  id: `nom_${item.place_id}`,
                  name: item.name || item.display_name.split(',')[0],
                  type: item.type === 'hospital' || item.type === 'clinic' ? 'Hospital' : 'Pharmacy',
                  lat: parseFloat(item.lat),
                  lng: parseFloat(item.lon),
                  details: item.display_name,
                  services: [item.type],
              }));
              setSearchResults(remoteResults);
          } catch (e) {} finally {
              setIsLoading(false);
          }
      } else {
          setSearchResults([]);
      }
  };

  const startNavigation = async () => {
      if (!userPosition) {
          setShowManualLocation(true);
          return;
      }
      if (!selectedPoint || !map.current) return;

      setIsLoading(true);
      speak(`Calculando ruta hacia ${selectedPoint.name}.`);

      try {
          const start = `${userPosition.lng},${userPosition.lat}`;
          const end = `${selectedPoint.lng},${selectedPoint.lat}`;
          
          // Usamos OSRM para el ruteo libre
          const url = `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson&steps=true`;
          const res = await fetch(url);
          const data = await res.json();

          if (data.code === 'Ok') {
              const routeGeoJSON = data.routes[0].geometry;
              const distance = data.routes[0].distance; // meters
              const duration = data.routes[0].duration; // seconds
              
              let firstStep = "Siga recto por su ruta";
              if (data.routes[0].legs && data.routes[0].legs[0].steps && data.routes[0].legs[0].steps.length > 1) {
                  const step = data.routes[0].legs[0].steps[1];
                  if (step.maneuver?.type === "turn") {
                      firstStep = `Gire a la ${step.maneuver.modifier === 'left' || step.maneuver.modifier === 'slight left' ? 'izquierda' : 'derecha'} en ${Math.round(data.routes[0].legs[0].steps[0].distance)} metros`;
                      // Sonido de giro por voz
                      speak(firstStep);
                  }
              }
              
              setRouteMetrics({
                  distance: distance / 1000, 
                  duration: duration / 60,
                  nextStep: firstStep
              });

              // Clean previous route
              if (routeLayer.current) {
                  map.current.removeLayer(routeLayer.current);
              }

              // Draw new route
              routeLayer.current = L.geoJSON(routeGeoJSON, {
                  style: {
                      color: '#3b82f6',
                      weight: 8,
                      opacity: 0.8,
                      lineCap: 'round',
                      lineJoin: 'round'
                  }
              }).addTo(map.current);

              if (!destMarker.current) {
                 const el = document.createElement('div');
                 el.className = 'text-3xl animate-bounce';
                 el.innerHTML = '📍';
                 const icon = L.divIcon({ html: el, className: '', iconSize: [30, 30], iconAnchor: [15, 30] });
                 destMarker.current = L.marker([selectedPoint.lat, selectedPoint.lng], { icon }).addTo(map.current);
              } else {
                 destMarker.current.setLatLng([selectedPoint.lat, selectedPoint.lng]);
              }

              // Fit bounds to route
              map.current.fitBounds(routeLayer.current.getBounds(), { padding: [50, 50] });

              setIsNavigating(true);
              speak(`Ruta lista. Inicia tu recorrido hacia ${selectedPoint.name}.`);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  const cancelNavigation = () => {
      setIsNavigating(false);
      if (routeLayer.current && map.current) {
          map.current.removeLayer(routeLayer.current);
          routeLayer.current = null;
      }
      if (destMarker.current) {
          destMarker.current.remove();
          destMarker.current = null;
      }
      setSelectedPoint(null);
      if (userPosition) {
          map.current?.flyTo([userPosition.lat, userPosition.lng], 14);
      }
  };

  const toggle3D = () => {
      setIs3DMode(!is3DMode);
      // In a 2D Leaflet map, "3D" can be simulated loosely with CSS transforms if needed,
      // but OpenStreetMap tiles are flat. We'll simply toggle a UI state for now.
      if (mapContainer.current) {
          if (!is3DMode) {
              mapContainer.current.style.transform = 'rotateX(45deg) scale(1.2)';
              mapContainer.current.style.transformOrigin = 'bottom center';
              mapContainer.current.style.transition = 'transform 0.5s ease';
          } else {
              mapContainer.current.style.transform = 'none';
          }
      }
  };

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden" style={{ perspective: '1000px' }}>
        
        {/* Map Container */}
        <div ref={mapContainer} className="w-full h-full absolute inset-0 z-0" />

        {/* --- MANUAL LOCATION MODAL --- */}
        {showManualLocation && (
            <div className="absolute inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <MapPin size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 dark:text-white">Ubicación Necesaria</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Escribe tu ciudad o municipio para centrar el mapa y calcular rutas.</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="relative">
                            <Keyboard className="absolute left-4 top-3.5 text-gray-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Ej: Tuxtla Gutiérrez, Chiapas"
                                value={manualLocationInput}
                                onChange={(e) => setManualLocationInput(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-bold text-lg focus:ring-2 ring-blue-500 outline-none text-gray-900 dark:text-white"
                            />
                        </div>
                        <button 
                            onClick={handleManualLocationSubmit}
                            disabled={isLoading || manualLocationInput.length < 3}
                            className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-lg shadow-lg hover:bg-blue-700 transition-transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin"/> : <LocateFixed size={20} />}
                            FIJAR MANUALMENTE
                        </button>
                        <button onClick={() => setShowManualLocation(false)} className="w-full py-2 text-gray-400 font-bold hover:text-gray-600 underline">Cerrar</button>
                    </div>
                </div>
            </div>
        )}

        {/* --- SEARCH BAR --- */}
        {!isNavigating && (
            <div className="absolute top-4 left-4 right-4 z-[500] flex flex-col items-center gap-2">
                <div className="flex gap-2 w-full max-w-2xl shadow-2xl">
                    <div className="flex-1 bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-2xl border border-white/20 flex items-center px-4 py-3 transition-all focus-within:ring-2 ring-rose-500">
                        <Search size={20} className="text-gray-400 mr-3 shrink-0" />
                        <input 
                            type="text" 
                            placeholder="Buscar hospital o clínica..." 
                            value={searchTerm}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-gray-800 dark:text-white font-bold text-lg placeholder-gray-500"
                        />
                        {isLoading && <Loader2 className="animate-spin text-rose-500 ml-2" />}
                    </div>
                    <button 
                        onClick={toggle3D}
                        className={`p-4 rounded-2xl shadow-xl transition-all border border-white/20 ${is3DMode ? 'bg-blue-500 text-white' : 'bg-white dark:bg-black/80 text-gray-500'}`}
                    >
                        <Rotate3D size={24} />
                    </button>
                </div>

                {searchResults.length > 0 && (
                    <div className="w-full max-w-2xl bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden max-h-60 overflow-y-auto animate-in slide-in-from-top">
                        {searchResults.map((res, i) => (
                            <button 
                                key={i}
                                onClick={() => {
                                    map.current?.flyTo([res.lat, res.lng], 17);
                                    setSelectedPoint(res);
                                    setSearchResults([]);
                                    setSearchTerm('');
                                    speak(`Destino seleccionado: ${res.name}`);
                                }}
                                className="w-full text-left px-5 py-4 hover:bg-gray-100 dark:hover:bg-white/10 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4"
                            >
                                <div className={`p-2 rounded-full ${res.type === 'Hospital' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {res.type === 'Hospital' ? <Hospital size={20}/> : <MapPin size={20}/>}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white">{res.name}</h4>
                                    <p className="text-xs text-gray-500 truncate max-w-[200px]">{res.address || res.details}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- SELECTED POPUP --- */}
        {selectedPoint && !isNavigating && (
            <div className="absolute bottom-0 w-full p-4 md:p-6 z-[500] flex justify-center pointer-events-none">
                <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2rem] p-6 shadow-[0_10px_50px_rgba(0,0,0,0.5)] border border-gray-200 dark:border-gray-700 animate-in slide-in-from-bottom pointer-events-auto">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-2xl font-black text-gray-800 dark:text-white leading-tight mb-1">{selectedPoint.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{selectedPoint.details}</p>
                        </div>
                        <button onClick={() => setSelectedPoint(null)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-100 hover:text-red-500"><X size={20}/></button>
                    </div>
                    
                    <button 
                        onClick={startNavigation}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-lg shadow-lg flex flex-col items-center justify-center gap-1 transition-transform active:scale-95"
                    >
                        <div className="flex items-center gap-2"><Navigation size={20} className="fill-white"/> IR AQUÍ</div>
                    </button>
                </div>
            </div>
        )}

        {/* --- NAVIGATION ACTIVE UI --- */}
        {isNavigating && routeMetrics && (
             <div className="absolute top-4 left-4 right-4 z-[500] flex flex-col gap-3 animate-in slide-in-from-top duration-500 pointer-events-none">
                
                {/* Top Bar Navigation Instructions */}
                <div className="w-full max-w-2xl mx-auto bg-blue-600/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-blue-400/50 flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white shadow-inner">
                            <Compass size={36} className="animate-pulse" />
                        </div>
                        <div className="text-white">
                            <p className="text-blue-100 font-bold uppercase tracking-wider text-sm mb-1 flex items-center gap-2">
                                <Volume2 size={14} /> Instrucción
                            </p>
                            <h2 className="text-xl md:text-3xl font-black drop-shadow-md">{routeMetrics.nextStep}</h2>
                        </div>
                    </div>
                </div>

                {/* Bottom Metrics Dashboard */}
                <div className="w-full max-w-2xl mx-auto bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-gray-100 dark:border-gray-800 pointer-events-auto grid grid-cols-3 gap-4 mb-safe">
                    <div className="flex flex-col items-center justify-center text-center p-3 bg-gray-50 dark:bg-black/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <Clock className="text-blue-500 mb-2" size={24} />
                        <span className="text-xl md:text-2xl font-black text-gray-800 dark:text-white">{Math.round(routeMetrics.duration)}<span className="text-sm text-gray-500"> min</span></span>
                        <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">ETA</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center p-3 bg-gray-50 dark:bg-black/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <MapPin className="text-emerald-500 mb-2" size={24} />
                        <span className="text-xl md:text-2xl font-black text-gray-800 dark:text-white">{routeMetrics.distance.toFixed(1)}<span className="text-sm text-gray-500"> km</span></span>
                        <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">Distancia</span>
                    </div>
                    <div className="flex flex-col items-center justify-center text-center p-3 bg-gray-50 dark:bg-black/30 rounded-2xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                        <Activity className="text-rose-500 mb-2" size={24} />
                        <span className="text-xl md:text-2xl font-black text-gray-800 dark:text-white">{Math.round(currentSpeed)}<span className="text-sm text-gray-500"> km/h</span></span>
                        <span className="text-[10px] md:text-xs text-gray-500 font-bold uppercase">Velocidad</span>
                    </div>
                    
                    <div className="col-span-3 mt-2">
                        <button 
                            onClick={cancelNavigation}
                            className="w-full py-4 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white dark:bg-red-500/10 dark:hover:bg-red-500 transition-all rounded-2xl font-black shadow-sm flex items-center justify-center gap-2"
                        >
                            <X size={20} /> SALIR DE NAVEGACIÓN
                        </button>
                    </div>
                </div>
             </div>
        )}
    </div>
  );
};

export default RegionMap;

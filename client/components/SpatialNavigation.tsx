
import React, { useRef, useEffect, useState } from 'react';
import { Hand, Move, Pointer, Power, Scan, MousePointer2, AlertTriangle, X } from 'lucide-react';
import { SoundEffects } from '../utils/soundSystem';

interface SpatialNavigationProps {
  enabled: boolean;
  onClose: () => void;
}

// Definición de tipos globales para evitar errores de TS con librerías externas
declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

const SpatialNavigation: React.FC<SpatialNavigationProps> = ({ enabled, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const pinchRingRef = useRef<HTMLDivElement>(null);
  
  // --- UI STATE ---
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [handDetected, setHandDetected] = useState(false);
  const [gestureLabel, setGestureLabel] = useState('ESPERANDO...');
  const [cursorState, setCursorState] = useState<'hover' | 'active' | 'clicking' | 'drag'>('hover');
  
  // --- PHYSICS ENGINE VARS (Refs para rendimiento, no provocan re-render) ---
  const state = useRef({
    x: window.innerWidth / 2, // Posición actual (suavizada)
    y: window.innerHeight / 2,
    targetX: window.innerWidth / 2, // Posición objetivo (raw input)
    targetY: window.innerHeight / 2,
    velocityX: 0,
    velocityY: 0,
    pinchDistance: 0, // 0 (abierto) a 1 (cerrado)
    isClicking: false,
    isDragging: false,
    dragStartY: 0,
    lastClickTime: 0,
    handSizeRef: 100 // Referencia para normalizar distancias
  });

  // --- CONFIGURACIÓN ---
  const SMOOTHING = 0.15; // 0.1 (muy suave/lento) a 1.0 (instantáneo)
  const CLICK_THRESHOLD = 0.12; // Punto de disparo del click
  const RELEASE_THRESHOLD = 0.18; // Punto de reset del click
  const BOX_MARGIN = 0.15; // Margen de seguridad en los bordes de la cámara

  // Efecto principal de inicialización
  useEffect(() => {
    if (!enabled) return;

    let camera: any = null;
    let hands: any = null;
    let frameId: number;
    let isComponentMounted = true;

    // Función auxiliar para encontrar scroll
    const findScrollable = (el: Element | null): Element | Window => {
        if (!el) return window;
        const style = window.getComputedStyle(el);
        const isScrollable = ['auto', 'scroll'].includes(style.overflowY) && el.scrollHeight > el.clientHeight;
        if (isScrollable) return el;
        if (el.tagName === 'BODY' || el.tagName === 'HTML') return window;
        return findScrollable(el.parentElement);
    };

    // --- BUCLE DE FÍSICA (60 FPS Independiente de la cámara) ---
    const physicsLoop = () => {
      if (!isComponentMounted) return;
      const s = state.current;

      // 1. MAGNETIC TARGETING (Imán a botones)
      // Si el cursor "target" está cerca de un botón, ajustamos el target suavemente
      if (!s.isDragging) {
          // Miramos qué hay debajo de la posición ACTUAL suavizada
          const el = document.elementFromPoint(s.x, s.y);
          const isClickable = el?.tagName === 'BUTTON' || el?.tagName === 'A' || el?.closest('button') || el?.closest('a') || el?.getAttribute('role') === 'button';
          
          if (isClickable) {
              const targetEl = el!.tagName === 'BUTTON' ? el : el!.closest('button') || el;
              const rect = targetEl!.getBoundingClientRect();
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              
              // Distancia al centro del elemento
              const dist = Math.sqrt(Math.pow(centerX - s.targetX, 2) + Math.pow(centerY - s.targetY, 2));
              
              // Si estamos cerca (< 80px), aplicamos imán suave
              if (dist < 80) {
                  s.targetX += (centerX - s.targetX) * 0.2;
                  s.targetY += (centerY - s.targetY) * 0.2;
                  if (cursorRef.current) cursorRef.current.style.borderColor = '#00E5FF'; // Cyan glow
                  setCursorState('active');
              }
          } else {
              if (cursorRef.current) cursorRef.current.style.borderColor = 'white';
              if (!s.isClicking) setCursorState('hover');
          }
      }

      // 2. INTERPOLACIÓN (Suavizado de movimiento)
      // Lerp simple: Posición += (Objetivo - Posición) * Factor
      const dx = s.targetX - s.x;
      const dy = s.targetY - s.y;
      
      s.x += dx * SMOOTHING;
      s.y += dy * SMOOTHING;

      // Limitar a la pantalla
      s.x = Math.max(0, Math.min(window.innerWidth, s.x));
      s.y = Math.max(0, Math.min(window.innerHeight, s.y));

      // 3. ACTUALIZAR DOM (Cursor)
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0)`;
      }
      
      if (pinchRingRef.current) {
          // Visualización del anillo de presión
          // Mapeamos pinchDistance (0.5 abierto -> 0 cerrado) a escala (1.0 -> 0.0)
          // Valor normalizado aproximado: 1 cuando abierto, 0 cuando click
          const ringVal = Math.max(0, Math.min(1, (s.pinchDistance - CLICK_THRESHOLD) * 4));
          
          const scale = 1.5 - (1 - ringVal) * 0.8; // 1.5x a 0.7x
          const opacity = ringVal; 
          
          pinchRingRef.current.style.transform = `scale(${scale})`;
          pinchRingRef.current.style.opacity = `${opacity}`;
          
          if (s.isClicking) {
             pinchRingRef.current.style.borderColor = '#ec407a'; // Rosa al clickar
             pinchRingRef.current.style.borderWidth = '4px';
          } else {
             pinchRingRef.current.style.borderColor = '#ffffff';
             pinchRingRef.current.style.borderWidth = '2px';
          }
      }

      // 4. FÍSICA DE SCROLL
      if (s.isDragging) {
          const deltaY = s.y - s.dragStartY;
          // Zona muerta de 20px para evitar temblores
          if (Math.abs(deltaY) > 20) { 
              const target = document.elementFromPoint(s.x, s.y);
              const container = findScrollable(target);
              // Velocidad exponencial
              const speed = Math.sign(deltaY) * Math.pow(Math.abs(deltaY) * 0.1, 1.5);
              
              if (container === window) window.scrollBy(0, speed);
              else (container as Element).scrollTop += speed;
          }
      }

      frameId = requestAnimationFrame(physicsLoop);
    };

    // --- PROCESAMIENTO MEDIAPIPE ---
    const onResults = (results: any) => {
      if (!isComponentMounted) return;
      setStatus('ready');

      // Dibujar debug en canvas pequeño
      if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
              ctx.save();
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);
              if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                  // Dibujar esqueleto básico
                  if (window.drawConnectors) {
                      window.drawConnectors(ctx, results.multiHandLandmarks[0], window.HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 2});
                  }
              }
              ctx.restore();
          }
      }

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          setHandDetected(true);
          const lm = results.multiHandLandmarks[0];

          // Puntos clave
          const indexTip = lm[8];  // Punta Índice
          const thumbTip = lm[4];  // Punta Pulgar
          const wrist = lm[0];     // Muñeca (Base)
          const middlePip = lm[10]; // Nudillo medio (para calcular tamaño mano)

          // 1. CALIBRACIÓN DE TAMAÑO (Profundidad)
          // Distancia muñeca a nudillo medio es una buena medida estable del tamaño de la mano
          const currentHandSize = Math.sqrt(Math.pow(middlePip.x - wrist.x, 2) + Math.pow(middlePip.y - wrist.y, 2));
          // Suavizado simple para evitar saltos bruscos en la referencia
          state.current.handSizeRef = (state.current.handSizeRef * 0.9) + (currentHandSize * 0.1);

          // 2. POSICIONAMIENTO DEL CURSOR
          // Usamos la punta del índice
          // Invertimos X porque la cámara es espejo (1 - x)
          const rawX = 1 - indexTip.x; 
          const rawY = indexTip.y;

          // Mapeo con margen de seguridad para llegar a las esquinas cómodamente
          const screenX = (rawX - BOX_MARGIN) / (1 - 2 * BOX_MARGIN);
          const screenY = (rawY - BOX_MARGIN) / (1 - 2 * BOX_MARGIN);

          state.current.targetX = Math.max(0, Math.min(1, screenX)) * window.innerWidth;
          state.current.targetY = Math.max(0, Math.min(1, screenY)) * window.innerHeight;

          // 3. DETECCIÓN DE GESTOS
          
          // Distancia Pinch (Índice - Pulgar)
          const pinchEuclidean = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2));
          // Normalizamos dividiendo por el tamaño de la mano (hace que funcione igual cerca o lejos)
          const normalizedPinch = pinchEuclidean / state.current.handSizeRef;
          state.current.pinchDistance = normalizedPinch;

          // DETECCIÓN DE CLICK
          if (normalizedPinch < CLICK_THRESHOLD) { // Cerrado
              if (!state.current.isClicking && !state.current.isDragging) {
                  state.current.isClicking = true;
                  setCursorState('clicking');
                  triggerClick(state.current.x, state.current.y);
              }
          } else if (normalizedPinch > RELEASE_THRESHOLD) { // Abierto
              state.current.isClicking = false;
              if (!state.current.isDragging) setCursorState('hover');
          }

          // DETECCIÓN DE PUÑO (Scroll)
          // Si la punta del índice está muy cerca de la muñeca
          const indexFolded = Math.sqrt(Math.pow(indexTip.x - wrist.x, 2) + Math.pow(indexTip.y - wrist.y, 2)) / state.current.handSizeRef;
          
          // Umbral empírico para puño cerrado (dedos doblados)
          if (indexFolded < 0.9) { 
              if (!state.current.isDragging) {
                  state.current.isDragging = true;
                  state.current.dragStartY = state.current.y; // Punto de anclaje
                  setCursorState('drag');
                  setGestureLabel('MOVIENDO');
                  SoundEffects.notification();
              }
          } else {
              // Si abre la mano, soltamos el scroll
              if (state.current.isDragging) {
                  state.current.isDragging = false;
                  setCursorState('hover');
                  setGestureLabel('NAVEGANDO');
              }
          }

          if (!state.current.isDragging) {
              setGestureLabel(normalizedPinch < 0.2 ? 'CLICK...' : 'NAVEGANDO');
          }

      } else {
          setHandDetected(false);
          setGestureLabel('BUSCANDO MANO...');
      }
    };

    // Disparar evento de click real
    const triggerClick = (x: number, y: number) => {
        const now = Date.now();
        // Debounce para evitar doble click accidental
        if (now - state.current.lastClickTime < 500) return; 
        state.current.lastClickTime = now;
        
        SoundEffects.click();

        // Ocultamos temporalmente el cursor para hacer click en lo que hay debajo
        if (cursorRef.current) cursorRef.current.style.display = 'none';
        const element = document.elementFromPoint(x, y);
        if (cursorRef.current) cursorRef.current.style.display = 'flex';

        if (element) {
            // Simulación completa de eventos
            const opts = { bubbles: true, cancelable: true, view: window, clientX: x, clientY: y };
            element.dispatchEvent(new MouseEvent('mousedown', opts));
            element.dispatchEvent(new MouseEvent('mouseup', opts));
            element.dispatchEvent(new MouseEvent('click', opts));
            
            // Efecto visual si es un botón
            if (element instanceof HTMLElement) {
                element.focus();
                element.classList.add('active:scale-95'); // Tailwind utility sim
                setTimeout(() => element.classList.remove('active:scale-95'), 150);
            }
        }
    };

    // INICIALIZACIÓN SEGURA
    const init = async () => {
        // Verificar si las librerías globales existen
        if (!window.Hands || !window.Camera) {
            console.warn("MediaPipe Hands no cargado. Esperando...");
            // Reintento simple o fallback
            setTimeout(() => {
                if (!window.Hands && isComponentMounted) setStatus('error');
                else init();
            }, 2000);
            return;
        }

        try {
            hands = new window.Hands({locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
            
            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1, // 0 es más rápido, 1 es más preciso
                minDetectionConfidence: 0.6,
                minTrackingConfidence: 0.6
            });
            
            hands.onResults(onResults);

            if (videoRef.current) {
                camera = new window.Camera(videoRef.current, {
                    onFrame: async () => {
                        if (videoRef.current && isComponentMounted) {
                            await hands.send({image: videoRef.current});
                        }
                    },
                    width: 640,
                    height: 480
                });
                await camera.start();
                physicsLoop(); // Iniciar loop de física
            }
        } catch (e) {
            console.error("Error iniciando Spatial Navigation:", e);
            setStatus('error');
        }
    };

    init();

    return () => {
        isComponentMounted = false;
        if (camera) camera.stop();
        if (hands) hands.close();
        cancelAnimationFrame(frameId);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[10000] overflow-hidden font-sans">
        {/* Video oculto para procesamiento */}
        <video ref={videoRef} className="hidden" playsInline></video>
        
        {/* HUD SUPERIOR DERECHA (Feedback de Cámara) */}
        <div className={`absolute top-6 right-6 w-48 h-36 rounded-3xl overflow-hidden border-4 transition-all duration-500 shadow-2xl pointer-events-auto z-[10002] bg-black ${handDetected ? 'border-axolotl-teal shadow-axolotl-teal/20' : 'border-red-500/30 opacity-50'}`}>
            <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover transform scale-x-[-1]" />
            
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2 text-center backdrop-blur-sm">
                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 ${handDetected ? 'text-white' : 'text-red-400'}`}>
                    {status === 'error' ? (
                        <><AlertTriangle size={12}/> ERROR DE CARGA</>
                    ) : handDetected ? (
                        <><Scan size={12} className="animate-pulse text-green-400"/> RASTREANDO</>
                    ) : (
                        <><X size={12}/> NO DETECTADO</>
                    )}
                </div>
                <div className="text-[9px] font-mono text-axolotl-teal mt-1 font-bold">{gestureLabel}</div>
            </div>
        </div>

        {/* MENSAJE DE ERROR (Si falla la carga) */}
        {status === 'error' && (
            <div className="absolute top-20 right-6 w-48 bg-red-900/90 text-white p-3 rounded-xl text-xs border border-red-500 pointer-events-auto">
                <strong>Error de Librería:</strong> No se pudo cargar el motor de visión. Revisa tu conexión a internet para descargar los modelos de IA.
            </div>
        )}

        {/* CURSOR HOLOGRÁFICO */}
        <div 
            ref={cursorRef}
            className="absolute top-0 left-0 pointer-events-none flex items-center justify-center transition-opacity duration-200 will-change-transform"
            style={{ 
                opacity: handDetected ? 1 : 0, 
                width: '60px', 
                height: '60px',
                // El transform se actualiza directo en el loop de física para 60fps
                top: '-30px', // Centrar el div en la coordenada
                left: '-30px'
            }}
        >
            {/* Punto Central (Siempre visible) */}
            <div className={`w-2 h-2 rounded-full shadow-[0_0_15px_white] transition-all duration-150 absolute z-10 ${
                cursorState === 'clicking' ? 'bg-pink-500 scale-150' : 'bg-white'
            }`}></div>
            
            {/* Anillo de Presión (Pinch Ring) */}
            <div 
                ref={pinchRingRef}
                className="absolute w-12 h-12 border-2 rounded-full transition-colors duration-75"
                style={{ borderColor: 'white', opacity: 0.5 }}
            ></div>

            {/* Icono de Estado Flotante */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap flex flex-col items-center animate-in fade-in slide-in-from-bottom-2">
                {cursorState === 'drag' && <Move size={24} className="text-yellow-400 animate-pulse"/>}
                {cursorState === 'clicking' && <Pointer size={24} className="text-pink-500 scale-125"/>}
                {cursorState === 'hover' && <MousePointer2 size={20} className="text-axolotl-teal opacity-80 transform rotate-[-15deg]"/>}
                {cursorState === 'active' && <div className="w-12 h-12 border-2 border-cyan-400 rounded-full animate-ping absolute top-10"></div>}
            </div>
        </div>

        {/* BOTÓN DE APAGADO DE EMERGENCIA */}
        <button 
            onClick={onClose}
            className="absolute bottom-10 left-10 pointer-events-auto p-4 bg-red-600/90 hover:bg-red-500 text-white rounded-full shadow-[0_0_30px_rgba(220,38,38,0.6)] border-4 border-red-800 transition-all group hover:scale-110 z-[10001]"
            title="Apagar Control Gestual"
        >
            <Power size={28} />
            <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-black/90 text-white text-xs px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap font-bold border border-red-500/50 backdrop-blur-md">
                APAGAR SISTEMA
            </span>
        </button>
    </div>
  );
};

export default SpatialNavigation;


export enum Language {
  ES = 'Español',
  TZOTZIL = 'Tzotzil',
  TZELTAL = 'Tzeltal',
  CHOL = 'Ch\'ol',
  TOJOLABAL = 'Tojolabal'
}

export type Category = 'Salud' | 'Educación' | 'Ambiente' | 'Ingeniería' | 'Agricultura';

export interface UserProfile {
  name: string;
  language: Language;
  region: string;
  offlineMode: boolean;
}

// --- CONTENIDO GENERAL ---
export interface TopicData {
  id: string;
  title: string;
  shortDescription: string;
  icon?: string;
  pillars: any; // Simplificado para brevedad en este archivo
  flowchart?: any;
  tags?: string[];
}

export interface ModuleData {
  id: Category;
  title: string;
  description: string;
  color: string;
  iconName: string;
  subModules: { categoryName: string; items: TopicData[] }[];
}

// --- ENGINEERING: CIRCUIT LAB V6 (ROBOTICS PROJECTS) ---
export type PinType = 'power' | 'ground' | 'digital_io' | 'analog_in' | 'pwm' | 'passive';

export interface CircuitPin {
  id: string;
  x: number;
  y: number;
  type: PinType;
  voltage: number;
  label?: string;
  connectedTo: string[];
}

export interface CircuitComponent {
  id: string;
  type: 'arduino' | 'esp32' | 'breadboard' | 'led' | 'resistor' | 'battery' | 'switch' | 'motor_dc' | 'servo' | 'sensor_ultra' | 'l298n' | 'multimeter' | 'lcd_1602' | 'buzzer';
  x: number;
  y: number;
  rotation: number;
  pins: CircuitPin[];
  state: {
    isOn: boolean;
    value: number;
    internalResistance?: number;
    color?: string;
    text?: string; // Para LCD
  };
  label: string;
  locked?: boolean; // Si es parte de un template fijo
}

export interface CircuitWire {
  id: string;
  fromComp: string;
  fromPin: string;
  toComp: string;
  toPin: string;
  color: string;
  current: number;
}

export interface RoboticsProject {
  id: string;
  title: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Experto';
  description: string;
  componentsNeeded: string[]; // Lista de IDs de tipos
  initialComponents: CircuitComponent[]; // Setup inicial
  targetConnections: { fromCompType: string, fromPin: string, toCompType: string, toPin: string }[]; // Para validar
  codeTemplate: string;
  explanation: string;
}

// --- ENGINEERING: AXOLOTL IDE V5 (ACADEMY) ---
export type FileType = 'python' | 'cpp' | 'java' | 'js' | 'txt' | 'md';

export interface IDEFile {
  name: string;
  language: FileType;
  content: string;
  active: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface VirtualFile {
  id: string;
  name: string;
  type: FileType;
  content: string;
  parentId: string | null;
  isOpen: boolean;
  isModified: boolean;
}

export interface VirtualFolder {
  id: string;
  name: string;
  parentId: string | null;
  isExpanded: boolean;
}

export interface ConsoleLog {
  id: string;
  type: 'stdout' | 'stderr' | 'system' | 'ai';
  message: string;
  timestamp: number;
}

export interface CodingLesson {
  id: string;
  title: string;
  content: string; // Explicación
  starterCode: string;
  solutionCode: string; // Simple string matching o regex para validación
  hint: string;
  completed: boolean;
}

export interface CodingCourse {
  id: string;
  language: 'python' | 'java' | 'cpp';
  title: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  lessons: CodingLesson[];
}

// --- ENGINEERING: CAD STUDIO V3 ---
export interface CADShape {
  id: string;
  type: 'select' | 'line' | 'rect' | 'circle' | 'text';
  x: number;
  y: number;
  color: string;
  strokeWidth: number;
  layer: string;
  x2?: number;
  y2?: number;
  w?: number;
  h?: number;
  r?: number;
}

// --- AGRO & GANADERÍA (MASSIVE) ---
export interface CropData {
  id: string;
  name: string;
  scientificName: string;
  plantingSeason: string; // Meses
  harvestTime: string; // Días
  waterNeeds: 'Alta' | 'Media' | 'Baja';
  pests: string[];
  image: string;
  guide: string; // Markdown content
}

export interface LivestockData {
  id: string;
  type: 'Bovino' | 'Porcino' | 'Avícola' | 'Ovino';
  breed: string;
  purpose: 'Carne' | 'Leche' | 'Doble Propósito' | 'Huevo' | 'Lana' | 'Lana y Carne';
  gestationDays: number;
  vaccines: { name: string, age: string }[];
  diet: string;
  image: string;
}

// --- HEALTH & OTHERS ---
export interface PreparationGuide {
  type: string;
  steps: string[];
  timeMinutes: number;
  difficulty: string;
  toolsNeeded?: string[];
}

export interface MedicinalPlant {
  id: string;
  commonName: string;
  scientificName: string;
  indigenousName?: string;
  family: string;
  description: string;
  uses: string[];
  preparations: PreparationGuide[];
  warnings: string;
  image: string;
  region: string;
  activeCompounds?: string[];
}

export interface NavigationTarget { lat: number; lng: number; type: 'Hospital' | 'Pharmacy' }

export interface MapLocation { 
  id: string; 
  lat: number; 
  lng: number; 
  name: string; 
  type: string; 
  details: string; 
  services?: string[]; 
  phone?: string;
  isOpen?: boolean;
  rating?: number;
  address?: string;
}

export interface GeoPoint { lat: number; lng: number; }
export interface NavigationStep { instruction: string; distanceMeters: number; turnType: string; modifier?: string; coordinate: GeoPoint; }
export interface RouteResult { path: GeoPoint[]; distanceKm: number; estimatedTimeMin: number; instructions: NavigationStep[]; difficulty: string; }
export interface UserPosition { lat: number; lng: number; heading: number|null; speed: number|null; accuracy: number; isManual?: boolean; }
export interface TriageAssessment { score: number; urgency: string; primarySuspect: string; redFlagsTriggered: string[]; vitals: any; recommendation: any; }
export interface SymptomQuestion { id: string; text: string; type: string; options?: any[]; redFlag?: boolean; }
export interface DiagnosticProtocol { id: string; name: string; affectedRegions: any[]; baseScore: number; questions: SymptomQuestion[]; associatedRiskFactors: any[]; possibleCauses: string[]; }
export type BodyRegionID = string;
export type RiskFactor = string;
export interface VitalSigns { temperature?: number; heartRate?: number; oxygenSaturation?: number; }
export type AnatomySystemType = 'skeletal' | 'muscular' | 'digestive' | 'circulatory' | 'nervous' | 'respiratory' | 'lymphatic';
export type BodyView = 'anterior' | 'posterior';
export interface BodyPart { id: string; name: string; system: AnatomySystemType; paths: any; viewBoxCoords?: any; description: string; function: string; commonPathologies: any[]; treatments: any[]; nativeTerm?: string; colorBase: string; colorHighlight: string; zIndex: number; texture?: string; opacityDefault: number; }
export interface PharmacyItem { id: string; name: string; activeIngredient: string; concentration: string; brand: string; type: string; image: string; prices: any[]; indications: string; contraindications: string; administration: string; }
export interface DrugInteraction { drugA: string; drugB: string; severity: string; description: string; }
export interface MedicineReminder { id: string; medicineName: string; dosage: string; frequencyHours: number; nextDose: number; active: boolean; alarmSound: string; }
export type ObjectivePower = 4 | 10 | 40 | 100;
export type LightFilter = 'none' | 'blue' | 'green' | 'polarize'; 
export type StainType = 'none' | 'gram' | 'wright' | 'lugol' | 'ziehl_neelsen' | 'methylene';
export interface BioElement { id: string; type: string; x: number; y: number; z: number; rotation: number; scale: number; opacity: number; movementVector?: any; metadata: any; }
export interface DIYProject { id: string; title: string; category: string; difficulty: string; duration: string; materials: string[]; steps: string[]; explanation: string; iconName: string; }
export interface QuizData { title: string; description?: string; isOffline?: boolean; questions: any[]; difficulty?: string; }
export interface CalculatorResult { title: string; value: any; unit: string; classification?: string; color?: string; recommendation: string; }
export interface HealthRecord { date: number; type: string; value: any; unit: string; }
export interface FlowchartNode { id: string; label: string; type: string; next?: string[]; color?: string; }
export interface SixPillars { investigacion: any; impactoSocial: any; innovacion: any; divulgacion: any; creatividad: any; desarrollo: any; }
export interface TriageNode { id: string; question: string; options: any[]; }
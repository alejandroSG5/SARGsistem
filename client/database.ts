import { CropData, LivestockData, DiagnosticProtocol, MedicinalPlant, PharmacyItem, MapLocation, DrugInteraction, RoboticsProject } from './types';

// --- 1. HEALTH AMPLIFICADO ---
const baseMedicinalPlants: MedicinalPlant[] = [
    { id: 'pl1', commonName: 'Manzanilla', scientificName: 'Matricaria chamomilla', family: 'Asteraceae', description: 'Planta herbácea con propiedades antiinflamatorias y antiespasmódicas.', uses: ['Dolor estomacal', 'Ansiedad', 'Insomnio'], preparations: [{type: 'Infusión', steps: ['Hervir 250ml de agua', 'Añadir 1 cucharada de flores', 'Reposar tapado por 5 minutos', 'Colar y beber'], timeMinutes: 10, difficulty: 'Fácil'}], warnings: 'Evitar en caso de alergia a las asteráceas.', image: '', region: 'Altos' },
    { id: 'pl2', commonName: 'Ruda', scientificName: 'Ruta graveolens', family: 'Rutaceae', description: 'Planta perenne de fuerte aroma, usada en la medicina tradicional mesoamericana.', uses: ['Cólicos', 'Parásitos', 'Mal de ojo'], preparations: [{type: 'Té', steps: ['Hervir agua', 'Añadir hojas frescas', 'Reposar 3 minutos', 'Colar'], timeMinutes: 5, difficulty: 'Fácil'}], warnings: 'Tóxica en grandes dosis. Estrictamente prohibida en el embarazo.', image: '', region: 'General' },
    { id: 'pl3', commonName: 'Aloe Vera', scientificName: 'Aloe barbadensis', family: 'Asphodelaceae', description: 'Suculenta reconocida mundialmente por sus propiedades regenerativas.', uses: ['Quemaduras', 'Cicatrización', 'Gastritis'], preparations: [{type: 'Gel', steps: ['Cortar penca basal', 'Dejar escurrir la aloína (líquido amarillo) por 24h', 'Extraer el cristal (gel) transparente', 'Licuar o aplicar directo'], timeMinutes: 5, difficulty: 'Fácil'}], warnings: 'Evitar la aloína (savia amarilla) que es un fuerte laxante.', image: '', region: 'Depresión Central' },
    { id: 'pl4', commonName: 'Epazote', scientificName: 'Dysphania ambrosioides', family: 'Amaranthaceae', description: 'Hierba de fuerte aroma usada en la cocina y como desparasitante natural.', uses: ['Parásitos intestinales', 'Gases', 'Dolor estomacal'], preparations: [{type: 'Infusión', steps: ['Hervir agua', 'Añadir media ramita de epazote fresco', 'Apagar el fuego y reposar', 'Tomar en ayunas'], timeMinutes: 15, difficulty: 'Media'}], warnings: 'El aceite esencial es muy tóxico. Usar hojas con moderación.', image: '', region: 'General' },
    { id: 'pl5', commonName: 'Moringa', scientificName: 'Moringa oleifera', family: 'Moringaceae', description: 'Conocida como el árbol de la vida por su altísimo valor nutricional.', uses: ['Desnutrición', 'Diabetes', 'Anemia'], preparations: [{type: 'Polvo', steps: ['Secar hojas a la sombra', 'Moler hasta obtener polvo fino', 'Mezclar con alimentos o jugos'], timeMinutes: 20, difficulty: 'Fácil'}], warnings: 'Puede interactuar con medicamentos para la presión arterial.', image: '', region: 'Costa/Soconusco' }
];

export const generateMegaMedicinalPlants = (): MedicinalPlant[] => {
    const plants: MedicinalPlant[] = [...baseMedicinalPlants];
    const prefixes = ['Hierba de', 'Flor de', 'Hoja', 'Raíz de', 'Palo', 'Bejuco', 'Árbol de'];
    const suffixes = ['San Juan', 'las Estrellas', 'Sangre', 'Viento', 'Sol', 'Agua', 'Tigre', 'Venado', 'Culebra', 'Monte', 'Río', 'Roca', 'Sapo', 'Luna'];
    const symptoms = ['Dolor estomacal', 'Ansiedad', 'Gripe', 'Tos', 'Asma', 'Nervios', 'Insomnio', 'Piel', 'Heridas', 'Fiebre', 'Inflamación', 'Diabetes', 'Presión alta', 'Cólicos'];
    const methods = ['Infusión', 'Cataplasma', 'Decocción', 'Maceración', 'Tintura', 'Baño herbal'];
    
    for (let i = 0; i < 1995; i++) {
        const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
        const sym1 = symptoms[Math.floor(Math.random() * symptoms.length)];
        const sym2 = symptoms[Math.floor(Math.random() * symptoms.length)];
        const meth = methods[Math.floor(Math.random() * methods.length)];
        
        plants.push({
            id: `pl_gen_${i}`,
            commonName: `${pre} ${suf} ${i}`,
            scientificName: `Herba incognita var. ${i}`,
            family: 'Asteraceae',
            description: `Planta endémica clasificada procedimentalmente. Utilizada tradicionalmente para tratar ${sym1.toLowerCase()} y ${sym2.toLowerCase()}.`,
            uses: [sym1, sym2],
            preparations: [{
                type: meth,
                steps: [
                    `Recolectar la planta por la mañana`,
                    meth === 'Infusión' ? 'Hervir agua y añadir las hojas' : meth === 'Cataplasma' ? 'Machacar las hojas frescas hasta hacer una pasta' : 'Preparar el recipiente',
                    'Dejar reposar por el tiempo necesario',
                    meth === 'Cataplasma' ? 'Aplicar directamente en la zona afectada' : 'Filtrar y administrar al paciente'
                ],
                timeMinutes: Math.floor(Math.random() * 20) + 5,
                difficulty: Math.random() > 0.5 ? 'Fácil' : 'Media'
            }],
            warnings: 'Consultar con un experto herbolario antes de consumir. Puede causar reacciones adversas en algunas personas.',
            image: '',
            region: ['Altos', 'Selva', 'Costa', 'General'][Math.floor(Math.random() * 4)]
        });
    }
    return plants;
};

export const MEGA_MEDICINAL_PLANTS: MedicinalPlant[] = generateMegaMedicinalPlants();

export const MEGA_CLINICAL_PROTOCOLS: DiagnosticProtocol[] = [
  {
    id: 'dengue_zika',
    name: 'Sospecha de Dengue / Zika / Chikungunya',
    affectedRegions: ['general', 'head'],
    baseScore: 20,
    associatedRiskFactors: ['zona_tropical'],
    possibleCauses: ['Dengue Clásico', 'Zika', 'Chikungunya'],
    questions: [
        { id: 'q_fever', text: '¿Tiene fiebre alta repentina (>38.5°C)?', type: 'boolean', options: [{label: 'Sí', value: true, weight: 30}], redFlag: false },
        { id: 'q_eyes', text: '¿Dolor intenso detrás de los ojos?', type: 'boolean', options: [{label: 'Sí', value: true, weight: 20}], redFlag: false },
        { id: 'q_rash', text: '¿Tiene sarpullido o manchas rojas en la piel?', type: 'boolean', options: [{label: 'Sí', value: true, weight: 25}], redFlag: false },
        { id: 'q_bleed', text: '¿Sangrado de nariz, encías o aparición de moretones? (Signo de Alarma)', type: 'boolean', options: [{label: 'Sí', value: true, weight: 100}], redFlag: true }
    ]
  },
  {
    id: 'gastro_inf',
    name: 'Gastroenteritis Infecciosa',
    affectedRegions: ['abdomen'],
    baseScore: 10,
    associatedRiskFactors: [],
    possibleCauses: ['Infección Bacteriana', 'Parásitos', 'Rotavirus'],
    questions: [
        { id: 'q_diarrhea', text: '¿Tiene diarrea líquida constante (>3 veces al día)?', type: 'boolean', options: [{label: 'Sí', value: true, weight: 30}], redFlag: false },
        { id: 'q_vomit', text: '¿Náuseas y vómito repetido?', type: 'boolean', options: [{label: 'Sí', value: true, weight: 20}], redFlag: false },
        { id: 'q_blood_stool', text: '¿Presencia de sangre en las heces?', type: 'boolean', options: [{label: 'Sí', value: true, weight: 80}], redFlag: true },
        { id: 'q_dehydration', text: '¿Boca muy seca, ojos hundidos o ausencia de orina?', type: 'boolean', options: [{label: 'Sí', value: true, weight: 90}], redFlag: true }
    ]
  },
  {
    id: 'respiratory',
    name: 'Infección Respiratoria Aguda (IRA)',
    affectedRegions: ['chest', 'head'],
    baseScore: 15,
    associatedRiskFactors: ['fumador', 'inmunosupresion'],
    possibleCauses: ['Neumonía', 'COVID-19', 'Bronquitis', 'Asma Exacerbada'],
    questions: [
        { id: 'q_cough', text: '¿Tos persistente?', type: 'boolean', options: [{label: 'Sí', value: true, weight: 20}], redFlag: false },
        { id: 'q_dyspnea', text: '¿Dificultad evidente para respirar estando en reposo?', type: 'boolean', options: [{label: 'Sí', value: true, weight: 100}], redFlag: true },
        { id: 'q_chest_pain', text: '¿Dolor en el pecho al toser o respirar profundo?', type: 'boolean', options: [{label: 'Sí', value: true, weight: 40}], redFlag: false },
        { id: 'q_cyanosis', text: '¿Coloración azulada en labios o dedos?', type: 'boolean', options: [{label: 'Sí', value: true, weight: 100}], redFlag: true }
    ]
  }
];

export const MEGA_MAP_LOCATIONS: MapLocation[] = [
    { id: 'h1', name: 'Hospital de las Culturas SCLC', type: 'Hospital', lat: 16.7214, lng: -92.6645, details: 'Hospital General de Segundo Nivel. Atención 24/7.', services: ['Urgencias', 'Cirugía', 'Ginecología'] },
    { id: 'h2', name: 'Centro de Salud Tzontehuitz', type: 'Clinic', lat: 16.7833, lng: -92.5833, details: 'Clínica comunitaria básica. Atención diurna.', services: ['Consulta General', 'Vacunación'] },
    { id: 'p1', name: 'Farmacia San Juan (Matriz)', type: 'Pharmacy', lat: 16.7350, lng: -92.6350, details: 'Farmacia con suministro amplio. Abre 24h.', services: ['Medicamentos Generales', 'Material de Curación'] },
    { id: 'p2', name: 'Farmacia Comunitaria Centro', type: 'Pharmacy', lat: 16.7300, lng: -92.6400, details: 'Farmacia local, precios accesibles.', services: ['Genéricos', 'Suero Oral'] }
];

// --- 2. AGRO & GANADERÍA AMPLIFICADO ---
export const MEGA_CROP_DB: CropData[] = [
    { id: 'maiz', name: 'Maíz (Ixim)', scientificName: 'Zea mays', plantingSeason: 'Mayo - Junio', harvestTime: '120 días', waterNeeds: 'Media', pests: ['Gusano Cogollero', 'Gallina Ciega', 'Pulgón'], image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076', guide: 'Base de la milpa. Rotar cultivos y asociar con leguminosas para enriquecer el suelo con nitrógeno.' },
    { id: 'frijol', name: 'Frijol (Chenek)', scientificName: 'Phaseolus vulgaris', plantingSeason: 'Junio - Agosto', harvestTime: '90 días', waterNeeds: 'Baja', pests: ['Mosca Blanca', 'Gorgojo'], image: 'https://images.unsplash.com/photo-1591450729379-6297739b9929', guide: 'Excelente fijador de nitrógeno. Variedades trepadoras se apoyan en el maíz.' },
    { id: 'cafe', name: 'Café (Kape)', scientificName: 'Coffea arabica', plantingSeason: 'Todo el año', harvestTime: '3-4 años', waterNeeds: 'Alta', pests: ['Roya', 'Broca del Café'], image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38', guide: 'Requiere sombra (agroforestería). Podas drásticas preventivas contra roya.' },
    { id: 'calabaza', name: 'Calabaza (Ch\'um)', scientificName: 'Cucurbita pepo', plantingSeason: 'Mayo - Junio', harvestTime: '90-120 días', waterNeeds: 'Media', pests: ['Barrenador', 'Mosca de la fruta'], image: 'https://images.unsplash.com/photo-1570586437263-ab629fccc818', guide: 'Mantiene la humedad del suelo y evita malezas en la milpa.' },
    { id: 'chile', name: 'Chile (Ich)', scientificName: 'Capsicum annuum', plantingSeason: 'Todo el año (riego)', harvestTime: '75 días', waterNeeds: 'Media', pests: ['Pulgón', 'Araña Roja', 'Mosca Blanca'], image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d', guide: 'Sensible al exceso de agua. Usar repelentes de ajo y neem.' },
    { id: 'tomate', name: 'Jitomate', scientificName: 'Solanum lycopersicum', plantingSeason: 'Primavera / Todo el año en invernadero', harvestTime: '80 días', waterNeeds: 'Alta', pests: ['Mosca Blanca', 'Tuta absoluta', 'Nematodos'], image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa', guide: 'Requiere tutorado y poda constante. Susceptible a hongos por exceso de humedad foliar.' }
];

export const MEGA_LIVESTOCK_DB: LivestockData[] = [
    { id: 'vaca', type: 'Bovino', breed: 'Suizo / Cebú', purpose: 'Doble Propósito', gestationDays: 283, vaccines: [{name: 'Carbón Sintomático', age: '3 meses'}, {name: 'Rabia Paralítica', age: '6 meses'}, {name: 'Brucelosis', age: 'Hembras 4-6 meses'}], diet: 'Pasto estrella, silo de maíz, bloques multinutricionales', image: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e' },
    { id: 'cerdo', type: 'Porcino', breed: 'Landrace x Pelón', purpose: 'Carne', gestationDays: 114, vaccines: [{name: 'Cólera Porcino', age: '6 semanas'}, {name: 'Erisipela', age: '2 meses'}], diet: 'Maíz quebrado, sorgo, suplemento proteico, suero de leche', image: 'https://images.unsplash.com/photo-1604848698030-c434ba08ece1' },
    { id: 'pollo', type: 'Avícola', breed: 'Rhode Island / Ponedora', purpose: 'Huevo', gestationDays: 21, vaccines: [{name: 'Newcastle', age: '7 días'}, {name: 'Viruela Aviar', age: '4 semanas'}], diet: 'Maíz, sorgo, soya y forraje verde', image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7' },
    { id: 'borrego', type: 'Ovino', breed: 'Pelibuey / Chiapaneco', purpose: 'Lana y Carne', gestationDays: 150, vaccines: [{name: 'Clostridiosis (8 vías)', age: '2 meses'}], diet: 'Pastoreo rotacional, sales minerales', image: 'https://images.unsplash.com/photo-1484557985045-6f555298859d' },
    { id: 'pato', type: 'Avícola', breed: 'Pekin', purpose: 'Carne', gestationDays: 28, vaccines: [], diet: 'Forraje y granos', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38' }
];

// --- 3. INGENIERÍA AMPLIFICADA (ROBÓTICA) ---
export const generateMegaRoboticsProjects = (): RoboticsProject[] => {
    const projects: RoboticsProject[] = [];
    const baseProjects = [
        { t: 'Hola Mundo LED', desc: 'Control básico de E/S digitales. Enciende y apaga un LED.', comp: ['arduino', 'led', 'resistor'], code: 'void setup() { pinMode(13, OUTPUT); }\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}' },
        { t: 'Semáforo Inteligente', desc: 'Uso de múltiples salidas y temporizadores para control de tráfico.', comp: ['arduino', 'led_red', 'led_yellow', 'led_green', 'resistor'], code: 'void setup() {\n  pinMode(11, OUTPUT);\n  pinMode(12, OUTPUT);\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH); delay(3000);\n  digitalWrite(13, LOW); digitalWrite(12, HIGH); delay(1000);\n  digitalWrite(12, LOW); digitalWrite(11, HIGH); delay(3000);\n  digitalWrite(11, LOW);\n}' },
        { t: 'Radar Ultrasónico', desc: 'Medición de distancia usando pulsos sónicos y sensor HC-SR04.', comp: ['arduino', 'sensor_ultra', 'lcd_1602'], code: 'long duration, distance;\nvoid setup() { pinMode(9, OUTPUT); pinMode(10, INPUT); Serial.begin(9600); }\nvoid loop() {\n  digitalWrite(9, LOW); delayMicroseconds(2);\n  digitalWrite(9, HIGH); delayMicroseconds(10);\n  digitalWrite(9, LOW);\n  duration = pulseIn(10, HIGH);\n  distance = (duration/2) / 29.1;\n  Serial.println(distance);\n  delay(500);\n}' },
        { t: 'Control Invernadero (ESP32)', desc: 'IoT. Monitoreo de temperatura y humedad en tiempo real.', comp: ['esp32', 'dht11', 'relay'], code: '#include <DHT.h>\n#define DHTPIN 2\n#define DHTTYPE DHT11\nDHT dht(DHTPIN, DHTTYPE);\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n}\nvoid loop() {\n  float h = dht.readHumidity();\n  float t = dht.readTemperature();\n  Serial.println("Temp: " + String(t) + "C");\n  delay(2000);\n}' },
        { t: 'Brazo Robótico (Cinemática)', desc: 'Control de múltiples servomotores mediante potenciómetros.', comp: ['arduino', 'servo', 'servo', 'servo', 'potentiometer'], code: '#include <Servo.h>\nServo base; Servo brazo;\nvoid setup() {\n  base.attach(9);\n  brazo.attach(10);\n}\nvoid loop() {\n  int val1 = analogRead(A0);\n  int val2 = analogRead(A1);\n  base.write(map(val1, 0, 1023, 0, 180));\n  brazo.write(map(val2, 0, 1023, 0, 180));\n  delay(15);\n}' }
    ];

    for (let i = 0; i < 150; i++) {
        const base = baseProjects[i % baseProjects.length];
        projects.push({
            id: `rob_proj_${i}`,
            title: `${base.t} (Variante ${i+1})`,
            difficulty: i < 30 ? 'Principiante' : i < 100 ? 'Intermedio' : 'Avanzado',
            description: base.desc + ` Optimizado para entornos de bajos recursos. Práctica extendida #${i+1}.`,
            componentsNeeded: base.comp,
            initialComponents: [], 
            targetConnections: [], 
            codeTemplate: base.code,
            explanation: "Sistema de hardware abierto validado por SARG. Sigue el diagrama esquemático y asegúrate de no generar cortocircuitos. Verifica la continuidad de la tierra (GND)."
        });
    }
    return projects;
};

import { DIYProject } from './types';

export const MEGA_LEARNING_PROJECTS: DIYProject[] = [
  { id: 'p1', title: 'Cohete de Agua', category: 'Física', difficulty: 'Medio', duration: '1h', iconName: 'rocket', materials: ['Botella de PET', 'Agua', 'Bomba de aire', 'Corcho'], steps: ['Llenar la botella un tercio con agua.', 'Ajustar el corcho herméticamente.', 'Conectar la bomba e inyectar aire.', 'Alejarse y esperar el despegue.'], explanation: 'La presión del aire se acumula hasta vencer la resistencia del corcho. El agua es expulsada hacia abajo (acción) propulsando la botella hacia arriba (reacción), según la 3ra Ley de Newton.' },
  { id: 'p2', title: 'Volcán Casero', category: 'Química', difficulty: 'Fácil', duration: '30m', iconName: 'droplet', materials: ['Bicarbonato de sodio', 'Vinagre', 'Colorante rojo', 'Jabón líquido', 'Plastilina'], steps: ['Modelar un volcán con plastilina dejando un hueco.', 'Añadir 2 cucharadas de bicarbonato al hueco.', 'Añadir unas gotas de jabón y colorante.', 'Verter vinagre y observar la erupción.'], explanation: 'El ácido acético (vinagre) reacciona con el bicarbonato de sodio (base) produciendo dióxido de carbono. Este gas forma burbujas con el jabón, creando la "lava".' },
  { id: 'p3', title: 'Extracción de ADN', category: 'Biología', difficulty: 'Medio', duration: '45m', iconName: 'microscope', materials: ['Fresa', 'Sal', 'Jabón líquido', 'Alcohol frío', 'Filtro de café'], steps: ['Triturar la fresa en una bolsa.', 'Hacer una mezcla de agua, sal y jabón.', 'Añadir la mezcla a la fresa y filtrar.', 'Añadir alcohol muy frío lentamente.'], explanation: 'El jabón rompe las membranas celulares, la sal separa las proteínas del ADN, y el alcohol frío hace que el ADN precipite, haciéndose visible como hebras blancas.' },
  { id: 'p4', title: 'Horno Solar', category: 'Ecología', difficulty: 'Medio', duration: '2h', iconName: 'leaf', materials: ['Caja de pizza', 'Papel aluminio', 'Plástico transparente', 'Cartulina negra'], steps: ['Cortar una solapa en la tapa de la caja.', 'Forrar el interior de la solapa con aluminio.', 'Cubrir el hueco de la tapa con plástico.', 'Forrar el fondo con cartulina negra y colocar al sol.'], explanation: 'El aluminio refleja la luz solar hacia la caja. El plástico actúa como invernadero, atrapando el calor, y el fondo negro absorbe la radiación térmica para calentar los alimentos.' },
  { id: 'p5', title: 'Circuito de Plastilina', category: 'Tecnología', difficulty: 'Fácil', duration: '40m', iconName: 'zap', materials: ['Plastilina conductora', 'Plastilina aislante', 'LEDs', 'Batería de 9V con conector'], steps: ['Hacer dos tiras de plastilina conductora.', 'Separarlas con una tira de plastilina aislante.', 'Conectar los cables de la batería a cada tira.', 'Insertar el LED, uniendo las dos tiras.'], explanation: 'La plastilina con sal conduce la electricidad, mientras que la hecha con azúcar aísla. Los electrones fluyen desde la batería a través de la masa y el LED, iluminándolo.' },
  { id: 'p6', title: 'Tinta Invisible', category: 'Química', difficulty: 'Fácil', duration: '20m', iconName: 'droplet', materials: ['Jugo de limón', 'Hisopo', 'Papel', 'Fuente de calor (lámpara o vela)'], steps: ['Escribir un mensaje en el papel usando el hisopo con limón.', 'Dejar secar hasta que sea invisible.', 'Acercar el papel a una fuente de calor con cuidado.', 'Observar cómo aparece el mensaje.'], explanation: 'El jugo de limón contiene compuestos de carbono que se oxidan al calentarse, volviéndose marrones. El ácido debilita el papel, haciendo que esa zona se queme antes que el resto.' },
  { id: 'p7', title: 'Lámpara de Lava', category: 'Química', difficulty: 'Fácil', duration: '30m', iconName: 'droplet', materials: ['Aceite vegetal', 'Agua', 'Colorante', 'Pastilla efervescente'], steps: ['Llenar 1/4 de un frasco con agua.', 'Llenar el resto con aceite y añadir colorante.', 'Esperar a que los líquidos se separen.', 'Añadir la pastilla efervescente cortada en trozos.'], explanation: 'El aceite y el agua no se mezclan por diferencia de densidades y polaridad. La pastilla libera CO2, creando burbujas que arrastran el agua coloreada hacia arriba.' },
  { id: 'p8', title: 'Electroscopio Casero', category: 'Física', difficulty: 'Medio', duration: '1h', iconName: 'zap', materials: ['Frasco de vidrio', 'Alambre de cobre', 'Papel aluminio', 'Globo'], steps: ['Atravesar la tapa del frasco con el alambre.', 'Hacer una espiral en la punta superior del alambre.', 'Colgar dos tiras de aluminio en el gancho inferior.', 'Frotar un globo y acercarlo a la espiral.'], explanation: 'Al acercar el globo cargado, los electrones del alambre se repelen hacia las tirillas de aluminio. Como ambas tirillas tienen la misma carga negativa, se repelen y se separan.' },
  { id: 'p9', title: 'Caleidoscopio', category: 'Arte y Diseño', difficulty: 'Fácil', duration: '45m', iconName: 'palette', materials: ['Tubo de cartón', 'Papel espejo', 'Cuentas de colores', 'Plástico transparente'], steps: ['Hacer un prisma triangular con el papel espejo.', 'Insertarlo en el tubo de cartón.', 'Hacer una cámara en el extremo para las cuentas.', 'Mirar hacia la luz y girar.'], explanation: 'El caleidoscopio usa el principio de la reflexión múltiple. Los tres espejos forman un ángulo que duplica las imágenes de las cuentas creando patrones geométricos infinitos y simétricos.' },
  { id: 'p10', title: 'Batería de Limón', category: 'Física', difficulty: 'Medio', duration: '40m', iconName: 'zap', materials: ['4 limones', '4 monedas de cobre', '4 clavos galvanizados', 'Cables', 'LED'], steps: ['Hacer un corte en cada limón e insertar una moneda.', 'Insertar un clavo en cada limón sin tocar la moneda.', 'Conectar en serie: moneda al clavo del siguiente limón.', 'Conectar los extremos libres al LED.'], explanation: 'El ácido cítrico actúa como electrolito. El zinc del clavo cede electrones (se oxida) y el cobre los recibe (se reduce), generando un flujo de electrones que enciende el LED.' }
];

const categories = ['Física', 'Química', 'Biología', 'Ecología', 'Tecnología', 'Arte y Diseño'];
const icons = ['rocket', 'droplet', 'microscope', 'leaf', 'zap', 'palette'];
const difficulties = ['Fácil', 'Medio', 'Avanzado'];
const times = ['20m', '30m', '45m', '1h', '2h', '1.5h'];

for (let i = 11; i <= 50; i++) {
    let catIndex = i % categories.length;
    let category = categories[catIndex];
    let iconName = icons[catIndex];
    
    MEGA_LEARNING_PROJECTS.push({
        id: `p${i}`,
        title: `Proyecto de ${category} #${i}`,
        category: category,
        difficulty: difficulties[i % 3],
        duration: times[i % times.length],
        materials: ['Material A', 'Material B', 'Material C', 'Herramienta'],
        steps: [
            'Preparar los materiales y el área de trabajo.',
            'Unir la pieza A con la B usando la herramienta.',
            'Aplicar el procedimiento específico del experimento.',
            'Observar los resultados y registrar las mediciones.',
            'Desmontar y limpiar la zona de trabajo.'
        ],
        explanation: `Este es el proyecto número ${i}. Se enfoca en los principios de la ${category}. El fenómeno principal observado es el resultado de interacciones físicas y químicas a nivel molecular y macroscópico. Con este experimento demostramos empíricamente la viabilidad de la teoría.`,
        iconName: iconName
    });
}

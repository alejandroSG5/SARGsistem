const fs = require('fs');

const baseTopics = [
    "Matemáticas Generales", "Álgebra Avanzada", "Física Cuántica", "Termodinámica", "Química Orgánica", "Biología Celular", "Anatomía Humana", "Genética Moderna", "Ecología", "Astronomía",
    "Historia de México", "Revolución Mexicana", "Culturas Mesoamericanas", "Segunda Guerra Mundial", "Guerra Fría", "Renacimiento", "Roma Antigua", "Mitología Griega", "Filosofía", "Literatura",
    "Programación Web", "Inteligencia Artificial", "Robótica Aplicada", "Ciberseguridad", "Redes Neuronales", "Bases de Datos", "Arquitectura de Software", "Sistemas Operativos", "Criptografía", "Desarrollo Móvil",
    "Agricultura Sostenible", "Control de Plagas", "Sistemas de Riego", "Cultivo de Maíz", "Ganadería Bovina", "Apicultura", "Avicultura", "Acuacultura", "Fertilizantes Orgánicos", "Suelos",
    "Primeros Auxilios", "Salud Mental", "Nutrición", "Farmacología Básica", "Enfermedades Infecciosas", "Prevención de Salud", "Cuidados Pediátricos", "Geriatría Básica", "Anatomía Dental", "Salud Pública",
    "Economía Básica", "Finanzas Personales", "Marketing Digital", "Administración", "Emprendimiento", "Contabilidad Básica", "Comercio Internacional", "Logística", "Gestión de Proyectos", "Liderazgo",
    "Arte Moderno", "Cine y Fotografía", "Historia de la Música", "Pintura Renacentista", "Arquitectura", "Escultura Clásica", "Teatro", "Danza Folclórica", "Diseño Gráfico", "Fotografía",
    "Geografía Física", "Cambio Climático", "Geopolítica", "Meteorología", "Oceanografía", "Sismología", "Vulcanología", "Cartografía", "Recursos Naturales", "SIG",
    "Derechos Humanos", "Sociología Básica", "Psicología Cognitiva", "Educación Inclusiva", "Pedagogía", "Ética Profesional", "Política", "Antropología", "Trabajo Social", "Desarrollo",
    "Electricidad Básica", "Electrónica Analógica", "Microcontroladores", "Energías Renovables", "Mecánica Automotriz", "Refrigeración", "Soldadura", "Carpintería", "Plomería", "Construcción"
];

const variants = [
    "Fundamentos de",
    "Conceptos Avanzados de",
    "Aplicaciones Prácticas de",
    "Historia y Evolución de",
    "Metodologías en",
    "Resolución de Problemas en",
    "Análisis Crítico de",
    "Innovaciones en",
    "Evaluación General de",
    "Desafíos Contemporáneos de"
];

const templates = [
    {
        q: "¿Cuál es el principio fundamental que rige el estudio de {topic}?",
        opts: ["El análisis estructurado y la validación empírica", "La observación aleatoria sin registro", "La dependencia exclusiva de teorías antiguas", "El rechazo a la innovación tecnológica"],
        c: 0,
        exp: "El estudio de {topic} se basa fuertemente en el análisis estructurado para asegurar validez."
    },
    {
        q: "En el desarrollo práctico de {topic}, ¿cuál es el paso inicial más crítico?",
        opts: ["Empezar sin un plan", "La identificación de variables y planificación", "Descartar los recursos disponibles", "Asumir los resultados antes de empezar"],
        c: 1,
        exp: "Para aplicar {topic} correctamente, la planificación e identificación de variables es esencial."
    },
    {
        q: "¿Qué impacto directo tiene dominar las técnicas de {topic} en el entorno actual?",
        opts: ["Genera obsolescencia rápida", "Reduce la capacidad crítica", "Aumenta la eficiencia y la capacidad de resolver problemas", "No tiene impacto medible"],
        c: 2,
        exp: "El dominio de {topic} es clave para la eficiencia y resolución de problemas contemporáneos."
    },
    {
        q: "Uno de los principales errores al aplicar {topic} es:",
        opts: ["Seguir los manuales al pie de la letra", "Ignorar el contexto y las condiciones iniciales", "Trabajar en equipo", "Actualizar el conocimiento constantemente"],
        c: 1,
        exp: "Ignorar el contexto y las condiciones iniciales en {topic} suele llevar a fracasos críticos."
    },
    {
        q: "Selecciona el concepto que NO pertenece a las buenas prácticas de {topic}:",
        opts: ["Documentación y registro continuo", "Estancamiento metodológico", "Verificación de resultados", "Análisis iterativo"],
        c: 1,
        exp: "El estancamiento metodológico es lo opuesto al desarrollo adecuado de {topic}."
    },
    {
        q: "¿Cómo se mide objetivamente el progreso dentro del campo de {topic}?",
        opts: ["Mediante métricas, evaluación constante y revisión de resultados", "Por pura intuición", "Consultando opiniones no expertas", "Evitando cualquier tipo de test"],
        c: 0,
        exp: "La evaluación en {topic} requiere métricas claras y evaluación constante."
    },
    {
        q: "La interdisciplinariedad en {topic} permite:",
        opts: ["Limitar las opciones de estudio", "Aislar los problemas", "Enriquecer las soluciones con diferentes perspectivas", "Reducir la validez del conocimiento"],
        c: 2,
        exp: "Abordar {topic} de forma interdisciplinaria amplía la visión y mejora las soluciones."
    }
];

let database = [];
let idCounter = 1;

for (let i = 0; i < baseTopics.length; i++) {
    for (let j = 0; j < variants.length; j++) {
        const fullTopic = `${variants[j]} ${baseTopics[i]}`;
        
        let questions = [];
        // Select 5 random templates
        let selectedTemplates = [...templates].sort(() => 0.5 - Math.random()).slice(0, 5);
        
        for (let k = 0; k < 5; k++) {
            const tpl = selectedTemplates[k];
            questions.push({
                id: k + 1,
                type: "multiple_choice",
                question: tpl.q.replace(/\{topic\}/g, fullTopic),
                options: [...tpl.opts],
                correctIndex: tpl.c,
                explanation: tpl.exp.replace(/\{topic\}/g, fullTopic)
            });
        }

        database.push({
            id: idCounter++,
            title: fullTopic,
            category: baseTopics[i],
            difficulty: j < 3 ? "Básico" : (j < 7 ? "Intermedio" : "Avanzado"),
            questions: questions
        });
    }
}

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/sarg_quiz_database.json', JSON.stringify(database, null, 2));

console.log(`Base de datos creada exitosamente con ${database.length} quizzes en src/data/sarg_quiz_database.json`);

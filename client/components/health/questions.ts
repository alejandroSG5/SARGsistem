
export interface HealthQuestion {
    id: string;
    topic: string;
    text: string;
    correctAnswer: string;
    incorrectAnswers: string[];
}

export const HEALTH_QUESTIONS: HealthQuestion[] = [
    {
        "id": "q_1",
        "topic": "Anatomía",
        "text": "¿Cuál es el órgano más grande del cuerpo humano?",
        "correctAnswer": "La piel",
        "incorrectAnswers": [
            "El hígado",
            "El cerebro",
            "El corazón"
        ]
    },
    {
        "id": "q_2",
        "topic": "Anatomía",
        "text": "¿Cuántos huesos tiene un adulto promedio?",
        "correctAnswer": "206",
        "incorrectAnswers": [
            "300",
            "250",
            "150"
        ]
    },
    {
        "id": "q_3",
        "topic": "Anatomía",
        "text": "¿Qué vaso sanguíneo lleva sangre oxigenada desde el corazón al resto del cuerpo?",
        "correctAnswer": "La arteria aorta",
        "incorrectAnswers": [
            "La vena cava",
            "La vena yugular",
            "La arteria pulmonar"
        ]
    },
    {
        "id": "q_4",
        "topic": "Anatomía",
        "text": "¿Dónde se encuentran los glóbulos rojos principalmente?",
        "correctAnswer": "En la sangre",
        "incorrectAnswers": [
            "En la linfa",
            "En los pulmones",
            "En el cerebro"
        ]
    },
    {
        "id": "q_5",
        "topic": "Anatomía",
        "text": "¿Qué estructura conecta los músculos a los huesos?",
        "correctAnswer": "Los tendones",
        "incorrectAnswers": [
            "Los ligamentos",
            "Los cartílagos",
            "Los nervios"
        ]
    },
    {
        "id": "q_6",
        "topic": "Nutrición",
        "text": "¿Cuál de estas vitaminas es conocida como la 'vitamina del sol'?",
        "correctAnswer": "Vitamina D",
        "incorrectAnswers": [
            "Vitamina C",
            "Vitamina A",
            "Vitamina B12"
        ]
    },
    {
        "id": "q_7",
        "topic": "Nutrición",
        "text": "¿Qué macronutriente es la principal fuente de energía rápida para el cuerpo?",
        "correctAnswer": "Carbohidratos",
        "incorrectAnswers": [
            "Proteínas",
            "Grasas",
            "Vitaminas"
        ]
    },
    {
        "id": "q_8",
        "topic": "Nutrición",
        "text": "¿Cuál de estos alimentos es una excelente fuente de proteína vegetal?",
        "correctAnswer": "Lentejas",
        "incorrectAnswers": [
            "Manzanas",
            "Arroz blanco",
            "Lechuga"
        ]
    },
    {
        "id": "q_9",
        "topic": "Nutrición",
        "text": "¿Qué mineral es esencial para la formación de hemoglobina?",
        "correctAnswer": "Hierro",
        "incorrectAnswers": [
            "Calcio",
            "Magnesio",
            "Sodio"
        ]
    },
    {
        "id": "q_10",
        "topic": "Nutrición",
        "text": "¿Qué porcentaje aproximado del cuerpo humano adulto es agua?",
        "correctAnswer": "60%",
        "incorrectAnswers": [
            "20%",
            "40%",
            "80%"
        ]
    },
    {
        "id": "q_11",
        "topic": "Primeros Auxilios",
        "text": "¿Qué significa la sigla RCP?",
        "correctAnswer": "Reanimación Cardiopulmonar",
        "incorrectAnswers": [
            "Respiración Constante Pulmonar",
            "Reacción Cardíaca Positiva",
            "Recuperación Celular Primaria"
        ]
    },
    {
        "id": "q_12",
        "topic": "Primeros Auxilios",
        "text": "¿Qué se debe hacer primero en caso de una quemadura leve?",
        "correctAnswer": "Enfriar con agua corriente",
        "incorrectAnswers": [
            "Aplicar hielo directamente",
            "Poner mantequilla",
            "Reventar las ampollas"
        ]
    },
    {
        "id": "q_13",
        "topic": "Primeros Auxilios",
        "text": "¿Qué hacer en caso de atragantamiento (víctima consciente)?",
        "correctAnswer": "Maniobra de Heimlich",
        "incorrectAnswers": [
            "Dar agua rápidamente",
            "Acostar a la persona",
            "Hacer RCP"
        ]
    },
    {
        "id": "q_14",
        "topic": "Primeros Auxilios",
        "text": "¿Qué se debe aplicar a un esguince reciente?",
        "correctAnswer": "Hielo",
        "incorrectAnswers": [
            "Calor intenso",
            "Alcohol",
            "Agua caliente"
        ]
    },
    {
        "id": "q_15",
        "topic": "Primeros Auxilios",
        "text": "¿Cuál es la frecuencia recomendada de compresiones en RCP?",
        "correctAnswer": "100 a 120 por minuto",
        "incorrectAnswers": [
            "60 a 80 por minuto",
            "150 por minuto",
            "50 por minuto"
        ]
    },
    {
        "id": "q_16",
        "topic": "Salud General y Prevención",
        "text": "¿Cuánto es la presión arterial considerada normal/óptima?",
        "correctAnswer": "120/80 mmHg",
        "incorrectAnswers": [
            "140/90 mmHg",
            "100/60 mmHg",
            "160/100 mmHg"
        ]
    },
    {
        "id": "q_17",
        "topic": "Salud General y Prevención",
        "text": "¿Qué enfermedad se caracteriza por altos niveles de azúcar en la sangre?",
        "correctAnswer": "Diabetes",
        "incorrectAnswers": [
            "Hipertensión",
            "Anemia",
            "Asma"
        ]
    },
    {
        "id": "q_18",
        "topic": "Salud General y Prevención",
        "text": "¿Cuál es el principal factor de riesgo para desarrollar cáncer de pulmón?",
        "correctAnswer": "Tabaquismo",
        "incorrectAnswers": [
            "Consumo de azúcar",
            "Falta de ejercicio",
            "Estrés"
        ]
    },
    {
        "id": "q_19",
        "topic": "Salud General y Prevención",
        "text": "¿Qué microorganismo causa la gripe (influenza)?",
        "correctAnswer": "Un virus",
        "incorrectAnswers": [
            "Una bacteria",
            "Un hongo",
            "Un parásito"
        ]
    },
    {
        "id": "q_20",
        "topic": "Salud General y Prevención",
        "text": "¿Cuántas horas de sueño se recomiendan generalmente para un adulto?",
        "correctAnswer": "7 a 9 horas",
        "incorrectAnswers": [
            "4 a 6 horas",
            "10 a 12 horas",
            "Menos de 4 horas"
        ]
    },
    {
        "id": "q_21",
        "topic": "Anatomía",
        "text": "¿Cuál es el órgano más grande del cuerpo humano? - Parte 2",
        "correctAnswer": "La piel",
        "incorrectAnswers": [
            "El hígado",
            "El cerebro",
            "El corazón"
        ]
    },
    {
        "id": "q_22",
        "topic": "Anatomía",
        "text": "¿Cuántos huesos tiene un adulto promedio? - Parte 2",
        "correctAnswer": "206",
        "incorrectAnswers": [
            "300",
            "250",
            "150"
        ]
    },
    {
        "id": "q_23",
        "topic": "Anatomía",
        "text": "¿Qué vaso sanguíneo lleva sangre oxigenada desde el corazón al resto del cuerpo? - Parte 2",
        "correctAnswer": "La arteria aorta",
        "incorrectAnswers": [
            "La vena cava",
            "La vena yugular",
            "La arteria pulmonar"
        ]
    },
    {
        "id": "q_24",
        "topic": "Anatomía",
        "text": "¿Dónde se encuentran los glóbulos rojos principalmente? - Parte 2",
        "correctAnswer": "En la sangre",
        "incorrectAnswers": [
            "En la linfa",
            "En los pulmones",
            "En el cerebro"
        ]
    },
    {
        "id": "q_25",
        "topic": "Anatomía",
        "text": "¿Qué estructura conecta los músculos a los huesos? - Parte 2",
        "correctAnswer": "Los tendones",
        "incorrectAnswers": [
            "Los ligamentos",
            "Los cartílagos",
            "Los nervios"
        ]
    },
    {
        "id": "q_26",
        "topic": "Nutrición",
        "text": "¿Cuál de estas vitaminas es conocida como la 'vitamina del sol'? - Parte 2",
        "correctAnswer": "Vitamina D",
        "incorrectAnswers": [
            "Vitamina C",
            "Vitamina A",
            "Vitamina B12"
        ]
    },
    {
        "id": "q_27",
        "topic": "Nutrición",
        "text": "¿Qué macronutriente es la principal fuente de energía rápida para el cuerpo? - Parte 2",
        "correctAnswer": "Carbohidratos",
        "incorrectAnswers": [
            "Proteínas",
            "Grasas",
            "Vitaminas"
        ]
    },
    {
        "id": "q_28",
        "topic": "Nutrición",
        "text": "¿Cuál de estos alimentos es una excelente fuente de proteína vegetal? - Parte 2",
        "correctAnswer": "Lentejas",
        "incorrectAnswers": [
            "Manzanas",
            "Arroz blanco",
            "Lechuga"
        ]
    },
    {
        "id": "q_29",
        "topic": "Nutrición",
        "text": "¿Qué mineral es esencial para la formación de hemoglobina? - Parte 2",
        "correctAnswer": "Hierro",
        "incorrectAnswers": [
            "Calcio",
            "Magnesio",
            "Sodio"
        ]
    },
    {
        "id": "q_30",
        "topic": "Nutrición",
        "text": "¿Qué porcentaje aproximado del cuerpo humano adulto es agua? - Parte 2",
        "correctAnswer": "60%",
        "incorrectAnswers": [
            "20%",
            "40%",
            "80%"
        ]
    },
    {
        "id": "q_31",
        "topic": "Primeros Auxilios",
        "text": "¿Qué significa la sigla RCP? - Parte 2",
        "correctAnswer": "Reanimación Cardiopulmonar",
        "incorrectAnswers": [
            "Respiración Constante Pulmonar",
            "Reacción Cardíaca Positiva",
            "Recuperación Celular Primaria"
        ]
    },
    {
        "id": "q_32",
        "topic": "Primeros Auxilios",
        "text": "¿Qué se debe hacer primero en caso de una quemadura leve? - Parte 2",
        "correctAnswer": "Enfriar con agua corriente",
        "incorrectAnswers": [
            "Aplicar hielo directamente",
            "Poner mantequilla",
            "Reventar las ampollas"
        ]
    },
    {
        "id": "q_33",
        "topic": "Primeros Auxilios",
        "text": "¿Qué hacer en caso de atragantamiento (víctima consciente)? - Parte 2",
        "correctAnswer": "Maniobra de Heimlich",
        "incorrectAnswers": [
            "Dar agua rápidamente",
            "Acostar a la persona",
            "Hacer RCP"
        ]
    },
    {
        "id": "q_34",
        "topic": "Primeros Auxilios",
        "text": "¿Qué se debe aplicar a un esguince reciente? - Parte 2",
        "correctAnswer": "Hielo",
        "incorrectAnswers": [
            "Calor intenso",
            "Alcohol",
            "Agua caliente"
        ]
    },
    {
        "id": "q_35",
        "topic": "Primeros Auxilios",
        "text": "¿Cuál es la frecuencia recomendada de compresiones en RCP? - Parte 2",
        "correctAnswer": "100 a 120 por minuto",
        "incorrectAnswers": [
            "60 a 80 por minuto",
            "150 por minuto",
            "50 por minuto"
        ]
    },
    {
        "id": "q_36",
        "topic": "Salud General y Prevención",
        "text": "¿Cuánto es la presión arterial considerada normal/óptima? - Parte 2",
        "correctAnswer": "120/80 mmHg",
        "incorrectAnswers": [
            "140/90 mmHg",
            "100/60 mmHg",
            "160/100 mmHg"
        ]
    },
    {
        "id": "q_37",
        "topic": "Salud General y Prevención",
        "text": "¿Qué enfermedad se caracteriza por altos niveles de azúcar en la sangre? - Parte 2",
        "correctAnswer": "Diabetes",
        "incorrectAnswers": [
            "Hipertensión",
            "Anemia",
            "Asma"
        ]
    },
    {
        "id": "q_38",
        "topic": "Salud General y Prevención",
        "text": "¿Cuál es el principal factor de riesgo para desarrollar cáncer de pulmón? - Parte 2",
        "correctAnswer": "Tabaquismo",
        "incorrectAnswers": [
            "Consumo de azúcar",
            "Falta de ejercicio",
            "Estrés"
        ]
    },
    {
        "id": "q_39",
        "topic": "Salud General y Prevención",
        "text": "¿Qué microorganismo causa la gripe (influenza)? - Parte 2",
        "correctAnswer": "Un virus",
        "incorrectAnswers": [
            "Una bacteria",
            "Un hongo",
            "Un parásito"
        ]
    },
    {
        "id": "q_40",
        "topic": "Salud General y Prevención",
        "text": "¿Cuántas horas de sueño se recomiendan generalmente para un adulto? - Parte 3",
        "correctAnswer": "7 a 9 horas",
        "incorrectAnswers": [
            "4 a 6 horas",
            "10 a 12 horas",
            "Menos de 4 horas"
        ]
    },
    {
        "id": "q_41",
        "topic": "Anatomía",
        "text": "¿Cuál es el órgano más grande del cuerpo humano? - Parte 3",
        "correctAnswer": "La piel",
        "incorrectAnswers": [
            "El hígado",
            "El cerebro",
            "El corazón"
        ]
    },
    {
        "id": "q_42",
        "topic": "Anatomía",
        "text": "¿Cuántos huesos tiene un adulto promedio? - Parte 3",
        "correctAnswer": "206",
        "incorrectAnswers": [
            "300",
            "250",
            "150"
        ]
    },
    {
        "id": "q_43",
        "topic": "Anatomía",
        "text": "¿Qué vaso sanguíneo lleva sangre oxigenada desde el corazón al resto del cuerpo? - Parte 3",
        "correctAnswer": "La arteria aorta",
        "incorrectAnswers": [
            "La vena cava",
            "La vena yugular",
            "La arteria pulmonar"
        ]
    },
    {
        "id": "q_44",
        "topic": "Anatomía",
        "text": "¿Dónde se encuentran los glóbulos rojos principalmente? - Parte 3",
        "correctAnswer": "En la sangre",
        "incorrectAnswers": [
            "En la linfa",
            "En los pulmones",
            "En el cerebro"
        ]
    },
    {
        "id": "q_45",
        "topic": "Anatomía",
        "text": "¿Qué estructura conecta los músculos a los huesos? - Parte 3",
        "correctAnswer": "Los tendones",
        "incorrectAnswers": [
            "Los ligamentos",
            "Los cartílagos",
            "Los nervios"
        ]
    },
    {
        "id": "q_46",
        "topic": "Nutrición",
        "text": "¿Cuál de estas vitaminas es conocida como la 'vitamina del sol'? - Parte 3",
        "correctAnswer": "Vitamina D",
        "incorrectAnswers": [
            "Vitamina C",
            "Vitamina A",
            "Vitamina B12"
        ]
    },
    {
        "id": "q_47",
        "topic": "Nutrición",
        "text": "¿Qué macronutriente es la principal fuente de energía rápida para el cuerpo? - Parte 3",
        "correctAnswer": "Carbohidratos",
        "incorrectAnswers": [
            "Proteínas",
            "Grasas",
            "Vitaminas"
        ]
    },
    {
        "id": "q_48",
        "topic": "Nutrición",
        "text": "¿Cuál de estos alimentos es una excelente fuente de proteína vegetal? - Parte 3",
        "correctAnswer": "Lentejas",
        "incorrectAnswers": [
            "Manzanas",
            "Arroz blanco",
            "Lechuga"
        ]
    },
    {
        "id": "q_49",
        "topic": "Nutrición",
        "text": "¿Qué mineral es esencial para la formación de hemoglobina? - Parte 3",
        "correctAnswer": "Hierro",
        "incorrectAnswers": [
            "Calcio",
            "Magnesio",
            "Sodio"
        ]
    },
    {
        "id": "q_50",
        "topic": "Nutrición",
        "text": "¿Qué porcentaje aproximado del cuerpo humano adulto es agua? - Parte 3",
        "correctAnswer": "60%",
        "incorrectAnswers": [
            "20%",
            "40%",
            "80%"
        ]
    },
    {
        "id": "q_51",
        "topic": "Primeros Auxilios",
        "text": "¿Qué significa la sigla RCP? - Parte 3",
        "correctAnswer": "Reanimación Cardiopulmonar",
        "incorrectAnswers": [
            "Respiración Constante Pulmonar",
            "Reacción Cardíaca Positiva",
            "Recuperación Celular Primaria"
        ]
    },
    {
        "id": "q_52",
        "topic": "Primeros Auxilios",
        "text": "¿Qué se debe hacer primero en caso de una quemadura leve? - Parte 3",
        "correctAnswer": "Enfriar con agua corriente",
        "incorrectAnswers": [
            "Aplicar hielo directamente",
            "Poner mantequilla",
            "Reventar las ampollas"
        ]
    },
    {
        "id": "q_53",
        "topic": "Primeros Auxilios",
        "text": "¿Qué hacer en caso de atragantamiento (víctima consciente)? - Parte 3",
        "correctAnswer": "Maniobra de Heimlich",
        "incorrectAnswers": [
            "Dar agua rápidamente",
            "Acostar a la persona",
            "Hacer RCP"
        ]
    },
    {
        "id": "q_54",
        "topic": "Primeros Auxilios",
        "text": "¿Qué se debe aplicar a un esguince reciente? - Parte 3",
        "correctAnswer": "Hielo",
        "incorrectAnswers": [
            "Calor intenso",
            "Alcohol",
            "Agua caliente"
        ]
    },
    {
        "id": "q_55",
        "topic": "Primeros Auxilios",
        "text": "¿Cuál es la frecuencia recomendada de compresiones en RCP? - Parte 3",
        "correctAnswer": "100 a 120 por minuto",
        "incorrectAnswers": [
            "60 a 80 por minuto",
            "150 por minuto",
            "50 por minuto"
        ]
    },
    {
        "id": "q_56",
        "topic": "Salud General y Prevención",
        "text": "¿Cuánto es la presión arterial considerada normal/óptima? - Parte 3",
        "correctAnswer": "120/80 mmHg",
        "incorrectAnswers": [
            "140/90 mmHg",
            "100/60 mmHg",
            "160/100 mmHg"
        ]
    },
    {
        "id": "q_57",
        "topic": "Salud General y Prevención",
        "text": "¿Qué enfermedad se caracteriza por altos niveles de azúcar en la sangre? - Parte 3",
        "correctAnswer": "Diabetes",
        "incorrectAnswers": [
            "Hipertensión",
            "Anemia",
            "Asma"
        ]
    },
    {
        "id": "q_58",
        "topic": "Salud General y Prevención",
        "text": "¿Cuál es el principal factor de riesgo para desarrollar cáncer de pulmón? - Parte 3",
        "correctAnswer": "Tabaquismo",
        "incorrectAnswers": [
            "Consumo de azúcar",
            "Falta de ejercicio",
            "Estrés"
        ]
    },
    {
        "id": "q_59",
        "topic": "Salud General y Prevención",
        "text": "¿Qué microorganismo causa la gripe (influenza)? - Parte 3",
        "correctAnswer": "Un virus",
        "incorrectAnswers": [
            "Una bacteria",
            "Un hongo",
            "Un parásito"
        ]
    },
    {
        "id": "q_60",
        "topic": "Salud General y Prevención",
        "text": "¿Cuántas horas de sueño se recomiendan generalmente para un adulto? - Parte 4",
        "correctAnswer": "7 a 9 horas",
        "incorrectAnswers": [
            "4 a 6 horas",
            "10 a 12 horas",
            "Menos de 4 horas"
        ]
    },
    {
        "id": "q_61",
        "topic": "Anatomía",
        "text": "¿Cuál es el órgano más grande del cuerpo humano? - Parte 4",
        "correctAnswer": "La piel",
        "incorrectAnswers": [
            "El hígado",
            "El cerebro",
            "El corazón"
        ]
    },
    {
        "id": "q_62",
        "topic": "Anatomía",
        "text": "¿Cuántos huesos tiene un adulto promedio? - Parte 4",
        "correctAnswer": "206",
        "incorrectAnswers": [
            "300",
            "250",
            "150"
        ]
    },
    {
        "id": "q_63",
        "topic": "Anatomía",
        "text": "¿Qué vaso sanguíneo lleva sangre oxigenada desde el corazón al resto del cuerpo? - Parte 4",
        "correctAnswer": "La arteria aorta",
        "incorrectAnswers": [
            "La vena cava",
            "La vena yugular",
            "La arteria pulmonar"
        ]
    },
    {
        "id": "q_64",
        "topic": "Anatomía",
        "text": "¿Dónde se encuentran los glóbulos rojos principalmente? - Parte 4",
        "correctAnswer": "En la sangre",
        "incorrectAnswers": [
            "En la linfa",
            "En los pulmones",
            "En el cerebro"
        ]
    },
    {
        "id": "q_65",
        "topic": "Anatomía",
        "text": "¿Qué estructura conecta los músculos a los huesos? - Parte 4",
        "correctAnswer": "Los tendones",
        "incorrectAnswers": [
            "Los ligamentos",
            "Los cartílagos",
            "Los nervios"
        ]
    },
    {
        "id": "q_66",
        "topic": "Nutrición",
        "text": "¿Cuál de estas vitaminas es conocida como la 'vitamina del sol'? - Parte 4",
        "correctAnswer": "Vitamina D",
        "incorrectAnswers": [
            "Vitamina C",
            "Vitamina A",
            "Vitamina B12"
        ]
    },
    {
        "id": "q_67",
        "topic": "Nutrición",
        "text": "¿Qué macronutriente es la principal fuente de energía rápida para el cuerpo? - Parte 4",
        "correctAnswer": "Carbohidratos",
        "incorrectAnswers": [
            "Proteínas",
            "Grasas",
            "Vitaminas"
        ]
    },
    {
        "id": "q_68",
        "topic": "Nutrición",
        "text": "¿Cuál de estos alimentos es una excelente fuente de proteína vegetal? - Parte 4",
        "correctAnswer": "Lentejas",
        "incorrectAnswers": [
            "Manzanas",
            "Arroz blanco",
            "Lechuga"
        ]
    },
    {
        "id": "q_69",
        "topic": "Nutrición",
        "text": "¿Qué mineral es esencial para la formación de hemoglobina? - Parte 4",
        "correctAnswer": "Hierro",
        "incorrectAnswers": [
            "Calcio",
            "Magnesio",
            "Sodio"
        ]
    },
    {
        "id": "q_70",
        "topic": "Nutrición",
        "text": "¿Qué porcentaje aproximado del cuerpo humano adulto es agua? - Parte 4",
        "correctAnswer": "60%",
        "incorrectAnswers": [
            "20%",
            "40%",
            "80%"
        ]
    },
    {
        "id": "q_71",
        "topic": "Primeros Auxilios",
        "text": "¿Qué significa la sigla RCP? - Parte 4",
        "correctAnswer": "Reanimación Cardiopulmonar",
        "incorrectAnswers": [
            "Respiración Constante Pulmonar",
            "Reacción Cardíaca Positiva",
            "Recuperación Celular Primaria"
        ]
    },
    {
        "id": "q_72",
        "topic": "Primeros Auxilios",
        "text": "¿Qué se debe hacer primero en caso de una quemadura leve? - Parte 4",
        "correctAnswer": "Enfriar con agua corriente",
        "incorrectAnswers": [
            "Aplicar hielo directamente",
            "Poner mantequilla",
            "Reventar las ampollas"
        ]
    },
    {
        "id": "q_73",
        "topic": "Primeros Auxilios",
        "text": "¿Qué hacer en caso de atragantamiento (víctima consciente)? - Parte 4",
        "correctAnswer": "Maniobra de Heimlich",
        "incorrectAnswers": [
            "Dar agua rápidamente",
            "Acostar a la persona",
            "Hacer RCP"
        ]
    },
    {
        "id": "q_74",
        "topic": "Primeros Auxilios",
        "text": "¿Qué se debe aplicar a un esguince reciente? - Parte 4",
        "correctAnswer": "Hielo",
        "incorrectAnswers": [
            "Calor intenso",
            "Alcohol",
            "Agua caliente"
        ]
    },
    {
        "id": "q_75",
        "topic": "Primeros Auxilios",
        "text": "¿Cuál es la frecuencia recomendada de compresiones en RCP? - Parte 4",
        "correctAnswer": "100 a 120 por minuto",
        "incorrectAnswers": [
            "60 a 80 por minuto",
            "150 por minuto",
            "50 por minuto"
        ]
    },
    {
        "id": "q_76",
        "topic": "Salud General y Prevención",
        "text": "¿Cuánto es la presión arterial considerada normal/óptima? - Parte 4",
        "correctAnswer": "120/80 mmHg",
        "incorrectAnswers": [
            "140/90 mmHg",
            "100/60 mmHg",
            "160/100 mmHg"
        ]
    },
    {
        "id": "q_77",
        "topic": "Salud General y Prevención",
        "text": "¿Qué enfermedad se caracteriza por altos niveles de azúcar en la sangre? - Parte 4",
        "correctAnswer": "Diabetes",
        "incorrectAnswers": [
            "Hipertensión",
            "Anemia",
            "Asma"
        ]
    },
    {
        "id": "q_78",
        "topic": "Salud General y Prevención",
        "text": "¿Cuál es el principal factor de riesgo para desarrollar cáncer de pulmón? - Parte 4",
        "correctAnswer": "Tabaquismo",
        "incorrectAnswers": [
            "Consumo de azúcar",
            "Falta de ejercicio",
            "Estrés"
        ]
    },
    {
        "id": "q_79",
        "topic": "Salud General y Prevención",
        "text": "¿Qué microorganismo causa la gripe (influenza)? - Parte 4",
        "correctAnswer": "Un virus",
        "incorrectAnswers": [
            "Una bacteria",
            "Un hongo",
            "Un parásito"
        ]
    },
    {
        "id": "q_80",
        "topic": "Salud General y Prevención",
        "text": "¿Cuántas horas de sueño se recomiendan generalmente para un adulto? - Parte 5",
        "correctAnswer": "7 a 9 horas",
        "incorrectAnswers": [
            "4 a 6 horas",
            "10 a 12 horas",
            "Menos de 4 horas"
        ]
    },
    {
        "id": "q_81",
        "topic": "Anatomía",
        "text": "¿Cuál es el órgano más grande del cuerpo humano? - Parte 5",
        "correctAnswer": "La piel",
        "incorrectAnswers": [
            "El hígado",
            "El cerebro",
            "El corazón"
        ]
    },
    {
        "id": "q_82",
        "topic": "Anatomía",
        "text": "¿Cuántos huesos tiene un adulto promedio? - Parte 5",
        "correctAnswer": "206",
        "incorrectAnswers": [
            "300",
            "250",
            "150"
        ]
    },
    {
        "id": "q_83",
        "topic": "Anatomía",
        "text": "¿Qué vaso sanguíneo lleva sangre oxigenada desde el corazón al resto del cuerpo? - Parte 5",
        "correctAnswer": "La arteria aorta",
        "incorrectAnswers": [
            "La vena cava",
            "La vena yugular",
            "La arteria pulmonar"
        ]
    },
    {
        "id": "q_84",
        "topic": "Anatomía",
        "text": "¿Dónde se encuentran los glóbulos rojos principalmente? - Parte 5",
        "correctAnswer": "En la sangre",
        "incorrectAnswers": [
            "En la linfa",
            "En los pulmones",
            "En el cerebro"
        ]
    },
    {
        "id": "q_85",
        "topic": "Anatomía",
        "text": "¿Qué estructura conecta los músculos a los huesos? - Parte 5",
        "correctAnswer": "Los tendones",
        "incorrectAnswers": [
            "Los ligamentos",
            "Los cartílagos",
            "Los nervios"
        ]
    },
    {
        "id": "q_86",
        "topic": "Nutrición",
        "text": "¿Cuál de estas vitaminas es conocida como la 'vitamina del sol'? - Parte 5",
        "correctAnswer": "Vitamina D",
        "incorrectAnswers": [
            "Vitamina C",
            "Vitamina A",
            "Vitamina B12"
        ]
    },
    {
        "id": "q_87",
        "topic": "Nutrición",
        "text": "¿Qué macronutriente es la principal fuente de energía rápida para el cuerpo? - Parte 5",
        "correctAnswer": "Carbohidratos",
        "incorrectAnswers": [
            "Proteínas",
            "Grasas",
            "Vitaminas"
        ]
    },
    {
        "id": "q_88",
        "topic": "Nutrición",
        "text": "¿Cuál de estos alimentos es una excelente fuente de proteína vegetal? - Parte 5",
        "correctAnswer": "Lentejas",
        "incorrectAnswers": [
            "Manzanas",
            "Arroz blanco",
            "Lechuga"
        ]
    },
    {
        "id": "q_89",
        "topic": "Nutrición",
        "text": "¿Qué mineral es esencial para la formación de hemoglobina? - Parte 5",
        "correctAnswer": "Hierro",
        "incorrectAnswers": [
            "Calcio",
            "Magnesio",
            "Sodio"
        ]
    },
    {
        "id": "q_90",
        "topic": "Nutrición",
        "text": "¿Qué porcentaje aproximado del cuerpo humano adulto es agua? - Parte 5",
        "correctAnswer": "60%",
        "incorrectAnswers": [
            "20%",
            "40%",
            "80%"
        ]
    },
    {
        "id": "q_91",
        "topic": "Primeros Auxilios",
        "text": "¿Qué significa la sigla RCP? - Parte 5",
        "correctAnswer": "Reanimación Cardiopulmonar",
        "incorrectAnswers": [
            "Respiración Constante Pulmonar",
            "Reacción Cardíaca Positiva",
            "Recuperación Celular Primaria"
        ]
    },
    {
        "id": "q_92",
        "topic": "Primeros Auxilios",
        "text": "¿Qué se debe hacer primero en caso de una quemadura leve? - Parte 5",
        "correctAnswer": "Enfriar con agua corriente",
        "incorrectAnswers": [
            "Aplicar hielo directamente",
            "Poner mantequilla",
            "Reventar las ampollas"
        ]
    },
    {
        "id": "q_93",
        "topic": "Primeros Auxilios",
        "text": "¿Qué hacer en caso de atragantamiento (víctima consciente)? - Parte 5",
        "correctAnswer": "Maniobra de Heimlich",
        "incorrectAnswers": [
            "Dar agua rápidamente",
            "Acostar a la persona",
            "Hacer RCP"
        ]
    },
    {
        "id": "q_94",
        "topic": "Primeros Auxilios",
        "text": "¿Qué se debe aplicar a un esguince reciente? - Parte 5",
        "correctAnswer": "Hielo",
        "incorrectAnswers": [
            "Calor intenso",
            "Alcohol",
            "Agua caliente"
        ]
    },
    {
        "id": "q_95",
        "topic": "Primeros Auxilios",
        "text": "¿Cuál es la frecuencia recomendada de compresiones en RCP? - Parte 5",
        "correctAnswer": "100 a 120 por minuto",
        "incorrectAnswers": [
            "60 a 80 por minuto",
            "150 por minuto",
            "50 por minuto"
        ]
    },
    {
        "id": "q_96",
        "topic": "Salud General y Prevención",
        "text": "¿Cuánto es la presión arterial considerada normal/óptima? - Parte 5",
        "correctAnswer": "120/80 mmHg",
        "incorrectAnswers": [
            "140/90 mmHg",
            "100/60 mmHg",
            "160/100 mmHg"
        ]
    },
    {
        "id": "q_97",
        "topic": "Salud General y Prevención",
        "text": "¿Qué enfermedad se caracteriza por altos niveles de azúcar en la sangre? - Parte 5",
        "correctAnswer": "Diabetes",
        "incorrectAnswers": [
            "Hipertensión",
            "Anemia",
            "Asma"
        ]
    },
    {
        "id": "q_98",
        "topic": "Salud General y Prevención",
        "text": "¿Cuál es el principal factor de riesgo para desarrollar cáncer de pulmón? - Parte 5",
        "correctAnswer": "Tabaquismo",
        "incorrectAnswers": [
            "Consumo de azúcar",
            "Falta de ejercicio",
            "Estrés"
        ]
    },
    {
        "id": "q_99",
        "topic": "Salud General y Prevención",
        "text": "¿Qué microorganismo causa la gripe (influenza)? - Parte 5",
        "correctAnswer": "Un virus",
        "incorrectAnswers": [
            "Una bacteria",
            "Un hongo",
            "Un parásito"
        ]
    },
    {
        "id": "q_100",
        "topic": "Salud General y Prevención",
        "text": "¿Cuántas horas de sueño se recomiendan generalmente para un adulto? - Parte 6",
        "correctAnswer": "7 a 9 horas",
        "incorrectAnswers": [
            "4 a 6 horas",
            "10 a 12 horas",
            "Menos de 4 horas"
        ]
    }
];

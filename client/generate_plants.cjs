const fs = require('fs');

const plantNamesPrefix = ['Aloe', 'Ficus', 'Rosa', 'Mentha', 'Salvia', 'Lavandula', 'Thymus', 'Rosmarinus', 'Eucalyptus', 'Ocimum'];
const plantNamesSuffix = ['vera', 'benjamina', 'gallica', 'piperita', 'officinalis', 'angustifolia', 'vulgaris', 'globulus', 'basilicum', 'sylvestris'];
const properties = ['Antiinflamatorio', 'Antiséptico', 'Calmante', 'Digestivo', 'Cicatrizante', 'Expectorante', 'Relajante', 'Estimulante'];
const parts = ['Hojas', 'Flores', 'Tallo', 'Raíz', 'Fruto', 'Semillas'];
const diseases = ['Dolor de cabeza', 'Insomnio', 'Indigestión', 'Heridas', 'Resfriado', 'Ansiedad', 'Fiebre', 'Inflamación'];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

const plants = [];

for (let i = 1; i <= 2000; i++) {
    const prefix = getRandomItem(plantNamesPrefix);
    const suffix = getRandomItem(plantNamesSuffix);
    const numProps = Math.floor(Math.random() * 3) + 1;
    const numParts = Math.floor(Math.random() * 2) + 1;
    const numDiseases = Math.floor(Math.random() * 2) + 1;

    const plantProps = [...new Set(Array.from({length: numProps}, () => getRandomItem(properties)))];
    const plantParts = [...new Set(Array.from({length: numParts}, () => getRandomItem(parts)))];
    const plantDiseases = [...new Set(Array.from({length: numDiseases}, () => getRandomItem(diseases)))];

    plants.push({
        id: `planta_${i}`,
        name: `${prefix} ${suffix} ${i}`,
        scientificName: `${prefix} ${suffix}`,
        properties: plantProps,
        partsUsed: plantParts,
        treats: plantDiseases,
        description: `La ${prefix} ${suffix} es conocida por sus propiedades ${plantProps.join(', ').toLowerCase()}.`
    });
}

fs.writeFileSync('plants_db.json', JSON.stringify(plants, null, 2));
console.log('Successfully generated plants_db.json with 2000 plants.');

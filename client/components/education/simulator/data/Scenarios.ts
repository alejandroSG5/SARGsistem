import { Particle } from '../engine/PhysicsEngine';
import { VecMath } from '../engine/Math';

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const SCENARIOS: Record<string, () => Particle[]> = {
    'solar_system': () => {
        return [
            {
                id: generateId(),
                name: 'Estrella Central (Sol)',
                pos: { x: 0, y: 0 },
                vel: { x: 0, y: 0 },
                acc: { x: 0, y: 0 },
                mass: 10000,
                radius: 40,
                color: '#fbbf24',
                isStatic: true,
                temperature: 5500,
                trail: []
            },
            {
                id: generateId(),
                name: 'Planeta Interior',
                pos: { x: 0, y: 200 },
                vel: { x: 5, y: 0 }, // v = sqrt(G*M/r) -> sqrt(0.5*10000/200) = sqrt(25) = 5
                acc: { x: 0, y: 0 },
                mass: 10,
                radius: 6,
                color: '#ef4444',
                isStatic: false,
                temperature: 400,
                trail: []
            },
            {
                id: generateId(),
                name: 'Planeta Habitable',
                pos: { x: 0, y: 400 },
                vel: { x: 3.53, y: 0 }, // sqrt(0.5*10000/400) = 3.535
                acc: { x: 0, y: 0 },
                mass: 50,
                radius: 12,
                color: '#3b82f6',
                isStatic: false,
                temperature: 280,
                trail: []
            },
            {
                id: generateId(),
                name: 'Gigante Gaseoso',
                pos: { x: 0, y: 800 },
                vel: { x: 2.5, y: 0 }, // sqrt(0.5*10000/800) = 2.5
                acc: { x: 0, y: 0 },
                mass: 300,
                radius: 25,
                color: '#fcd34d',
                isStatic: false,
                temperature: 120,
                trail: []
            }
        ];
    },
    'binary_star': () => {
        return [
            {
                id: generateId(),
                name: 'Alfa',
                pos: { x: -150, y: 0 },
                vel: { x: 0, y: 2.5 },
                acc: { x: 0, y: 0 },
                mass: 5000,
                radius: 30,
                color: '#fbbf24',
                isStatic: false,
                temperature: 5000,
                trail: []
            },
            {
                id: generateId(),
                name: 'Beta',
                pos: { x: 150, y: 0 },
                vel: { x: 0, y: -2.5 },
                acc: { x: 0, y: 0 },
                mass: 5000,
                radius: 30,
                color: '#60a5fa', // Blue hot star
                isStatic: false,
                temperature: 8000,
                trail: []
            },
            {
                id: generateId(),
                name: 'Planeta Circumbinario',
                pos: { x: 0, y: 600 },
                vel: { x: 2.88, y: 0 }, // M_total = 10000, r = 600, v = sqrt(0.5*10000/600)
                acc: { x: 0, y: 0 },
                mass: 20,
                radius: 8,
                color: '#a78bfa',
                isStatic: false,
                temperature: 300,
                trail: []
            }
        ];
    },
    'asteroid_field': () => {
        const bodies: Particle[] = [
            {
                id: generateId(),
                name: 'Sol',
                pos: { x: 0, y: 0 },
                vel: { x: 0, y: 0 },
                acc: { x: 0, y: 0 },
                mass: 8000,
                radius: 35,
                color: '#fbbf24',
                isStatic: true,
                temperature: 5000,
                trail: []
            }
        ];
        
        // Cinto de asteroides
        for(let i=0; i<150; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = 300 + Math.random() * 200;
            const speed = Math.sqrt((0.5 * 8000) / r); // Orbital velocity
            
            bodies.push({
                id: generateId(),
                name: `Asteroide ${i}`,
                pos: { x: Math.cos(angle) * r, y: Math.sin(angle) * r },
                // Tangent vector
                vel: { x: -Math.sin(angle) * speed, y: Math.cos(angle) * speed },
                acc: { x: 0, y: 0 },
                mass: Math.random() * 2 + 1,
                radius: Math.random() * 2 + 1,
                color: '#9ca3af',
                isStatic: false,
                temperature: 150,
                trail: []
            });
        }
        return bodies;
    }
};

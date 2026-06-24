import { Vec2, VecMath } from './Math';
import { generateId } from '../data/Scenarios';

export interface Creature {
    id: string;
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
    
    // Genetics
    maxSpeed: number;
    maxForce: number;
    visionRadius: number;
    color: string;
    generation: number;
    
    // State
    health: number; // 0 to 100
    age: number;
}

export interface Food {
    id: string;
    pos: Vec2;
    nutrition: number;
}

export class EvoEngine {
    public creatures: Creature[] = [];
    public foods: Food[] = [];
    public width: number = 800;
    public height: number = 600;

    constructor() {
        this.init();
    }

    public init() {
        this.creatures = [];
        this.foods = [];
        // Spawn initial population
        for (let i = 0; i < 50; i++) {
            this.spawnCreature(
                { x: Math.random() * this.width, y: Math.random() * this.height },
                1
            );
        }
        for (let i = 0; i < 100; i++) {
            this.spawnFood();
        }
    }

    public spawnFood() {
        this.foods.push({
            id: generateId(),
            pos: { x: Math.random() * this.width, y: Math.random() * this.height },
            nutrition: 20
        });
    }

    private spawnCreature(pos: Vec2, generation: number, parent?: Creature) {
        // Base genetics
        let maxSpeed = 2 + Math.random() * 2;
        let maxForce = 0.05 + Math.random() * 0.05;
        let visionRadius = 50 + Math.random() * 50;
        
        // Mutate if parent exists
        if (parent) {
            maxSpeed = Math.max(1, parent.maxSpeed + (Math.random() * 0.4 - 0.2));
            maxForce = Math.max(0.01, parent.maxForce + (Math.random() * 0.02 - 0.01));
            visionRadius = Math.max(20, parent.visionRadius + (Math.random() * 10 - 5));
        }

        // Color based on generation
        const hue = (generation * 40) % 360;
        const color = `hsl(${hue}, 80%, 60%)`;

        this.creatures.push({
            id: generateId(),
            pos: { x: pos.x, y: pos.y },
            vel: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 },
            acc: { x: 0, y: 0 },
            maxSpeed,
            maxForce,
            visionRadius,
            color,
            generation,
            health: 100,
            age: 0
        });
    }

    public step() {
        // Occasionally spawn food
        if (Math.random() < 0.1 && this.foods.length < 150) {
            this.spawnFood();
        }

        const nextCreatures: Creature[] = [];

        for (const c of this.creatures) {
            // Apply behaviors
            const sep = this.separate(c);
            const ali = this.align(c);
            const coh = this.cohesion(c);
            const forage = this.seekFood(c);

            // Weights
            c.acc = VecMath.add(c.acc, VecMath.mult(sep, 1.5));
            c.acc = VecMath.add(c.acc, VecMath.mult(ali, 1.0));
            c.acc = VecMath.add(c.acc, VecMath.mult(coh, 1.0));
            c.acc = VecMath.add(c.acc, VecMath.mult(forage, 2.0)); // High priority to eat

            // Physics
            c.vel = VecMath.add(c.vel, c.acc);
            
            // Limit speed
            const speedSq = VecMath.magSq(c.vel);
            if (speedSq > c.maxSpeed * c.maxSpeed) {
                c.vel = VecMath.mult(VecMath.normalize(c.vel), c.maxSpeed);
            }

            c.pos = VecMath.add(c.pos, c.vel);
            c.acc = { x: 0, y: 0 }; // Reset acceleration

            // Wrap around edges
            if (c.pos.x < 0) c.pos.x = this.width;
            if (c.pos.y < 0) c.pos.y = this.height;
            if (c.pos.x > this.width) c.pos.x = 0;
            if (c.pos.y > this.height) c.pos.y = 0;

            // Biology mechanics
            c.health -= 0.1 + (c.maxSpeed * 0.05); // Faster creatures burn more energy
            c.age += 1;

            if (c.health > 0) {
                nextCreatures.push(c);
                
                // Reproduction
                if (c.health > 150) {
                    c.health -= 80; // Cost of reproduction
                    this.spawnCreature({ x: c.pos.x + 10, y: c.pos.y + 10 }, c.generation + 1, c);
                }
            }
        }

        this.creatures = nextCreatures;
    }

    private seekFood(c: Creature): Vec2 {
        let closestDist = Infinity;
        let closestFoodIdx = -1;

        for (let i = 0; i < this.foods.length; i++) {
            const dSq = VecMath.distanceSq(c.pos, this.foods[i].pos);
            if (dSq < closestDist && dSq < c.visionRadius * c.visionRadius) {
                closestDist = dSq;
                closestFoodIdx = i;
            }
        }

        if (closestFoodIdx !== -1) {
            const food = this.foods[closestFoodIdx];
            
            // Eat if close enough
            if (closestDist < 100) { // 10 pixels radius
                c.health += food.nutrition;
                this.foods.splice(closestFoodIdx, 1);
                return { x: 0, y: 0 };
            }

            // Steer towards food
            const desired = VecMath.sub(food.pos, c.pos);
            const dNorm = VecMath.normalize(desired);
            const dMag = VecMath.mult(dNorm, c.maxSpeed);
            const steer = VecMath.sub(dMag, c.vel);
            
            // Limit force
            if (VecMath.magSq(steer) > c.maxForce * c.maxForce) {
                return VecMath.mult(VecMath.normalize(steer), c.maxForce);
            }
            return steer;
        }

        return { x: 0, y: 0 };
    }

    private separate(c: Creature): Vec2 {
        const desiredSeparationSq = 400; // 20 pixels
        let steer = { x: 0, y: 0 };
        let count = 0;

        for (const other of this.creatures) {
            const dSq = VecMath.distanceSq(c.pos, other.pos);
            if (dSq > 0 && dSq < desiredSeparationSq) {
                let diff = VecMath.sub(c.pos, other.pos);
                diff = VecMath.normalize(diff);
                diff = VecMath.div(diff, Math.sqrt(dSq)); // Weight by distance
                steer = VecMath.add(steer, diff);
                count++;
            }
        }

        if (count > 0) {
            steer = VecMath.div(steer, count);
            if (VecMath.magSq(steer) > 0) {
                steer = VecMath.normalize(steer);
                steer = VecMath.mult(steer, c.maxSpeed);
                steer = VecMath.sub(steer, c.vel);
                if (VecMath.magSq(steer) > c.maxForce * c.maxForce) {
                    steer = VecMath.mult(VecMath.normalize(steer), c.maxForce);
                }
            }
        }
        return steer;
    }

    private align(c: Creature): Vec2 {
        let sum = { x: 0, y: 0 };
        let count = 0;
        const neighborDistSq = 2500; // 50 pixels

        for (const other of this.creatures) {
            const dSq = VecMath.distanceSq(c.pos, other.pos);
            if (dSq > 0 && dSq < neighborDistSq) {
                sum = VecMath.add(sum, other.vel);
                count++;
            }
        }

        if (count > 0) {
            sum = VecMath.div(sum, count);
            sum = VecMath.normalize(sum);
            sum = VecMath.mult(sum, c.maxSpeed);
            let steer = VecMath.sub(sum, c.vel);
            if (VecMath.magSq(steer) > c.maxForce * c.maxForce) {
                steer = VecMath.mult(VecMath.normalize(steer), c.maxForce);
            }
            return steer;
        }
        return { x: 0, y: 0 };
    }

    private cohesion(c: Creature): Vec2 {
        let sum = { x: 0, y: 0 };
        let count = 0;
        const neighborDistSq = 2500;

        for (const other of this.creatures) {
            const dSq = VecMath.distanceSq(c.pos, other.pos);
            if (dSq > 0 && dSq < neighborDistSq) {
                sum = VecMath.add(sum, other.pos);
                count++;
            }
        }

        if (count > 0) {
            sum = VecMath.div(sum, count);
            return this.seek(sum, c);
        }
        return { x: 0, y: 0 };
    }

    private seek(target: Vec2, c: Creature): Vec2 {
        const desired = VecMath.sub(target, c.pos);
        const dNorm = VecMath.normalize(desired);
        const dMag = VecMath.mult(dNorm, c.maxSpeed);
        const steer = VecMath.sub(dMag, c.vel);
        
        if (VecMath.magSq(steer) > c.maxForce * c.maxForce) {
            return VecMath.mult(VecMath.normalize(steer), c.maxForce);
        }
        return steer;
    }

    public render(ctx: CanvasRenderingContext2D) {
        // Draw food
        ctx.fillStyle = '#10b981'; // Emerald
        for (const f of this.foods) {
            ctx.beginPath();
            ctx.arc(f.pos.x, f.pos.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw creatures
        for (const c of this.creatures) {
            const angle = Math.atan2(c.vel.y, c.vel.x);
            
            ctx.save();
            ctx.translate(c.pos.x, c.pos.y);
            ctx.rotate(angle);
            
            ctx.fillStyle = c.color;
            ctx.beginPath();
            ctx.moveTo(8, 0); // Nose
            ctx.lineTo(-4, 4); // Bottom Wing
            ctx.lineTo(-4, -4); // Top Wing
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }
}

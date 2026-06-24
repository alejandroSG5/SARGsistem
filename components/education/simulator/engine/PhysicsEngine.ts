import { Vec2, VecMath } from './Math';

export interface Particle {
    id: string;
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
    mass: number;
    radius: number;
    color: string;
    isStatic: boolean;
    temperature: number; // For visual glow and thermodynamics
    trail: Vec2[];
    name?: string;
}

export class PhysicsEngine {
    public G: number = 0.5;
    public softeningSq: number = 0.1; // Prevent infinite gravity at dist=0
    public collisionRestitution: number = 0.8; // Elasticity
    public mergeThreshold: number = 0.8; // Ratio of overlap to trigger merge

    // Advanced RK4 Integration state
    private computeAcceleration(bodies: Particle[], index: number, positions: Vec2[]): Vec2 {
        let ax = 0;
        let ay = 0;
        const bodyA = bodies[index];
        const posA = positions[index];

        for (let j = 0; j < bodies.length; j++) {
            if (index === j) continue;
            const bodyB = bodies[j];
            const posB = positions[j];

            const dx = posB.x - posA.x;
            const dy = posB.y - posA.y;
            const distSq = dx * dx + dy * dy + this.softeningSq;
            const dist = Math.sqrt(distSq);

            const force = (this.G * bodyB.mass) / distSq;
            ax += force * (dx / dist);
            ay += force * (dy / dist);
        }
        return { x: ax, y: ay };
    }

    // Step the simulation by dt
    public step(bodies: Particle[], dt: number, useRK4: boolean = false): Particle[] {
        if (useRK4) {
            return this.stepRK4(bodies, dt);
        } else {
            return this.stepSymplecticEuler(bodies, dt);
        }
    }

    // Fast, energy-preserving enough for most games
    private stepSymplecticEuler(bodies: Particle[], dt: number): Particle[] {
        // Compute forces
        for (let i = 0; i < bodies.length; i++) {
            if (bodies[i].isStatic) {
                bodies[i].acc = { x: 0, y: 0 };
                continue;
            }
            bodies[i].acc = this.computeAcceleration(bodies, i, bodies.map(b => b.pos));
        }

        // Apply velocities and positions
        for (let i = 0; i < bodies.length; i++) {
            if (bodies[i].isStatic) continue;
            
            bodies[i].vel.x += bodies[i].acc.x * dt;
            bodies[i].vel.y += bodies[i].acc.y * dt;
            
            bodies[i].pos.x += bodies[i].vel.x * dt;
            bodies[i].pos.y += bodies[i].vel.y * dt;
        }

        this.handleCollisions(bodies);
        return bodies;
    }

    // High precision Runge-Kutta 4th Order
    private stepRK4(bodies: Particle[], dt: number): Particle[] {
        const n = bodies.length;
        
        // k1
        const pos0 = bodies.map(b => b.pos);
        const vel0 = bodies.map(b => b.vel);
        const a1 = bodies.map((_, i) => this.computeAcceleration(bodies, i, pos0));
        const v1 = vel0;

        // k2
        const pos2 = bodies.map((b, i) => VecMath.add(pos0[i], VecMath.mult(v1[i], dt * 0.5)));
        const vel2 = bodies.map((b, i) => VecMath.add(vel0[i], VecMath.mult(a1[i], dt * 0.5)));
        const a2 = bodies.map((_, i) => this.computeAcceleration(bodies, i, pos2));
        const v2 = vel2;

        // k3
        const pos3 = bodies.map((b, i) => VecMath.add(pos0[i], VecMath.mult(v2[i], dt * 0.5)));
        const vel3 = bodies.map((b, i) => VecMath.add(vel0[i], VecMath.mult(a2[i], dt * 0.5)));
        const a3 = bodies.map((_, i) => this.computeAcceleration(bodies, i, pos3));
        const v3 = vel3;

        // k4
        const pos4 = bodies.map((b, i) => VecMath.add(pos0[i], VecMath.mult(v3[i], dt)));
        const vel4 = bodies.map((b, i) => VecMath.add(vel0[i], VecMath.mult(a3[i], dt)));
        const a4 = bodies.map((_, i) => this.computeAcceleration(bodies, i, pos4));
        const v4 = vel4;

        // Final accumulation
        for (let i = 0; i < n; i++) {
            if (bodies[i].isStatic) continue;

            // v = v0 + (a1 + 2*a2 + 2*a3 + a4) * dt / 6
            const aSumX = a1[i].x + 2 * a2[i].x + 2 * a3[i].x + a4[i].x;
            const aSumY = a1[i].y + 2 * a2[i].y + 2 * a3[i].y + a4[i].y;
            
            bodies[i].vel.x += (aSumX * dt) / 6;
            bodies[i].vel.y += (aSumY * dt) / 6;

            // x = x0 + (v1 + 2*v2 + 2*v3 + v4) * dt / 6
            const vSumX = v1[i].x + 2 * v2[i].x + 2 * v3[i].x + v4[i].x;
            const vSumY = v1[i].y + 2 * v2[i].y + 2 * v3[i].y + v4[i].y;
            
            bodies[i].pos.x += (vSumX * dt) / 6;
            bodies[i].pos.y += (vSumY * dt) / 6;
        }

        this.handleCollisions(bodies);
        return bodies;
    }

    private handleCollisions(bodies: Particle[]) {
        const toRemove = new Set<string>();

        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const a = bodies[i];
                const b = bodies[j];
                if (toRemove.has(a.id) || toRemove.has(b.id)) continue;

                const dx = b.pos.x - a.pos.x;
                const dy = b.pos.y - a.pos.y;
                const distSq = dx * dx + dy * dy;
                const minDist = a.radius + b.radius;

                if (distSq < minDist * minDist) {
                    const dist = Math.sqrt(distSq);
                    // Determine if we merge or bounce
                    const overlap = minDist - dist;
                    if (overlap > minDist * this.mergeThreshold) {
                        // Merge!
                        this.mergeBodies(a, b, toRemove);
                    } else {
                        // Bounce (Elastic Collision)
                        this.resolveElasticCollision(a, b, dx, dy, dist);
                    }
                }
            }
        }

        // Clean up merged bodies
        if (toRemove.size > 0) {
            for (let i = bodies.length - 1; i >= 0; i--) {
                if (toRemove.has(bodies[i].id)) {
                    bodies.splice(i, 1);
                }
            }
        }
    }

    private mergeBodies(a: Particle, b: Particle, toRemove: Set<string>) {
        const totalMass = a.mass + b.mass;
        const newVx = (a.vel.x * a.mass + b.vel.x * b.mass) / totalMass;
        const newVy = (a.vel.y * a.mass + b.vel.y * b.mass) / totalMass;
        
        // Conservar momento y combinar propiedades en el objeto más masivo
        const [survivor, absorbed] = a.mass >= b.mass ? [a, b] : [b, a];
        
        survivor.mass = totalMass;
        // Volumen V = 4/3 * pi * r^3. r = cbrt(V / (4/3 * pi)). Asumiendo densidad constante.
        survivor.radius = Math.pow(Math.pow(a.radius, 3) + Math.pow(b.radius, 3), 1/3);
        
        if (!survivor.isStatic) {
            survivor.vel = { x: newVx, y: newVy };
        }
        
        // La temperatura aumenta por el impacto inelástico (energía cinética perdida -> calor)
        survivor.temperature += absorbed.mass * 0.1; 

        toRemove.add(absorbed.id);
    }

    private resolveElasticCollision(a: Particle, b: Particle, dx: number, dy: number, dist: number) {
        if (dist === 0) return;
        const nx = dx / dist;
        const ny = dy / dist;

        // Separación posicional para evitar que se queden pegados (penetration resolution)
        const overlap = (a.radius + b.radius - dist) * 0.5;
        if (!a.isStatic) {
            a.pos.x -= nx * overlap;
            a.pos.y -= ny * overlap;
        }
        if (!b.isStatic) {
            b.pos.x += nx * overlap;
            b.pos.y += ny * overlap;
        }

        // Velocidad relativa
        const dvx = b.vel.x - a.vel.x;
        const dvy = b.vel.y - a.vel.y;
        
        const velAlongNormal = dvx * nx + dvy * ny;
        if (velAlongNormal > 0) return; // Se están separando

        const e = this.collisionRestitution;
        let j = -(1 + e) * velAlongNormal;
        
        const totalInvMass = (a.isStatic ? 0 : 1 / a.mass) + (b.isStatic ? 0 : 1 / b.mass);
        if (totalInvMass === 0) return;
        
        j /= totalInvMass;

        const impulseX = j * nx;
        const impulseY = j * ny;

        if (!a.isStatic) {
            a.vel.x -= impulseX / a.mass;
            a.vel.y -= impulseY / a.mass;
        }
        if (!b.isStatic) {
            b.vel.x += impulseX / b.mass;
            b.vel.y += impulseY / b.mass;
        }
    }
}

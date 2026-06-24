import { Vec2, VecMath } from './Math';

export enum OpticsObjType {
    MIRROR = 0,
    GLASS_PRISM = 1,
    ABSORBER = 2
}

export interface OpticsObject {
    id: string;
    type: OpticsObjType;
    p1: Vec2;
    p2: Vec2;
    ior: number; // Index of Refraction (e.g. 1.5 for glass)
}

export interface LaserSource {
    id: string;
    pos: Vec2;
    dir: Vec2;
    color: string;
}

export interface RaySegment {
    start: Vec2;
    end: Vec2;
    color: string;
    intensity: number;
}

export class OpticsEngine {
    public objects: OpticsObject[] = [];
    public lasers: LaserSource[] = [];
    public MAX_BOUNCES = 20;

    public step(): RaySegment[] {
        const segments: RaySegment[] = [];

        for (const laser of this.lasers) {
            this.traceRay(laser.pos, laser.dir, laser.color, 1.0, 0, segments);
        }

        return segments;
    }

    private traceRay(start: Vec2, dir: Vec2, color: string, intensity: number, bounces: number, segments: RaySegment[]) {
        if (bounces > this.MAX_BOUNCES || intensity < 0.01) return;

        // Find closest intersection
        let closestT = Infinity;
        let closestObj: OpticsObject | null = null;
        let closestHit: Vec2 | null = null;
        let closestNormal: Vec2 | null = null;

        for (const obj of this.objects) {
            const hit = this.intersectLine(start, dir, obj.p1, obj.p2);
            if (hit && hit.t > 0.001 && hit.t < closestT) {
                closestT = hit.t;
                closestObj = obj;
                closestHit = hit.pos;
                closestNormal = hit.normal;
            }
        }

        if (closestHit && closestObj && closestNormal) {
            // Add segment to hit
            segments.push({ start, end: closestHit, color, intensity });

            if (closestObj.type === OpticsObjType.ABSORBER) {
                return; // Ray dies
            }

            if (closestObj.type === OpticsObjType.MIRROR) {
                // R = D - 2(D·N)N
                const dot = VecMath.dot(dir, closestNormal);
                const rDir = VecMath.sub(dir, VecMath.mult(closestNormal, 2 * dot));
                this.traceRay(closestHit, rDir, color, intensity * 0.95, bounces + 1, segments);
            }

            if (closestObj.type === OpticsObjType.GLASS_PRISM) {
                // Snell's Law
                let n1 = 1.0; // Air
                let n2 = closestObj.ior;
                let normal = closestNormal;

                let cosI = -VecMath.dot(dir, normal);
                
                // If ray is inside the object, flip normal and indices
                if (cosI < 0) {
                    cosI = -cosI;
                    normal = { x: -normal.x, y: -normal.y };
                    n1 = closestObj.ior;
                    n2 = 1.0;
                }

                const eta = n1 / n2;
                const sinT2 = eta * eta * (1.0 - cosI * cosI);

                if (sinT2 > 1.0) {
                    // Total Internal Reflection
                    const rDir = VecMath.sub(dir, VecMath.mult(normal, 2 * -cosI));
                    this.traceRay(closestHit, rDir, color, intensity * 0.9, bounces + 1, segments);
                } else {
                    // Refraction: T = eta * D + (eta * cosI - sqrt(1.0 - sinT2)) * N
                    const cosT = Math.sqrt(1.0 - sinT2);
                    const tDirX = eta * dir.x + (eta * cosI - cosT) * normal.x;
                    const tDirY = eta * dir.y + (eta * cosI - cosT) * normal.y;
                    const refDir = VecMath.normalize({ x: tDirX, y: tDirY });

                    // Simulate basic chromatic dispersion for white light (split colors if white)
                    if (color === '#ffffff' && bounces === 0) {
                        // Split into RGB
                        this.traceRay(closestHit, this.disperse(refDir, normal, 0.02), '#ff0000', intensity * 0.33, bounces + 1, segments);
                        this.traceRay(closestHit, refDir, '#00ff00', intensity * 0.33, bounces + 1, segments);
                        this.traceRay(closestHit, this.disperse(refDir, normal, -0.02), '#0000ff', intensity * 0.33, bounces + 1, segments);
                    } else {
                        this.traceRay(closestHit, refDir, color, intensity * 0.9, bounces + 1, segments);
                    }
                    
                    // Partial Reflection (Fresnel effect simplified)
                    const rDir = VecMath.sub(dir, VecMath.mult(normal, 2 * -cosI));
                    this.traceRay(closestHit, rDir, color, intensity * 0.1, bounces + 1, segments);
                }
            }
        } else {
            // No hit, ray goes to infinity (screen edge)
            const end = VecMath.add(start, VecMath.mult(dir, 2000));
            segments.push({ start, end, color, intensity });
        }
    }

    private disperse(dir: Vec2, normal: Vec2, amount: number): Vec2 {
        const angle = Math.atan2(dir.y, dir.x) + amount;
        return { x: Math.cos(angle), y: Math.sin(angle) };
    }

    private intersectLine(p: Vec2, r: Vec2, q: Vec2, s2: Vec2): { t: number, pos: Vec2, normal: Vec2 } | null {
        const s = VecMath.sub(s2, q);
        const rxs = r.x * s.y - r.y * s.x;
        
        if (Math.abs(rxs) < 1e-8) return null; // Parallel

        const t = ((q.x - p.x) * s.y - (q.y - p.y) * s.x) / rxs;
        const u = ((q.x - p.x) * r.y - (q.y - p.y) * r.x) / rxs;

        if (t >= 0 && u >= 0 && u <= 1) {
            const hitPos = VecMath.add(p, VecMath.mult(r, t));
            // Calculate normal (perpendicular to line segment q->s2)
            let normal = VecMath.normalize({ x: -s.y, y: s.x });
            
            // Ensure normal faces the incoming ray
            if (VecMath.dot(r, normal) > 0) {
                normal = { x: -normal.x, y: -normal.y };
            }
            
            return { t, pos: hitPos, normal };
        }

        return null;
    }
}

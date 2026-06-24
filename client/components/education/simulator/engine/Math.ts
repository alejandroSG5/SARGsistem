export interface Vec2 {
    x: number;
    y: number;
}

export const VecMath = {
    add: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y }),
    sub: (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y }),
    mult: (a: Vec2, scalar: number): Vec2 => ({ x: a.x * scalar, y: a.y * scalar }),
    div: (a: Vec2, scalar: number): Vec2 => ({ x: a.x / scalar, y: a.y / scalar }),
    magSq: (a: Vec2): number => a.x * a.x + a.y * a.y,
    mag: (a: Vec2): number => Math.sqrt(a.x * a.x + a.y * a.y),
    normalize: (a: Vec2): Vec2 => {
        const m = VecMath.mag(a);
        return m === 0 ? { x: 0, y: 0 } : VecMath.div(a, m);
    },
    distanceSq: (a: Vec2, b: Vec2): number => {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        return dx * dx + dy * dy;
    },
    distance: (a: Vec2, b: Vec2): number => Math.sqrt(VecMath.distanceSq(a, b)),
    dot: (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y,
    clone: (a: Vec2): Vec2 => ({ x: a.x, y: a.y })
};

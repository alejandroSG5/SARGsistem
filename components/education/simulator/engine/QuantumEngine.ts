import { Vec2 } from './Math';

export class QuantumEngine {
    public width: number;
    public height: number;
    private u: Float32Array;
    private u_prev: Float32Array;
    private u_next: Float32Array;
    public walls: Uint8Array;
    
    public sources: { x: number, y: number, frequency: number, phase: number }[] = [];
    public time: number = 0;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        const size = width * height;
        this.u = new Float32Array(size);
        this.u_prev = new Float32Array(size);
        this.u_next = new Float32Array(size);
        this.walls = new Uint8Array(size);
    }

    public getIndex(x: number, y: number): number {
        return y * this.width + x;
    }

    public addWall(x: number, y: number, radius: number) {
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx*dx + dy*dy <= radius*radius) {
                    const nx = x + dx;
                    const ny = y + dy;
                    if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                        this.walls[this.getIndex(nx, ny)] = 1;
                        this.u[this.getIndex(nx, ny)] = 0;
                        this.u_prev[this.getIndex(nx, ny)] = 0;
                    }
                }
            }
        }
    }

    public clearWalls() {
        this.walls.fill(0);
    }

    public addSource(x: number, y: number, frequency: number) {
        this.sources.push({ x, y, frequency, phase: 0 });
    }

    public step() {
        this.time += 0.05;
        const damping = 0.999; // Slight energy loss
        const c2 = 0.5; // Wave speed squared (CFL condition < 0.5 for 2D)

        for (let y = 1; y < this.height - 1; y++) {
            for (let x = 1; x < this.width - 1; x++) {
                const i = this.getIndex(x, y);
                if (this.walls[i] === 1) {
                    this.u_next[i] = 0;
                    continue;
                }

                const u_center = this.u[i];
                const u_top = this.u[i - this.width];
                const u_bottom = this.u[i + this.width];
                const u_left = this.u[i - 1];
                const u_right = this.u[i + 1];

                const laplacian = u_top + u_bottom + u_left + u_right - 4 * u_center;
                
                this.u_next[i] = (2 * u_center - this.u_prev[i] + c2 * laplacian) * damping;
            }
        }

        // Apply sources
        for (const s of this.sources) {
            if (s.x >= 0 && s.x < this.width && s.y >= 0 && s.y < this.height) {
                const i = this.getIndex(s.x, s.y);
                this.u_next[i] = Math.sin(this.time * s.frequency) * 2.0; // High amplitude
            }
        }

        // Swap buffers
        const temp = this.u_prev;
        this.u_prev = this.u;
        this.u = this.u_next;
        this.u_next = temp;
    }

    public render(ctx: CanvasRenderingContext2D, cellSize: number) {
        const imgData = ctx.getImageData(0, 0, this.width * cellSize, this.height * cellSize);
        const data = imgData.data;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = this.getIndex(x, y);
                const isWall = this.walls[idx] === 1;
                
                let r=0, g=0, b=0;

                if (isWall) {
                    r = 100; g = 116; b = 139; // Slate-500
                } else {
                    const val = this.u[idx];
                    // Map wave amplitude to color (positive = cyan, negative = purple)
                    if (val > 0) {
                        const intensity = Math.min(255, Math.floor(val * 128));
                        r = 0; g = intensity; b = intensity;
                    } else {
                        const intensity = Math.min(255, Math.floor(-val * 128));
                        r = intensity; g = 0; b = intensity;
                    }
                }

                for (let dy = 0; dy < cellSize; dy++) {
                    for (let dx = 0; dx < cellSize; dx++) {
                        const px = (y * cellSize + dy) * (this.width * cellSize) * 4 + (x * cellSize + dx) * 4;
                        data[px] = r;
                        data[px+1] = g;
                        data[px+2] = b;
                        data[px+3] = 255;
                    }
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);

        // Draw sources as bright dots
        ctx.fillStyle = '#ffffff';
        for (const s of this.sources) {
            ctx.beginPath();
            ctx.arc(s.x * cellSize + cellSize/2, s.y * cellSize + cellSize/2, 4, 0, Math.PI*2);
            ctx.fill();
        }
    }
}

import { Particle } from './PhysicsEngine';
import { Vec2 } from './Math';

export class Renderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    
    // Camera
    public offset: Vec2 = { x: 0, y: 0 };
    public scale: number = 1.0;
    
    public showTrails: boolean = true;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error("Could not initialize 2D context");
        this.ctx = context;
    }

    public resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;
    }

    // World to Screen coordinates
    public toScreen(worldPos: Vec2): Vec2 {
        return {
            x: (worldPos.x + this.offset.x) * this.scale + this.canvas.width / 2,
            y: (worldPos.y + this.offset.y) * this.scale + this.canvas.height / 2
        };
    }

    // Screen to World coordinates
    public toWorld(screenPos: Vec2): Vec2 {
        return {
            x: (screenPos.x - this.canvas.width / 2) / this.scale - this.offset.x,
            y: (screenPos.y - this.canvas.height / 2) / this.scale - this.offset.y
        };
    }

    public render(bodies: Particle[], isDragging: boolean, dragStart: Vec2, dragCurrent: Vec2) {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear background
        this.ctx.fillStyle = '#050814';
        this.ctx.fillRect(0, 0, width, height);

        // Draw deep space grid
        this.drawGrid();

        // Draw Trails
        if (this.showTrails) {
            this.drawTrails(bodies);
        }

        // Draw Drag Vector (Launcher)
        if (isDragging) {
            this.drawLauncher(dragStart, dragCurrent);
        }

        // Draw Bodies
        for (const body of bodies) {
            this.drawBody(body);
        }
    }

    private drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;
        
        // Base grid size in world units
        const gridSize = 100 * this.scale;
        
        // Offset mapping to screen
        const offsetX = (this.offset.x * this.scale + this.canvas.width / 2) % gridSize;
        const offsetY = (this.offset.y * this.scale + this.canvas.height / 2) % gridSize;

        this.ctx.beginPath();
        for (let x = offsetX; x < this.canvas.width; x += gridSize) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        for (let y = offsetY; y < this.canvas.height; y += gridSize) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        this.ctx.stroke();
    }

    private drawTrails(bodies: Particle[]) {
        for (const body of bodies) {
            if (body.trail.length < 2) continue;
            
            this.ctx.beginPath();
            const startScreen = this.toScreen(body.trail[0]);
            this.ctx.moveTo(startScreen.x, startScreen.y);
            
            for (let i = 1; i < body.trail.length; i++) {
                const screenPos = this.toScreen(body.trail[i]);
                this.ctx.lineTo(screenPos.x, screenPos.y);
            }
            
            this.ctx.strokeStyle = body.color;
            this.ctx.globalAlpha = 0.5;
            this.ctx.lineWidth = 1.5 * this.scale;
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
        }
    }

    private drawLauncher(dragStart: Vec2, dragCurrent: Vec2) {
        const start = this.toScreen(dragStart);
        const current = this.toScreen(dragCurrent);

        this.ctx.beginPath();
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(current.x, current.y);
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.setLineDash([5, 5]);
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Ghost planet indicator
        this.ctx.beginPath();
        this.ctx.arc(start.x, start.y, 8 * this.scale, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(96, 165, 250, 0.8)';
        this.ctx.fill();
    }

    private drawBody(body: Particle) {
        const pos = this.toScreen(body.pos);
        const screenRadius = Math.max(1, body.radius * this.scale);

        // Don't draw if outside screen view by a large margin
        if (pos.x < -screenRadius * 10 || pos.x > this.canvas.width + screenRadius * 10 ||
            pos.y < -screenRadius * 10 || pos.y > this.canvas.height + screenRadius * 10) {
            return;
        }

        // Star/Sun rendering (Static or High Temp)
        if (body.isStatic || body.temperature > 1000) {
            const gradient = this.ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, screenRadius * 4);
            gradient.addColorStop(0, body.color);
            gradient.addColorStop(0.3, body.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, screenRadius * 4, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            
            // Add bloom blend mode
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fill();
            this.ctx.globalCompositeOperation = 'source-over';
        } else {
            // Normal planet rendering
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, screenRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = body.color;
            this.ctx.fill();

            // Shiny specular highlight
            if (screenRadius > 2) {
                this.ctx.beginPath();
                this.ctx.arc(pos.x - screenRadius * 0.3, pos.y - screenRadius * 0.3, screenRadius * 0.3, 0, Math.PI * 2);
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                this.ctx.fill();
            }
        }
    }
}

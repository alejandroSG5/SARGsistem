export enum ElementType {
    EMPTY = 0,
    WALL = 1,
    SAND = 2,
    WATER = 3,
    WOOD = 4,
    FIRE = 5,
    LAVA = 6,
    ACID = 7,
    GAS = 8,
    STEAM = 9,
    STONE = 10,
    ASH = 11,
    OIL = 12
}

export const ELEMENT_PROPS: Record<ElementType, { color: string, density: number, state: 'solid' | 'liquid' | 'gas', flammability: number }> = {
    [ElementType.EMPTY]: { color: '#000000', density: 0, state: 'gas', flammability: 0 },
    [ElementType.WALL]:  { color: '#6b7280', density: 100, state: 'solid', flammability: 0 },
    [ElementType.SAND]:  { color: '#fcd34d', density: 1.5, state: 'solid', flammability: 0 },
    [ElementType.WATER]: { color: '#3b82f6', density: 1.0, state: 'liquid', flammability: 0 },
    [ElementType.WOOD]:  { color: '#8b5cf6', density: 0.8, state: 'solid', flammability: 0.8 },
    [ElementType.FIRE]:  { color: '#ef4444', density: 0.1, state: 'gas', flammability: 0 },
    [ElementType.LAVA]:  { color: '#ea580c', density: 2.0, state: 'liquid', flammability: 0 },
    [ElementType.ACID]:  { color: '#84cc16', density: 1.2, state: 'liquid', flammability: 0.1 },
    [ElementType.GAS]:   { color: '#a8a29e', density: 0.2, state: 'gas', flammability: 0.9 },
    [ElementType.STEAM]: { color: '#e5e7eb', density: 0.3, state: 'gas', flammability: 0 },
    [ElementType.STONE]: { color: '#4b5563', density: 3.0, state: 'solid', flammability: 0 },
    [ElementType.ASH]:   { color: '#374151', density: 0.6, state: 'solid', flammability: 0 },
    [ElementType.OIL]:   { color: '#111827', density: 0.9, state: 'liquid', flammability: 0.95 }
};

export class AutomataEngine {
    public width: number;
    public height: number;
    public grid: Uint8Array; // Stores ElementType
    private nextGrid: Uint8Array;
    
    // To minimize GC
    private dirty: boolean = true;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.grid = new Uint8Array(width * height);
        this.nextGrid = new Uint8Array(width * height);
    }

    public getIndex(x: number, y: number): number {
        return y * this.width + x;
    }

    public set(x: number, y: number, type: ElementType) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[this.getIndex(x, y)] = type;
            this.dirty = true;
        }
    }

    public get(x: number, y: number): ElementType {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.grid[this.getIndex(x, y)];
        }
        return ElementType.WALL; // Out of bounds is wall
    }

    private swap(idx1: number, idx2: number) {
        const tmp = this.nextGrid[idx1];
        this.nextGrid[idx1] = this.nextGrid[idx2];
        this.nextGrid[idx2] = tmp;
    }

    public step() {
        if (!this.dirty) return;
        
        // Copy current to next
        this.nextGrid.set(this.grid);

        // Process from bottom to top, randomly alternating left/right scan for natural flow
        for (let y = this.height - 1; y >= 0; y--) {
            const dir = Math.random() > 0.5 ? 1 : -1;
            const startX = dir === 1 ? 0 : this.width - 1;
            const endX = dir === 1 ? this.width : -1;

            for (let x = startX; x !== endX; x += dir) {
                const idx = this.getIndex(x, y);
                const type = this.grid[idx];

                if (type === ElementType.EMPTY || type === ElementType.WALL) continue;

                const props = ELEMENT_PROPS[type as ElementType];
                
                // Advanced Thermodynamics & Chemistry rules
                this.handleReactions(x, y, type as ElementType, idx);

                // Movement physics (read from updated nextGrid to avoid double moves)
                const currentType = this.nextGrid[idx];
                if (currentType === ElementType.EMPTY || currentType === ElementType.WALL) continue;
                
                const curProps = ELEMENT_PROPS[currentType as ElementType];
                
                if (curProps.state === 'solid' && type !== ElementType.WOOD && type !== ElementType.STONE && type !== ElementType.ASH) {
                    // Falling solids (Sand)
                    if (this.canMove(x, y + 1, curProps.density)) {
                        this.swap(idx, this.getIndex(x, y + 1));
                    } else if (this.canMove(x - 1, y + 1, curProps.density)) {
                        this.swap(idx, this.getIndex(x - 1, y + 1));
                    } else if (this.canMove(x + 1, y + 1, curProps.density)) {
                        this.swap(idx, this.getIndex(x + 1, y + 1));
                    }
                } 
                else if (curProps.state === 'liquid') {
                    // Liquids flow down, then down-diagonal, then horizontal
                    if (this.canMove(x, y + 1, curProps.density)) {
                        this.swap(idx, this.getIndex(x, y + 1));
                    } else if (this.canMove(x - dir, y + 1, curProps.density)) {
                        this.swap(idx, this.getIndex(x - dir, y + 1));
                    } else if (this.canMove(x + dir, y + 1, curProps.density)) {
                        this.swap(idx, this.getIndex(x + dir, y + 1));
                    } else if (this.canMove(x + dir, y, curProps.density)) {
                        this.swap(idx, this.getIndex(x + dir, y));
                    } else if (this.canMove(x - dir, y, curProps.density)) {
                        this.swap(idx, this.getIndex(x - dir, y));
                    }
                }
                else if (curProps.state === 'gas') {
                    // Gases flow up, then up-diagonal, then horizontal
                    // Fire has a short lifespan
                    if (currentType === ElementType.FIRE && Math.random() < 0.1) {
                        this.nextGrid[idx] = Math.random() < 0.2 ? ElementType.SMOKE || ElementType.EMPTY : ElementType.EMPTY;
                        continue;
                    }
                    if (currentType === ElementType.STEAM && Math.random() < 0.02) {
                        this.nextGrid[idx] = Math.random() < 0.5 ? ElementType.WATER : ElementType.EMPTY; // Condensation
                        continue;
                    }

                    if (this.canMove(x, y - 1, curProps.density, true)) {
                        this.swap(idx, this.getIndex(x, y - 1));
                    } else if (this.canMove(x - dir, y - 1, curProps.density, true)) {
                        this.swap(idx, this.getIndex(x - dir, y - 1));
                    } else if (this.canMove(x + dir, y - 1, curProps.density, true)) {
                        this.swap(idx, this.getIndex(x + dir, y - 1));
                    } else if (this.canMove(x + dir, y, curProps.density, true)) {
                        this.swap(idx, this.getIndex(x + dir, y));
                    } else if (this.canMove(x - dir, y, curProps.density, true)) {
                        this.swap(idx, this.getIndex(x - dir, y));
                    }
                }
            }
        }
        
        // Swap buffers
        this.grid.set(this.nextGrid);
    }

    private canMove(x: number, y: number, density: number, isGas: boolean = false): boolean {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        const target = this.nextGrid[this.getIndex(x, y)] as ElementType;
        if (target === ElementType.EMPTY) return true;
        if (target === ElementType.WALL) return false;
        
        const targetDensity = ELEMENT_PROPS[target].density;
        // Fluids displace lighter fluids
        if (!isGas && targetDensity < density && ELEMENT_PROPS[target].state !== 'solid') return true;
        if (isGas && targetDensity > density && ELEMENT_PROPS[target].state === 'gas') return true;
        return false;
    }

    private getNeighbors(x: number, y: number): {x: number, y: number, type: ElementType, idx: number}[] {
        const neighbors = [];
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                    neighbors.push({x: nx, y: ny, type: this.grid[this.getIndex(nx, ny)] as ElementType, idx: this.getIndex(nx, ny)});
                }
            }
        }
        return neighbors;
    }

    private handleReactions(x: number, y: number, type: ElementType, idx: number) {
        const neighbors = this.getNeighbors(x, y);

        // Acid dissolves everything except wall and gas
        if (type === ElementType.ACID) {
            for (const n of neighbors) {
                if (n.type !== ElementType.EMPTY && n.type !== ElementType.WALL && n.type !== ElementType.ACID && ELEMENT_PROPS[n.type].state !== 'gas') {
                    if (Math.random() < 0.05) {
                        this.nextGrid[n.idx] = ElementType.GAS;
                        if (Math.random() < 0.2) this.nextGrid[idx] = ElementType.EMPTY; // Acid consumes itself slowly
                    }
                }
            }
        }

        // Lava melts sand into glass (empty for now), evaporates water, burns wood
        if (type === ElementType.LAVA) {
            for (const n of neighbors) {
                if (n.type === ElementType.WATER) {
                    this.nextGrid[n.idx] = ElementType.STEAM;
                    if (Math.random() < 0.1) this.nextGrid[idx] = ElementType.STONE; // Lava cools
                } else if (n.type === ElementType.SAND) {
                    if (Math.random() < 0.01) this.nextGrid[n.idx] = ElementType.EMPTY;
                } else if (n.type === ElementType.WOOD || n.type === ElementType.OIL) {
                    this.nextGrid[n.idx] = ElementType.FIRE;
                }
            }
        }

        // Fire burns flammable things
        if (type === ElementType.FIRE) {
            for (const n of neighbors) {
                if (ELEMENT_PROPS[n.type].flammability > 0 && Math.random() < ELEMENT_PROPS[n.type].flammability) {
                    this.nextGrid[n.idx] = ElementType.FIRE;
                } else if (n.type === ElementType.WATER) {
                    this.nextGrid[idx] = ElementType.STEAM; // Fire extinguished
                    break;
                }
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D, cellSize: number) {
        // Fast rendering via Image Data instead of fillRect for huge performance
        const imgData = ctx.getImageData(0, 0, this.width * cellSize, this.height * cellSize);
        const data = imgData.data;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const type = this.grid[this.getIndex(x, y)] as ElementType;
                if (type === ElementType.EMPTY) continue;

                const hex = ELEMENT_PROPS[type].color;
                // Parse hex to RGB
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);

                // Apply slight color variation based on coordinates to make it look organic
                const varAmount = (type === ElementType.SAND || type === ElementType.STONE) ? ((x * y) % 10) - 5 : 0;

                // Fill cellSize block
                for (let dy = 0; dy < cellSize; dy++) {
                    for (let dx = 0; dx < cellSize; dx++) {
                        const px = (y * cellSize + dy) * (this.width * cellSize) * 4 + (x * cellSize + dx) * 4;
                        data[px] = Math.max(0, Math.min(255, r + varAmount));
                        data[px+1] = Math.max(0, Math.min(255, g + varAmount));
                        data[px+2] = Math.max(0, Math.min(255, b + varAmount));
                        data[px+3] = 255; // Alpha
                    }
                }
            }
        }
        ctx.putImageData(imgData, 0, 0);
    }
}

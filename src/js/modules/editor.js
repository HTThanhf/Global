/**
 * Map Editor - Create and edit custom maps
 */

import { CONFIG, TILES, TILE_NAMES } from '../config.js';
import { GameMap } from './map.js';
import { Camera } from './camera.js';

export class MapEditor {
    constructor(canvas, storage) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.storage = storage;
        
        this.map = new GameMap({ width: 40, height: 30 });
        this.camera = new Camera(window.innerWidth, window.innerHeight - 80);
        this.camera.setBounds(this.map.width, this.map.height);
        
        this.currentTool = TILES.GROUND;
        this.isDrawing = false;
        this.lastTile = null;
        this.toolSize = 1;
        
        this.running = false;
        this.needsVerification = false;
        this.verifiedByBot = false;
        
        this.setupCanvas();
        this.setupEventListeners();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 80;
    }
    
    setupEventListeners() {
        // Mouse
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
        
        // Wheel for scrolling
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.camera.x += e.deltaX;
            this.camera.y += e.deltaY;
            this.camera.x = Math.max(0, Math.min(this.camera.x, this.camera.maxX));
            this.camera.y = Math.max(0, Math.min(this.camera.y, this.camera.maxY));
        });
        
        // Resize
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    onMouseDown(e) {
        this.isDrawing = true;
        this.paintTile(e);
        this.needsVerification = true;
        this.verifiedByBot = false;
    }
    
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.camera.x;
        const y = e.clientY - rect.top + this.camera.y;
        
        // Update coordinate display
        const tx = Math.floor(x / CONFIG.TILE_SIZE);
        const ty = Math.floor(y / CONFIG.TILE_SIZE);
        this.updateCoordDisplay(tx, ty);
        
        if (this.isDrawing) {
            this.paintTile(e);
        }
        
        // Update cursor preview
        this.updateCursorPreview(e.clientX - rect.left, e.clientY - rect.top);
    }
    
    onMouseUp() {
        this.isDrawing = false;
        this.lastTile = null;
    }
    
    paintTile(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left + this.camera.x;
        const y = e.clientY - rect.top + this.camera.y;
        
        const tx = Math.floor(x / CONFIG.TILE_SIZE);
        const ty = Math.floor(y / CONFIG.TILE_SIZE);
        
        if (this.lastTile && this.lastTile.x === tx && this.lastTile.y === ty) return;
        
        // Paint with tool size
        for (let dy = 0; dy < this.toolSize; dy++) {
            for (let dx = 0; dx < this.toolSize; dx++) {
                const paintX = (tx + dx) * CONFIG.TILE_SIZE + 1;
                const paintY = (ty + dy) * CONFIG.TILE_SIZE + 1;
                const tile = this.currentTool === 'erase' ? TILES.EMPTY : this.currentTool;
                this.map.setTileAt(paintX, paintY, tile);
            }
        }
        
        this.lastTile = { x: tx, y: ty };
        this.needsVerification = true;
    }
    
    setTool(tool) {
        this.currentTool = tool;
    }
    
    setToolSize(size) {
        this.toolSize = Math.max(1, Math.min(5, size));
    }
    
    fillRect(startX, startY, width, height, tile) {
        for (let y = startY; y < startY + height; y++) {
            for (let x = startX; x < startX + width; x++) {
                if (y >= 0 && y < this.map.height && x >= 0 && x < this.map.width) {
                    this.map.tiles[y][x] = tile;
                }
            }
        }
        this.needsVerification = true;
    }
    
    clearMap() {
        if (confirm('Clear all tiles? This cannot be undone.')) {
            this.map = new GameMap({ width: this.map.width, height: this.map.height });
            this.camera.setBounds(this.map.width, this.map.height);
            this.needsVerification = true;
            this.verifiedByBot = false;
        }
    }
    
    resizeMap(width, height) {
        const newTiles = Array(height).fill(null).map(() => Array(width).fill(0));
        
        // Copy old tiles
        for (let y = 0; y < Math.min(this.map.height, height); y++) {
            for (let x = 0; x < Math.min(this.map.width, width); x++) {
                newTiles[y][x] = this.map.tiles[y][x];
            }
        }
        
        this.map.width = width;
        this.map.height = height;
        this.map.tiles = newTiles;
        this.camera.setBounds(width, height);
        this.needsVerification = true;
    }
    
    getMapData() {
        return this.map.toJSON();
    }
    
    loadMap(mapData) {
        this.map = new GameMap(mapData);
        this.camera.setBounds(this.map.width, this.map.height);
        this.needsVerification = false;
    }
    
    // Verification check
    checkValidation() {
        const errors = [];
        const warnings = [];
        
        // Check for spawn
        let hasSpawn = false;
        let hasGoal = false;
        let spawnCount = 0;
        let goalCount = 0;
        
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                const tile = this.map.tiles[y][x];
                if (tile === TILES.SPAWN) {
                    hasSpawn = true;
                    spawnCount++;
                }
                if (tile === TILES.GOAL) {
                    hasGoal = true;
                    goalCount++;
                }
            }
        }
        
        if (!hasSpawn) errors.push('Map must have a Spawn Point (👤)');
        if (!hasGoal) errors.push('Map must have a Goal (🚩)');
        if (spawnCount > 1) warnings.push(`Multiple spawn points (${spawnCount}), only first will be used`);
        if (goalCount > 1) warnings.push(`Multiple goals (${goalCount}), only first will be used`);
        
        // Check if spawn can reach goal (basic check)
        if (hasSpawn && hasGoal) {
            const spawnY = this.map.spawn.y;
            const goalY = this.map.goal.y;
            const spawnX = this.map.spawn.x;
            const goalX = this.map.goal.x;
            
            if (Math.abs(goalX - spawnX) < 3 && Math.abs(goalY - spawnY) < 3) {
                warnings.push('Spawn and Goal are very close together');
            }
        }
        
        // Check for common mistakes
        let hazardCount = 0;
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                const tile = this.map.tiles[y][x];
                if ([TILES.SPIKE, TILES.LASER_H, TILES.LASER_V].includes(tile)) {
                    hazardCount++;
                }
            }
        }
        
        if (hazardCount > 50) {
            warnings.push(`Very high hazard count (${hazardCount}), map may be too difficult`);
        }
        
        // Check for teleport pairs
        let teleportIn = 0;
        let teleportOut = 0;
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                if (this.map.tiles[y][x] === TILES.TELEPORT_IN) teleportIn++;
                if (this.map.tiles[y][x] === TILES.TELEPORT_OUT) teleportOut++;
            }
        }
        
        if (teleportIn !== teleportOut) {
            warnings.push(`Teleport mismatch: ${teleportIn} IN, ${teleportOut} OUT`);
        }
        
        return { valid: errors.length === 0, errors, warnings };
    }
    
    updateCoordDisplay(tx, ty) {
        const coordEl = document.getElementById('editorCoords');
        if (coordEl) {
            coordEl.textContent = `X: ${tx}, Y: ${ty}`;
        }
        
        const tileName = (tx >= 0 && tx < this.map.width && ty >= 0 && ty < this.map.height)
            ? TILE_NAMES[this.map.tiles[ty][tx]] || 'Empty'
            : 'Out of bounds';
        
        const tileEl = document.getElementById('editorTile');
        if (tileEl) {
            tileEl.textContent = `Tile: ${tileName}`;
        }
    }
    
    updateCursorPreview(screenX, screenY) {
        // Store for render
        this.cursorX = screenX;
        this.cursorY = screenY;
    }
    
    start() {
        this.running = true;
        this.loop();
    }
    
    stop() {
        this.running = false;
    }
    
    loop() {
        if (!this.running) return;
        
        this.update();
        this.render();
        requestAnimationFrame(() => this.loop());
    }
    
    update() {
        this.map.update();
    }
    
    render() {
        // Clear
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.drawGrid();
        
        // Draw map
        this.map.draw(this.ctx, this.camera);
        
        // Draw cursor preview
        this.drawCursorPreview();
        
        // Draw border
        this.ctx.strokeStyle = '#4CAF50';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(
            -this.camera.x,
            -this.camera.y,
            this.map.width * CONFIG.TILE_SIZE,
            this.map.height * CONFIG.TILE_SIZE
        );
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        const startX = Math.floor(this.camera.x / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE - this.camera.x;
        const startY = Math.floor(this.camera.y / CONFIG.TILE_SIZE) * CONFIG.TILE_SIZE - this.camera.y;
        
        for (let x = startX; x < this.canvas.width; x += CONFIG.TILE_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = startY; y < this.canvas.height; y += CONFIG.TILE_SIZE) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawCursorPreview() {
        if (!this.cursorX || !this.cursorY) return;
        
        const tx = Math.floor((this.cursorX + this.camera.x) / CONFIG.TILE_SIZE);
        const ty = Math.floor((this.cursorY + this.camera.y) / CONFIG.TILE_SIZE);
        
        const x = tx * CONFIG.TILE_SIZE - this.camera.x;
        const y = ty * CONFIG.TILE_SIZE - this.camera.y;
        
        // Draw highlight
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, CONFIG.TILE_SIZE * this.toolSize, CONFIG.TILE_SIZE * this.toolSize);
        
        // Draw current tool preview
        if (this.currentTool !== 'erase') {
            this.ctx.globalAlpha = 0.5;
            this.map.drawTile(this.ctx, this.currentTool, x, y);
            this.ctx.globalAlpha = 1;
        }
    }
}

/**
 * Map Class - Tile map system with all tile types
 */

import { CONFIG, TILES, TILE_COLORS } from '../config.js';

export class GameMap {
    constructor(data) {
        this.width = data.width || 40;
        this.height = data.height || 20;
        this.tiles = data.tiles || this.createEmptyMap();
        this.spawn = data.spawn || { x: 2, y: this.height - 4 };
        this.goal = data.goal || { x: this.width - 3, y: this.height - 4 };
        this.name = data.name || 'Untitled';
        this.creator = data.creator || 'Unknown';
        this.difficulty = data.difficulty || 'easy';
        
        // Special states
        this.toggleState = true;
        this.crumbleTimers = {};
        this.teleportOut = this.findTile(TILES.TELEPORT_OUT);
        
        // Moving platforms
        this.movingPlatforms = [];
        this.initMovingPlatforms();
    }
    
    createEmptyMap() {
        return Array(this.height).fill(null).map(() => Array(this.width).fill(0));
    }
    
    findTile(tileType) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.tiles[y][x] === tileType) {
                    return { x, y };
                }
            }
        }
        return null;
    }
    
    initMovingPlatforms() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                if (tile === TILES.MOVING_PLATFORM_H || tile === TILES.MOVING_PLATFORM_V) {
                    this.movingPlatforms.push({
                        x, y,
                        startX: x,
                        startY: y,
                        direction: 1,
                        type: tile,
                        offset: 0
                    });
                }
            }
        }
    }
    
    update() {
        // Update crumble timers
        for (const key in this.crumbleTimers) {
            this.crumbleTimers[key]--;
            if (this.crumbleTimers[key] <= 0) {
                const [x, y] = key.split(',').map(Number);
                this.tiles[y][x] = TILES.EMPTY;
                delete this.crumbleTimers[key];
            }
        }
        
        // Update moving platforms
        this.movingPlatforms.forEach(platform => {
            platform.offset += 0.02 * platform.direction;
            if (Math.abs(platform.offset) > 3) {
                platform.direction *= -1;
            }
        });
    }
    
    static fromData(data) {
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
        return new GameMap(data.data || data);
    }
    
    draw(ctx, camera) {
        const startX = Math.floor(camera.x / CONFIG.TILE_SIZE);
        const endX = Math.ceil((camera.x + camera.width) / CONFIG.TILE_SIZE);
        const startY = Math.floor(camera.y / CONFIG.TILE_SIZE);
        const endY = Math.ceil((camera.y + camera.height) / CONFIG.TILE_SIZE);
        
        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                if (y < 0 || y >= this.height || x < 0 || x >= this.width) continue;
                
                const tile = this.tiles[y][x];
                if (tile === TILES.EMPTY) continue;
                
                // Skip toggle blocks if off
                if (tile === TILES.TOGGLE_BLOCK && !this.toggleState) continue;
                
                // Get screen position
                let screenX = x * CONFIG.TILE_SIZE - camera.x;
                let screenY = y * CONFIG.TILE_SIZE - camera.y;
                
                // Apply moving platform offset
                const movingPlat = this.movingPlatforms.find(p => p.x === x && p.y === y);
                if (movingPlat) {
                    if (movingPlat.type === TILES.MOVING_PLATFORM_H) {
                        screenX += movingPlat.offset * CONFIG.TILE_SIZE;
                    } else {
                        screenY += movingPlat.offset * CONFIG.TILE_SIZE;
                    }
                }
                
                // Crumble animation
                if (tile === TILES.CRUMBLE && this.crumbleTimers[`${x},${y}`]) {
                    const shake = (30 - this.crumbleTimers[`${x},${y}`]) * 0.5;
                    screenX += (Math.random() - 0.5) * shake;
                }
                
                this.drawTile(ctx, tile, screenX, screenY);
            }
        }
    }
    
    drawTile(ctx, tile, x, y) {
        const size = CONFIG.TILE_SIZE;
        const color = TILE_COLORS[tile];
        
        switch (tile) {
            case TILES.GROUND:
                ctx.fillStyle = '#5D4037';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.fillRect(x, y, size, size - 4);
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x + 2, y, size - 4, 4);
                break;
                
            case TILES.PLATFORM:
                ctx.fillStyle = '#B8860B';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.fillRect(x, y, size, 8);
                ctx.fillRect(x + 2, y + 8, size - 4, 4);
                break;
                
            case TILES.SPIKE:
                this.drawSpike(ctx, x, y, size);
                break;
                
            case TILES.COIN:
                this.drawCoin(ctx, x, y, size);
                break;
                
            case TILES.CHECKPOINT:
                this.drawCheckpoint(ctx, x, y, size);
                break;
                
            case TILES.GOAL:
                this.drawGoal(ctx, x, y, size);
                break;
                
            case TILES.SPAWN:
                ctx.fillStyle = 'rgba(255, 105, 180, 0.5)';
                ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
                ctx.fillStyle = color;
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('👤', x + size / 2, y + size / 2 + 7);
                break;
                
            case TILES.MOVING_PLATFORM_H:
            case TILES.MOVING_PLATFORM_V:
                ctx.fillStyle = '#2E8B57';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = '#3CB371';
                ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                ctx.fillStyle = '#90EE90';
                ctx.fillRect(x + 8, y + 8, size - 16, 4);
                // Arrow
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.fillText(tile === TILES.MOVING_PLATFORM_H ? '→' : '↓', x + 12, y + 22);
                break;
                
            case TILES.JUMP_PAD:
                ctx.fillStyle = '#CD5C5C';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                this.drawTriangle(ctx, x + 4, y + 4, size - 8, 'up');
                ctx.fillStyle = 'white';
                ctx.font = '10px Arial';
                ctx.fillText('↑', x + 12, y + 20);
                break;
                
            case TILES.PUSH_BLOCK:
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                ctx.fillStyle = 'white';
                ctx.font = '14px Arial';
                ctx.fillText('⇄', x + 9, y + 22);
                break;
                
            case TILES.SPEED_BOOST:
                ctx.fillStyle = '#228B22';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(x + 4, y + size / 2);
                ctx.lineTo(x + size - 4, y + 8);
                ctx.lineTo(x + size - 4, y + size - 8);
                ctx.closePath();
                ctx.fill();
                break;
                
            case TILES.ICE:
                ctx.fillStyle = '#E0FFFF';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                // Shine effect
                ctx.strokeStyle = 'white';
                ctx.beginPath();
                ctx.moveTo(x + 4, y + size - 4);
                ctx.lineTo(x + size - 4, y + 4);
                ctx.stroke();
                break;
                
            case TILES.BOUNCE_PAD:
                ctx.fillStyle = '#C71585';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(x + 4, y + size - 4);
                ctx.lineTo(x + size / 2, y + 4);
                ctx.lineTo(x + size - 4, y + size - 4);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.fillText('×2', x + 8, y + 20);
                break;
                
            case TILES.TELEPORT_IN:
                ctx.fillStyle = '#4B0082';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('IN', x + size / 2, y + size / 2 + 4);
                break;
                
            case TILES.TELEPORT_OUT:
                ctx.fillStyle = '#4B0082';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('OUT', x + size / 2, y + size / 2 + 4);
                break;
                
            case TILES.CRUMBLE:
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
                // Crack pattern
                ctx.strokeStyle = '#5D4037';
                ctx.beginPath();
                ctx.moveTo(x + 8, y + 8);
                ctx.lineTo(x + size - 8, y + size - 8);
                ctx.moveTo(x + size - 8, y + 8);
                ctx.lineTo(x + 8, y + size - 8);
                ctx.stroke();
                break;
                
            case TILES.GRAVITY_FLIP:
                ctx.fillStyle = '#2E0854';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('⇅', x + size / 2, y + size / 2 + 6);
                break;
                
            case TILES.WIND_UP:
                ctx.fillStyle = '#4682B4';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(x + 8 + i * 6, y + 8 + i * 4, 4, 8);
                }
                break;
                
            case TILES.WIND_SIDE:
                ctx.fillStyle = '#4682B4';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                for (let i = 0; i < 3; i++) {
                    ctx.fillRect(x + 8 + i * 4, y + 8 + i * 6, 8, 4);
                }
                break;
                
            case TILES.LASER_H:
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.fillRect(x, y + size / 2 - 2, size, 4);
                // Glow
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.fillRect(x - 2, y + size / 2 - 4, size + 4, 8);
                break;
                
            case TILES.LASER_V:
                ctx.fillStyle = '#8B0000';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.fillRect(x + size / 2 - 2, y, 4, size);
                // Glow
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.fillRect(x + size / 2 - 4, y - 2, 8, size + 4);
                break;
                
            case TILES.KEY:
                ctx.fillStyle = '#DAA520';
                ctx.fillRect(x + 8, y + 4, 16, 24);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x + size / 2, y + 10, 6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#B8860B';
                ctx.fillRect(x + size / 2 - 2, y + 14, 4, 10);
                break;
                
            case TILES.LOCKED_DOOR:
                ctx.fillStyle = '#4A0404';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
                ctx.fillStyle = 'white';
                ctx.font = '16px Arial';
                ctx.fillText('🔒', x + 8, y + 24);
                break;
                
            case TILES.BUTTON:
                ctx.fillStyle = '#CC8400';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x + size / 2, y + size / 2, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(this.toggleState ? 'ON' : 'OFF', x + size / 2, y + size / 2 + 3);
                break;
                
            case TILES.TOGGLE_BLOCK:
                ctx.fillStyle = '#2F4F4F';
                ctx.fillRect(x, y, size, size);
                ctx.fillStyle = color;
                ctx.fillRect(x + 4, y + 4, size - 8, size - 8);
                ctx.fillStyle = 'white';
                ctx.fillRect(x + 10, y + 10, 12, 12);
                break;
        }
    }
    
    drawSpike(ctx, x, y, size) {
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y);
        ctx.lineTo(x + size, y + size);
        ctx.lineTo(x, y + size);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#DC143C';
        ctx.beginPath();
        ctx.moveTo(x + size / 2, y + 4);
        ctx.lineTo(x + size - 4, y + size - 2);
        ctx.lineTo(x + 4, y + size - 2);
        ctx.closePath();
        ctx.fill();
    }
    
    drawCoin(ctx, x, y, size) {
        const bounce = Math.sin(Date.now() / 200) * 2;
        ctx.fillStyle = '#FFA000';
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2 + bounce, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2 + bounce, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFA000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('$', x + size / 2, y + size / 2 + bounce + 4);
    }
    
    drawCheckpoint(ctx, x, y, size) {
        ctx.fillStyle = '#008B8B';
        ctx.fillRect(x + 12, y + 8, 8, 24);
        ctx.fillStyle = '#00CED1';
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 4);
        ctx.lineTo(x + 28, y + 12);
        ctx.lineTo(x + 16, y + 20);
        ctx.closePath();
        ctx.fill();
    }
    
    drawGoal(ctx, x, y, size) {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(x + 12, y + 8, 8, 24);
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.moveTo(x + 16, y + 2);
        ctx.lineTo(x + 30, y + 10);
        ctx.lineTo(x + 16, y + 18);
        ctx.closePath();
        ctx.fill();
        // Wave animation
        ctx.fillStyle = 'rgba(50, 205, 50, 0.3)';
        const wave = Math.sin(Date.now() / 300) * 5;
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 20 + wave, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawTriangle(ctx, x, y, size, direction) {
        ctx.beginPath();
        if (direction === 'up') {
            ctx.moveTo(x + size / 2, y);
            ctx.lineTo(x + size, y + size);
            ctx.lineTo(x, y + size);
        } else {
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y);
            ctx.lineTo(x + size / 2, y + size);
        }
        ctx.closePath();
        ctx.fill();
    }
    
    getTileAt(x, y) {
        const tx = Math.floor(x / CONFIG.TILE_SIZE);
        const ty = Math.floor(y / CONFIG.TILE_SIZE);
        if (ty < 0 || ty >= this.height || tx < 0 || tx >= this.width) return null;
        return this.tiles[ty][tx];
    }
    
    setTileAt(x, y, tile) {
        const tx = Math.floor(x / CONFIG.TILE_SIZE);
        const ty = Math.floor(y / CONFIG.TILE_SIZE);
        if (ty < 0 || ty >= this.height || tx < 0 || tx >= this.width) return false;
        this.tiles[ty][tx] = tile;
        
        if (tile === TILES.SPAWN) {
            this.spawn = { x: tx, y: ty };
        }
        if (tile === TILES.GOAL) {
            this.goal = { x: tx, y: ty };
        }
        if (tile === TILES.TELEPORT_OUT) {
            this.teleportOut = { x: tx, y: ty };
        }
        return true;
    }
    
    toJSON() {
        return {
            width: this.width,
            height: this.height,
            tiles: this.tiles,
            spawn: this.spawn,
            goal: this.goal,
            name: this.name,
            creator: this.creator,
            difficulty: this.difficulty
        };
    }
}

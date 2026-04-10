/**
 * Player Class with all abilities and states
 */

import { CONFIG, TILES } from '../config.js';
import { Physics } from './physics.js';

export class Player {
    constructor(x, y, skin = 'default') {
        this.startX = x;
        this.startY = y;
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 32;
        this.vx = 0;
        this.vy = 0;
        
        // Movement
        this.speed = CONFIG.PLAYER_SPEED;
        this.sprintSpeed = CONFIG.SPRINT_SPEED;
        this.jumpForce = CONFIG.JUMP_FORCE;
        this.doubleJumpForce = CONFIG.DOUBLE_JUMP_FORCE;
        this.gravity = CONFIG.GRAVITY;
        this.friction = CONFIG.FRICTION;
        this.terminalVelocity = CONFIG.TERMINAL_VELOCITY;
        
        // State
        this.grounded = false;
        this.jumping = false;
        this.canDoubleJump = false;
        this.facingRight = true;
        this.isSprinting = false;
        
        // Special states
        this.invertedGravity = false;
        this.iceFriction = 0.98;
        this.normalFriction = CONFIG.FRICTION;
        this.speedBoostTimer = 0;
        this.invincibleTimer = 0;
        this.keys = [];
        
        // Animation
        this.animFrame = 0;
        this.animTimer = 0;
        this.state = 'idle';
        this.skin = skin;
        
        // Stats
        this.deaths = 0;
        this.coins = 0;
        this.checkpoint = null;
        this.hasKey = false;
    }
    
    reset() {
        if (this.checkpoint) {
            this.x = this.checkpoint.x;
            this.y = this.checkpoint.y;
        } else {
            this.x = this.startX;
            this.y = this.startY;
        }
        this.vx = 0;
        this.vy = 0;
        this.grounded = false;
        this.jumping = false;
        this.canDoubleJump = false;
        this.invertedGravity = false;
        this.gravity = CONFIG.GRAVITY;
        this.friction = this.normalFriction;
        this.speedBoostTimer = 0;
        this.invincibleTimer = 0;
    }
    
    fullReset() {
        this.checkpoint = null;
        this.coins = 0;
        this.deaths = 0;
        this.keys = [];
        this.hasKey = false;
        this.invertedGravity = false;
        this.gravity = CONFIG.GRAVITY;
        this.friction = this.normalFriction;
        this.speedBoostTimer = 0;
        this.reset();
    }
    
    setSpawn(x, y) {
        this.startX = x;
        this.startY = y;
        this.reset();
    }
    
    update(input, map, particles) {
        // Decrease timers
        if (this.speedBoostTimer > 0) this.speedBoostTimer--;
        if (this.invincibleTimer > 0) this.invincibleTimer--;
        
        // Handle input
        const axisX = input.getAxisX();
        const sprinting = input.isSprinting() || this.speedBoostTimer > 0;
        const currentSpeed = sprinting ? this.sprintSpeed : this.speed;
        
        // Apply movement with ice physics
        if (axisX !== 0) {
            this.vx += axisX * 1.5;
            this.facingRight = axisX > 0;
        }
        
        // Apply friction
        this.vx *= this.friction;
        
        // Clamp velocity
        if (Math.abs(this.vx) > currentSpeed) {
            this.vx = Math.sign(this.vx) * currentSpeed;
        }
        
        // Jump
        if (input.isJumpPressed()) {
            if (this.grounded) {
                this.vy = this.invertedGravity ? -this.jumpForce : this.jumpForce;
                this.grounded = false;
                this.jumping = true;
                if (particles) particles.emitJump(this.x + this.width/2, this.y + this.height);
                return 'jump';
            } else if (this.canDoubleJump) {
                this.vy = this.invertedGravity ? -this.doubleJumpForce : this.doubleJumpForce;
                this.canDoubleJump = false;
                if (particles) particles.emitJump(this.x + this.width/2, this.y + this.height);
                return 'doublejump';
            }
        }
        
        // Apply gravity
        this.vy += this.invertedGravity ? -this.gravity : this.gravity;
        if (this.vy > this.terminalVelocity) {
            this.vy = this.terminalVelocity;
        }
        if (this.vy < -this.terminalVelocity) {
            this.vy = -this.terminalVelocity;
        }
        
        // Update position
        this.grounded = false;
        this.x += this.vx;
        this.handleCollisions(map, 'x');
        this.y += this.vy;
        this.handleCollisions(map, 'y');
        
        // Check bounds (death by falling)
        const mapBottom = map.height * CONFIG.TILE_SIZE + 200;
        const mapTop = -200;
        if ((!this.invertedGravity && this.y > mapBottom) || 
            (this.invertedGravity && this.y < mapTop)) {
            return 'die';
        }
        
        // Update animation
        this.updateAnimationState();
        
        // Check special tiles
        if (particles) {
            const result = this.checkSpecialTiles(map, particles);
            if (result) return result;
        }
        
        return null;
    }
    
    handleCollisions(map, axis) {
        const startX = Math.floor(this.x / CONFIG.TILE_SIZE);
        const endX = Math.floor((this.x + this.width) / CONFIG.TILE_SIZE);
        const startY = Math.floor(this.y / CONFIG.TILE_SIZE);
        const endY = Math.floor((this.y + this.height) / CONFIG.TILE_SIZE);
        
        for (let ty = startY; ty <= endY; ty++) {
            for (let tx = startX; tx <= endX; tx++) {
                if (ty < 0 || ty >= map.height || tx < 0 || tx >= map.width) continue;
                
                const tile = map.tiles[ty][tx];
                if (tile === TILES.EMPTY || tile === TILES.COIN || tile === TILES.GOAL || 
                    tile === TILES.SPAWN || tile === TILES.KEY || tile === TILES.TELEPORT_IN) continue;
                
                // One-way platform
                if (tile === TILES.PLATFORM && axis === 'y' && this.vy < 0) continue;
                
                // Toggle block - skip if inactive
                if (tile === TILES.TOGGLE_BLOCK && map.toggleState === false) continue;
                
                const tileRect = {
                    x: tx * CONFIG.TILE_SIZE,
                    y: ty * CONFIG.TILE_SIZE,
                    size: CONFIG.TILE_SIZE
                };
                
                const result = Physics.resolveCollision(this, tileRect, tile);
                
                if (result && this.isHazard(tile)) {
                    if (this.invincibleTimer === 0) {
                        return 'die';
                    }
                }
            }
        }
    }
    
    isHazard(tile) {
        return tile === TILES.SPIKE || 
               tile === TILES.LASER_H || 
               tile === TILES.LASER_V ||
               tile === TILES.CRUMBLE;
    }
    
    checkSpecialTiles(map, particles) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const tx = Math.floor(centerX / CONFIG.TILE_SIZE);
        const ty = Math.floor(centerY / CONFIG.TILE_SIZE);
        
        if (ty < 0 || ty >= map.height || tx < 0 || tx >= map.width) return null;
        
        const tile = map.tiles[ty][tx];
        const tileX = tx * CONFIG.TILE_SIZE;
        const tileY = ty * CONFIG.TILE_SIZE;
        
        switch (tile) {
            case TILES.COIN:
                map.tiles[ty][tx] = TILES.EMPTY;
                this.coins++;
                particles.emitCoin(tileX + 16, tileY + 16);
                return 'coin';
                
            case TILES.CHECKPOINT:
                this.checkpoint = {
                    x: tileX + (CONFIG.TILE_SIZE - this.width) / 2,
                    y: tileY + CONFIG.TILE_SIZE - this.height
                };
                return 'checkpoint';
                
            case TILES.GOAL:
                return 'win';
                
            case TILES.JUMP_PAD:
                this.vy = -18;
                return 'jumppad';
                
            case TILES.BOUNCE_PAD:
                this.vy = -25;
                particles.emitSpark(tileX + 16, tileY + 16, '#FF1493');
                return 'bounce';
                
            case TILES.SPEED_BOOST:
                this.speedBoostTimer = 180; // 3 seconds at 60fps
                return 'boost';
                
            case TILES.ICE:
                this.friction = this.iceFriction;
                break;
                
            case TILES.PUSH_BLOCK:
                this.vx += this.facingRight ? 8 : -8;
                return 'push';
                
            case TILES.GRAVITY_FLIP:
                this.invertedGravity = !this.invertedGravity;
                this.gravity = CONFIG.GRAVITY;
                particles.emitSpark(tileX + 16, tileY + 16, '#4B0082');
                return 'gravity';
                
            case TILES.WIND_UP:
                this.vy -= 0.8;
                if (Math.random() < 0.3) {
                    particles.emitWind(tileX + 16, tileY + 32, 'up');
                }
                break;
                
            case TILES.WIND_SIDE:
                this.vx += 1;
                if (Math.random() < 0.3) {
                    particles.emitWind(tileX, tileY + 16, 'side');
                }
                break;
                
            case TILES.TELEPORT_IN:
                if (map.teleportOut) {
                    this.x = map.teleportOut.x * CONFIG.TILE_SIZE + 4;
                    this.y = map.teleportOut.y * CONFIG.TILE_SIZE;
                    particles.emitTeleport(tileX + 16, tileY + 16);
                    particles.emitTeleport(this.x + 12, this.y + 16);
                    return 'teleport';
                }
                break;
                
            case TILES.CRUMBLE:
                // Mark for destruction
                if (!map.crumbleTimers) map.crumbleTimers = {};
                const key = `${tx},${ty}`;
                if (!map.crumbleTimers[key]) {
                    map.crumbleTimers[key] = 30; // 0.5 second
                }
                break;
                
            case TILES.KEY:
                map.tiles[ty][tx] = TILES.EMPTY;
                this.keys.push({ x: tx, y: ty });
                this.hasKey = true;
                particles.emitSpark(tileX + 16, tileY + 16, '#FFD700');
                return 'key';
                
            case TILES.LOCKED_DOOR:
                if (this.hasKey) {
                    map.tiles[ty][tx] = TILES.EMPTY;
                    this.hasKey = false;
                    particles.emitExplosion(tileX + 16, tileY + 16, '#8B0000');
                    return 'unlock';
                }
                break;
                
            case TILES.BUTTON:
                map.toggleState = !map.toggleState;
                particles.emitSpark(tileX + 16, tileY + 16, '#FFA500');
                return 'toggle';
        }
        
        // Reset friction if not on ice
        if (tile !== TILES.ICE) {
            this.friction = this.normalFriction;
        }
        
        return null;
    }
    
    updateAnimationState() {
        if (!this.grounded) {
            this.state = this.vy < 0 ? 'jump' : 'fall';
        } else if (Math.abs(this.vx) > 0.5) {
            this.state = this.isSprinting ? 'sprint' : 'run';
        } else {
            this.state = 'idle';
        }
        
        this.animTimer++;
        if (this.animTimer >= 60 / CONFIG.ANIMATION_FPS) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        // Invincible flash effect
        if (this.invincibleTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(screenX + 2, screenY + 2, this.width, this.height);
        
        // Body color based on skin
        const skinColors = {
            default: '#FF6B6B',
            blue: '#4A90E2',
            green: '#50C878',
            gold: '#FFD700',
            rainbow: `hsl(${(Date.now() / 10) % 360}, 70%, 60%)`
        };
        ctx.fillStyle = skinColors[this.skin] || skinColors.default;
        
        // Flip if inverted gravity
        if (this.invertedGravity) {
            ctx.save();
            ctx.translate(screenX + this.width / 2, screenY + this.height / 2);
            ctx.scale(1, -1);
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.restore();
        } else {
            ctx.fillRect(screenX, screenY, this.width, this.height);
        }
        
        // Eyes
        ctx.fillStyle = 'white';
        const eyeOffset = this.facingRight ? 4 : -4;
        ctx.fillRect(screenX + 12 + eyeOffset, screenY + 6, 6, 6);
        ctx.fillRect(screenX + 12 + eyeOffset, screenY + 14, 6, 6);
        
        // Pupils
        ctx.fillStyle = 'black';
        ctx.fillRect(screenX + 14 + eyeOffset, screenY + 7, 2, 2);
        ctx.fillRect(screenX + 14 + eyeOffset, screenY + 15, 2, 2);
        
        // Speed boost trail
        if (this.speedBoostTimer > 0) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
            ctx.fillRect(screenX - this.vx * 2, screenY, this.width, this.height);
        }
        
        // Key indicator
        if (this.hasKey) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(screenX + this.width / 2, screenY - 8, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
    }
}

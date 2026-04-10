/**
 * Particle System - Visual effects
 */

export class Particle {
    constructor(x, y, color, velocity, lifetime, size, gravity = 0.2) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.size = size;
        this.gravity = gravity;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.lifetime--;
        this.rotation += this.rotationSpeed;
    }
    
    draw(ctx, cameraX, cameraY) {
        const alpha = this.lifetime / this.maxLifetime;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(this.x - cameraX, this.y - cameraY);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
    
    isDead() {
        return this.lifetime <= 0;
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.pool = [];
    }
    
    getParticle(x, y, color, velocity, lifetime, size, gravity) {
        if (this.pool.length > 0) {
            const p = this.pool.pop();
            p.x = x;
            p.y = y;
            p.color = color;
            p.vx = velocity.x;
            p.vy = velocity.y;
            p.lifetime = lifetime;
            p.maxLifetime = lifetime;
            p.size = size;
            p.gravity = gravity;
            p.rotation = 0;
            return p;
        }
        return new Particle(x, y, color, velocity, lifetime, size, gravity);
    }
    
    emit(x, y, color, count = 10, spread = 5, speed = 3) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const s = Math.random() * speed + 1;
            const velocity = {
                x: Math.cos(angle) * s * spread,
                y: Math.sin(angle) * s * spread
            };
            const size = Math.random() * 4 + 2;
            const lifetime = Math.random() * 30 + 20;
            const p = this.getParticle(x, y, color, velocity, lifetime, size);
            this.particles.push(p);
        }
    }
    
    emitExplosion(x, y, color, count = 20) {
        this.emit(x, y, color, count, 2, 5);
    }
    
    emitCoin(x, y) {
        this.emit(x, y, '#FFD700', 8, 1, 2);
    }
    
    emitJump(x, y) {
        this.emit(x, y, 'rgba(255, 255, 255, 0.5)', 5, 0.5, 1);
    }
    
    emitSpark(x, y, color = '#FFF') {
        this.emit(x, y, color, 15, 1.5, 4);
    }
    
    emitTeleport(x, y) {
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const velocity = {
                x: Math.cos(angle) * 3,
                y: Math.sin(angle) * 3
            };
            const p = this.getParticle(x, y, '#9400D3', velocity, 40, 3);
            this.particles.push(p);
        }
    }
    
    emitWind(x, y, direction) {
        const velocity = direction === 'up' 
            ? { x: (Math.random() - 0.5) * 2, y: -2 }
            : { x: 2, y: (Math.random() - 0.5) * 2 };
        const p = this.getParticle(x, y, 'rgba(135, 206, 250, 0.6)', velocity, 60, 2, 0);
        this.particles.push(p);
    }
    
    emitAchievement(x, y) {
        const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#9400D3'];
        for (let i = 0; i < 50; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const velocity = {
                x: (Math.random() - 0.5) * 8,
                y: -Math.random() * 8 - 2
            };
            const p = this.getParticle(x, y, color, velocity, 80, 4 + Math.random() * 4, 0.1);
            this.particles.push(p);
        }
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.isDead()) {
                this.pool.push(p);
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        ctx.save();
        for (const p of this.particles) {
            p.draw(ctx, cameraX, cameraY);
        }
        ctx.restore();
    }
    
    clear() {
        this.pool.push(...this.particles);
        this.particles = [];
    }
}

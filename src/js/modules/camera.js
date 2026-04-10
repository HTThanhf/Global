/**
 * Camera System - Smooth follow with dead zone
 */

import { CONFIG } from '../config.js';

export class Camera {
    constructor(canvasWidth, canvasHeight) {
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.smooth = CONFIG.CAMERA_SMOOTH;
        this.deadZoneX = CONFIG.DEAD_ZONE_X;
        this.deadZoneY = CONFIG.DEAD_ZONE_Y;
        this.minX = 0;
        this.minY = 0;
        this.maxX = Infinity;
        this.maxY = Infinity;
        this.shakeAmount = 0;
        this.shakeDecay = 0.9;
    }
    
    setBounds(mapWidth, mapHeight) {
        this.maxX = Math.max(0, mapWidth * CONFIG.TILE_SIZE - this.width);
        this.maxY = Math.max(0, mapHeight * CONFIG.TILE_SIZE - this.height);
    }
    
    follow(targetX, targetY) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        const distX = targetX - centerX;
        const distY = targetY - centerY;
        
        if (Math.abs(distX) > this.deadZoneX) {
            this.targetX = targetX - this.width / 2 + (distX > 0 ? -this.deadZoneX : this.deadZoneX);
        }
        if (Math.abs(distY) > this.deadZoneY) {
            this.targetY = targetY - this.height / 2 + (distY > 0 ? -this.deadZoneY : this.deadZoneY);
        }
        
        this.x += (this.targetX - this.x) * this.smooth;
        this.y += (this.targetY - this.y) * this.smooth;
        
        // Apply screen shake
        if (this.shakeAmount > 0) {
            this.x += (Math.random() - 0.5) * this.shakeAmount;
            this.y += (Math.random() - 0.5) * this.shakeAmount;
            this.shakeAmount *= this.shakeDecay;
            if (this.shakeAmount < 0.5) this.shakeAmount = 0;
        }
        
        // Clamp to bounds
        this.x = Math.max(this.minX, Math.min(this.maxX, this.x));
        this.y = Math.max(this.minY, Math.min(this.maxY, this.y));
    }
    
    shake(amount) {
        this.shakeAmount = amount;
    }
    
    worldToScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    }
    
    screenToWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    }
    
    isVisible(worldX, worldY, width, height) {
        return worldX + width > this.x && 
               worldX < this.x + this.width &&
               worldY + height > this.y && 
               worldY < this.y + this.height;
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
    }
}

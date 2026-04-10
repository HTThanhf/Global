/**
 * Physics Engine - Collision detection and resolution
 */

import { CONFIG } from '../config.js';

export class Physics {
    static checkAABB(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    static checkPointInRect(px, py, rect) {
        return px >= rect.x && px <= rect.x + rect.width &&
               py >= rect.y && py <= rect.y + rect.height;
    }
    
    static resolveCollision(player, tileRect, tileType) {
        const playerRect = { 
            x: player.x, 
            y: player.y, 
            width: player.width, 
            height: player.height 
        };
        
        if (!this.checkAABB(playerRect, tileRect)) return null;
        
        const centerPlayerX = playerRect.x + playerRect.width / 2;
        const centerPlayerY = playerRect.y + playerRect.height / 2;
        const centerTileX = tileRect.x + tileRect.width / 2;
        const centerTileY = tileRect.y + tileRect.height / 2;
        
        const dx = centerPlayerX - centerTileX;
        const dy = centerPlayerY - centerTileY;
        
        const combinedHalfWidths = (playerRect.width + tileRect.width) / 2;
        const combinedHalfHeights = (playerRect.height + tileRect.height) / 2;
        
        const overlapX = combinedHalfWidths - Math.abs(dx);
        const overlapY = combinedHalfHeights - Math.abs(dy);
        
        if (overlapX < overlapY) {
            // Horizontal collision
            const direction = dx > 0 ? 1 : -1;
            player.x += overlapX * direction;
            player.vx = 0;
            return 'x';
        } else {
            // Vertical collision
            const direction = dy > 0 ? 1 : -1;
            player.y += overlapY * direction;
            player.vy = 0;
            if (direction < 0) {
                player.grounded = true;
                player.canDoubleJump = true;
            }
            return 'y';
        }
    }
    
    static raycast(x, y, dx, dy, maxDistance, map) {
        const steps = Math.ceil(maxDistance / 4);
        const stepX = dx / steps;
        const stepY = dy / steps;
        
        for (let i = 0; i <= steps; i++) {
            const px = x + stepX * i;
            const py = y + stepY * i;
            const tx = Math.floor(px / CONFIG.TILE_SIZE);
            const ty = Math.floor(py / CONFIG.TILE_SIZE);
            
            if (ty >= 0 && ty < map.height && tx >= 0 && tx < map.width) {
                const tile = map.tiles[ty][tx];
                if (tile !== 0) {
                    return {
                        hit: true,
                        x: px,
                        y: py,
                        tileX: tx,
                        tileY: ty,
                        tile: tile,
                        distance: Math.sqrt((px - x) ** 2 + (py - y) ** 2)
                    };
                }
            }
        }
        
        return { hit: false, x: x + dx, y: y + dy, distance: maxDistance };
    }
    
    static distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    }
    
    static normalize(x, y) {
        const len = Math.sqrt(x * x + y * y);
        if (len === 0) return { x: 0, y: 0 };
        return { x: x / len, y: y / len };
    }
}

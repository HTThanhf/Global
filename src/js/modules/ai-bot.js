/**
 * AI Bot - Auto-plays maps and rates difficulty (1-10 stars)
 */

import { CONFIG, TILES } from '../config.js';
import { Player } from './player.js';
import { GameMap } from './map.js';
import { Physics } from './physics.js';

export class AIBot {
    constructor() {
        this.player = null;
        this.map = null;
        this.path = [];
        this.currentStep = 0;
        this.attempts = 0;
        this.maxAttempts = 3;
        this.deaths = 0;
        this.completionTime = 0;
        this.startTime = 0;
        this.state = 'IDLE'; // IDLE, THINKING, RUNNING, FINISHED
        this.rating = 0;
        
        // Bot stats
        this.skillLevel = 0.95; // 0-1, higher = better
        this.reactionTime = 2; // frames
        this.jumpAccuracy = 0.95;
        
        // Navigation
        this.nodes = [];
        this.currentNode = 0;
        this.jumpPoints = [];
    }
    
    analyzeMap(mapData) {
        this.map = new GameMap(mapData);
        this.player = new Player(
            this.map.spawn.x * CONFIG.TILE_SIZE + 4,
            this.map.spawn.y * CONFIG.TILE_SIZE
        );
        
        // Analyze map features
        const analysis = this.performAnalysis();
        
        // Generate navigation path
        this.generatePath();
        
        return analysis;
    }
    
    performAnalysis() {
        let totalTiles = 0;
        let hazards = 0;
        let jumps = 0;
        let movingPlatforms = 0;
        let specialTiles = 0;
        let distance = 0;
        
        const spawnX = this.map.spawn.x;
        const spawnY = this.map.spawn.y;
        const goalX = this.map.goal.x;
        const goalY = this.map.goal.y;
        
        distance = Math.abs(goalX - spawnX) + Math.abs(goalY - spawnY);
        
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                const tile = this.map.tiles[y][x];
                if (tile !== TILES.EMPTY) totalTiles++;
                
                switch (tile) {
                    case TILES.SPIKE:
                    case TILES.LASER_H:
                    case TILES.LASER_V:
                        hazards++;
                        break;
                    case TILES.JUMP_PAD:
                    case TILES.BOUNCE_PAD:
                        jumps++;
                        break;
                    case TILES.MOVING_PLATFORM_H:
                    case TILES.MOVING_PLATFORM_V:
                        movingPlatforms++;
                        break;
                    case TILES.TELEPORT_IN:
                    case TILES.GRAVITY_FLIP:
                    case TILES.CRUMBLE:
                    case TILES.ICE:
                    case TILES.WIND_UP:
                    case TILES.WIND_SIDE:
                    case TILES.PUSH_BLOCK:
                    case TILES.BUTTON:
                    case TILES.TOGGLE_BLOCK:
                        specialTiles++;
                        break;
                }
            }
        }
        
        return {
            totalTiles,
            hazards,
            jumps,
            movingPlatforms,
            specialTiles,
            distance,
            spawnPoint: { x: spawnX, y: spawnY },
            goalPoint: { x: goalX, y: goalY }
        };
    }
    
    generatePath() {
        // Simple A* pathfinding for bot navigation
        this.nodes = [];
        const start = { 
            x: this.map.spawn.x, 
            y: this.map.spawn.y,
            g: 0,
            h: this.heuristic(this.map.spawn.x, this.map.spawn.y),
            f: 0,
            parent: null
        };
        start.f = start.g + start.h;
        
        const open = [start];
        const closed = new Set();
        
        while (open.length > 0) {
            // Find lowest f score
            let current = open[0];
            let currentIdx = 0;
            for (let i = 1; i < open.length; i++) {
                if (open[i].f < current.f) {
                    current = open[i];
                    currentIdx = i;
                }
            }
            
            open.splice(currentIdx, 1);
            closed.add(`${current.x},${current.y}`);
            
            // Check if reached goal
            if (current.x === this.map.goal.x && current.y === this.map.goal.y) {
                // Reconstruct path
                this.nodes = [];
                let node = current;
                while (node) {
                    this.nodes.unshift({ x: node.x, y: node.y });
                    node = node.parent;
                }
                return;
            }
            
            // Check neighbors
            const neighbors = [
                { x: current.x + 1, y: current.y },
                { x: current.x - 1, y: current.y },
                { x: current.x, y: current.y + 1 },
                { x: current.x, y: current.y - 1 },
                { x: current.x + 1, y: current.y - 1 }, // Diagonal jumps
                { x: current.x + 2, y: current.y - 1 },
                { x: current.x + 1, y: current.y - 2 }
            ];
            
            for (const neighbor of neighbors) {
                if (closed.has(`${neighbor.x},${neighbor.y}`)) continue;
                if (neighbor.x < 0 || neighbor.x >= this.map.width ||
                    neighbor.y < 0 || neighbor.y >= this.map.height) continue;
                
                // Check if tile is walkable/safe
                const tile = this.map.tiles[neighbor.y][neighbor.x];
                if (this.isTileDangerous(tile)) continue;
                
                const g = current.g + 1;
                const h = this.heuristic(neighbor.x, neighbor.y);
                const f = g + h;
                
                const existing = open.find(n => n.x === neighbor.x && n.y === neighbor.y);
                if (!existing || g < existing.g) {
                    if (!existing) {
                        open.push({
                            x: neighbor.x,
                            y: neighbor.y,
                            g,
                            h,
                            f,
                            parent: current
                        });
                    }
                }
            }
        }
        
        // If no path found, create direct path
        if (this.nodes.length === 0) {
            this.createDirectPath();
        }
    }
    
    heuristic(x, y) {
        return Math.abs(x - this.map.goal.x) + Math.abs(y - this.map.goal.y);
    }
    
    isTileDangerous(tile) {
        return tile === TILES.SPIKE || 
               tile === TILES.LASER_H || 
               tile === TILES.LASER_V ||
               tile === TILES.EMPTY;
    }
    
    createDirectPath() {
        // Create a simple direct path from spawn to goal
        const startX = this.map.spawn.x;
        const startY = this.map.spawn.y;
        const goalX = this.map.goal.x;
        const goalY = this.map.goal.y;
        
        this.nodes = [];
        
        // Horizontal movement
        const stepX = goalX > startX ? 1 : -1;
        for (let x = startX; x !== goalX; x += stepX) {
            this.nodes.push({ x, y: startY });
        }
        
        // Vertical movement
        const stepY = goalY > startY ? 1 : -1;
        for (let y = startY; y !== goalY; y += stepY) {
            this.nodes.push({ x: goalX, y });
        }
        
        this.nodes.push({ x: goalX, y: goalY });
    }
    
    startPlaying() {
        this.state = 'RUNNING';
        this.startTime = Date.now();
        this.currentNode = 0;
        this.attempts = 0;
        this.deaths = 0;
        this.player.fullReset();
    }
    
    update() {
        if (this.state !== 'RUNNING') return null;
        
        // Update player physics
        this.applyBotInput();
        
        // Check for death
        const result = this.player.update({
            isDown: () => false,
            isPressed: () => false,
            getAxisX: () => this.currentInput?.x || 0,
            isJumpPressed: () => this.currentInput?.jump || false,
            isSprinting: () => true // Bot always sprints
        }, this.map);
        
        if (result === 'die' || this.player.y > this.map.height * CONFIG.TILE_SIZE + 100) {
            this.deaths++;
            this.attempts++;
            
            if (this.attempts >= this.maxAttempts) {
                this.state = 'FAILED';
                return { status: 'FAILED', deaths: this.deaths };
            }
            
            this.player.reset();
            this.currentNode = 0;
        }
        
        // Check for win
        const px = Math.floor((this.player.x + this.player.width / 2) / CONFIG.TILE_SIZE);
        const py = Math.floor((this.player.y + this.player.height / 2) / CONFIG.TILE_SIZE);
        
        if (px === this.map.goal.x && py === this.map.goal.y) {
            this.completionTime = (Date.now() - this.startTime) / 1000;
            this.state = 'FINISHED';
            this.calculateRating();
            return {
                status: 'COMPLETED',
                time: this.completionTime,
                deaths: this.deaths,
                rating: this.rating
            };
        }
        
        // Progress check - if stuck for too long, reset
        if (this.checkIfStuck()) {
            this.attempts++;
            if (this.attempts >= this.maxAttempts) {
                this.state = 'FAILED';
                return { status: 'FAILED', deaths: this.deaths };
            }
            this.player.reset();
            this.currentNode = 0;
        }
        
        return { status: 'RUNNING' };
    }
    
    applyBotInput() {
        this.currentInput = { x: 0, jump: false };
        
        if (this.currentNode >= this.nodes.length) {
            // Move toward goal directly
            const goalScreenX = this.map.goal.x * CONFIG.TILE_SIZE;
            const diff = goalScreenX - this.player.x;
            this.currentInput.x = diff > 0 ? 1 : -1;
            return;
        }
        
        const target = this.nodes[this.currentNode];
        const targetX = target.x * CONFIG.TILE_SIZE;
        const targetY = target.y * CONFIG.TILE_SIZE;
        
        const diffX = targetX - this.player.x;
        const diffY = targetY - this.player.y;
        
        // Horizontal movement
        if (Math.abs(diffX) > 10) {
            this.currentInput.x = diffX > 0 ? 1 : -1;
        }
        
        // Jump logic
        const tileAhead = this.getTileAhead();
        const gapAhead = this.checkGapAhead();
        const obstacleAhead = this.checkObstacleAhead();
        
        // Jump conditions
        if (this.player.grounded && (
            gapAhead || 
            obstacleAhead || 
            (diffY < -50 && Math.abs(diffX) < 100) ||
            tileAhead === TILES.JUMP_PAD ||
            tileAhead === TILES.BOUNCE_PAD
        )) {
            // Add some randomness based on skill level
            if (Math.random() < this.jumpAccuracy) {
                this.currentInput.jump = true;
            }
        }
        
        // Double jump for high obstacles
        if (!this.player.grounded && this.player.canDoubleJump && diffY < -100) {
            this.currentInput.jump = true;
        }
        
        // Advance to next node if close enough
        if (Math.abs(diffX) < 20 && Math.abs(diffY) < 50) {
            this.currentNode++;
        }
        
        // Handle special tiles
        this.handleSpecialTiles();
    }
    
    getTileAhead() {
        const checkX = this.player.x + (this.player.facingRight ? 32 : -32);
        const checkY = this.player.y + this.player.height / 2;
        return this.map.getTileAt(checkX, checkY);
    }
    
    checkGapAhead() {
        const checkX = this.player.x + (this.player.facingRight ? 40 : -40);
        const checkY = this.player.y + this.player.height + 40;
        const tile = this.map.getTileAt(checkX, checkY);
        return tile === TILES.EMPTY || tile === null;
    }
    
    checkObstacleAhead() {
        const checkX = this.player.x + (this.player.facingRight ? 32 : -32);
        const checkY = this.player.y;
        const tile = this.map.getTileAt(checkX, checkY);
        return tile === TILES.GROUND || tile === TILES.PLATFORM || tile === TILES.LOCKED_DOOR;
    }
    
    handleSpecialTiles() {
        const centerX = this.player.x + this.width / 2;
        const centerY = this.player.y + this.height / 2;
        const tile = this.map.getTileAt(centerX, centerY);
        
        switch (tile) {
            case TILES.PUSH_BLOCK:
                // Move away quickly
                this.currentInput.x = this.player.facingRight ? -1 : 1;
                break;
                
            case TILES.GRAVITY_FLIP:
                // Wait a moment after flip
                if (this.player.invertedGravity) {
                    setTimeout(() => {}, 500);
                }
                break;
                
            case TILES.TELEPORT_IN:
                // Teleport will handle automatically
                break;
                
            case TILES.CRUMBLE:
                // Move quickly off crumble
                if (!this.player.grounded) {
                    this.currentInput.jump = true;
                }
                break;
        }
    }
    
    checkIfStuck() {
        // Simple stuck detection - if player hasn't moved much for 3 seconds
        // This is a simplified version - in reality would track position history
        return false;
    }
    
    calculateRating() {
        const analysis = this.performAnalysis();
        
        // Base rating from map features
        let rating = 5; // Base 5 stars
        
        // Deduct for deaths
        rating -= this.deaths * 0.5;
        
        // Add for map complexity
        rating += analysis.hazards * 0.1;
        rating += analysis.specialTiles * 0.05;
        rating += analysis.movingPlatforms * 0.2;
        rating += analysis.jumps * 0.1;
        
        // Distance factor
        if (analysis.distance > 30) rating += 0.5;
        if (analysis.distance > 50) rating += 1;
        
        // Time factor - faster completion = harder map
        if (this.completionTime < 10) rating += 1;
        if (this.completionTime > 60) rating -= 1;
        
        // Cap at 1-10
        this.rating = Math.max(1, Math.min(10, Math.round(rating * 10) / 10));
        
        return this.rating;
    }
    
    getDifficultyLabel() {
        if (this.rating <= 2) return 'Very Easy';
        if (this.rating <= 4) return 'Easy';
        if (this.rating <= 6) return 'Medium';
        if (this.rating <= 8) return 'Hard';
        return 'Expert';
    }
    
    // Quick analysis without playing - for initial difficulty estimate
    static quickAnalyze(mapData) {
        const analysis = {
            hazards: 0,
            specialTiles: 0,
            jumps: 0,
            moving: 0
        };
        
        for (let y = 0; y < mapData.height; y++) {
            for (let x = 0; x < mapData.width; x++) {
                const tile = mapData.tiles[y][x];
                if ([TILES.SPIKE, TILES.LASER_H, TILES.LASER_V].includes(tile)) {
                    analysis.hazards++;
                }
                if ([TILES.JUMP_PAD, TILES.BOUNCE_PAD].includes(tile)) {
                    analysis.jumps++;
                }
                if ([TILES.MOVING_PLATFORM_H, TILES.MOVING_PLATFORM_V].includes(tile)) {
                    analysis.moving++;
                }
                if ([TILES.TELEPORT_IN, TILES.GRAVITY_FLIP, TILES.CRUMBLE, TILES.ICE,
                     TILES.WIND_UP, TILES.WIND_SIDE, TILES.PUSH_BLOCK, TILES.BUTTON,
                     TILES.TOGGLE_BLOCK, TILES.KEY, TILES.LOCKED_DOOR].includes(tile)) {
                    analysis.specialTiles++;
                }
            }
        }
        
        // Estimate rating
        let estimated = 5;
        estimated += analysis.hazards * 0.15;
        estimated += analysis.specialTiles * 0.08;
        estimated += analysis.jumps * 0.12;
        estimated += analysis.moving * 0.25;
        
        return {
            ...analysis,
            estimatedRating: Math.max(1, Math.min(10, Math.round(estimated * 10) / 10))
        };
    }
}

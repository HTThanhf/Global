/**
 * Campaign Mode - 100 Pre-made Stages (1-100)
 */

import { TILES } from '../config.js';

export class CampaignGenerator {
    static generateStage(level) {
        const generators = [
            // World 1: Beginner (1-20)
            this.generateTutorial,
            this.generateBasicJump,
            this.generateSmallGap,
            this.generatePlatformIntro,
            this.generateCoinPath,
            this.generateSpikeIntro,
            this.generateMovingPlatform,
            this.generateCheckpoint,
            this.generateDoubleJump,
            this.generateUpAndOver,
            this.generateStairs,
            this.generateSpiral,
            this.generatePitfalls,
            this.generatePlatforms,
            this.generateCoins,
            this.generateSpikes,
            this.generateSpeed,
            this.generatePrecision,
            this.generateCombo,
            this.generateBoss1,
            // World 2: Intermediate (21-40)
            this.generateIceIntro,
            this.generateIceSlide,
            this.generateMomentum,
            this.generateIceJump,
            this.generateSpeedRun,
            this.generateBoostPad,
            this.generateFastTrack,
            this.generateWindUp,
            this.generateWindSide,
            this.generateWindCombo,
            this.generateBounceIntro,
            this.generateHighJump,
            this.generateBounceChain,
            this.generatePushBlock,
            this.generateBlockPuzzle,
            this.generatePushAndJump,
            this.generateKeyIntro,
            this.generateLockedDoor,
            this.generateKeyHunt,
            this.generateBoss2,
            // World 3: Advanced (41-60)
            this.generateTeleportIntro,
            this.generateTeleportPuzzle,
            this.generateInAndOut,
            this.generateCrumbleIntro,
            this.generateQuickSteps,
            this.generateCrumbleRun,
            this.generateGravityIntro,
            this.generateFlipFlop,
            this.generateGravityMaze,
            this.generateLaserIntro,
            this.generateLaserDodge,
            this.generateLaserMaze,
            this.generateButtonIntro,
            this.generateToggleBlocks,
            this.generateButtonPuzzle,
            this.generateMovingHazard,
            this.generateComboHazard,
            this.generatePrecision2,
            this.generateSpeedRun2,
            this.generateBoss3,
            // World 4: Expert (61-80)
            this.generateComplex1,
            this.generateComplex2,
            this.generateComplex3,
            this.generateComplex4,
            this.generateComplex5,
            this.generateComplex6,
            this.generateComplex7,
            this.generateComplex8,
            this.generateComplex9,
            this.generateComplex10,
            this.generateNightmare1,
            this.generateNightmare2,
            this.generateNightmare3,
            this.generateNightmare4,
            this.generateNightmare5,
            this.generateNightmare6,
            this.generateNightmare7,
            this.generateNightmare8,
            this.generateNightmare9,
            this.generateBoss4,
            // World 5: Master (81-100)
            this.generateMaster1,
            this.generateMaster2,
            this.generateMaster3,
            this.generateMaster4,
            this.generateMaster5,
            this.generateMaster6,
            this.generateMaster7,
            this.generateMaster8,
            this.generateMaster9,
            this.generateFinalChallenge,
            this.generateUltimate1,
            this.generateUltimate2,
            this.generateUltimate3,
            this.generateUltimate4,
            this.generateUltimate5,
            this.generateUltimate6,
            this.generateUltimate7,
            this.generateUltimate8,
            this.generateUltimate9,
            this.generateBossFinal
        ];
        
        const generator = generators[(level - 1) % generators.length] || this.generateTutorial;
        return generator.call(this, level);
    }
    
    static createMap(width, height, name, difficulty = 'easy') {
        return {
            width,
            height,
            tiles: Array(height).fill(null).map(() => Array(width).fill(0)),
            spawn: { x: 2, y: height - 4 },
            goal: { x: width - 3, y: height - 4 },
            name,
            creator: 'System',
            difficulty
        };
    }
    
    static fillGround(map, startX, endX, y) {
        for (let x = startX; x <= endX; x++) {
            map.tiles[y][x] = TILES.GROUND;
        }
    }
    
    static addPlatform(map, x, y, width = 3) {
        for (let i = 0; i < width; i++) {
            map.tiles[y][x + i] = TILES.PLATFORM;
        }
    }
    
    static addCoinLine(map, x, y, count) {
        for (let i = 0; i < count; i++) {
            map.tiles[y][x + i] = TILES.COIN;
        }
    }
    
    // World 1: Beginner
    static generateTutorial(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Tutorial`, 'easy');
        this.fillGround(map, 0, 39, 19);
        this.fillGround(map, 0, 5, 18);
        this.addPlatform(map, 10, 14, 3);
        this.addPlatform(map, 18, 12, 3);
        this.addPlatform(map, 26, 14, 3);
        map.tiles[10][35] = TILES.GOAL;
        map.tiles[17][2] = TILES.SPAWN;
        return map;
    }
    
    static generateBasicJump(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Basic Jump`, 'easy');
        this.fillGround(map, 0, 10, 19);
        this.fillGround(map, 15, 25, 19);
        this.fillGround(map, 30, 39, 19);
        map.tiles[18][35] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateSmallGap(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Small Gaps`, 'easy');
        this.fillGround(map, 0, 39, 19);
        for (let i = 10; i < 35; i += 5) {
            map.tiles[19][i] = TILES.EMPTY;
            map.tiles[19][i + 1] = TILES.EMPTY;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generatePlatformIntro(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Platforms`, 'easy');
        this.fillGround(map, 0, 5, 19);
        for (let i = 8; i < 35; i += 6) {
            this.addPlatform(map, i, 15 - (i % 3) * 2, 3);
        }
        this.fillGround(map, 36, 39, 19);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateCoinPath(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Coin Path`, 'easy');
        this.fillGround(map, 0, 39, 19);
        for (let i = 8; i < 32; i++) {
            map.tiles[14][i] = TILES.COIN;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateSpikeIntro(level) {
        const map = this.createMap(40, 20, `Stage ${level}: First Spikes`, 'easy');
        this.fillGround(map, 0, 39, 19);
        map.tiles[18][12] = TILES.SPIKE;
        map.tiles[18][13] = TILES.SPIKE;
        map.tiles[18][25] = TILES.SPIKE;
        map.tiles[18][26] = TILES.SPIKE;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateMovingPlatform(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Moving`, 'easy');
        this.fillGround(map, 0, 5, 19);
        map.tiles[15][10] = TILES.MOVING_PLATFORM_H;
        map.tiles[12][20] = TILES.MOVING_PLATFORM_V;
        map.tiles[15][30] = TILES.MOVING_PLATFORM_H;
        this.fillGround(map, 35, 39, 19);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateCheckpoint(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Checkpoint`, 'easy');
        this.fillGround(map, 0, 39, 19);
        map.tiles[18][18] = TILES.CHECKPOINT;
        map.tiles[18][12] = TILES.SPIKE;
        map.tiles[18][25] = TILES.SPIKE;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateDoubleJump(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Double Jump`, 'easy');
        this.fillGround(map, 0, 5, 19);
        this.addPlatform(map, 15, 12, 2);
        this.addPlatform(map, 25, 8, 2);
        this.fillGround(map, 35, 39, 19);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateUpAndOver(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Up and Over`, 'easy');
        this.fillGround(map, 0, 39, 19);
        for (let x = 10; x < 30; x++) {
            map.tiles[15][x] = TILES.GROUND;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[14][37] = TILES.GOAL;
        return map;
    }
    
    static generateStairs(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Stairs`, 'easy');
        this.fillGround(map, 0, 5, 19);
        for (let i = 0; i < 15; i++) {
            this.addPlatform(map, 8 + i * 2, 18 - i, 2);
        }
        this.fillGround(map, 38, 39, 5);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[4][37] = TILES.GOAL;
        return map;
    }
    
    static generateSpiral(level) {
        const map = this.createMap(50, 25, `Stage ${level}: Spiral`, 'easy');
        this.fillGround(map, 0, 5, 24);
        // Create spiral pattern
        for (let i = 0; i < 20; i++) {
            this.addPlatform(map, 8 + i, 20 - i % 5, 2);
        }
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[20][47] = TILES.GOAL;
        return map;
    }
    
    static generatePitfalls(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Pitfalls`, 'medium');
        this.fillGround(map, 0, 5, 19);
        for (let i = 8; i < 35; i += 4) {
            this.addPlatform(map, i, 19, 2);
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generatePlatforms(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Platform Master`, 'medium');
        this.fillGround(map, 0, 5, 24);
        for (let i = 0; i < 10; i++) {
            this.addPlatform(map, 8 + i * 3, 20 - i, 2);
        }
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[14][37] = TILES.GOAL;
        return map;
    }
    
    static generateCoins(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Coin Rush`, 'easy');
        this.fillGround(map, 0, 39, 19);
        for (let i = 8; i < 35; i += 3) {
            map.tiles[15][i] = TILES.COIN;
            map.tiles[13][i + 1] = TILES.COIN;
            map.tiles[15][i + 2] = TILES.COIN;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateSpikes(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Spike Field`, 'medium');
        this.fillGround(map, 0, 39, 19);
        for (let i = 10; i < 35; i += 4) {
            map.tiles[18][i] = TILES.SPIKE;
        }
        this.addPlatform(map, 12, 15, 2);
        this.addPlatform(map, 24, 15, 2);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateSpeed(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Speed Test`, 'medium');
        this.fillGround(map, 0, 39, 19);
        for (let i = 8; i < 35; i += 8) {
            map.tiles[18][i] = TILES.SPEED_BOOST;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generatePrecision(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Precision`, 'medium');
        this.fillGround(map, 0, 5, 19);
        for (let i = 0; i < 25; i++) {
            this.addPlatform(map, 8 + i, 19, 1);
        }
        this.fillGround(map, 35, 39, 19);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateCombo(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Combo`, 'medium');
        this.fillGround(map, 0, 39, 19);
        this.addPlatform(map, 10, 14, 2);
        map.tiles[14][11] = TILES.JUMP_PAD;
        this.addPlatform(map, 18, 10, 2);
        map.tiles[10][19] = TILES.SPIKE;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateBoss1(level) {
        const map = this.createMap(50, 20, `Stage ${level}: World 1 Boss`, 'medium');
        this.fillGround(map, 0, 49, 19);
        // Boss pattern
        for (let i = 10; i < 40; i += 5) {
            map.tiles[18][i] = TILES.SPIKE;
            map.tiles[15][i + 2] = TILES.COIN;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][47] = TILES.GOAL;
        return map;
    }
    
    // World 2: Intermediate (Ice, Wind, Speed, Bounce, Keys)
    static generateIceIntro(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Ice Intro`, 'medium');
        this.fillGround(map, 0, 39, 19);
        for (let i = 10; i < 30; i++) {
            map.tiles[19][i] = TILES.ICE;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateIceSlide(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Ice Slide`, 'medium');
        this.fillGround(map, 0, 5, 19);
        for (let i = 8; i < 30; i++) {
            map.tiles[19][i] = TILES.ICE;
        }
        this.addPlatform(map, 32, 15, 3);
        this.fillGround(map, 36, 39, 19);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateMomentum(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Momentum`, 'medium');
        this.fillGround(map, 0, 10, 19);
        for (let i = 12; i < 30; i++) {
            map.tiles[19][i] = TILES.ICE;
        }
        this.addPlatform(map, 32, 10, 2);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[9][37] = TILES.GOAL;
        return map;
    }
    
    static generateIceJump(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Ice Jump`, 'medium');
        this.fillGround(map, 0, 5, 19);
        for (let i = 0; i < 6; i++) {
            this.addPlatform(map, 10 + i * 5, 15 - i, 2);
            map.tiles[15 - i + 1][10 + i * 5] = TILES.ICE;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[8][37] = TILES.GOAL;
        return map;
    }
    
    static generateSpeedRun(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Speed Run`, 'medium');
        this.fillGround(map, 0, 39, 19);
        for (let i = 5; i < 35; i += 6) {
            map.tiles[18][i] = TILES.SPEED_BOOST;
            map.tiles[18][i + 1] = TILES.SPIKE;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateBoostPad(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Boost`, 'medium');
        this.fillGround(map, 0, 39, 19);
        map.tiles[19][10] = TILES.JUMP_PAD;
        this.addPlatform(map, 18, 10, 2);
        map.tiles[19][20] = TILES.JUMP_PAD;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateFastTrack(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Fast Track`, 'hard');
        this.fillGround(map, 0, 5, 19);
        for (let i = 0; i < 10; i++) {
            map.tiles[18][8 + i * 3] = TILES.SPEED_BOOST;
        }
        this.fillGround(map, 35, 39, 19);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateWindUp(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Wind Up`, 'medium');
        this.fillGround(map, 0, 5, 19);
        for (let y = 14; y < 19; y++) {
            for (let x = 8; x < 32; x++) {
                map.tiles[y][x] = TILES.WIND_UP;
            }
        }
        this.addPlatform(map, 35, 5, 3);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[4][37] = TILES.GOAL;
        return map;
    }
    
    static generateWindSide(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Wind Side`, 'medium');
        this.fillGround(map, 0, 39, 19);
        for (let y = 10; y < 19; y++) {
            for (let x = 10; x < 30; x += 2) {
                map.tiles[y][x] = TILES.WIND_SIDE;
            }
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateWindCombo(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Wind Combo`, 'hard');
        this.fillGround(map, 0, 5, 19);
        for (let y = 10; y < 19; y++) {
            for (let x = 8; x < 20; x++) {
                map.tiles[y][x] = y % 2 === 0 ? TILES.WIND_UP : TILES.WIND_SIDE;
            }
        }
        this.fillGround(map, 35, 39, 19);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateBounceIntro(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Bounce`, 'medium');
        this.fillGround(map, 0, 5, 19);
        map.tiles[19][10] = TILES.BOUNCE_PAD;
        this.addPlatform(map, 20, 5, 2);
        map.tiles[19][25] = TILES.BOUNCE_PAD;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[4][37] = TILES.GOAL;
        return map;
    }
    
    static generateHighJump(level) {
        const map = this.createMap(40, 25, `Stage ${level}: High Jump`, 'medium');
        this.fillGround(map, 0, 5, 24);
        map.tiles[24][8] = TILES.BOUNCE_PAD;
        for (let i = 0; i < 5; i++) {
            this.addPlatform(map, 15 + i * 4, 20 - i * 3, 2);
        }
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[8][37] = TILES.GOAL;
        return map;
    }
    
    static generateBounceChain(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Bounce Chain`, 'hard');
        this.fillGround(map, 0, 5, 24);
        for (let i = 0; i < 6; i++) {
            map.tiles[23 - i * 3][10 + i * 5] = TILES.BOUNCE_PAD;
        }
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[5][37] = TILES.GOAL;
        return map;
    }
    
    static generatePushBlock(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Push Block`, 'medium');
        this.fillGround(map, 0, 39, 19);
        map.tiles[18][15] = TILES.PUSH_BLOCK;
        map.tiles[18][25] = TILES.SPIKE;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateBlockPuzzle(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Block Puzzle`, 'hard');
        this.fillGround(map, 0, 10, 19);
        this.fillGround(map, 30, 39, 19);
        for (let i = 0; i < 4; i++) {
            map.tiles[18][12 + i * 4] = TILES.PUSH_BLOCK;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generatePushAndJump(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Push & Jump`, 'hard');
        this.fillGround(map, 0, 5, 19);
        map.tiles[15][10] = TILES.PUSH_BLOCK;
        this.addPlatform(map, 20, 10, 2);
        map.tiles[19][15] = TILES.JUMP_PAD;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateKeyIntro(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Key`, 'medium');
        this.fillGround(map, 0, 39, 19);
        map.tiles[15][10] = TILES.KEY;
        map.tiles[18][25] = TILES.LOCKED_DOOR;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateLockedDoor(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Locked`, 'medium');
        this.fillGround(map, 0, 39, 19);
        for (let i = 15; i < 25; i++) {
            map.tiles[19][i] = TILES.LOCKED_DOOR;
        }
        map.tiles[14][5] = TILES.KEY;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateKeyHunt(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Key Hunt`, 'hard');
        this.fillGround(map, 0, 39, 19);
        map.tiles[18][10] = TILES.SPIKE;
        map.tiles[15][10] = TILES.KEY;
        map.tiles[14][20] = TILES.SPIKE;
        map.tiles[11][20] = TILES.KEY;
        for (let i = 30; i < 35; i++) {
            map.tiles[19][i] = TILES.LOCKED_DOOR;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateBoss2(level) {
        const map = this.createMap(50, 20, `Stage ${level}: World 2 Boss`, 'hard');
        this.fillGround(map, 0, 49, 19);
        for (let i = 10; i < 40; i += 3) {
            map.tiles[19][i] = TILES.ICE;
            map.tiles[18][i + 1] = TILES.SPIKE;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][47] = TILES.GOAL;
        return map;
    }
    
    // World 3: Advanced (Teleport, Crumble, Gravity, Lasers, Buttons)
    static generateTeleportIntro(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Teleport`, 'hard');
        this.fillGround(map, 0, 5, 19);
        map.tiles[18][10] = TILES.TELEPORT_IN;
        map.tiles[10][30] = TILES.TELEPORT_OUT;
        this.fillGround(map, 35, 39, 10);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[9][37] = TILES.GOAL;
        return map;
    }
    
    static generateTeleportPuzzle(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Teleport Puzzle`, 'hard');
        this.fillGround(map, 0, 5, 19);
        map.tiles[18][10] = TILES.TELEPORT_IN;
        map.tiles[15][25] = TILES.TELEPORT_OUT;
        map.tiles[10][25] = TILES.TELEPORT_IN;
        map.tiles[5][35] = TILES.TELEPORT_OUT;
        this.fillGround(map, 33, 39, 5);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[4][37] = TILES.GOAL;
        return map;
    }
    
    static generateInAndOut(level) {
        const map = this.createMap(40, 25, `Stage ${level}: In and Out`, 'hard');
        this.fillGround(map, 0, 5, 24);
        map.tiles[23][8] = TILES.TELEPORT_IN;
        map.tiles[5][8] = TILES.TELEPORT_OUT;
        map.tiles[5][20] = TILES.TELEPORT_IN;
        map.tiles[23][30] = TILES.TELEPORT_OUT;
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[23][37] = TILES.GOAL;
        return map;
    }
    
    static generateCrumbleIntro(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Crumble`, 'hard');
        this.fillGround(map, 0, 5, 19);
        for (let i = 0; i < 10; i++) {
            map.tiles[19][10 + i] = TILES.CRUMBLE;
        }
        this.fillGround(map, 35, 39, 19);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateQuickSteps(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Quick Steps`, 'hard');
        this.fillGround(map, 0, 5, 19);
        for (let i = 0; i < 20; i++) {
            map.tiles[19][8 + i] = i % 3 === 0 ? TILES.GROUND : TILES.CRUMBLE;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateCrumbleRun(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Crumble Run`, 'expert');
        this.fillGround(map, 0, 39, 19);
        for (let i = 8; i < 35; i += 2) {
            map.tiles[19][i] = TILES.CRUMBLE;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateGravityIntro(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Gravity`, 'hard');
        this.fillGround(map, 0, 39, 19);
        map.tiles[18][15] = TILES.GRAVITY_FLIP;
        this.addPlatform(map, 25, 5, 3);
        map.tiles[5][30] = TILES.GRAVITY_FLIP;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateFlipFlop(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Flip Flop`, 'expert');
        this.fillGround(map, 0, 39, 19);
        for (let i = 5; i < 35; i += 10) {
            map.tiles[18][i] = TILES.GRAVITY_FLIP;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateGravityMaze(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Gravity Maze`, 'expert');
        this.fillGround(map, 0, 39, 24);
        for (let y = 5; y < 20; y += 5) {
            map.tiles[y][10] = TILES.GRAVITY_FLIP;
            map.tiles[y][30] = TILES.GRAVITY_FLIP;
        }
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[2][37] = TILES.GOAL;
        return map;
    }
    
    static generateLaserIntro(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Laser`, 'hard');
        this.fillGround(map, 0, 39, 19);
        for (let x = 10; x < 30; x += 5) {
            map.tiles[17][x] = TILES.LASER_V;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateLaserDodge(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Laser Dodge`, 'expert');
        this.fillGround(map, 0, 39, 19);
        for (let y = 10; y < 19; y++) {
            for (let x = 10; x < 30; x += 4) {
                map.tiles[y][x] = TILES.LASER_V;
            }
        }
        this.addPlatform(map, 12, 8, 2);
        this.addPlatform(map, 24, 8, 2);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateLaserMaze(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Laser Maze`, 'expert');
        this.fillGround(map, 0, 39, 19);
        for (let y = 5; y < 19; y += 3) {
            map.tiles[y][10] = TILES.LASER_H;
            map.tiles[y][20] = TILES.LASER_H;
            map.tiles[y][30] = TILES.LASER_H;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateButtonIntro(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Button`, 'hard');
        this.fillGround(map, 0, 39, 19);
        for (let i = 20; i < 30; i++) {
            map.tiles[19][i] = TILES.TOGGLE_BLOCK;
        }
        map.tiles[18][10] = TILES.BUTTON;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateToggleBlocks(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Toggle`, 'hard');
        this.fillGround(map, 0, 5, 19);
        for (let i = 0; i < 10; i++) {
            map.tiles[19][10 + i] = i % 2 === 0 ? TILES.TOGGLE_BLOCK : TILES.GROUND;
        }
        map.tiles[18][8] = TILES.BUTTON;
        this.fillGround(map, 35, 39, 19);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateButtonPuzzle(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Button Puzzle`, 'expert');
        this.fillGround(map, 0, 39, 19);
        for (let i = 0; i < 4; i++) {
            map.tiles[19][10 + i * 6] = TILES.BUTTON;
            for (let j = 0; j < 5; j++) {
                map.tiles[18][12 + i * 6 + j] = TILES.TOGGLE_BLOCK;
            }
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateMovingHazard(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Moving Hazard`, 'expert');
        this.fillGround(map, 0, 5, 19);
        map.tiles[15][10] = TILES.MOVING_PLATFORM_H;
        map.tiles[15][15] = TILES.SPIKE;
        map.tiles[15][20] = TILES.MOVING_PLATFORM_H;
        map.tiles[15][25] = TILES.SPIKE;
        this.fillGround(map, 35, 39, 19);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateComboHazard(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Combo Hazard`, 'expert');
        this.fillGround(map, 0, 39, 19);
        map.tiles[18][10] = TILES.SPIKE;
        map.tiles[19][11] = TILES.ICE;
        map.tiles[18][15] = TILES.LASER_V;
        map.tiles[19][20] = TILES.CRUMBLE;
        map.tiles[18][25] = TILES.GRAVITY_FLIP;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generatePrecision2(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Precision II`, 'expert');
        this.fillGround(map, 0, 5, 19);
        for (let i = 0; i < 25; i++) {
            map.tiles[18 - i % 3][8 + i] = TILES.PLATFORM;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[15][37] = TILES.GOAL;
        return map;
    }
    
    static generateSpeedRun2(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Speed Run II`, 'expert');
        this.fillGround(map, 0, 39, 19);
        for (let i = 5; i < 35; i++) {
            if (i % 7 === 0) {
                map.tiles[18][i] = TILES.SPEED_BOOST;
            } else if (i % 5 === 0) {
                map.tiles[18][i] = TILES.SPIKE;
            }
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateBoss3(level) {
        const map = this.createMap(50, 20, `Stage ${level}: World 3 Boss`, 'expert');
        this.fillGround(map, 0, 49, 19);
        for (let i = 10; i < 40; i += 2) {
            map.tiles[19][i] = TILES.CRUMBLE;
        }
        for (let i = 15; i < 35; i += 10) {
            map.tiles[15][i] = TILES.LASER_V;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][47] = TILES.GOAL;
        return map;
    }
    
    // World 4: Expert (Complex combinations)
    static generateComplex1(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Complex 1`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Ice + Speed boost combo
        for (let i = 8; i < 30; i++) {
            map.tiles[19][i] = i % 4 === 0 ? TILES.SPEED_BOOST : TILES.ICE;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateComplex2(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Complex 2`, 'expert');
        this.fillGround(map, 0, 5, 19);
        // Teleport + key
        map.tiles[18][10] = TILES.TELEPORT_IN;
        map.tiles[10][25] = TILES.TELEPORT_OUT;
        map.tiles[10][27] = TILES.KEY;
        for (let i = 30; i < 35; i++) {
            map.tiles[19][i] = TILES.LOCKED_DOOR;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateComplex3(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Complex 3`, 'expert');
        this.fillGround(map, 0, 5, 24);
        // Bounce + gravity
        map.tiles[24][10] = TILES.BOUNCE_PAD;
        map.tiles[15][20] = TILES.GRAVITY_FLIP;
        map.tiles[10][30] = TILES.BOUNCE_PAD;
        map.tiles[5][35] = TILES.GRAVITY_FLIP;
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[23][37] = TILES.GOAL;
        return map;
    }
    
    static generateComplex4(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Complex 4`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Wind + crumble
        for (let y = 10; y < 19; y++) {
            for (let x = 8; x < 32; x += 3) {
                map.tiles[y][x] = TILES.WIND_UP;
            }
        }
        for (let i = 8; i < 32; i += 4) {
            map.tiles[8][i] = TILES.CRUMBLE;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[7][37] = TILES.GOAL;
        return map;
    }
    
    static generateComplex5(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Complex 5`, 'expert');
        this.fillGround(map, 0, 5, 19);
        // Push blocks + spikes
        for (let i = 0; i < 5; i++) {
            map.tiles[18][10 + i * 5] = TILES.PUSH_BLOCK;
            map.tiles[18][12 + i * 5] = TILES.SPIKE;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateComplex6(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Complex 6`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Laser + button
        for (let y = 5; y < 19; y += 4) {
            map.tiles[y][20] = TILES.LASER_H;
        }
        map.tiles[18][10] = TILES.BUTTON;
        map.tiles[18][30] = TILES.BUTTON;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateComplex7(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Complex 7`, 'expert');
        this.fillGround(map, 0, 39, 24);
        // Moving platforms + keys
        for (let i = 0; i < 4; i++) {
            map.tiles[20 - i * 5][10 + i * 7] = TILES.MOVING_PLATFORM_H;
        }
        map.tiles[5][8] = TILES.KEY;
        map.tiles[5][32] = TILES.KEY;
        for (let i = 30; i < 35; i++) {
            map.tiles[24][i] = TILES.LOCKED_DOOR;
        }
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[23][37] = TILES.GOAL;
        return map;
    }
    
    static generateComplex8(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Complex 8`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Jump pads + moving
        for (let i = 0; i < 5; i++) {
            map.tiles[19][8 + i * 6] = TILES.JUMP_PAD;
            map.tiles[15][11 + i * 6] = TILES.MOVING_PLATFORM_H;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateComplex9(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Complex 9`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Speed + bounce combo
        for (let i = 5; i < 35; i += 4) {
            map.tiles[19][i] = TILES.SPEED_BOOST;
            if (i < 30) {
                map.tiles[15][i + 2] = TILES.BOUNCE_PAD;
            }
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateComplex10(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Complex 10`, 'expert');
        this.fillGround(map, 0, 5, 19);
        // Teleport chain
        map.tiles[18][8] = TILES.TELEPORT_IN;
        map.tiles[15][16] = TILES.TELEPORT_OUT;
        map.tiles[15][18] = TILES.TELEPORT_IN;
        map.tiles[12][26] = TILES.TELEPORT_OUT;
        map.tiles[12][28] = TILES.TELEPORT_IN;
        map.tiles[8][35] = TILES.TELEPORT_OUT;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[7][37] = TILES.GOAL;
        return map;
    }
    
    // Nightmare levels
    static generateNightmare1(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Nightmare 1`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Everything combined
        for (let i = 8; i < 35; i += 3) {
            map.tiles[19][i] = [TILES.SPIKE, TILES.ICE, TILES.CRUMBLE, TILES.LASER_V][i % 4];
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateNightmare2(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Nightmare 2`, 'expert');
        this.fillGround(map, 0, 5, 24);
        // Gravity maze with spikes
        for (let y = 5; y < 20; y += 5) {
            for (let x = 10; x < 35; x += 10) {
                map.tiles[y][x] = TILES.GRAVITY_FLIP;
                map.tiles[y][x + 2] = TILES.SPIKE;
            }
        }
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[2][37] = TILES.GOAL;
        return map;
    }
    
    static generateNightmare3(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Nightmare 3`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Crumble + speed
        for (let i = 8; i < 35; i++) {
            map.tiles[19][i] = i % 2 === 0 ? TILES.CRUMBLE : TILES.SPEED_BOOST;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateNightmare4(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Nightmare 4`, 'expert');
        this.fillGround(map, 0, 5, 19);
        // Wind + moving platforms
        for (let y = 10; y < 19; y++) {
            for (let x = 8; x < 30; x += 2) {
                map.tiles[y][x] = TILES.WIND_SIDE;
            }
        }
        map.tiles[15][15] = TILES.MOVING_PLATFORM_V;
        map.tiles[15][25] = TILES.MOVING_PLATFORM_V;
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateNightmare5(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Nightmare 5`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Button hell
        for (let i = 0; i < 5; i++) {
            map.tiles[18][8 + i * 6] = TILES.BUTTON;
            for (let j = 0; j < 4; j++) {
                map.tiles[17][9 + i * 6 + j] = TILES.TOGGLE_BLOCK;
            }
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateNightmare6(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Nightmare 6`, 'expert');
        this.fillGround(map, 0, 5, 19);
        // Key + teleport combo
        map.tiles[18][8] = TILES.TELEPORT_IN;
        map.tiles[10][15] = TILES.TELEPORT_OUT;
        map.tiles[10][17] = TILES.KEY;
        map.tiles[10][20] = TILES.TELEPORT_IN;
        map.tiles[15][28] = TILES.TELEPORT_OUT;
        for (let i = 30; i < 35; i++) {
            map.tiles[19][i] = TILES.LOCKED_DOOR;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateNightmare7(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Nightmare 7`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Laser hell
        for (let y = 5; y < 19; y += 2) {
            for (let x = 8; x < 35; x += 4) {
                map.tiles[y][x] = TILES.LASER_H;
            }
        }
        this.addPlatform(map, 10, 3, 2);
        this.addPlatform(map, 20, 3, 2);
        this.addPlatform(map, 30, 3, 2);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[2][37] = TILES.GOAL;
        return map;
    }
    
    static generateNightmare8(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Nightmare 8`, 'expert');
        this.fillGround(map, 0, 5, 24);
        // Gravity + bounce
        for (let i = 0; i < 6; i++) {
            map.tiles[23 - i * 4][10 + i * 5] = TILES.GRAVITY_FLIP;
            if (i < 5) {
                map.tiles[21 - i * 4][12 + i * 5] = TILES.BOUNCE_PAD;
            }
        }
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[3][37] = TILES.GOAL;
        return map;
    }
    
    static generateNightmare9(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Nightmare 9`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Push block + spike maze
        for (let i = 0; i < 8; i++) {
            map.tiles[18][8 + i * 3] = i % 2 === 0 ? TILES.PUSH_BLOCK : TILES.SPIKE;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateBoss4(level) {
        const map = this.createMap(50, 20, `Stage ${level}: World 4 Boss`, 'expert');
        this.fillGround(map, 0, 49, 19);
        // Ultimate challenge
        for (let i = 10; i < 40; i += 2) {
            map.tiles[19][i] = [TILES.ICE, TILES.SPIKE, TILES.CRUMBLE, TILES.LASER_V][(i / 2) % 4];
        }
        for (let i = 15; i < 35; i += 10) {
            map.tiles[15][i] = TILES.GRAVITY_FLIP;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][47] = TILES.GOAL;
        return map;
    }
    
    // World 5: Master (Ultimate challenge)
    static generateMaster1(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Master 1`, 'expert');
        this.fillGround(map, 0, 5, 19);
        // Everything
        for (let i = 8; i < 35; i += 2) {
            const tiles = [TILES.SPIKE, TILES.ICE, TILES.CRUMBLE, TILES.SPEED_BOOST, TILES.JUMP_PAD];
            map.tiles[19][i] = tiles[i % 5];
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateMaster2(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Master 2`, 'expert');
        this.fillGround(map, 0, 5, 24);
        // Multi teleport
        map.tiles[24][8] = TILES.TELEPORT_IN;
        map.tiles[20][16] = TILES.TELEPORT_OUT;
        map.tiles[20][18] = TILES.TELEPORT_IN;
        map.tiles[16][26] = TILES.TELEPORT_OUT;
        map.tiles[16][28] = TILES.TELEPORT_IN;
        map.tiles[8][35] = TILES.TELEPORT_OUT;
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[7][37] = TILES.GOAL;
        return map;
    }
    
    static generateMaster3(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Master 3`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Button + toggle + laser
        for (let i = 0; i < 4; i++) {
            map.tiles[18][8 + i * 8] = TILES.BUTTON;
            map.tiles[15][10 + i * 8] = TILES.TOGGLE_BLOCK;
            map.tiles[10][12 + i * 8] = TILES.LASER_H;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateMaster4(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Master 4`, 'expert');
        this.fillGround(map, 0, 5, 19);
        // Key hunt extreme
        for (let i = 0; i < 3; i++) {
            map.tiles[15][10 + i * 10] = TILES.KEY;
            map.tiles[18][12 + i * 10] = TILES.SPIKE;
        }
        for (let i = 32; i < 37; i++) {
            map.tiles[19][i] = TILES.LOCKED_DOOR;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateMaster5(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Master 5`, 'expert');
        this.fillGround(map, 0, 39, 24);
        // Wind + moving + gravity
        for (let y = 10; y < 24; y++) {
            for (let x = 8; x < 32; x += 3) {
                map.tiles[y][x] = y % 2 === 0 ? TILES.WIND_UP : TILES.WIND_SIDE;
            }
        }
        map.tiles[20][15] = TILES.MOVING_PLATFORM_H;
        map.tiles[15][25] = TILES.GRAVITY_FLIP;
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[23][37] = TILES.GOAL;
        return map;
    }
    
    static generateMaster6(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Master 6`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Bounce chain + speed
        for (let i = 0; i < 6; i++) {
            map.tiles[19][6 + i * 5] = i % 2 === 0 ? TILES.BOUNCE_PAD : TILES.SPEED_BOOST;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateMaster7(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Master 7`, 'expert');
        this.fillGround(map, 0, 5, 19);
        // Precision ice
        for (let i = 0; i < 25; i++) {
            map.tiles[19][8 + i] = i % 3 === 0 ? TILES.GROUND : TILES.ICE;
        }
        this.fillGround(map, 35, 39, 19);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateMaster8(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Master 8`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Crumble + laser
        for (let i = 8; i < 35; i += 2) {
            map.tiles[19][i] = TILES.CRUMBLE;
            if (i % 4 === 0) {
                map.tiles[15][i] = TILES.LASER_V;
            }
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateMaster9(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Master 9`, 'expert');
        this.fillGround(map, 0, 5, 19);
        // Push puzzle
        for (let i = 0; i < 6; i++) {
            map.tiles[18][8 + i * 4] = TILES.PUSH_BLOCK;
            map.tiles[15][10 + i * 4] = TILES.PLATFORM;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateFinalChallenge(level) {
        const map = this.createMap(50, 25, `Stage ${level}: Final Challenge`, 'expert');
        this.fillGround(map, 0, 49, 24);
        // Everything combined
        for (let i = 10; i < 40; i += 3) {
            const tileType = [TILES.SPIKE, TILES.ICE, TILES.CRUMBLE, TILES.SPEED_BOOST, TILES.GRAVITY_FLIP][i % 5];
            map.tiles[23][i] = tileType;
        }
        map.tiles[20][15] = TILES.TELEPORT_IN;
        map.tiles[10][30] = TILES.TELEPORT_OUT;
        map.tiles[10][35] = TILES.KEY;
        for (let i = 42; i < 47; i++) {
            map.tiles[24][i] = TILES.LOCKED_DOOR;
        }
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[23][47] = TILES.GOAL;
        return map;
    }
    
    static generateUltimate1(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Ultimate 1`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Random chaos
        for (let i = 8; i < 35; i++) {
            const tiles = [TILES.SPIKE, TILES.ICE, TILES.CRUMBLE, TILES.SPEED_BOOST, TILES.BOUNCE_PAD, TILES.GRAVITY_FLIP];
            map.tiles[19][i] = tiles[Math.floor(Math.random() * tiles.length)];
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateUltimate2(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Ultimate 2`, 'expert');
        this.fillGround(map, 0, 5, 24);
        // Vertical challenge
        for (let i = 0; i < 20; i++) {
            this.addPlatform(map, 8 + (i % 3) * 10, 23 - i, 2);
            if (i % 4 === 0) {
                map.tiles[23 - i][10 + (i % 3) * 10] = TILES.SPIKE;
            }
        }
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[3][37] = TILES.GOAL;
        return map;
    }
    
    static generateUltimate3(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Ultimate 3`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Moving platform hell
        for (let i = 0; i < 6; i++) {
            map.tiles[15][8 + i * 5] = TILES.MOVING_PLATFORM_H;
            map.tiles[10][10 + i * 5] = TILES.MOVING_PLATFORM_V;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateUltimate4(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Ultimate 4`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Wind tunnel
        for (let y = 5; y < 19; y++) {
            for (let x = 8; x < 35; x++) {
                map.tiles[y][x] = TILES.WIND_SIDE;
            }
        }
        this.addPlatform(map, 36, 10, 2);
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[10][37] = TILES.GOAL;
        return map;
    }
    
    static generateUltimate5(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Ultimate 5`, 'expert');
        this.fillGround(map, 0, 5, 24);
        // Gravity madness
        for (let y = 5; y < 24; y += 3) {
            for (let x = 8; x < 35; x += 5) {
                map.tiles[y][x] = TILES.GRAVITY_FLIP;
            }
        }
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[2][37] = TILES.GOAL;
        return map;
    }
    
    static generateUltimate6(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Ultimate 6`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Button hell 2
        for (let i = 0; i < 10; i++) {
            map.tiles[18][4 + i * 3] = TILES.BUTTON;
            map.tiles[17][5 + i * 3] = TILES.TOGGLE_BLOCK;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateUltimate7(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Ultimate 7`, 'expert');
        this.fillGround(map, 0, 5, 19);
        // Precision + speed
        for (let i = 0; i < 25; i++) {
            map.tiles[19][8 + i] = i % 2 === 0 ? TILES.SPEED_BOOST : TILES.CRUMBLE;
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateUltimate8(level) {
        const map = this.createMap(40, 25, `Stage ${level}: Ultimate 8`, 'expert');
        this.fillGround(map, 0, 39, 24);
        // Teleport maze
        const teleports = [
            { in: [23, 8], out: [18, 16] },
            { in: [18, 18], out: [13, 26] },
            { in: [13, 28], out: [8, 35] }
        ];
        teleports.forEach(t => {
            map.tiles[t.in[0]][t.in[1]] = TILES.TELEPORT_IN;
            map.tiles[t.out[0]][t.out[1]] = TILES.TELEPORT_OUT;
        });
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[7][37] = TILES.GOAL;
        return map;
    }
    
    static generateUltimate9(level) {
        const map = this.createMap(40, 20, `Stage ${level}: Ultimate 9`, 'expert');
        this.fillGround(map, 0, 39, 19);
        // Everything at once
        for (let i = 8; i < 35; i++) {
            map.tiles[19][i] = [TILES.SPIKE, TILES.ICE, TILES.CRUMBLE, TILES.SPEED_BOOST, TILES.BOUNCE_PAD, TILES.LASER_V][i % 6];
        }
        map.tiles[18][2] = TILES.SPAWN;
        map.tiles[18][37] = TILES.GOAL;
        return map;
    }
    
    static generateBossFinal(level) {
        const map = this.createMap(60, 25, `Stage ${level}: FINAL BOSS`, 'expert');
        this.fillGround(map, 0, 59, 24);
        // The ultimate challenge
        // Section 1: Speed + spikes
        for (let i = 8; i < 20; i += 2) {
            map.tiles[23][i] = TILES.SPEED_BOOST;
            map.tiles[23][i + 1] = TILES.SPIKE;
        }
        // Section 2: Ice slide
        for (let i = 22; i < 35; i++) {
            map.tiles[23][i] = TILES.ICE;
        }
        // Section 3: Crumble run
        for (let i = 37; i < 50; i += 2) {
            map.tiles[23][i] = TILES.CRUMBLE;
        }
        // Section 4: Final challenge
        map.tiles[20][52] = TILES.GRAVITY_FLIP;
        map.tiles[15][55] = TILES.BOUNCE_PAD;
        
        map.tiles[23][2] = TILES.SPAWN;
        map.tiles[10][57] = TILES.GOAL;
        return map;
    }
}

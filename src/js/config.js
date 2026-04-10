/**
 * Game Configuration
 */

export const CONFIG = {
    TILE_SIZE: 32,
    GRAVITY: 0.6,
    FRICTION: 0.85,
    PLAYER_SPEED: 5,
    SPRINT_SPEED: 8,
    JUMP_FORCE: -12,
    DOUBLE_JUMP_FORCE: -10,
    TERMINAL_VELOCITY: 15,
    CAMERA_SMOOTH: 0.1,
    DEAD_ZONE_X: 100,
    DEAD_ZONE_Y: 50,
    FPS_LIMIT: 60,
    ANIMATION_FPS: 10,
    MAX_CAMPAIGN_STAGES: 100
};

export const TILES = {
    EMPTY: 0,
    GROUND: 1,
    PLATFORM: 2,
    SPIKE: 3,
    GOAL: 4,
    COIN: 5,
    CHECKPOINT: 6,
    SPAWN: 7,
    MOVING_PLATFORM_H: 8,
    MOVING_PLATFORM_V: 9,
    JUMP_PAD: 10,
    // New tiles
    PUSH_BLOCK: 11,        // Đẩy người chơi
    SPEED_BOOST: 12,       // Tăng tốc chạy
    ICE: 13,               // Trơn trượt
    BOUNCE_PAD: 14,        // Bật cao hơn jump pad
    TELEPORT_IN: 15,       // Cổng vào
    TELEPORT_OUT: 16,      // Cổng ra
    CRUMBLE: 17,           // Vỡ khi đứng
    GRAVITY_FLIP: 18,      // Đảo gravity
    WIND_UP: 19,           // Gió đẩy lên
    WIND_SIDE: 20,         // Gió đẩy ngang
    LASER_H: 21,           // Laser ngang
    LASER_V: 22,           // Laser dọc
    KEY: 23,               // Chìa khóa
    LOCKED_DOOR: 24,       // Cửa khóa
    BUTTON: 25,            // Nút bấm
    TOGGLE_BLOCK: 26       // Block bật/tắt
};

export const TILE_NAMES = {
    [TILES.GROUND]: 'Ground',
    [TILES.PLATFORM]: 'Platform',
    [TILES.SPIKE]: 'Spike',
    [TILES.GOAL]: 'Goal',
    [TILES.COIN]: 'Coin',
    [TILES.CHECKPOINT]: 'Checkpoint',
    [TILES.SPAWN]: 'Spawn',
    [TILES.MOVING_PLATFORM_H]: 'Moving H',
    [TILES.MOVING_PLATFORM_V]: 'Moving V',
    [TILES.JUMP_PAD]: 'Jump Pad',
    [TILES.PUSH_BLOCK]: 'Push Block',
    [TILES.SPEED_BOOST]: 'Speed Boost',
    [TILES.ICE]: 'Ice',
    [TILES.BOUNCE_PAD]: 'Bounce Pad',
    [TILES.TELEPORT_IN]: 'Teleport In',
    [TILES.TELEPORT_OUT]: 'Teleport Out',
    [TILES.CRUMBLE]: 'Crumble',
    [TILES.GRAVITY_FLIP]: 'Gravity Flip',
    [TILES.WIND_UP]: 'Wind Up',
    [TILES.WIND_SIDE]: 'Wind Side',
    [TILES.LASER_H]: 'Laser H',
    [TILES.LASER_V]: 'Laser V',
    [TILES.KEY]: 'Key',
    [TILES.LOCKED_DOOR]: 'Locked Door',
    [TILES.BUTTON]: 'Button',
    [TILES.TOGGLE_BLOCK]: 'Toggle Block'
};

export const TILE_COLORS = {
    [TILES.EMPTY]: null,
    [TILES.GROUND]: '#8B4513',
    [TILES.PLATFORM]: '#DAA520',
    [TILES.SPIKE]: '#DC143C',
    [TILES.GOAL]: '#32CD32',
    [TILES.COIN]: '#FFD700',
    [TILES.CHECKPOINT]: '#00CED1',
    [TILES.SPAWN]: '#FF69B4',
    [TILES.MOVING_PLATFORM_H]: '#20B2AA',
    [TILES.MOVING_PLATFORM_V]: '#3CB371',
    [TILES.JUMP_PAD]: '#FF6347',
    [TILES.PUSH_BLOCK]: '#FF4500',
    [TILES.SPEED_BOOST]: '#00FF00',
    [TILES.ICE]: '#B0E0E6',
    [TILES.BOUNCE_PAD]: '#FF1493',
    [TILES.TELEPORT_IN]: '#9400D3',
    [TILES.TELEPORT_OUT]: '#8A2BE2',
    [TILES.CRUMBLE]: '#D2691E',
    [TILES.GRAVITY_FLIP]: '#4B0082',
    [TILES.WIND_UP]: '#87CEFA',
    [TILES.WIND_SIDE]: '#ADD8E6',
    [TILES.LASER_H]: '#FF0000',
    [TILES.LASER_V]: '#FF0000',
    [TILES.KEY]: '#FFD700',
    [TILES.LOCKED_DOOR]: '#8B0000',
    [TILES.BUTTON]: '#FFA500',
    [TILES.TOGGLE_BLOCK]: '#696969'
};

export const ACHIEVEMENTS = [
    { id: 'first_blood', name: 'First Death', desc: 'Die for the first time', icon: '💀' },
    { id: 'coin_collector', name: 'Coin Collector', desc: 'Collect 100 coins', icon: '🪙' },
    { id: 'speed_runner', name: 'Speed Runner', desc: 'Complete a level in under 30 seconds', icon: '⚡' },
    { id: 'perfectionist', name: 'Perfectionist', desc: 'Complete a level without dying', icon: '✨' },
    { id: 'map_creator', name: 'Map Creator', desc: 'Create your first map', icon: '🗺️' },
    { id: 'map_master', name: 'Map Master', desc: 'Create 10 maps', icon: '👑' },
    { id: 'stage_10', name: 'Stage 10', desc: 'Complete stage 10', icon: '🏆' },
    { id: 'stage_50', name: 'Stage 50', desc: 'Complete stage 50', icon: '🏆' },
    { id: 'stage_100', name: 'Stage 100', desc: 'Complete stage 100', icon: '👑' },
    { id: 'bot_beaten', name: 'Bot Beaten', desc: 'Beat a map the AI rated 8+ stars', icon: '🤖' }
];

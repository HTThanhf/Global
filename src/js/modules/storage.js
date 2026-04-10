/**
 * Storage Manager - Handles data persistence, auth, and API
 */

import { CONFIG, ACHIEVEMENTS } from '../config.js';
import { CampaignGenerator } from './campaign.js';
import { AIBot } from './ai-bot.js';

export class StorageManager {
    constructor() {
        this.currentUser = null;
        this.users = [];
        this.globalMaps = [];
        this.campaignProgress = {};
        this.botRatings = {};
        
        this.loadData();
        this.initDefaultData();
    }
    
    loadData() {
        // Load users
        const users = localStorage.getItem('platformer_pro_users');
        this.users = users ? JSON.parse(users) : [];
        
        // Load current user
        const current = localStorage.getItem('platformer_pro_current_user');
        if (current) {
            this.currentUser = JSON.parse(current);
        }
        
        // Load global maps
        const maps = localStorage.getItem('platformer_pro_global_maps');
        this.globalMaps = maps ? JSON.parse(maps) : [];
        
        // Load campaign progress
        const progress = localStorage.getItem('platformer_pro_campaign');
        this.campaignProgress = progress ? JSON.parse(progress) : {};
        
        // Load bot ratings
        const ratings = localStorage.getItem('platformer_pro_bot_ratings');
        this.botRatings = ratings ? JSON.parse(ratings) : {};
    }
    
    saveData() {
        localStorage.setItem('platformer_pro_users', JSON.stringify(this.users));
        localStorage.setItem('platformer_pro_current_user', JSON.stringify(this.currentUser));
        localStorage.setItem('platformer_pro_global_maps', JSON.stringify(this.globalMaps));
        localStorage.setItem('platformer_pro_campaign', JSON.stringify(this.campaignProgress));
        localStorage.setItem('platformer_pro_bot_ratings', JSON.stringify(this.botRatings));
    }
    
    initDefaultData() {
        // Create default global maps if none exist
        if (this.globalMaps.length === 0) {
            this.createDefaultGlobalMaps();
        }
        
        // Initialize campaign stages
        this.initCampaignStages();
    }
    
    initCampaignStages() {
        // Check if campaign stages exist
        const stages = localStorage.getItem('platformer_pro_campaign_stages');
        if (!stages) {
            // Generate all 100 stages
            const campaignStages = [];
            for (let i = 1; i <= CONFIG.MAX_CAMPAIGN_STAGES; i++) {
                campaignStages.push(CampaignGenerator.generateStage(i));
            }
            localStorage.setItem('platformer_pro_campaign_stages', JSON.stringify(campaignStages));
        }
    }
    
    getCampaignStage(level) {
        const stages = localStorage.getItem('platformer_pro_campaign_stages');
        if (!stages) {
            this.initCampaignStages();
            return this.getCampaignStage(level);
        }
        const allStages = JSON.parse(stages);
        return allStages[level - 1] || allStages[0];
    }
    
    getCampaignProgress() {
        const userId = this.currentUser?.id;
        if (!userId) return { currentStage: 1, completed: [], stars: {} };
        
        if (!this.campaignProgress[userId]) {
            this.campaignProgress[userId] = {
                currentStage: 1,
                completed: [],
                stars: {},
                bestTimes: {}
            };
        }
        return this.campaignProgress[userId];
    }
    
    updateCampaignProgress(level, stars, time) {
        const userId = this.currentUser?.id;
        if (!userId) return;
        
        const progress = this.getCampaignProgress();
        
        if (!progress.completed.includes(level)) {
            progress.completed.push(level);
        }
        
        // Update stars if better
        if (!progress.stars[level] || stars > progress.stars[level]) {
            progress.stars[level] = stars;
        }
        
        // Update best time
        if (!progress.bestTimes[level] || time < progress.bestTimes[level]) {
            progress.bestTimes[level] = time;
        }
        
        // Advance to next stage
        if (level === progress.currentStage && progress.currentStage < CONFIG.MAX_CAMPAIGN_STAGES) {
            progress.currentStage++;
        }
        
        this.campaignProgress[userId] = progress;
        this.saveData();
        
        // Check achievements
        this.checkAchievements();
    }
    
    createDefaultGlobalMaps() {
        const defaultMaps = [
            {
                id: 'global_1',
                name: 'Jump Master',
                creator: 'System',
                difficulty: 'medium',
                rating: 6.5,
                botRated: true,
                likes: 245,
                plays: 1200,
                verified: true,
                created: Date.now(),
                data: CampaignGenerator.generateBasicJump(0)
            },
            {
                id: 'global_2',
                name: 'Spike Valley',
                creator: 'System',
                difficulty: 'hard',
                rating: 7.2,
                botRated: true,
                likes: 189,
                plays: 890,
                verified: true,
                created: Date.now(),
                data: CampaignGenerator.generateSpikes(0)
            },
            {
                id: 'global_3',
                name: 'Ice Cavern',
                creator: 'System',
                difficulty: 'hard',
                rating: 7.8,
                botRated: true,
                likes: 156,
                plays: 650,
                verified: true,
                created: Date.now(),
                data: CampaignGenerator.generateIceIntro(0)
            },
            {
                id: 'global_4',
                name: 'Teleport Maze',
                creator: 'System',
                difficulty: 'expert',
                rating: 8.5,
                botRated: true,
                likes: 98,
                plays: 420,
                verified: true,
                created: Date.now(),
                data: CampaignGenerator.generateTeleportIntro(0)
            },
            {
                id: 'global_5',
                name: 'Gravity Shift',
                creator: 'System',
                difficulty: 'expert',
                rating: 8.9,
                botRated: true,
                likes: 76,
                plays: 310,
                verified: true,
                created: Date.now(),
                data: CampaignGenerator.generateGravityIntro(0)
            }
        ];
        
        this.globalMaps = defaultMaps;
        this.saveData();
    }
    
    // Authentication
    register(username, password, email = '') {
        // Check if username exists
        if (this.users.find(u => u.username === username)) {
            return { success: false, error: 'Username already exists' };
        }
        
        // Create user
        const user = {
            id: this.generateId(),
            username,
            password: this.hashPassword(password),
            email,
            created: Date.now(),
            stats: {
                totalPlays: 0,
                totalDeaths: 0,
                coinsCollected: 0,
                mapsCreated: 0,
                mapsUploaded: 0
            },
            achievements: [],
            unlockedSkins: ['default'],
            currentSkin: 'default'
        };
        
        this.users.push(user);
        this.currentUser = user;
        this.saveData();
        
        return { success: true, user: this.sanitizeUser(user) };
    }
    
    login(username, password) {
        const user = this.users.find(u => u.username === username);
        if (!user) {
            return { success: false, error: 'User not found' };
        }
        
        if (user.password !== this.hashPassword(password)) {
            return { success: false, error: 'Incorrect password' };
        }
        
        this.currentUser = user;
        this.saveData();
        
        return { success: true, user: this.sanitizeUser(user) };
    }
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('platformer_pro_current_user');
    }
    
    changePassword(oldPassword, newPassword) {
        if (!this.currentUser) {
            return { success: false, error: 'Not logged in' };
        }
        
        if (this.currentUser.password !== this.hashPassword(oldPassword)) {
            return { success: false, error: 'Incorrect old password' };
        }
        
        this.currentUser.password = this.hashPassword(newPassword);
        
        // Update in users array
        const idx = this.users.findIndex(u => u.id === this.currentUser.id);
        if (idx !== -1) {
            this.users[idx] = this.currentUser;
        }
        
        this.saveData();
        return { success: true };
    }
    
    hashPassword(password) {
        // Simple hash - in production use bcrypt or similar
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }
    
    sanitizeUser(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            created: user.created,
            stats: user.stats,
            achievements: user.achievements,
            unlockedSkins: user.unlockedSkins,
            currentSkin: user.currentSkin
        };
    }
    
    getCurrentUser() {
        return this.currentUser ? this.sanitizeUser(this.currentUser) : null;
    }
    
    isLoggedIn() {
        return !!this.currentUser;
    }
    
    // Map management
    saveMapLocal(mapData) {
        if (!this.currentUser) {
            return { success: false, error: 'Must be logged in' };
        }
        
        const userMaps = this.getUserMaps();
        
        const map = {
            id: this.generateId(),
            ...mapData,
            creator: this.currentUser.username,
            creatorId: this.currentUser.id,
            created: Date.now(),
            isLocal: true
        };
        
        userMaps.push(map);
        localStorage.setItem(`platformer_pro_user_maps_${this.currentUser.id}`, 
            JSON.stringify(userMaps));
        
        // Update stats
        this.currentUser.stats.mapsCreated++;
        this.saveData();
        
        return { success: true, map };
    }
    
    getUserMaps() {
        if (!this.currentUser) return [];
        
        const maps = localStorage.getItem(`platformer_pro_user_maps_${this.currentUser.id}`);
        return maps ? JSON.parse(maps) : [];
    }
    
    deleteUserMap(mapId) {
        if (!this.currentUser) return { success: false };
        
        let maps = this.getUserMaps();
        maps = maps.filter(m => m.id !== mapId);
        
        localStorage.setItem(`platformer_pro_user_maps_${this.currentUser.id}`, 
            JSON.stringify(maps));
        
        return { success: true };
    }
    
    // Upload to global (requires verification)
    async uploadMapToGlobal(mapId, botVerification = true) {
        if (!this.currentUser) {
            return { success: false, error: 'Must be logged in' };
        }
        
        const userMaps = this.getUserMaps();
        const map = userMaps.find(m => m.id === mapId);
        if (!map) {
            return { success: false, error: 'Map not found' };
        }
        
        // Check if already uploaded
        if (this.globalMaps.find(m => m.data && m.id === mapId)) {
            return { success: false, error: 'Map already uploaded' };
        }
        
        // Bot verification - must be completable
        let botResult = null;
        if (botVerification) {
            const bot = new AIBot();
            bot.analyzeMap(map.data);
            bot.startPlaying();
            
            // Simulate bot play (simplified)
            let attempts = 0;
            while (attempts < 1000 && bot.state === 'RUNNING') {
                bot.update();
                attempts++;
            }
            
            if (bot.state !== 'FINISHED') {
                return { 
                    success: false, 
                    error: 'Bot could not complete map. Map may be impossible.' 
                };
            }
            
            botResult = {
                rating: bot.rating,
                time: bot.completionTime,
                deaths: bot.deaths
            };
        }
        
        const globalMap = {
            id: `global_${mapId}_${Date.now()}`,
            name: map.name,
            creator: this.currentUser.username,
            creatorId: this.currentUser.id,
            difficulty: map.difficulty || 'medium',
            rating: botResult ? botResult.rating : 5,
            botRated: !!botResult,
            botStats: botResult,
            likes: 0,
            plays: 0,
            verified: true,
            created: Date.now(),
            data: map.data
        };
        
        this.globalMaps.unshift(globalMap);
        this.saveData();
        
        // Update stats
        this.currentUser.stats.mapsUploaded++;
        this.saveData();
        
        return { 
            success: true, 
            map: globalMap,
            botRating: botResult?.rating 
        };
    }
    
    getGlobalMaps(sortBy = 'newest', filter = {}) {
        let maps = [...this.globalMaps];
        
        // Apply filters
        if (filter.difficulty) {
            maps = maps.filter(m => m.difficulty === filter.difficulty);
        }
        if (filter.search) {
            const search = filter.search.toLowerCase();
            maps = maps.filter(m => 
                m.name.toLowerCase().includes(search) ||
                m.creator.toLowerCase().includes(search)
            );
        }
        if (filter.minRating) {
            maps = maps.filter(m => m.rating >= filter.minRating);
        }
        
        // Sort
        switch (sortBy) {
            case 'newest':
                maps.sort((a, b) => b.created - a.created);
                break;
            case 'popular':
                maps.sort((a, b) => b.likes - a.likes);
                break;
            case 'plays':
                maps.sort((a, b) => b.plays - a.plays);
                break;
            case 'rating':
                maps.sort((a, b) => b.rating - a.rating);
                break;
        }
        
        return maps;
    }
    
    likeMap(mapId) {
        const map = this.globalMaps.find(m => m.id === mapId);
        if (map) {
            map.likes++;
            this.saveData();
        }
    }
    
    incrementMapPlays(mapId) {
        const map = this.globalMaps.find(m => m.id === mapId);
        if (map) {
            map.plays = (map.plays || 0) + 1;
            this.saveData();
        }
    }
    
    // Achievements
    checkAchievements() {
        if (!this.currentUser) return [];
        
        const newAchievements = [];
        const progress = this.getCampaignProgress();
        const user = this.currentUser;
        
        ACHIEVEMENTS.forEach(ach => {
            if (user.achievements.includes(ach.id)) return;
            
            let unlocked = false;
            
            switch (ach.id) {
                case 'first_blood':
                    unlocked = user.stats.totalDeaths > 0;
                    break;
                case 'coin_collector':
                    unlocked = user.stats.coinsCollected >= 100;
                    break;
                case 'stage_10':
                    unlocked = progress.completed.includes(10);
                    break;
                case 'stage_50':
                    unlocked = progress.completed.includes(50);
                    break;
                case 'stage_100':
                    unlocked = progress.completed.includes(100);
                    break;
                case 'map_creator':
                    unlocked = user.stats.mapsCreated >= 1;
                    break;
                case 'map_master':
                    unlocked = user.stats.mapsCreated >= 10;
                    break;
            }
            
            if (unlocked) {
                user.achievements.push(ach.id);
                newAchievements.push(ach);
            }
        });
        
        if (newAchievements.length > 0) {
            this.saveData();
        }
        
        return newAchievements;
    }
    
    unlockSkin(skinId) {
        if (!this.currentUser) return false;
        
        if (!this.currentUser.unlockedSkins.includes(skinId)) {
            this.currentUser.unlockedSkins.push(skinId);
            this.saveData();
            return true;
        }
        return false;
    }
    
    setCurrentSkin(skinId) {
        if (!this.currentUser) return false;
        
        if (this.currentUser.unlockedSkins.includes(skinId)) {
            this.currentUser.currentSkin = skinId;
            this.saveData();
            return true;
        }
        return false;
    }
    
    updateStats(stats) {
        if (!this.currentUser) return;
        
        Object.assign(this.currentUser.stats, stats);
        
        const idx = this.users.findIndex(u => u.id === this.currentUser.id);
        if (idx !== -1) {
            this.users[idx] = this.currentUser;
        }
        
        this.saveData();
    }
    
    getLeaderboard() {
        // Sort users by campaign progress and stats
        const sorted = [...this.users].map(u => ({
            username: u.username,
            stages: this.campaignProgress[u.id]?.completed.length || 0,
            maps: u.stats.mapsCreated,
            deaths: u.stats.totalDeaths
        }));
        
        sorted.sort((a, b) => b.stages - a.stages);
        return sorted.slice(0, 10);
    }
    
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Clear all data (for testing)
    clearAllData() {
        localStorage.removeItem('platformer_pro_users');
        localStorage.removeItem('platformer_pro_current_user');
        localStorage.removeItem('platformer_pro_global_maps');
        localStorage.removeItem('platformer_pro_campaign');
        localStorage.removeItem('platformer_pro_bot_ratings');
        localStorage.removeItem('platformer_pro_campaign_stages');
        
        // Clear user maps
        for (let key in localStorage) {
            if (key.startsWith('platformer_pro_user_maps_')) {
                localStorage.removeItem(key);
            }
        }
        
        this.users = [];
        this.currentUser = null;
        this.globalMaps = [];
        this.campaignProgress = {};
        this.botRatings = {};
        
        this.initDefaultData();
    }
}

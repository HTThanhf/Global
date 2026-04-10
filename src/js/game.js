/**
 * Main Game Class - Platformer Pro
 */

import { CONFIG, TILES, ACHIEVEMENTS } from './config.js';
import { InputManager } from './modules/input.js';
import { SoundManager } from './modules/sound.js';
import { StorageManager } from './modules/storage.js';
import { ParticleSystem } from './modules/particles.js';
import { Camera } from './modules/camera.js';
import { Player } from './modules/player.js';
import { GameMap } from './modules/map.js';
import { MapEditor } from './modules/editor.js';
import { AIBot } from './modules/ai-bot.js';
import { CampaignGenerator } from './modules/campaign.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.input = new InputManager();
        this.sound = new SoundManager();
        this.storage = new StorageManager();
        this.particles = new ParticleSystem();
        
        this.player = null;
        this.map = null;
        this.camera = null;
        this.editor = null;
        this.bot = null;
        
        this.state = 'MENU'; // MENU, PLAYING, PAUSED, EDITOR, BOT_TEST
        this.gameMode = 'CAMPAIGN'; // CAMPAIGN, GLOBAL, EDITOR_TEST
        
        this.currentStage = 1;
        this.currentMapId = null;
        
        this.timer = 0;
        this.startTime = 0;
        this.deaths = 0;
        
        this.lastTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.fpsTimer = 0;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.loadSettings();
        
        // Start loop
        this.loop();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera = new Camera(this.canvas.width, this.canvas.height);
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.setupCanvas();
            if (this.editor) this.editor.setupCanvas();
        });
        
        // Setup all UI buttons
        this.setupMainMenu();
        this.setupCampaignMenu();
        this.setupGlobalMapsMenu();
        this.setupEditorMenu();
        this.setupGameUI();
        this.setupAuthUI();
    }
    
    setupMainMenu() {
        document.getElementById('btnCampaign')?.addEventListener('click', () => this.showCampaign());
        document.getElementById('btnGlobalMaps')?.addEventListener('click', () => this.showGlobalMaps());
        document.getElementById('btnMapEditor')?.addEventListener('click', () => this.showEditor());
        document.getElementById('btnMyMaps')?.addEventListener('click', () => this.showMyMaps());
        document.getElementById('btnLeaderboard')?.addEventListener('click', () => this.showLeaderboard());
        document.getElementById('btnSettings')?.addEventListener('click', () => this.showSettings());
        document.getElementById('btnLoginMenu')?.addEventListener('click', () => this.showLogin());
        document.getElementById('btnRegisterMenu')?.addEventListener('click', () => this.showRegister());
        document.getElementById('btnLogout')?.addEventListener('click', () => this.logout());
    }
    
    setupCampaignMenu() {
        document.getElementById('btnCampaignBack')?.addEventListener('click', () => this.showScreen('mainMenu'));
        document.getElementById('btnPlayStage')?.addEventListener('click', () => this.playCurrentStage());
        document.getElementById('btnNextStage')?.addEventListener('click', () => this.nextStage());
        document.getElementById('btnPrevStage')?.addEventListener('click', () => this.prevStage());
    }
    
    setupGlobalMapsMenu() {
        document.getElementById('btnGlobalBack')?.addEventListener('click', () => this.showScreen('mainMenu'));
        document.getElementById('globalSearch')?.addEventListener('input', () => this.filterGlobalMaps());
        document.getElementById('globalSort')?.addEventListener('change', () => this.sortGlobalMaps());
        document.getElementById('globalFilter')?.addEventListener('change', () => this.filterGlobalMaps());
    }
    
    setupEditorMenu() {
        document.getElementById('btnEditorBack')?.addEventListener('click', () => this.exitEditor());
        document.getElementById('btnClearMap')?.addEventListener('click', () => this.editor?.clearMap());
        document.getElementById('btnTestMap')?.addEventListener('click', () => this.testMap());
        document.getElementById('btnVerifyMap')?.addEventListener('click', () => this.verifyMapWithBot());
        document.getElementById('btnSaveMap')?.addEventListener('click', () => this.saveMap());
        document.getElementById('btnResizeMap')?.addEventListener('click', () => this.resizeMap());
        
        // Tool buttons
        document.querySelectorAll('.tool-btn')?.forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (this.editor) {
                    this.editor.setTool(parseInt(btn.dataset.tool));
                }
            });
        });
    }
    
    setupGameUI() {
        document.getElementById('btnPause')?.addEventListener('click', () => this.pause());
        document.getElementById('btnResume')?.addEventListener('click', () => this.resume());
        document.getElementById('btnRestart')?.addEventListener('click', () => this.restart());
        document.getElementById('btnExit')?.addEventListener('click', () => this.exitToMenu());
        document.getElementById('btnRespawn')?.addEventListener('click', () => this.respawn());
        document.getElementById('btnNextLevel')?.addEventListener('click', () => this.nextLevel());
        document.getElementById('btnWinRestart')?.addEventListener('click', () => this.restart());
    }
    
    setupAuthUI() {
        document.getElementById('btnLoginSubmit')?.addEventListener('click', () => this.login());
        document.getElementById('btnRegisterSubmit')?.addEventListener('click', () => this.register());
        document.getElementById('btnAuthBack')?.addEventListener('click', () => this.showScreen('mainMenu'));
        
        // Enter key support
        document.getElementById('loginPassword')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('registerPassword')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.register();
        });
    }
    
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('platformer_pro_settings') || '{}');
        this.sound.setEnabled(settings.sound !== false);
        this.sound.setVolume((settings.volume || 50) / 100);
        this.updateAuthUI();
    }
    
    saveSettings() {
        const settings = {
            sound: this.sound.enabled,
            volume: Math.round(this.sound.volume * 100),
            showFps: document.getElementById('showFps')?.checked || false
        };
        localStorage.setItem('platformer_pro_settings', JSON.stringify(settings));
    }
    
    // Screen navigation
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId)?.classList.add('active');
        
        // Update auth UI when showing main menu
        if (screenId === 'mainMenu') {
            this.updateAuthUI();
        }
    }
    
    updateAuthUI() {
        const user = this.storage.getCurrentUser();
        const usernameEl = document.getElementById('usernameDisplay');
        const loginBtn = document.getElementById('btnLoginMenu');
        const registerBtn = document.getElementById('btnRegisterMenu');
        const logoutBtn = document.getElementById('btnLogout');
        
        if (usernameEl) usernameEl.textContent = user ? user.username : 'Guest';
        
        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (registerBtn) registerBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
        } else {
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (registerBtn) registerBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    }
    
    // Authentication
    showLogin() {
        this.showScreen('loginScreen');
    }
    
    showRegister() {
        this.showScreen('registerScreen');
    }
    
    login() {
        const username = document.getElementById('loginUsername')?.value;
        const password = document.getElementById('loginPassword')?.value;
        
        if (!username || !password) {
            alert('Please enter username and password');
            return;
        }
        
        const result = this.storage.login(username, password);
        if (result.success) {
            this.sound.playClick();
            this.showScreen('mainMenu');
            this.updateAuthUI();
        } else {
            alert(result.error);
        }
    }
    
    register() {
        const username = document.getElementById('registerUsername')?.value;
        const password = document.getElementById('registerPassword')?.value;
        const email = document.getElementById('registerEmail')?.value;
        
        if (!username || !password) {
            alert('Please enter username and password');
            return;
        }
        
        if (password.length < 4) {
            alert('Password must be at least 4 characters');
            return;
        }
        
        const result = this.storage.register(username, password, email);
        if (result.success) {
            this.sound.playClick();
            this.showScreen('mainMenu');
            this.updateAuthUI();
        } else {
            alert(result.error);
        }
    }
    
    logout() {
        this.storage.logout();
        this.updateAuthUI();
        this.showScreen('mainMenu');
    }
    
    // Campaign
    showCampaign() {
        this.sound.playClick();
        this.showScreen('campaignScreen');
        this.updateCampaignUI();
    }
    
    updateCampaignUI() {
        const progress = this.storage.getCampaignProgress();
        const stageDisplay = document.getElementById('currentStageDisplay');
        const completedEl = document.getElementById('stagesCompleted');
        const starsEl = document.getElementById('totalStars');
        
        if (stageDisplay) stageDisplay.textContent = this.currentStage;
        if (completedEl) completedEl.textContent = progress.completed.length;
        
        const totalStars = Object.values(progress.stars || {}).reduce((a, b) => a + b, 0);
        if (starsEl) starsEl.textContent = totalStars;
        
        // Update stage selector
        const maxStage = progress.currentStage;
        const prevBtn = document.getElementById('btnPrevStage');
        const nextBtn = document.getElementById('btnNextStage');
        
        if (prevBtn) prevBtn.disabled = this.currentStage <= 1;
        if (nextBtn) nextBtn.disabled = this.currentStage >= maxStage;
    }
    
    nextStage() {
        const progress = this.storage.getCampaignProgress();
        if (this.currentStage < progress.currentStage) {
            this.currentStage++;
            this.updateCampaignUI();
        }
    }
    
    prevStage() {
        if (this.currentStage > 1) {
            this.currentStage--;
            this.updateCampaignUI();
        }
    }
    
    playCurrentStage() {
        this.sound.init();
        this.sound.playClick();
        this.gameMode = 'CAMPAIGN';
        
        const stageData = this.storage.getCampaignStage(this.currentStage);
        this.loadMap(stageData);
    }
    
    // Global Maps
    showGlobalMaps() {
        this.sound.playClick();
        this.showScreen('globalMapsScreen');
        this.renderGlobalMaps();
    }
    
    renderGlobalMaps() {
        const container = document.getElementById('globalMapsList');
        if (!container) return;
        
        const maps = this.storage.getGlobalMaps();
        
        if (maps.length === 0) {
            container.innerHTML = '<p class="no-maps">No maps available. Be the first to upload!</p>';
            return;
        }
        
        container.innerHTML = maps.map(map => `
            <div class="map-card ${map.botRated ? 'bot-rated' : ''}">
                <div class="map-header">
                    <span class="map-name">${map.name}</span>
                    <span class="map-difficulty ${map.difficulty}">${map.difficulty}</span>
                </div>
                <div class="map-creator">by ${map.creator}</div>
                ${map.botRated ? `
                    <div class="bot-rating">
                        <span class="stars">${'★'.repeat(Math.floor(map.rating))}${'☆'.repeat(10 - Math.floor(map.rating))}</span>
                        <span class="rating-num">${map.rating}/10</span>
                        ${map.botStats ? `
                            <span class="bot-stats">Bot: ${map.botStats.deaths}⚰️ ${map.botStats.time.toFixed(1)}s</span>
                        ` : ''}
                    </div>
                ` : '<div class="bot-rating pending">⏳ Pending bot verification</div>'}
                <div class="map-stats">
                    <span>❤️ ${map.likes}</span>
                    <span>▶️ ${map.plays}</span>
                </div>
                <button class="btn-play" onclick="game.playGlobalMap('${map.id}')">Play</button>
            </div>
        `).join('');
    }
    
    filterGlobalMaps() {
        const search = document.getElementById('globalSearch')?.value || '';
        const difficulty = document.getElementById('globalFilter')?.value || '';
        const minRating = document.getElementById('minRating')?.value || 0;
        
        const maps = this.storage.getGlobalMaps('newest', {
            search,
            difficulty: difficulty !== 'all' ? difficulty : null,
            minRating: parseFloat(minRating) || 0
        });
        
        this.renderFilteredMaps(maps);
    }
    
    sortGlobalMaps() {
        const sortBy = document.getElementById('globalSort')?.value || 'newest';
        const maps = this.storage.getGlobalMaps(sortBy);
        this.renderFilteredMaps(maps);
    }
    
    renderFilteredMaps(maps) {
        const container = document.getElementById('globalMapsList');
        if (!container) return;
        
        if (maps.length === 0) {
            container.innerHTML = '<p class="no-maps">No maps match your filters</p>';
            return;
        }
        
        // Reuse render logic
        this.renderGlobalMaps();
    }
    
    playGlobalMap(mapId) {
        this.sound.init();
        this.sound.playClick();
        this.gameMode = 'GLOBAL';
        this.currentMapId = mapId;
        
        const maps = this.storage.getGlobalMaps();
        const map = maps.find(m => m.id === mapId);
        
        if (map) {
            this.storage.incrementMapPlays(mapId);
            this.loadMap(map.data);
        }
    }
    
    // Editor
    showEditor(mapData = null) {
        this.sound.playClick();
        this.showScreen('editorScreen');
        
        const editorCanvas = document.getElementById('editorCanvas');
        this.editor = new MapEditor(editorCanvas, this.storage);
        
        if (mapData) {
            this.editor.loadMap(mapData);
        }
        
        this.editor.start();
        this.state = 'EDITOR';
    }
    
    exitEditor() {
        if (this.editor) {
            this.editor.stop();
            this.editor = null;
        }
        this.state = 'MENU';
        this.showScreen('mainMenu');
    }
    
    testMap() {
        if (!this.editor) return;
        
        const validation = this.editor.checkValidation();
        if (!validation.valid) {
            alert('Map errors:\n' + validation.errors.join('\n'));
            return;
        }
        
        this.gameMode = 'EDITOR_TEST';
        this.loadMap(this.editor.getMapData());
    }
    
    async verifyMapWithBot() {
        if (!this.editor) return;
        
        const validation = this.editor.checkValidation();
        if (!validation.valid) {
            alert('Fix map errors before verification:\n' + validation.errors.join('\n'));
            return;
        }
        
        this.showScreen('botVerificationScreen');
        
        const statusEl = document.getElementById('botStatus');
        const progressEl = document.getElementById('botProgress');
        const resultEl = document.getElementById('botResult');
        
        if (statusEl) statusEl.textContent = '🤖 Bot is analyzing map...';
        if (progressEl) progressEl.style.width = '0%';
        if (resultEl) resultEl.innerHTML = '';
        
        // Run bot
        this.bot = new AIBot();
        this.bot.analyzeMap(this.editor.getMapData());
        this.bot.startPlaying();
        
        // Simulate bot playing
        let attempts = 0;
        const maxAttempts = 1000;
        
        const runBotStep = () => {
            if (attempts >= maxAttempts || this.bot.state === 'FINISHED' || this.bot.state === 'FAILED') {
                this.onBotComplete();
                return;
            }
            
            const result = this.bot.update();
            attempts++;
            
            if (progressEl) {
                progressEl.style.width = `${Math.min(100, (attempts / maxAttempts) * 100)}%`;
            }
            
            requestAnimationFrame(runBotStep);
        };
        
        runBotStep();
    }
    
    onBotComplete() {
        const resultEl = document.getElementById('botResult');
        const statusEl = document.getElementById('botStatus');
        
        if (this.bot.state === 'FINISHED') {
            const rating = this.bot.rating;
            const difficulty = this.bot.getDifficultyLabel();
            
            if (statusEl) statusEl.textContent = '✅ Bot completed the map!';
            if (resultEl) {
                resultEl.innerHTML = `
                    <div class="bot-success">
                        <h3>🎉 Map Verified!</h3>
                        <p>Bot Rating: <span class="rating">${rating}/10</span></p>
                        <p>Difficulty: <span class="difficulty">${difficulty}</span></p>
                        <p>Time: ${this.bot.completionTime.toFixed(2)}s</p>
                        <p>Deaths: ${this.bot.deaths}</p>
                        <button class="btn-primary" onclick="game.showEditor()">Continue Editing</button>
                        <button class="btn-secondary" onclick="game.saveVerifiedMap()">Save Map</button>
                    </div>
                `;
            }
            
            this.editor.verifiedByBot = true;
            this.editor.needsVerification = false;
            this.sound.playBotComplete(rating);
        } else {
            if (statusEl) statusEl.textContent = '❌ Bot could not complete map';
            if (resultEl) {
                resultEl.innerHTML = `
                    <div class="bot-fail">
                        <h3>⚠️ Map Too Difficult</h3>
                        <p>The AI bot could not complete this map after ${this.bot.maxAttempts} attempts.</p>
                        <p>This may mean the map is:</p>
                        <ul>
                            <li>Too difficult or impossible</li>
                            <li>Requires tricks the bot doesn't know</li>
                            <li>Has a bug or missing elements</li>
                        </ul>
                        <button class="btn-primary" onclick="game.showEditor()">Back to Editor</button>
                    </div>
                `;
            }
        }
    }
    
    saveMap() {
        if (!this.editor) return;
        
        const validation = this.editor.checkValidation();
        if (!validation.valid) {
            alert('Cannot save - fix errors first:\n' + validation.errors.join('\n'));
            return;
        }
        
        const mapName = prompt('Enter map name:');
        if (!mapName) return;
        
        const difficulty = document.getElementById('mapDifficulty')?.value || 'medium';
        
        const mapData = {
            name: mapName,
            difficulty: difficulty,
            data: this.editor.getMapData()
        };
        
        const result = this.storage.saveMapLocal(mapData);
        
        if (result.success) {
            alert('Map saved! You can upload it to Global Maps from My Maps.');
        } else {
            alert('Error: ' + result.error);
        }
    }
    
    saveVerifiedMap() {
        if (!this.editor || !this.editor.verifiedByBot) return;
        
        const mapName = prompt('Enter map name:', 'Verified Map');
        if (!mapName) return;
        
        const difficulty = this.bot.getDifficultyLabel().toLowerCase();
        
        const mapData = {
            name: mapName,
            difficulty: difficulty,
            data: this.editor.getMapData(),
            botRating: this.bot.rating,
            botVerified: true
        };
        
        const result = this.storage.saveMapLocal(mapData);
        
        if (result.success) {
            this.sound.playWin();
            alert(`✅ Map saved with ${this.bot.rating}/10 rating!\n\nYou can now upload it to Global Maps.`);
            this.showScreen('mainMenu');
        } else {
            alert('Error: ' + result.error);
        }
    }
    
    resizeMap() {
        if (!this.editor) return;
        
        const width = parseInt(prompt('Map width (tiles):', '40'));
        const height = parseInt(prompt('Map height (tiles):', '30'));
        
        if (width && height && width >= 20 && width <= 100 && height >= 10 && height <= 50) {
            this.editor.resizeMap(width, height);
        }
    }
    
    showMyMaps() {
        this.sound.playClick();
        this.showScreen('myMapsScreen');
        this.renderMyMaps();
    }
    
    renderMyMaps() {
        const container = document.getElementById('myMapsList');
        if (!container) return;
        
        const maps = this.storage.getUserMaps();
        
        if (maps.length === 0) {
            container.innerHTML = '<p class="no-maps">You have no saved maps. Create one in the Editor!</p>';
            return;
        }
        
        container.innerHTML = maps.map(map => `
            <div class="map-card">
                <div class="map-header">
                    <span class="map-name">${map.name}</span>
                    <span class="map-difficulty ${map.difficulty}">${map.difficulty}</span>
                </div>
                ${map.botVerified ? `<div class="bot-badge">✅ Bot Verified ${map.botRating}/10</div>` : ''}
                <div class="map-actions">
                    <button class="btn-small" onclick="game.editUserMap('${map.id}')">Edit</button>
                    <button class="btn-small" onclick="game.playUserMap('${map.id}')">Test</button>
                    <button class="btn-small ${map.botVerified ? '' : 'disabled'}" 
                        ${map.botVerified ? `onclick="game.uploadMap('${map.id}')"` : 'disabled'}
                        title="${map.botVerified ? 'Upload to Global Maps' : 'Must be bot verified first'}">
                        Upload
                    </button>
                    <button class="btn-small btn-danger" onclick="game.deleteUserMap('${map.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }
    
    editUserMap(mapId) {
        const maps = this.storage.getUserMaps();
        const map = maps.find(m => m.id === mapId);
        if (map) {
            this.showEditor(map.data);
        }
    }
    
    playUserMap(mapId) {
        const maps = this.storage.getUserMaps();
        const map = maps.find(m => m.id === mapId);
        if (map) {
            this.loadMap(map.data);
        }
    }
    
    async uploadMap(mapId) {
        const result = await this.storage.uploadMapToGlobal(mapId, true);
        
        if (result.success) {
            this.sound.playWin();
            alert(`🎉 Map uploaded to Global Maps!\n\nBot rated it ${result.botRating}/10`);
            this.renderMyMaps();
        } else {
            alert('Upload failed: ' + result.error);
        }
    }
    
    deleteUserMap(mapId) {
        if (confirm('Delete this map permanently?')) {
            this.storage.deleteUserMap(mapId);
            this.renderMyMaps();
        }
    }
    
    // Game loading
    loadMap(mapData) {
        this.sound.init();
        this.map = new GameMap(mapData);
        this.camera.setBounds(this.map.width, this.map.height);
        
        // Get player skin
        const user = this.storage.getCurrentUser();
        const skin = user?.currentSkin || 'default';
        
        const spawnX = this.map.spawn.x * CONFIG.TILE_SIZE + 4;
        const spawnY = this.map.spawn.y * CONFIG.TILE_SIZE;
        this.player = new Player(spawnX, spawnY, skin);
        
        this.state = 'PLAYING';
        this.showScreen('gameScreen');
        
        this.timer = 0;
        this.startTime = Date.now();
        this.deaths = 0;
        this.particles.clear();
        
        // Hide overlays
        document.getElementById('pauseMenu')?.classList.add('hidden');
        document.getElementById('winScreen')?.classList.add('hidden');
        document.getElementById('deathScreen')?.classList.add('hidden');
    }
    
    // Game loop
    loop() {
        const now = Date.now();
        const delta = (now - this.lastTime) / 1000;
        this.lastTime = now;
        
        if (this.state === 'PLAYING') {
            this.update(delta);
            this.render();
        } else if (this.state === 'BOT_TEST') {
            this.updateBotTest(delta);
        }
        
        // FPS counter
        this.frameCount++;
        this.fpsTimer += delta;
        if (this.fpsTimer >= 1) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
            const fpsEl = document.getElementById('fpsCounter');
            if (fpsEl) fpsEl.textContent = this.fps + ' FPS';
        }
        
        this.input.update();
        requestAnimationFrame(() => this.loop());
    }
    
    update(delta) {
        if (!this.player || !this.map) return;
        
        // Update timer
        this.timer = Math.floor((Date.now() - this.startTime) / 1000);
        this.updateHUD();
        
        // Update map
        this.map.update();
        
        // Update player
        const result = this.player.update(this.input, this.map, this.particles);
        
        if (result === 'die') {
            this.playerDie();
        } else if (result === 'jump' || result === 'jumppad') {
            this.sound.playJump();
        } else if (result === 'doublejump') {
            this.sound.playDoubleJump();
        } else if (result === 'coin') {
            this.sound.playCoin();
        } else if (result === 'checkpoint') {
            this.sound.playCheckpoint();
            this.camera.shake(5);
        } else if (result === 'win') {
            this.win();
        } else if (result === 'bounce') {
            this.sound.playBounce();
        } else if (result === 'teleport') {
            this.sound.playTeleport();
        } else if (result === 'unlock') {
            this.sound.playUnlock();
        }
        
        // Update camera
        this.camera.follow(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        
        // Update particles
        this.particles.update();
        
        // Pause
        if (this.input.isPressed('Escape')) {
            this.pause();
        }
        
        // Restart
        if (this.input.isPressed('KeyR')) {
            this.restart();
        }
    }
    
    render() {
        // Clear
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.drawBackground();
        
        // Map
        if (this.map) {
            this.map.draw(this.ctx, this.camera);
        }
        
        // Particles
        this.particles.draw(this.ctx, this.camera.x, this.camera.y);
        
        // Player
        if (this.player) {
            this.player.draw(this.ctx, this.camera.x, this.camera.y);
        }
    }
    
    drawBackground() {
        // Clouds
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        const offset = this.camera.x * 0.3;
        for (let i = 0; i < 5; i++) {
            const x = ((i * 300) - offset * 0.5) % (this.canvas.width + 200);
            const adjustedX = x < -100 ? x + this.canvas.width + 300 : x;
            this.drawCloud(adjustedX, 100 + i * 50);
        }
    }
    
    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, Math.PI * 2);
        this.ctx.arc(x + 30, y - 10, 35, 0, Math.PI * 2);
        this.ctx.arc(x + 60, y, 30, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    updateHUD() {
        const mins = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const secs = (this.timer % 60).toString().padStart(2, '0');
        
        const timeEl = document.getElementById('hudTime');
        const coinEl = document.getElementById('hudCoins');
        const deathEl = document.getElementById('hudDeaths');
        
        if (timeEl) timeEl.textContent = `Time: ${mins}:${secs}`;
        if (coinEl) coinEl.textContent = `Coins: ${this.player?.coins || 0}`;
        if (deathEl) deathEl.textContent = `Deaths: ${this.deaths}`;
    }
    
    // Game events
    playerDie() {
        this.deaths++;
        this.sound.playDie();
        this.particles.emitExplosion(this.player.x + 12, this.player.y + 16, '#FF6B6B');
        this.camera.shake(10);
        
        document.getElementById('deathScreen')?.classList.remove('hidden');
        this.state = 'DEAD';
    }
    
    respawn() {
        document.getElementById('deathScreen')?.classList.add('hidden');
        this.player.reset();
        this.state = 'PLAYING';
    }
    
    win() {
        this.sound.playWin();
        this.state = 'WON';
        
        // Calculate stars (based on deaths and time)
        let stars = 3;
        if (this.deaths > 5) stars = 2;
        if (this.deaths > 10) stars = 1;
        
        // Update campaign progress
        if (this.gameMode === 'CAMPAIGN') {
            this.storage.updateCampaignProgress(this.currentStage, stars, this.timer);
        }
        
        // Update stats
        if (this.storage.isLoggedIn()) {
            this.storage.updateStats({
                totalPlays: (this.storage.currentUser?.stats?.totalPlays || 0) + 1,
                coinsCollected: (this.storage.currentUser?.stats?.coinsCollected || 0) + (this.player?.coins || 0)
            });
        }
        
        // Show win screen
        const mins = Math.floor(this.timer / 60).toString().padStart(2, '0');
        const secs = (this.timer % 60).toString().padStart(2, '0');
        
        document.getElementById('winTime')?.textContent(`${mins}:${secs}`);
        document.getElementById('winDeaths')?.textContent = this.deaths;
        document.getElementById('winCoins')?.textContent = this.player?.coins || 0;
        document.getElementById('winStars')?.textContent = '★'.repeat(stars);
        
        document.getElementById('winScreen')?.classList.remove('hidden');
        
        // Check achievements
        const newAchievements = this.storage.checkAchievements();
        if (newAchievements.length > 0) {
            this.showAchievements(newAchievements);
        }
    }
    
    showAchievements(achievements) {
        achievements.forEach((ach, i) => {
            setTimeout(() => {
                this.sound.playAchievement();
                this.particles.emitAchievement(this.canvas.width / 2, this.canvas.height / 2);
                
                // Show toast
                const toast = document.createElement('div');
                toast.className = 'achievement-toast';
                toast.innerHTML = `
                    <div class="achievement-icon">${ach.icon}</div>
                    <div class="achievement-info">
                        <div class="achievement-name">${ach.name}</div>
                        <div class="achievement-desc">${ach.desc}</div>
                    </div>
                `;
                document.body.appendChild(toast);
                
                setTimeout(() => toast.remove(), 4000);
            }, i * 1500);
        });
    }
    
    pause() {
        if (this.state === 'PLAYING') {
            this.state = 'PAUSED';
            document.getElementById('pauseMenu')?.classList.remove('hidden');
        }
    }
    
    resume() {
        this.state = 'PLAYING';
        document.getElementById('pauseMenu')?.classList.add('hidden');
        this.startTime = Date.now() - this.timer * 1000;
    }
    
    restart() {
        document.getElementById('pauseMenu')?.classList.add('hidden');
        document.getElementById('winScreen')?.classList.add('hidden');
        document.getElementById('deathScreen')?.classList.add('hidden');
        
        this.player.fullReset();
        this.startTime = Date.now();
        this.timer = 0;
        this.state = 'PLAYING';
        this.particles.clear();
    }
    
    nextLevel() {
        if (this.gameMode === 'CAMPAIGN') {
            this.currentStage++;
            this.playCurrentStage();
        } else {
            this.exitToMenu();
        }
    }
    
    exitToMenu() {
        document.getElementById('pauseMenu')?.classList.add('hidden');
        document.getElementById('winScreen')?.classList.add('hidden');
        document.getElementById('deathScreen')?.classList.add('hidden');
        
        this.state = 'MENU';
        this.showScreen('mainMenu');
    }
    
    // Leaderboard
    showLeaderboard() {
        this.sound.playClick();
        this.showScreen('leaderboardScreen');
        this.renderLeaderboard();
    }
    
    renderLeaderboard() {
        const container = document.getElementById('leaderboardList');
        if (!container) return;
        
        const leaders = this.storage.getLeaderboard();
        
        container.innerHTML = leaders.map((user, i) => `
            <div class="leaderboard-item ${i < 3 ? 'top-' + (i + 1) : ''}">
                <span class="rank">${i + 1}</span>
                <span class="username">${user.username}</span>
                <span class="stat">${user.stages} stages</span>
                <span class="stat">${user.maps} maps</span>
            </div>
        `).join('');
    }
    
    // Settings
    showSettings() {
        this.sound.playClick();
        this.showScreen('settingsScreen');
    }
    
    // Make game available globally
    static init() {
        window.game = new Game();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});

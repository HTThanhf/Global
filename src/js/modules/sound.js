/**
 * Sound Manager - Synthesized audio using Web Audio API
 */

export class SoundManager {
    constructor() {
        this.enabled = true;
        this.volume = 0.5;
        this.context = null;
        this.initialized = false;
        this.synth = null;
    }
    
    init() {
        if (this.initialized) return;
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Audio not supported');
        }
    }
    
    generateTone(frequency, duration, type = 'sine', volume = 1) {
        if (!this.initialized || !this.enabled) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, this.context.currentTime);
        
        const vol = this.volume * volume * 0.3;
        gain.gain.setValueAtTime(vol, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.context.destination);
        
        osc.start();
        osc.stop(this.context.currentTime + duration);
    }
    
    generateSlide(startFreq, endFreq, duration, type = 'square') {
        if (!this.initialized || !this.enabled) return;
        
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, this.context.currentTime + duration);
        
        const vol = this.volume * 0.3;
        gain.gain.setValueAtTime(vol, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.context.destination);
        
        osc.start();
        osc.stop(this.context.currentTime + duration);
    }
    
    // Sound effects
    playJump() {
        this.generateTone(300, 0.15, 'square');
        setTimeout(() => this.generateTone(450, 0.1, 'square'), 50);
    }
    
    playDoubleJump() {
        this.generateTone(400, 0.1, 'square');
        setTimeout(() => this.generateTone(600, 0.15, 'square'), 50);
    }
    
    playCoin() {
        this.generateTone(900, 0.1, 'sine');
        setTimeout(() => this.generateTone(1200, 0.1, 'sine'), 50);
    }
    
    playWin() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.generateTone(freq, 0.3, 'square'), i * 150);
        });
    }
    
    playDie() {
        this.generateSlide(200, 150, 0.4, 'sawtooth');
    }
    
    playCheckpoint() {
        this.generateTone(600, 0.2, 'sine');
        setTimeout(() => this.generateTone(800, 0.3, 'sine'), 100);
    }
    
    playClick() {
        this.generateTone(800, 0.05, 'sine', 0.5);
    }
    
    playBounce() {
        this.generateSlide(400, 600, 0.2, 'square');
    }
    
    playTeleport() {
        this.generateTone(1000, 0.3, 'sine');
        setTimeout(() => this.generateTone(500, 0.3, 'sine'), 100);
    }
    
    playPowerUp() {
        const notes = [400, 500, 600, 800];
        notes.forEach((freq, i) => {
            setTimeout(() => this.generateTone(freq, 0.15, 'square'), i * 80);
        });
    }
    
    playUnlock() {
        this.generateTone(400, 0.1, 'square');
        setTimeout(() => this.generateTone(600, 0.2, 'square'), 100);
        setTimeout(() => this.generateTone(800, 0.4, 'square'), 200);
    }
    
    playCrumble() {
        this.generateSlide(300, 100, 0.3, 'sawtooth');
    }
    
    playWind() {
        this.generateTone(200, 0.5, 'sine', 0.3);
    }
    
    playLaser() {
        this.generateSlide(800, 1200, 0.15, 'sawtooth');
    }
    
    playAchievement() {
        const notes = [523, 659, 784, 1047, 1319];
        notes.forEach((freq, i) => {
            setTimeout(() => this.generateTone(freq, 0.4, 'square', 0.7), i * 120);
        });
    }
    
    playBotStart() {
        this.generateTone(600, 0.2, 'square');
        setTimeout(() => this.generateTone(800, 0.3, 'square'), 200);
    }
    
    playBotComplete(stars) {
        const baseFreq = 400 + stars * 100;
        for (let i = 0; i < stars; i++) {
            setTimeout(() => this.generateTone(baseFreq + i * 50, 0.3, 'sine'), i * 200);
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        if (enabled && !this.initialized) {
            this.init();
        }
    }
    
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
    
    resume() {
        if (this.context && this.context.state === 'suspended') {
            this.context.resume();
        }
    }
}

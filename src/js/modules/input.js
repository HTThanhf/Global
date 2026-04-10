/**
 * Input Manager - Handles keyboard, mouse, and touch input
 */

export class InputManager {
    constructor() {
        this.keys = {};
        this.keysPressed = {};
        this.keysReleased = {};
        this.mouse = { x: 0, y: 0, down: false, clicked: false };
        this.touch = { active: false, x: 0, y: 0, startX: 0, startY: 0 };
        this.touchJoystick = { active: false, dx: 0, dy: 0 };
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard
        window.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keysPressed[e.code] = true;
            }
            this.keys[e.code] = true;
            
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keysReleased[e.code] = true;
        });
        
        // Mouse
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        window.addEventListener('mousedown', (e) => {
            this.mouse.down = true;
            this.mouse.clicked = true;
        });
        
        window.addEventListener('mouseup', () => {
            this.mouse.down = false;
        });
        
        // Touch with joystick support
        window.addEventListener('touchstart', (e) => {
            this.touch.active = true;
            this.touch.x = e.touches[0].clientX;
            this.touch.y = e.touches[0].clientY;
            this.touch.startX = this.touch.x;
            this.touch.startY = this.touch.y;
            
            // Left side = joystick
            if (this.touch.x < window.innerWidth / 2) {
                this.touchJoystick.active = true;
            }
        });
        
        window.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.touch.x = e.touches[0].clientX;
            this.touch.y = e.touches[0].clientY;
            
            if (this.touchJoystick.active) {
                this.touchJoystick.dx = (this.touch.x - this.touch.startX) / 50;
                this.touchJoystick.dy = (this.touch.y - this.touch.startY) / 50;
                // Clamp
                const len = Math.sqrt(this.touchJoystick.dx ** 2 + this.touchJoystick.dy ** 2);
                if (len > 1) {
                    this.touchJoystick.dx /= len;
                    this.touchJoystick.dy /= len;
                }
            }
        });
        
        window.addEventListener('touchend', (e) => {
            if (e.touches.length === 0) {
                this.touch.active = false;
                this.touchJoystick.active = false;
                this.touchJoystick.dx = 0;
                this.touchJoystick.dy = 0;
            }
        });
    }
    
    isDown(code) {
        return !!this.keys[code];
    }
    
    isPressed(code) {
        return !!this.keysPressed[code];
    }
    
    isReleased(code) {
        return !!this.keysReleased[code];
    }
    
    getAxisX() {
        let x = 0;
        if (this.isDown('KeyA') || this.isDown('ArrowLeft')) x -= 1;
        if (this.isDown('KeyD') || this.isDown('ArrowRight')) x += 1;
        if (this.touchJoystick.active) x += this.touchJoystick.dx;
        return Math.max(-1, Math.min(1, x));
    }
    
    isJumpPressed() {
        return this.isPressed('KeyW') || this.isPressed('Space') || this.isPressed('ArrowUp') ||
               (this.touch.active && !this.touchJoystick.active && this.touch.y < window.innerHeight / 2);
    }
    
    isSprinting() {
        return this.isDown('ShiftLeft') || this.isDown('ShiftRight');
    }
    
    update() {
        this.keysPressed = {};
        this.keysReleased = {};
        this.mouse.clicked = false;
    }
}

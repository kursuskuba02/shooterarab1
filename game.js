// Hijaiyah letters with their transliterations
const hijaiyahLetters = [
    { arabic: 'ا', trans: 'alif' },
    { arabic: 'ب', trans: 'ba' },
    { arabic: 'ت', trans: 'ta' },
    { arabic: 'ث', trans: 'tsa' },
    { arabic: 'ج', trans: 'jim' },
    { arabic: 'ح', trans: 'ha' },
    { arabic: 'خ', trans: 'kha' },
    { arabic: 'د', trans: 'dal' },
    { arabic: 'ذ', trans: 'dzal' },
    { arabic: 'ر', trans: 'ra' },
    { arabic: 'ز', trans: 'zai' },
    { arabic: 'س', trans: 'sin' },
    { arabic: 'ش', trans: 'syin' },
    { arabic: 'ص', trans: 'shad' },
    { arabic: 'ض', trans: 'dhad' },
    { arabic: 'ط', trans: 'tha' },
    { arabic: 'ظ', trans: 'zha' },
    { arabic: 'ع', trans: 'ain' },
    { arabic: 'غ', trans: 'ghain' },
    { arabic: 'ف', trans: 'fa' },
    { arabic: 'ق', trans: 'qaf' },
    { arabic: 'ك', trans: 'kaf' },
    { arabic: 'ل', trans: 'lam' },
    { arabic: 'م', trans: 'mim' },
    { arabic: 'ن', trans: 'nun' },
    { arabic: 'و', trans: 'wau' },
    { arabic: 'ه', trans: 'ha' },
    { arabic: 'ء', trans: 'hamzah' },
    { arabic: 'ي', trans: 'ya' }
];

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.levelElement = document.getElementById('level');
        this.gameOverElement = document.getElementById('gameOver');
        this.targetElement = document.getElementById('target');
        this.startButton = document.getElementById('startButton');
        this.bossHealthElement = document.getElementById('bossHealth');
        this.bossHealthBarElement = document.getElementById('bossHealthBar');
        this.bossHealthTextElement = document.getElementById('bossHealthText');

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.player = {
            x: this.width / 2,
            y: this.height - 50,
            width: 50,
            height: 50,
            lives: 3
        };

        this.bullets = [];
        this.letters = [];
        this.healthOrbs = [];
        this.spikeOrbs = [];
        this.bossBullets = [];
        this.score = 0;
        this.currentTarget = null;
        this.gameOver = false;
        this.letterSpeed = 1;
        this.spawnInterval = 2000;
        this.targetSpawnInterval = 5000; // Target letter spawn interval
        this.lastSpawn = 0;
        this.lastTargetSpawn = 0;
        this.lastHealthOrbSpawn = 0;
        this.lastSpikeOrbSpawn = 0;
        this.healthOrbInterval = 20000; // 20 seconds
        this.spikeOrbInterval = 5000; // Reduced to 5 seconds for more challenge
        this.mouseX = this.width / 2;
        this.mouseY = this.height - 50;
        this.spikeOrbs = [];
        this.leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        this.hearts = document.querySelectorAll('.heart');
        this.boss = null;

        // Add touch handling properties
        this.isTouchDevice = 'ontouchstart' in window;
        this.touchStartX = 0;
        this.touchStartY = 0;
        
        // Joystick properties
        this.joystick = {
            active: false,
            startX: 0,
            startY: 0,
            moveX: 0,
            moveY: 0,
            element: document.querySelector('.joystick'),
            area: document.querySelector('.joystick-area')
        };

        // Shoot button
        this.shootButton = document.querySelector('.shoot-button');
        
        // Control settings
        this.controls = {
            joystick: {
                sensitivity: {
                    normal: 0.032,    // Slightly reduced for better control
                    precision: 0.018,  // More precise
                    boost: 0.06       // Faster boost
                },
                radius: 50,
                deadzone: 1.2,        // More responsive
                smoothing: 0.94,      // Even smoother
                maxSpeed: this.width * 0.006,
                visualFeedback: true,
                adaptiveControl: true,
                boostThreshold: this.width * 0.25,  // Easier to trigger boost
                precisionThreshold: this.width * 0.1 // Zone for precision mode
            },
            shooting: {
                mobileFireRate: {
                    normal: 260,      // Slightly faster base rate
                    rapid: 160,       // Faster rapid fire
                    precision: 320    // Slower for precision
                },
                bulletSpeed: this.width * 0.02,
                recoilRecovery: 0.998,
                screenShakeAmount: 1.0,
                screenShakeDuration: 30,
                autoAim: {
                    enabled: true,
                    strength: {
                        near: 0.025,   // Stronger close-range
                        far: 0.008     // Weaker far-range
                    },
                    range: this.height * 0.5,
                    predictive: true,
                    momentum: 0.4
                }
            },
            effects: {
                trailEffect: true,
                trailLength: 10,
                bulletTrail: true,
                hitEffect: true,
                powerupEffects: true,
                backgroundStars: true,
                colorCycling: true,
                particleDensity: 1.4,
                weatherEffects: true,
                ambientParticles: true,
                glowEffects: true,     // Enhanced glow
                shockwaves: true       // New shockwave effects
            },
            difficulty: {
                adaptiveSpeed: true,
                baseSpeed: this.height * 0.0016,  // Slightly slower base speed
                speedMultiplier: 1,
                scoreMultiplier: 1,
                levelProgression: {
                    speedIncrease: 0.08,    // More gradual increase
                    levelThreshold: 80,     // Easier to level up
                    maxLevel: 12,           // More levels
                    currentLevel: 1,
                    bonusThresholds: [100, 250, 500, 1000]  // Score milestones
                },
                dynamicDifficulty: {
                    enabled: true,
                    checkInterval: 4000,    // More frequent checks
                    lastCheck: Date.now(),
                    performanceHistory: [],
                    adaptationRate: 0.15,   // How quickly difficulty adapts
                    minSpeedMultiplier: 0.6,
                    maxSpeedMultiplier: 1.8
                },
                comboSystem: {
                    enabled: true,
                    multiplier: 1,
                    duration: 5000,
                    lastHitTime: 0
                }
            }
        };

        // Visual effects
        this.effects = {
            particles: [],
            trails: [],
            hitEffects: [],
            stars: this.initStars(),
            powerups: [],
            weather: this.initWeather(),
            ambient: this.initAmbientParticles(),
            shockwaves: [],
            colorCycle: {
                hue: 0,
                speed: 0.6,
                saturation: 100,
                brightness: 50
            }
        };

        // Combo system
        this.combo = {
            count: 0,
            multiplier: 1,
            lastHitTime: 0,
            maxMultiplier: 4,
            decayRate: 0.1,
            messages: ['جيد!', 'رائع!', 'ممتاز!', 'مذهل!', 'لا يصدق!']  // Good, Great, Excellent, Amazing, Incredible
        };

        // Movement smoothing variables
        this.smoothedX = 0;
        this.smoothedY = 0;

        // Initialize with responsive canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.bindEvents();
        this.startButton.addEventListener('click', () => this.startGame());
        document.getElementById('submitScore').addEventListener('click', () => this.submitScore());
        document.getElementById('restartGame').addEventListener('click', () => this.startGame());
        this.updateLeaderboardDisplay();
    }

    resizeCanvas() {
        const container = document.getElementById('game-container');
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate aspect ratio
        const gameAspectRatio = 4/3;
        let newWidth, newHeight;
        
        if (containerWidth / containerHeight > gameAspectRatio) {
            // Container is wider than needed
            newHeight = containerHeight;
            newWidth = containerHeight * gameAspectRatio;
        } else {
            // Container is taller than needed
            newWidth = containerWidth;
            newHeight = containerWidth / gameAspectRatio;
        }
        
        // Update canvas size
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        
        // Update game dimensions
        this.width = newWidth;
        this.height = newHeight;
        
        // Scale player and game elements
        this.player.width = newWidth * 0.1;  // 10% of screen width
        this.player.height = this.player.width * 0.75;
        
        // Adjust player position
        if (this.player.x > this.width - this.player.width) {
            this.player.x = this.width - this.player.width;
        }
        if (this.player.y > this.height - this.player.height) {
            this.player.y = this.height - this.player.height;
        }
    }

    bindEvents() {
        if (this.isTouchDevice) {
            // Joystick controls
            this.joystick.area.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const touch = e.touches[0];
                const rect = this.joystick.area.getBoundingClientRect();
                
                this.joystick.active = true;
                this.joystick.startX = touch.clientX - rect.left;
                this.joystick.startY = touch.clientY - rect.top;
                
                // Center the joystick on touch
                this.joystick.element.style.left = (this.joystick.startX - 25) + 'px';
                this.joystick.element.style.bottom = (rect.height - this.joystick.startY - 25) + 'px';
            });

            document.addEventListener('touchmove', (e) => {
                if (!this.joystick.active) return;
                
                const touch = e.touches[0];
                const rect = this.joystick.area.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                // Calculate joystick movement
                let deltaX = x - this.joystick.startX;
                let deltaY = y - this.joystick.startY;
                
                // Apply deadzone
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance < this.controls.joystick.deadzone) {
                    deltaX = 0;
                    deltaY = 0;
                }
                
                // Limit joystick movement radius
                const radius = this.controls.joystick.radius;
                if (distance > radius) {
                    deltaX = (deltaX / distance) * radius;
                    deltaY = (deltaY / distance) * radius;
                }
                
                // Update joystick position
                this.joystick.element.style.left = (this.joystick.startX + deltaX - 25) + 'px';
                this.joystick.element.style.bottom = (rect.height - (this.joystick.startY + deltaY) - 25) + 'px';
                
                // Calculate target movement with adjusted sensitivity
                const moveX = (deltaX / radius) * this.width * this.controls.joystick.sensitivity.normal;
                const moveY = (deltaY / radius) * this.height * this.controls.joystick.sensitivity.normal;
                
                // Apply smoothing
                this.smoothedX = this.smoothedX * this.controls.joystick.smoothing + 
                    moveX * (1 - this.controls.joystick.smoothing);
                this.smoothedY = this.smoothedY * this.controls.joystick.smoothing + 
                    moveY * (1 - this.controls.joystick.smoothing);
                
                // Update player position with smoothing and bounds checking
                this.player.x = Math.max(0, Math.min(this.width - this.player.width, 
                    this.player.x + this.smoothedX));
                this.player.y = Math.max(0, Math.min(this.height - this.player.height, 
                    this.player.y - this.smoothedY));
            });

            document.addEventListener('touchend', () => {
                if (!this.joystick.active) return;
                
                this.joystick.active = false;
                // Reset joystick position
                this.joystick.element.style.left = '35px';
                this.joystick.element.style.bottom = '35px';
            });

            // Shoot button
            this.shootButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.shoot();
            });

            // Auto-shoot while holding the button with adjusted fire rate
            let shootInterval;
            this.shootButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.shoot();
                shootInterval = setInterval(() => {
                    this.shoot();
                    // Apply recoil effect
                    this.player.y += 2;
                    setTimeout(() => {
                        this.player.y -= 2 * this.controls.shooting.recoilRecovery;
                    }, 50);
                }, this.controls.shooting.mobileFireRate.current);
            });

            this.shootButton.addEventListener('touchend', () => {
                clearInterval(shootInterval);
            });
        } else {
            // Desktop controls remain unchanged
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.player.x = e.clientX - rect.left - this.player.width / 2;
                this.player.y = e.clientY - rect.top - this.player.height / 2;
                
                // Keep player within bounds
                this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));
                this.player.y = Math.max(0, Math.min(this.height - this.player.height, this.player.y));
            });
            
            this.canvas.addEventListener('click', () => this.shoot());
        }
    }

    startGame() {
        this.score = 0;
        this.letters = [];
        this.bullets = [];
        this.healthOrbs = [];
        this.spikeOrbs = [];
        this.bossBullets = [];
        this.boss = null;
        this.gameOver = false;
        this.player.lives = 3;
        this.startButton.style.display = 'none';
        this.gameOverElement.style.display = 'none';
        this.bossHealthElement.style.display = 'none';
        document.getElementById('playerName').value = '';
        this.lastHealthOrbSpawn = Date.now();
        this.lastSpikeOrbSpawn = Date.now();
        this.lastTargetSpawn = Date.now();
        this.selectNewTarget();
        this.update();
    }

    selectNewTarget() {
        this.currentTarget = hijaiyahLetters[Math.floor(Math.random() * hijaiyahLetters.length)];
        document.getElementById('target').textContent = this.currentTarget.trans;
    }

    shoot() {
        const bullet = {
            x: this.player.x + this.player.width / 2 - 5,
            y: this.player.y,
            width: this.width * 0.015,
            height: this.height * 0.025,
            speed: this.controls.shooting.bulletSpeed
        };
        this.bullets.push(bullet);
        
        // Enhanced screen shake effect
        if (this.isTouchDevice) {
            const amount = this.controls.shooting.screenShakeAmount;
            const duration = this.controls.shooting.screenShakeDuration;
            
            this.canvas.style.transform = `translate(${Math.random() * 2 - 1}px, ${amount}px)`;
            setTimeout(() => {
                this.canvas.style.transform = 'translate(0, 0)';
            }, duration);
        }

        // Add muzzle flash effect
        for (let i = 0; i < 3; i++) {  // Multiple particles for better effect
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 1;
            this.effects.particles.push({
                x: bullet.x + bullet.width / 2,
                y: bullet.y + bullet.height,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                size: bullet.width * (Math.random() + 1),
                color: 'rgba(255, 200, 0, 0.8)'
            });
        }
    }

    spawnLetter(forceTarget = false) {
        let letter;
        if (forceTarget) {
            letter = this.currentTarget;
        } else {
            letter = hijaiyahLetters[Math.floor(Math.random() * hijaiyahLetters.length)];
        }
        
        const letterSize = this.width * 0.06; // 6% of screen width
        const x = Math.random() * (this.width - letterSize);
        
        this.letters.push({
            x: x,
            y: -letterSize,
            width: letterSize,
            height: letterSize,
            speed: this.height * 0.003, // 0.3% of screen height
            letter: letter
        });
        
        if (forceTarget) {
            this.currentTarget = letter;
            this.lastTargetSpawn = Date.now();
        }
    }

    spawnHealthOrb() {
        this.healthOrbs.push({
            x: Math.random() * (this.width - 20),
            y: -20,
            width: 20,
            height: 20,
            speed: 5,
            dx: (Math.random() - 0.5) * 8, // Random horizontal movement
            dy: Math.random() * 3 + 3 // Random vertical movement
        });
    }

    spawnSpikeOrb() {
        // Spawn 2-4 spike orbs at once
        const count = Math.floor(Math.random() * 3) + 2; // Random number between 2 and 4
        for (let i = 0; i < count; i++) {
            this.spikeOrbs.push({
                x: Math.random() * (this.width - 40),
                y: -40 - (i * 30), // Stagger vertical positions
                width: 40,
                height: 40,
                speed: 4,
                dx: (Math.random() - 0.5) * 8,
                dy: Math.random() * 4 + 3
            });
        }
    }

    spawnBoss() {
        this.boss = {
            x: this.width / 4,
            y: 100,
            width: this.width / 2,
            height: 120,
            health: 5,
            maxHealth: 5,
            dx: 2,
            dy: 1,
            lastShot: 0,
            shotInterval: 1000,
            targetHits: 0
        };
        this.bossHealthElement.style.display = 'block';
        this.updateBossHealth();
    }

    updateBossHealth() {
        const percentage = (this.boss.health / this.boss.maxHealth) * 100;
        this.bossHealthBarElement.style.width = percentage + '%';
        this.bossHealthTextElement.textContent = `صحة العدو: ${this.boss.health}/${this.boss.maxHealth}`;
    }

    update() {
        if (this.gameOver) return;

        // Update dynamic difficulty
        this.updateDifficulty();

        // Update weather effects
        if (this.controls.effects.weatherEffects) {
            this.effects.weather.forEach(particle => {
                particle.x += Math.cos(particle.angle) * particle.speed;
                particle.y += Math.sin(particle.angle) * particle.speed;
                
                if (particle.y > this.height) {
                    particle.y = 0;
                    particle.x = Math.random() * this.width;
                }
                if (particle.x > this.width) {
                    particle.x = 0;
                }
            });
        }

        // Update ambient particles
        if (this.controls.effects.ambientParticles) {
            this.effects.ambient.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around screen
                if (particle.x < 0) particle.x = this.width;
                if (particle.x > this.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.height;
                if (particle.y > this.height) particle.y = 0;
                
                // Random movement changes
                if (Math.random() < 0.01) {
                    particle.vx = (Math.random() - 0.5) * 0.5;
                    particle.vy = (Math.random() - 0.5) * 0.5;
                }
            });
        }

        // Adaptive fire rate based on target density
        if (this.isTouchDevice) {
            const nearbyTargets = this.letters.filter(letter => {
                const dx = letter.x - this.player.x;
                const dy = letter.y - this.player.y;
                return Math.sqrt(dx * dx + dy * dy) < this.height * 0.3;
            }).length;
            
            this.controls.shooting.mobileFireRate.current = 
                nearbyTargets > 2 ? this.controls.shooting.mobileFireRate.rapid :
                                  this.controls.shooting.mobileFireRate.normal;
        }

        // Adaptive movement speed
        if (this.controls.joystick.adaptiveControl && this.joystick.active) {
            let nearestDist = Infinity;
            this.letters.forEach(letter => {
                const dx = letter.x - this.player.x;
                const dy = letter.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                nearestDist = Math.min(nearestDist, dist);
            });
            
            // Choose sensitivity based on distance
            let sensitivity;
            if (nearestDist < this.player.width * 3) {
                sensitivity = this.controls.joystick.sensitivity.precision;
            } else if (nearestDist > this.controls.joystick.boostThreshold) {
                sensitivity = this.controls.joystick.sensitivity.boost;
            } else {
                sensitivity = this.controls.joystick.sensitivity.normal;
            }
            
            // Apply movement with selected sensitivity
            this.smoothedX = this.smoothedX * this.controls.joystick.smoothing + 
                this.joystick.moveX * sensitivity * (1 - this.controls.joystick.smoothing);
            this.smoothedY = this.smoothedY * this.controls.joystick.smoothing + 
                this.joystick.moveY * sensitivity * (1 - this.controls.joystick.smoothing);
        }

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw weather effects
        if (this.controls.effects.weatherEffects) {
            this.ctx.strokeStyle = 'rgba(180, 180, 255, 0.3)';
            this.ctx.lineWidth = 1;
            this.effects.weather.forEach(particle => {
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(
                    particle.x + Math.cos(particle.angle) * particle.size * 2,
                    particle.y + Math.sin(particle.angle) * particle.size * 2
                );
                this.ctx.stroke();
            });
        }

        // Draw ambient particles
        if (this.controls.effects.ambientParticles) {
            this.effects.ambient.forEach(particle => {
                this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }

        // Update color cycling
        if (this.controls.effects.colorCycling) {
            this.effects.colorCycle.hue = (this.effects.colorCycle.hue + this.effects.colorCycle.speed) % 360;
        }

        // Update adaptive difficulty
        if (this.controls.difficulty.adaptiveSpeed) {
            const recentPerformance = this.score / Math.max(1, this.missedLetters);
            this.controls.difficulty.speedMultiplier = 1 + (recentPerformance * 0.01);
        }

        // Predictive auto-aim
        if (this.controls.shooting.autoAim.enabled && this.letters.length > 0) {
            let bestTarget = null;
            let bestScore = -Infinity;
            
            this.letters.forEach(letter => {
                const dx = letter.x - this.player.x;
                const dy = letter.y - this.player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < this.controls.shooting.autoAim.range) {
                    // Calculate prediction score based on multiple factors
                    const timeToIntercept = dist / this.controls.shooting.bulletSpeed;
                    const predictedX = letter.x + letter.speedX * timeToIntercept;
                    const predictedY = letter.y + letter.speedY * timeToIntercept;
                    
                    // Score based on distance and prediction accuracy
                    const score = (this.controls.shooting.autoAim.range - dist) +
                                (this.width - Math.abs(this.player.x - predictedX)) * 0.5;
                    
                    if (score > bestScore) {
                        bestScore = score;
                        bestTarget = { x: predictedX, y: predictedY };
                    }
                }
            });
            
            // Apply adaptive aim assist
            if (bestTarget) {
                const aimStrength = 0.02;  // Subtle aim assistance
                this.player.x += (bestTarget.x - this.player.x) * aimStrength;
            }
        }

        // Enhanced particle effects
        this.effects.particles = this.effects.particles.filter(particle => {
            particle.x += particle.vx || 0;
            particle.y += particle.vy || 0;
            particle.alpha *= 0.95;
            particle.size *= 0.97;
            
            if (this.controls.effects.colorCycling && particle.cycleable) {
                particle.color = `hsla(${this.effects.colorCycle.hue}, 100%, 50%, ${particle.alpha})`;
            }
            
            return particle.alpha > 0.1;
        });

        // Update letters with adaptive speed
        this.letters.forEach(letter => {
            letter.y += this.controls.difficulty.baseSpeed * 
                       this.controls.difficulty.speedMultiplier;
            
            // Add subtle horizontal movement
            if (!letter.speedX) {
                letter.speedX = (Math.random() - 0.5) * this.width * 0.001;
            }
            letter.x += letter.speedX;
            
            // Bounce off walls
            if (letter.x <= 0 || letter.x + letter.width >= this.width) {
                letter.speedX *= -1;
            }
        });

        // Check for boss spawn
        if (this.score > 0 && this.score % 50 === 0 && !this.boss) {
            this.spawnBoss();
        }

        // Spawn target letter every 5 seconds
        if (Date.now() - this.lastTargetSpawn > this.targetSpawnInterval) {
            this.spawnLetter(true);
            this.lastTargetSpawn = Date.now();
        }
        
        // Spawn random letters
        if (Date.now() - this.lastSpawn > this.spawnInterval) {
            this.spawnLetter(false);
            this.lastSpawn = Date.now();
        }

        // Spawn health orbs
        if (Date.now() - this.lastHealthOrbSpawn > this.healthOrbInterval) {
            this.spawnHealthOrb();
            this.lastHealthOrbSpawn = Date.now();
        }

        // Spawn spike orbs
        if (Date.now() - this.lastSpikeOrbSpawn > this.spikeOrbInterval) {
            this.spawnSpikeOrb();
            this.lastSpikeOrbSpawn = Date.now();
        }

        // Update boss
        if (this.boss) {
            this.updateBoss();
            this.drawBoss();

            // Update boss bullets
            for (let i = this.bossBullets.length - 1; i >= 0; i--) {
                const bullet = this.bossBullets[i];
                bullet.x += bullet.dx;
                bullet.y += bullet.dy;

                // Check collision with player
                if (this.checkCollision(this.player, bullet)) {
                    this.player.lives--;
                    if (this.player.lives <= 0) {
                        this.gameOver = true;
                        this.gameOverElement.style.display = 'block';
                    }
                    this.bossBullets.splice(i, 1);
                    continue;
                }

                // Remove if out of bounds
                if (bullet.y > this.height) {
                    this.bossBullets.splice(i, 1);
                    continue;
                }

                // Draw bullet
                this.ctx.beginPath();
                this.ctx.arc(bullet.x, bullet.y, bullet.width/2, 0, Math.PI * 2);
                this.ctx.fillStyle = '#ff0000';
                this.ctx.fill();
            }
        }

        // Update and draw bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;
            
            if (bullet.y < 0) {
                this.bullets.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }

        // Update and draw health orbs
        for (let i = this.healthOrbs.length - 1; i >= 0; i--) {
            const orb = this.healthOrbs[i];
            
            // Update position with random movement
            orb.x += orb.dx;
            orb.y += orb.dy;
            
            // Bounce off walls
            if (orb.x <= 0 || orb.x >= this.width - orb.width) {
                orb.dx *= -1;
            }

            // Check collision with player
            if (this.checkCollision(this.player, orb)) {
                this.player.lives = Math.min(this.player.lives + 1, 5);
                this.healthOrbs.splice(i, 1);
                continue;
            }

            if (orb.y > this.height) {
                this.healthOrbs.splice(i, 1);
                continue;
            }

            // Draw health orb with gradient
            this.ctx.beginPath();
            const gradient = this.ctx.createRadialGradient(
                orb.x + orb.width/2, orb.y + orb.height/2, 0,
                orb.x + orb.width/2, orb.y + orb.height/2, orb.width/2
            );
            gradient.addColorStop(0, '#81C784');
            gradient.addColorStop(1, '#4CAF50');
            this.ctx.fillStyle = gradient;
            this.ctx.arc(orb.x + orb.width/2, orb.y + orb.height/2, orb.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.closePath();
        }

        // Update and draw spike orbs
        for (let i = this.spikeOrbs.length - 1; i >= 0; i--) {
            const orb = this.spikeOrbs[i];
            
            // Update position with random movement
            orb.x += orb.dx;
            orb.y += orb.dy;
            
            // Bounce off walls
            if (orb.x <= 0 || orb.x >= this.width - orb.width) {
                orb.dx *= -1;
            }

            // Check collision with player
            if (this.checkCollision(this.player, orb)) {
                this.player.lives--;
                if (this.player.lives <= 0) {
                    this.gameOver = true;
                    this.gameOverElement.style.display = 'block';
                }
                this.spikeOrbs.splice(i, 1);
                continue;
            }

            if (orb.y > this.height) {
                this.spikeOrbs.splice(i, 1);
                continue;
            }

            // Draw spike orb
            this.ctx.beginPath();
            const gradient = this.ctx.createRadialGradient(
                orb.x + orb.width/2, orb.y + orb.height/2, 0,
                orb.x + orb.width/2, orb.y + orb.height/2, orb.width/2
            );
            gradient.addColorStop(0, '#f44336');
            gradient.addColorStop(1, '#d32f2f');
            
            // Draw spiky circle
            const spikes = 8;
            const outerRadius = orb.width/2;
            const innerRadius = orb.width/4;
            const centerX = orb.x + orb.width/2;
            const centerY = orb.y + orb.height/2;
            
            for(let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i / spikes) * Math.PI;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                
                if(i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            
            this.ctx.closePath();
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }

        // Update and draw letters
        for (let i = this.letters.length - 1; i >= 0; i--) {
            const letter = this.letters[i];
            letter.y += this.letterSpeed;

            // Check collision with player
            if (this.checkCollision(this.player, {
                x: letter.x - 25,
                y: letter.y - 25,
                width: 50,
                height: 50
            })) {
                this.player.lives--;
                if (this.player.lives <= 0) {
                    this.gameOver = true;
                    this.gameOverElement.style.display = 'block';
                }
                this.letters.splice(i, 1);
                continue;
            }

            // Check for collision with bullets
            for (let j = this.bullets.length - 1; j >= 0; j--) {
                const bullet = this.bullets[j];
                if (this.checkCollision(bullet, letter)) {
                    if (letter.letter === this.currentTarget) {
                        this.score += 10;
                        this.updateScore();
                        this.selectNewTarget();
                        this.updateCombo(true);
                    } else {
                        this.player.lives--;
                        if (this.player.lives <= 0) {
                            this.gameOver = true;
                            this.gameOverElement.style.display = 'block';
                        }
                        this.updateCombo(false);
                    }
                    this.letters.splice(i, 1);
                    this.bullets.splice(j, 1);
                    break;
                }
            }

            // Check if letter reached bottom
            if (letter.y > this.height) {
                if (letter.letter === this.currentTarget) {
                    this.player.lives--;
                    if (this.player.lives <= 0) {
                        this.gameOver = true;
                        this.gameOverElement.style.display = 'block';
                    }
                    this.selectNewTarget(); // Select new target when current one is missed
                    this.updateCombo(false);
                }
                this.letters.splice(i, 1);
                continue;
            }

            // Draw letter in bubble
            this.drawLetter(letter.letter.arabic, letter.x + letter.width / 2, letter.y + letter.height / 2);
        }

        // Check bullet collisions with boss
        if (this.boss) {
            for (let i = this.bullets.length - 1; i >= 0; i--) {
                const bullet = this.bullets[i];
                if (this.checkCollision(bullet, this.boss)) {
                    this.bullets.splice(i, 1);
                    // Only count hits when the correct letter is shot
                    for (let j = this.letters.length - 1; j >= 0; j--) {
                        const letter = this.letters[j];
                        if (this.checkCollision(bullet, letter) && letter.letter === this.currentTarget) {
                            this.boss.targetHits++;
                            this.letters.splice(j, 1);
                            if (this.boss.targetHits >= 5) {
                                this.score += 20;
                                this.boss = null;
                                this.bossHealthElement.style.display = 'none';
                                this.bossBullets = [];
                            } else {
                                this.boss.health--;
                                this.updateBossHealth();
                            }
                            break;
                        }
                    }
                }
            }
        }

        // Update player trails
        if (this.controls.effects.trailEffect && this.isTouchDevice) {
            if (Math.abs(this.smoothedX) > 0.1 || Math.abs(this.smoothedY) > 0.1) {
                this.effects.trails.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y + this.player.height,
                    alpha: 1,
                    size: this.player.width * 0.3
                });
            }
            
            // Update trails
            for (let i = this.effects.trails.length - 1; i >= 0; i--) {
                this.effects.trails[i].alpha -= 0.1;
                this.effects.trails[i].size *= 0.95;
                if (this.effects.trails[i].alpha <= 0) {
                    this.effects.trails.splice(i, 1);
                }
            }
        }

        // Update hit effects
        for (let i = this.effects.hitEffects.length - 1; i >= 0; i--) {
            const effect = this.effects.hitEffects[i];
            effect.life -= 1;
            effect.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.size *= 0.9;
            });
            if (effect.life <= 0) {
                this.effects.hitEffects.splice(i, 1);
            }
        }

        // Update bullets with trails
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;
            
            if (this.controls.effects.bulletTrail) {
                this.effects.particles.push({
                    x: bullet.x + bullet.width / 2,
                    y: bullet.y + bullet.height,
                    alpha: 1,
                    size: bullet.width * 0.5,
                    color: 'rgba(255, 200, 0, 0.5)'
                });
            }
            
            if (bullet.y + bullet.height < 0) {
                this.bullets.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.effects.particles.length - 1; i >= 0; i--) {
            this.effects.particles[i].alpha -= 0.1;
            this.effects.particles[i].size *= 0.95;
            if (this.effects.particles[i].alpha <= 0) {
                this.effects.particles.splice(i, 1);
            }
        }

        // Draw trails
        this.effects.trails.forEach(trail => {
            this.ctx.beginPath();
            this.ctx.fillStyle = `rgba(100, 200, 255, ${trail.alpha * 0.3})`;
            this.ctx.arc(trail.x, trail.y, trail.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw bullet trails
        this.effects.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.fillStyle = particle.color || `rgba(255, 255, 255, ${particle.alpha})`;
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw hit effects
        this.effects.hitEffects.forEach(effect => {
            effect.particles.forEach(p => {
                this.ctx.beginPath();
                this.ctx.fillStyle = `rgba(255, 200, 0, ${p.alpha})`;
                this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
        });

        // Draw player spaceship
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = 'rgba(100, 200, 255, 0.5)';
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.shadowBlur = 0;

        // Draw bullets with glow
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = 'rgba(255, 200, 0, 0.5)';
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = '#FFC107';
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        this.ctx.shadowBlur = 0;

        // Update lives display
        this.updateLives();

        // Update stars (parallax background)
        if (this.controls.effects.backgroundStars) {
            this.effects.stars.forEach(star => {
                star.y += star.speed;
                if (star.y > this.height) {
                    star.y = 0;
                    star.x = Math.random() * this.width;
                }
            });
        }

        // Draw stars
        if (this.controls.effects.backgroundStars) {
            this.ctx.fillStyle = '#FFF';
            this.effects.stars.forEach(star => {
                this.ctx.globalAlpha = star.speed * 0.5;  // Brighter stars move faster
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
            this.ctx.globalAlpha = 1;
        }

        // Draw joystick direction indicator
        if (this.controls.joystick.visualFeedback && this.isTouchDevice && this.joystick.active) {
            const centerX = this.player.x + this.player.width / 2;
            const centerY = this.player.y + this.player.height / 2;
            
            this.ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(
                centerX + this.smoothedX * 50,
                centerY + this.smoothedY * 50
            );
            this.ctx.stroke();
        }

        // Draw powerup effects
        if (this.controls.effects.powerupEffects) {
            this.effects.powerups.forEach(powerup => {
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(${powerup.color}, ${powerup.alpha})`;
                this.ctx.lineWidth = 3;
                this.ctx.arc(
                    this.player.x + this.player.width / 2,
                    this.player.y + this.player.height / 2,
                    powerup.radius,
                    0, Math.PI * 2
                );
                this.ctx.stroke();
            });
        }

        // Enhanced bullet trails
        if (this.controls.effects.bulletTrail) {
            this.bullets.forEach(bullet => {
                // Draw bullet wake
                this.ctx.beginPath();
                this.ctx.strokeStyle = 'rgba(255, 200, 0, 0.2)';
                this.ctx.lineWidth = bullet.width * 0.8;
                this.ctx.moveTo(bullet.x + bullet.width / 2, bullet.y);
                this.ctx.lineTo(bullet.x + bullet.width / 2, bullet.y + bullet.height * 2);
                this.ctx.stroke();
            });
        }

        // Update shockwaves
        this.effects.shockwaves = this.effects.shockwaves.filter(wave => {
            wave.radius += wave.speed;
            wave.alpha *= 0.95;
            return wave.radius < wave.maxRadius && wave.alpha > 0.1;
        });

        // Draw shockwaves
        if (this.controls.effects.shockwaves) {
            this.effects.shockwaves.forEach(wave => {
                this.ctx.strokeStyle = wave.color.replace(')', `, ${wave.alpha})`);
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
                this.ctx.stroke();
            });
        }

        // Draw combo counter
        if (this.combo.count > 1) {
            this.ctx.fillStyle = `hsl(${this.effects.colorCycle.hue}, 100%, 50%)`;
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(
                `التركيبة x${this.combo.multiplier.toFixed(1)} (${this.combo.count})`,
                this.width / 2,
                50
            );
        }

        requestAnimationFrame(() => this.update());
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    updateLeaderboardDisplay() {
        const leaderboardDiv = document.getElementById('leaderboard');
        const topScores = this.leaderboard
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
        
        let html = 'أعلى النتائج:<br><br>';
        if (topScores.length === 0) {
            html += 'لا توجد نتائج بعد!';
        } else {
            html += topScores
                .map((entry, index) => `${index + 1}. ${entry.name}: ${entry.score}`)
                .join('<br>');
        }
        html += '<br><br>';
        leaderboardDiv.innerHTML = html;
    }

    submitScore() {
        const nameInput = document.getElementById('playerName');
        const name = nameInput.value.trim();
        if (name) {
            this.leaderboard.push({ name, score: this.score });
            this.leaderboard.sort((a, b) => b.score - a.score);
            if (this.leaderboard.length > 10) {
                this.leaderboard.length = 10;
            }
            localStorage.setItem('leaderboard', JSON.stringify(this.leaderboard));
            this.updateLeaderboardDisplay();
            nameInput.value = '';
            document.getElementById('submitScore').disabled = true;
        }
    }

    createHitEffect(x, y) {
        if (!this.controls.effects.hitEffect) return;
        
        const particles = [];
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                size: 5,
                alpha: 1
            });
        }
        
        this.effects.hitEffects.push({
            particles: particles,
            life: 20
        });
    }

    initStars() {
        const stars = [];
        const numStars = Math.floor(this.width * this.height / 10000);  // Adaptive star count
        
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.1
            });
        }
        
        return stars;
    }

    initWeather() {
        const particles = [];
        const count = Math.floor(this.width * this.height / 20000);
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                speed: Math.random() * 2 + 1,
                size: Math.random() * 2 + 0.5,
                angle: Math.PI / 4  // 45-degree angle for rain-like effect
            });
        }
        
        return particles;
    }

    initAmbientParticles() {
        const particles = [];
        const count = Math.floor(this.width * this.height / 15000);
        
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.5 + 0.2
            });
        }
        
        return particles;
    }

    addPowerupEffect(color, duration = 2000) {
        if (!this.controls.effects.powerupEffects) return;
        
        const powerup = {
            radius: this.player.width,
            alpha: 1,
            color: color,
            growth: 1.05
        };
        
        this.effects.powerups.push(powerup);
        
        const interval = setInterval(() => {
            powerup.radius *= powerup.growth;
            powerup.alpha *= 0.95;
            
            if (powerup.alpha <= 0.1) {
                clearInterval(interval);
                this.effects.powerups = this.effects.powerups.filter(p => p !== powerup);
            }
        }, 50);
    }

    updateLives() {
        this.livesElement.textContent = `الأرواح: ${this.player.lives}`;
    }

    updateScore() {
        this.scoreElement.textContent = `النتيجة: ${this.score}`;
    }

    updateLevel() {
        this.levelElement.textContent = `المستوى: ${this.controls.difficulty.levelProgression.currentLevel}`;
    }

    showGameOver() {
        this.gameOver = true;
        this.gameOverElement.style.display = 'block';
        this.gameOverElement.innerHTML = `
            <h2>انتهت اللعبة!</h2>
            <p>النتيجة النهائية: ${this.score}</p>
            <button id="restartButton" class="gameButton">العب مرة أخرى</button>
            <button id="menuButton" class="gameButton">القائمة الرئيسية</button>
        `;
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
};

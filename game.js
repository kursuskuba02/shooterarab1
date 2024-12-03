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
        this.targetElement = document.getElementById('targetText');
        this.gameOverElement = document.getElementById('gameOver');
        this.bossHealthElement = document.getElementById('bossHealth');
        this.bossHealthBarElement = document.getElementById('bossHealthBar');
        this.bossHealthTextElement = document.getElementById('bossHealthText');
        this.playerNameInput = document.getElementById('playerNameInput');
        this.submitScoreButton = document.getElementById('submitScore');
        this.leaderboardEntries = document.getElementById('leaderboardEntries');
        this.highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        
        this.submitScoreButton.addEventListener('click', () => this.submitScore());
        document.getElementById('restartGame').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });

        // Detect if mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Setup canvas size
        if (this.isMobile) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }

        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.player = {
            x: this.width / 2,
            y: this.height - 50,
            width: 50,
            height: 50,
            lives: 3,
            angle: 0,
            speed: 5,
            velocityX: 0,
            velocityY: 0
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
        this.targetSpawnInterval = 5000;
        this.lastSpawn = 0;
        this.lastTargetSpawn = 0;
        this.lastHealthOrbSpawn = 0;
        this.lastSpikeOrbSpawn = 0;
        this.healthOrbInterval = 20000;
        this.spikeOrbInterval = 5000;
        this.mouseX = this.width / 2;
        this.mouseY = this.height - 50;
        this.hearts = document.querySelectorAll('.heart');
        this.boss = null;

        // Initialize controls based on device type
        this.initializeControls();
        
        // Start the game
        this.startGame();
        this.update();
    }

    initializeControls() {
        if (this.isMobile) {
            // Setup mobile controls
            const joystickZone = document.getElementById('joystickZone');
            const shootButton = document.getElementById('shootButton');
            
            if (joystickZone && shootButton) {
                // Create joystick
                this.joystick = nipplejs.create({
                    zone: joystickZone,
                    mode: 'static',
                    position: { left: '60px', bottom: '60px' },
                    color: 'white',
                    size: 120
                });

                // Joystick events
                this.joystick.on('move', (evt, data) => {
                    const angle = data.angle.radian;
                    const force = Math.min(data.force, 1);
                    this.player.velocityX = Math.cos(angle) * this.player.speed * force;
                    this.player.velocityY = Math.sin(angle) * this.player.speed * force;
                    this.player.angle = angle + Math.PI/2;
                });

                this.joystick.on('end', () => {
                    this.player.velocityX = 0;
                    this.player.velocityY = 0;
                });

                // Shoot button event
                shootButton.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.shoot();
                });
            }
        } else {
            // PC controls
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
                
                // Update player position instantly
                this.player.x = this.mouseX - this.player.width / 2;
                this.player.y = this.mouseY - this.player.height / 2;
                
                // Keep player within canvas bounds
                if (this.player.x < 0) this.player.x = 0;
                if (this.player.x > this.width - this.player.width) {
                    this.player.x = this.width - this.player.width;
                }
                if (this.player.y < 0) this.player.y = 0;
                if (this.player.y > this.height - this.player.height) {
                    this.player.y = this.height - this.player.height;
                }
                
                // Calculate angle between player and cursor
                const dx = this.mouseX - (this.player.x + this.player.width / 2);
                const dy = this.mouseY - (this.player.y + this.player.height / 2);
                this.player.angle = Math.atan2(dy, dx) + Math.PI / 2;
            });

            this.canvas.addEventListener('mousedown', (e) => {
                if (e.button === 0) { // Left click
                    this.shoot();
                }
            });
        }

        // Add restart game event
        const restartButton = document.getElementById('restartGame');
        if (restartButton) {
            restartButton.addEventListener('click', () => this.startGame());
        }
    }

    updatePlayerPosition() {
        if (this.isMobile) {
            // Update position based on joystick
            this.player.x += this.player.velocityX;
            this.player.y += this.player.velocityY;

            // Keep player within bounds
            if (this.player.x < 0) this.player.x = 0;
            if (this.player.x > this.width - this.player.width) {
                this.player.x = this.width - this.player.width;
            }
            if (this.player.y < 0) this.player.y = 0;
            if (this.player.y > this.height - this.player.height) {
                this.player.y = this.height - this.player.height;
            }
        }
    }

    startGame() {
        this.score = 0;
        this.scoreElement.textContent = 'Score: 0';
        this.letters = [];
        this.bullets = [];
        this.healthOrbs = [];
        this.spikeOrbs = [];
        this.bossBullets = [];
        this.boss = null;
        this.gameOver = false;
        this.player.lives = 3;
        this.gameOverElement.style.display = 'none';
        this.bossHealthElement.style.display = 'none';
        this.lastHealthOrbSpawn = Date.now();
        this.lastSpikeOrbSpawn = Date.now();
        this.lastTargetSpawn = Date.now();
        this.selectNewTarget();
        this.updateLivesDisplay();
    }

    resetGame() {
        // Reset all game state
        this.score = 0;
        this.letters = [];
        this.bullets = [];
        this.healthOrbs = [];
        this.spikeOrbs = [];
        this.bossBullets = [];
        this.boss = null;
        this.gameOver = false;
        this.player.lives = 3;
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 50;
        this.lastHealthOrbSpawn = Date.now();
        this.lastSpikeOrbSpawn = Date.now();
        this.lastTargetSpawn = Date.now();
        
        // Clear UI elements
        this.gameOverElement.style.display = 'none';
        this.bossHealthElement.style.display = 'none';
        this.scoreElement.textContent = 'Score: 0';
        this.playerNameInput.value = '';
        
        // Re-enable controls
        if (this.isMobile) {
            document.getElementById('mobileControls').style.opacity = '1';
            document.getElementById('mobileControls').style.pointerEvents = 'auto';
        }
        
        // Reset player state
        this.updateLivesDisplay();
        this.selectNewTarget();
    }

    selectNewTarget() {
        this.currentTarget = hijaiyahLetters[Math.floor(Math.random() * hijaiyahLetters.length)];
        this.targetElement.textContent = this.currentTarget.trans;
        // Add rotation animation to target text
        this.targetElement.style.animation = 'rotate 4s linear infinite';
    }

    shoot() {
        if (this.gameOver) return;

        const bulletSpeed = 7;
        
        // Add bullet shooting straight up
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2.5, // Center the bullet
            y: this.player.y,
            width: 5,
            height: 15,
            speed: bulletSpeed
        });
    }

    spawnLetter(forceTarget = false) {
        let letter;
        if (forceTarget) {
            letter = this.currentTarget;
        } else {
            letter = hijaiyahLetters[Math.floor(Math.random() * hijaiyahLetters.length)];
        }
        
        this.letters.push({
            x: Math.random() * (this.width - 30),
            y: -30,
            width: 30,
            height: 30,
            letter: letter
        });
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

    checkBossSpawn() {
        if (!this.boss) {
            // First boss at score 50, then at 150, 250, 350, etc.
            const firstBossScore = 50;
            const subsequentInterval = 100;
            
            if (this.score === firstBossScore || 
                (this.score > firstBossScore && 
                 (this.score - firstBossScore) % subsequentInterval === 0)) {
                
                this.spawnBoss();
            }
        }
    }

    spawnBoss() {
        const bossSize = 100;
        this.boss = {
            x: this.canvas.width / 2 - bossSize / 2,
            y: 50,
            width: bossSize,
            height: bossSize,
            health: 5,
            maxHealth: 5,
            lastShot: Date.now(),
            shootInterval: 2000, // Shoot every 2 seconds
            bulletSpeed: 5
        };
        this.bossHealthElement.style.display = 'block';
        this.updateBossHealth();
    }

    updateBossHealth() {
        if (this.boss) {
            const healthPercentage = (this.boss.health / this.boss.maxHealth) * 100;
            const healthBar = this.bossHealthElement.querySelector('#bossHealthBar div');
            healthBar.style.width = `${healthPercentage}%`;
            document.getElementById('bossHealthText').textContent = `Boss HP: ${this.boss.health}/${this.boss.maxHealth}`;
        }
    }

    drawFuturisticSpaceship(x, y, width, height) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        // Main body gradient
        const gradient = this.ctx.createLinearGradient(centerX, y, centerX, y + height);
        gradient.addColorStop(0, '#4CAF50');
        gradient.addColorStop(0.5, '#2E7D32');
        gradient.addColorStop(1, '#1B5E20');
        
        // Draw main body
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, y); // Nose
        this.ctx.lineTo(x + width * 0.9, y + height * 0.3); // Right top
        this.ctx.lineTo(x + width, y + height * 0.7); // Right wing tip
        this.ctx.lineTo(x + width * 0.8, y + height); // Right bottom
        this.ctx.lineTo(x + width * 0.2, y + height); // Left bottom
        this.ctx.lineTo(x, y + height * 0.7); // Left wing tip
        this.ctx.lineTo(x + width * 0.1, y + height * 0.3); // Left top
        this.ctx.closePath();
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Energy lines
        this.ctx.strokeStyle = '#81C784';
        this.ctx.lineWidth = 2;
        
        // Wing details
        this.ctx.beginPath();
        // Left wing
        this.ctx.moveTo(x + width * 0.1, y + height * 0.4);
        this.ctx.lineTo(x - width * 0.2, y + height * 0.8);
        this.ctx.lineTo(x + width * 0.2, y + height * 0.6);
        // Right wing
        this.ctx.moveTo(x + width * 0.9, y + height * 0.4);
        this.ctx.lineTo(x + width * 1.2, y + height * 0.8);
        this.ctx.lineTo(x + width * 0.8, y + height * 0.6);
        this.ctx.stroke();
        
        // Cockpit
        const cockpitGradient = this.ctx.createLinearGradient(centerX, y + height * 0.2, centerX, y + height * 0.5);
        cockpitGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        cockpitGradient.addColorStop(1, 'rgba(129, 199, 132, 0.3)');
        
        this.ctx.beginPath();
        this.ctx.ellipse(centerX, y + height * 0.35, width * 0.15, height * 0.15, 0, 0, Math.PI * 2);
        this.ctx.fillStyle = cockpitGradient;
        this.ctx.fill();
        
        // Energy glow
        this.ctx.beginPath();
        this.ctx.moveTo(x + width * 0.3, y + height);
        this.ctx.lineTo(x + width * 0.5, y + height + 10);
        this.ctx.lineTo(x + width * 0.7, y + height);
        this.ctx.fillStyle = 'rgba(129, 199, 132, 0.6)';
        this.ctx.fill();
        
        // KUBA text with better visibility
        this.ctx.save();
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.strokeStyle = '#1B5E20';
        this.ctx.lineWidth = 3;
        this.ctx.textAlign = 'center';
        this.ctx.strokeText('KUBA', centerX, y + height * 0.45);
        this.ctx.fillText('KUBA', centerX, y + height * 0.45);
        this.ctx.restore();
    }

    drawLetter(letter, x, y) {
        // Draw bubble
        this.ctx.beginPath();
        const radius = 25; // Bubble size
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        // Bubble gradient
        const gradient = this.ctx.createRadialGradient(
            x - radius/3, y - radius/3, 0,
            x, y, radius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(200, 200, 255, 0.6)');
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw letter
        this.ctx.font = '36px Arial';
        this.ctx.fillStyle = '#000';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(letter, x, y);
    }

    drawBoss() {
        const gradient = this.ctx.createLinearGradient(this.boss.x, this.boss.y, this.boss.x, this.boss.y + this.boss.height);
        gradient.addColorStop(0, '#ff4444');
        gradient.addColorStop(0.5, '#cc0000');
        gradient.addColorStop(1, '#990000');
        
        // Main body
        this.ctx.beginPath();
        this.ctx.moveTo(this.boss.x + this.boss.width * 0.5, this.boss.y); // Top center
        this.ctx.lineTo(this.boss.x + this.boss.width * 0.8, this.boss.y + this.boss.height * 0.3);
        this.ctx.lineTo(this.boss.x + this.boss.width, this.boss.y + this.boss.height * 0.5);
        this.ctx.lineTo(this.boss.x + this.boss.width * 0.8, this.boss.y + this.boss.height * 0.7);
        this.ctx.lineTo(this.boss.x + this.boss.width * 0.6, this.boss.y + this.boss.height);
        this.ctx.lineTo(this.boss.x + this.boss.width * 0.4, this.boss.y + this.boss.height);
        this.ctx.lineTo(this.boss.x + this.boss.width * 0.2, this.boss.y + this.boss.height * 0.7);
        this.ctx.lineTo(this.boss.x, this.boss.y + this.boss.height * 0.5);
        this.ctx.lineTo(this.boss.x + this.boss.width * 0.2, this.boss.y + this.boss.height * 0.3);
        this.ctx.closePath();
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Details
        this.ctx.strokeStyle = '#ff6666';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Weapon points
        const weaponPoints = [
            { x: this.boss.x + this.boss.width * 0.2, y: this.boss.y + this.boss.height * 0.6 },
            { x: this.boss.x + this.boss.width * 0.4, y: this.boss.y + this.boss.height * 0.7 },
            { x: this.boss.x + this.boss.width * 0.6, y: this.boss.y + this.boss.height * 0.7 },
            { x: this.boss.x + this.boss.width * 0.8, y: this.boss.y + this.boss.height * 0.6 }
        ];
        
        weaponPoints.forEach(point => {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fill();
        });
    }

    updateLivesDisplay() {
        this.hearts.forEach((heart, index) => {
            heart.style.opacity = index < this.player.lives ? '1' : '0.2';
        });
    }

    updateBoss() {
        if (!this.boss) return;

        // Random movement
        this.boss.x += this.boss.dx;
        this.boss.y += this.boss.dy;

        // Bounce off walls
        if (this.boss.x <= 0 || this.boss.x + this.boss.width >= this.width) {
            this.boss.dx *= -1;
        }
        if (this.boss.y <= 0 || this.boss.y + this.boss.height >= this.height / 2) {
            this.boss.dy *= -1;
        }

        // Shoot bullets
        const currentTime = Date.now();
        if (currentTime - this.boss.lastShot > this.boss.shootInterval) {
            const weaponPoints = [
                { x: this.boss.x + this.boss.width * 0.2, y: this.boss.y + this.boss.height * 0.6 },
                { x: this.boss.x + this.boss.width * 0.4, y: this.boss.y + this.boss.height * 0.7 },
                { x: this.boss.x + this.boss.width * 0.6, y: this.boss.y + this.boss.height * 0.7 },
                { x: this.boss.x + this.boss.width * 0.8, y: this.boss.y + this.boss.height * 0.6 }
            ];

            weaponPoints.forEach(point => {
                this.bossBullets.push({
                    x: point.x,
                    y: point.y,
                    width: 8,
                    height: 8,
                    speed: 5,
                    dx: (Math.random() - 0.5) * 2,
                    dy: 5
                });
            });

            this.boss.lastShot = currentTime;
        }
    }

    updateDifficulty() {
        // Increase difficulty based on score
        const baseInterval = 2000; // Base spawn interval in milliseconds
        const minInterval = 800;   // Minimum spawn interval
        const difficultyFactor = Math.floor(this.score / 100); // Increase difficulty every 100 points
        
        // Update spawn intervals
        this.targetSpawnInterval = Math.max(minInterval, baseInterval - (difficultyFactor * 200));
        
        // Update enemy movement speed
        if (this.boss) {
            this.boss.bulletSpeed = Math.min(7, 5 + (difficultyFactor * 0.5));
            this.boss.shootInterval = Math.max(1000, 2000 - (difficultyFactor * 200));
        }
        
        // Update letter movement speed
        this.letterSpeed = Math.min(3, 1 + (difficultyFactor * 0.2));
    }

    update() {
        if (this.gameOver) return;

        this.updateDifficulty();
        
        // Update player position
        this.updatePlayerPosition();
        
        // Update letters
        this.updateLetters();
        
        // Update bullets
        this.updateBullets();
        
        // Update health orbs
        this.updateHealthOrbs();
        
        // Update spike orbs
        this.updateSpikeOrbs();
        
        // Update boss
        if (this.boss) {
            this.updateBoss();
        }
        
        // Check for boss spawn
        this.checkBossSpawn();
        
        const currentTime = Date.now();

        // Spawn target letter every interval
        if (currentTime - this.lastTargetSpawn > this.targetSpawnInterval) {
            this.spawnLetter();
            this.lastTargetSpawn = currentTime;
        }

        // Spawn health orb every 15 seconds
        if (currentTime - this.lastHealthOrbSpawn > 15000) {
            this.spawnHealthOrb();
            this.lastHealthOrbSpawn = currentTime;
        }

        // Spawn spike orb every 10 seconds
        if (currentTime - this.lastSpikeOrbSpawn > 10000) {
            this.spawnSpikeOrb();
            this.lastSpikeOrbSpawn = currentTime;
        }

        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw player spaceship
        this.drawFuturisticSpaceship(this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw letters
        this.letters.forEach(letter => {
            this.drawLetter(letter.letter.arabic, letter.x + letter.width / 2, letter.y + letter.height / 2);
        });

        // Draw bullets
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw health orbs
        this.healthOrbs.forEach(orb => {
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
        });

        // Draw spike orbs
        this.spikeOrbs.forEach(orb => {
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
                const angle = (i * Math.PI) / spikes;
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
        });

        // Draw boss
        if (this.boss) {
            this.drawBoss();
        }

        // Draw boss bullets
        this.bossBullets.forEach(bullet => {
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, bullet.width/2, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fill();
        });

        // Update lives display
        this.updateLivesDisplay();

        requestAnimationFrame(() => this.update());
    }

    updateLetters() {
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
                        this.scoreElement.textContent = `Score: ${this.score}`;
                        
                        // Reduce boss health if exists
                        if (this.boss) {
                            this.boss.health--;
                            this.updateBossHealth();
                            
                            // Check if boss is defeated
                            if (this.boss.health <= 0) {
                                this.score += 50; // Bonus points for defeating boss
                                this.scoreElement.textContent = `Score: ${this.score}`;
                                this.boss = null;
                                this.bossHealthElement.style.display = 'none';
                                this.bossBullets = [];
                            }
                        }
                        
                        this.selectNewTarget();
                    } else {
                        this.player.lives--;
                        if (this.player.lives <= 0) {
                            this.gameOver = true;
                            this.gameOverElement.style.display = 'block';
                        }
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
                }
                this.letters.splice(i, 1);
                continue;
            }
        }
    }

    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed; // Move straight up
            
            if (bullet.y < 0) {
                this.bullets.splice(i, 1);
                continue;
            }

            // Check bullet collisions with boss
            if (this.boss) {
                if (this.checkCollision(bullet, this.boss)) {
                    this.bullets.splice(i, 1);
                }
            }
        }
    }

    updateHealthOrbs() {
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
        }
    }

    updateSpikeOrbs() {
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
        }
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    submitScore() {
        const playerName = this.playerNameInput.value.trim();
        if (!playerName) {
            alert('Please enter your name!');
            return;
        }

        const newScore = {
            name: playerName,
            score: this.score,
            date: new Date().toISOString()
        };

        this.highScores.push(newScore);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 10); // Keep only top 10
        localStorage.setItem('highScores', JSON.stringify(this.highScores));
        this.updateLeaderboard();
    }

    updateLeaderboard() {
        this.leaderboardEntries.innerHTML = '';
        this.highScores.forEach((entry, index) => {
            const div = document.createElement('div');
            div.className = 'leaderboard-entry';
            div.innerHTML = `
                <span>${index + 1}. ${entry.name}</span>
                <span>${entry.score}</span>
            `;
            this.leaderboardEntries.appendChild(div);
        });
    }

    endGame() {
        this.gameOver = true;
        const finalScoreElement = document.getElementById('finalScore');
        finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
        this.updateLeaderboard();
        
        // Disable controls
        if (this.isMobile) {
            document.getElementById('mobileControls').style.opacity = '0.3';
            document.getElementById('mobileControls').style.pointerEvents = 'none';
        }
    }

    startGame() {
        this.score = 0;
        this.scoreElement.textContent = 'Score: 0';
        this.letters = [];
        this.bullets = [];
        this.healthOrbs = [];
        this.spikeOrbs = [];
        this.bossBullets = [];
        this.boss = null;
        this.gameOver = false;
        this.player.lives = 3;
        this.gameOverElement.style.display = 'none';
        this.bossHealthElement.style.display = 'none';
        this.lastHealthOrbSpawn = Date.now();
        this.lastSpikeOrbSpawn = Date.now();
        this.lastTargetSpawn = Date.now();
        this.targetSpawnInterval = 2000; // Initial spawn interval
        this.letterSpeed = 1;           // Initial letter speed
        this.selectNewTarget();
        this.updateLivesDisplay();
        
        // Start the game loop if it's not already running
        if (!this.gameLoopRunning) {
            this.gameLoopRunning = true;
            this.gameLoop();
        }
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    new Game();
});
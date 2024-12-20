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
        
        // Initialize stars array first
        this.stars = [];
        
        // Detect mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Set canvas size based on platform
        const updateCanvasSize = () => {
            const container = document.getElementById('gameContainer');
            const containerStyle = window.getComputedStyle(container);
            const containerWidth = parseInt(containerStyle.width);
            const containerHeight = parseInt(containerStyle.height);
            
            this.canvas.width = containerWidth;
            this.canvas.height = containerHeight;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            
            // Update player position when canvas is resized
            if (this.player) {
                this.player.x = Math.min(this.player.x, this.width - this.player.width);
                this.player.y = Math.min(this.player.y, this.height - this.player.height);
            }
        };

        // Initial size update
        updateCanvasSize();

        // Update canvas size when window is resized or orientation changes
        window.addEventListener('resize', updateCanvasSize);
        window.addEventListener('orientationchange', updateCanvasSize);
        
        this.scoreElement = document.getElementById('score');
        this.targetElement = document.getElementById('targetText');
        this.gameOverElement = document.getElementById('gameOver');
        this.bossHealthElement = document.getElementById('bossHealth');
        this.bossHealthBarElement = document.getElementById('bossHealthBar');
        this.bossHealthTextElement = document.getElementById('bossHealthText');
        this.playerNameInput = document.getElementById('playerNameInput');
        this.submitScoreButton = document.getElementById('submitScore');
        this.restartGameButton = document.getElementById('restartGame');
        this.leaderboardEntries = document.getElementById('leaderboardEntries');
        this.highScores = JSON.parse(localStorage.getItem('highScores') || '[]');

        // Add event listeners for game over buttons
        this.submitScoreButton.addEventListener('click', () => this.submitScore());
        this.restartGameButton.addEventListener('click', () => this.resetGame());

        // Game state
        this.score = 0;
        this.letters = [];
        this.bullets = [];
        this.healthOrbs = [];
        this.spikeOrbs = [];
        this.bossBullets = [];
        this.boss = null;
        this.gameOver = false;
        this.targetSpawnInterval = 5000; // Exactly 5 seconds
        this.randomLetterSpawnInterval = 1000; // Spawn 1 letter per second
        this.letterSpeedMin = 2.3;
        this.letterSpeedMax = 2.7;
        this.bubbleSize = 50; // Size of the bubble
        this.bubbleSpacing = 50; // Space between bubbles
        this.lastTargetSpawn = Date.now();
        this.lastRandomSpawn = Date.now();
        this.lastHealthOrbSpawn = Date.now();
        this.lastSpikeOrbSpawn = Date.now();

        // Initialize player
        this.player = {
            x: this.width / 2,
            y: this.height - 50,
            width: 50,
            height: 50,
            lives: 3,
            dx: 0,
            dy: 0,
            vx: 0,
            vy: 0
        };

        // Initialize hearts display
        this.hearts = Array.from(document.getElementsByClassName('heart'));

        // Detect if mobile device
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (this.isMobile) {
            this.mobileSpeed = 5; // Adjusted speed for better control
            this.player.y = this.height - 100;
            this.initMobileControls();
        } else {
            this.initDesktopControls();
        }
        
        // Start game loop for both mobile and desktop
        this.initializeGame();
        this.gameLoop();
    }

    initZoomControls() {
        const zoomInBtn = document.getElementById('zoomInBtn');
        const zoomOutBtn = document.getElementById('zoomOutBtn');
        
        zoomInBtn.addEventListener('click', () => {
            this.scale = Math.min(this.scale + 0.1, this.maxScale);
            this.updateGameScale();
        });
        
        zoomOutBtn.addEventListener('click', () => {
            this.scale = Math.max(this.scale - 0.1, this.minScale);
            this.updateGameScale();
        });
    }

    updateGameScale() {
        const canvas = document.getElementById('gameCanvas');
        const gameContainer = document.querySelector('.game-container');
        
        // Scale the game container
        gameContainer.style.transform = `scale(${this.scale})`;
        gameContainer.style.transformOrigin = 'center top';
        
        // Adjust container height to prevent scrolling
        const newHeight = (window.innerHeight / this.scale);
        gameContainer.style.height = `${newHeight}px`;
        
        // Update game dimensions
        this.updateGameDimensions();
    }

    initializeGame() {
        // Start game immediately for both mobile and desktop
        this.startGame();
    }

    startGame() {
        // Initialize game state
        this.score = 0;
        this.scoreElement.textContent = 'Score: 0';
        this.player = {
            x: this.width / 2,
            y: this.isMobile ? this.height - 100 : this.height / 2,
            width: 50,
            height: 50,
            vx: 0,
            vy: 0,
            lives: 3
        };
        
        this.selectNewTarget();
        this.gameLoop();
    }

    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.draw();
            this.animationFrame = requestAnimationFrame(() => this.gameLoop());
        }
    }

    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background first
        this.drawBackground();

        // Draw watermark after background but before other elements
        this.drawWatermark();

        // Draw player
        this.drawFuturisticSpaceship(this.player.x, this.player.y, this.player.width, this.player.height);

        // Draw letters (without transliteration)
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
            this.drawHealthOrb(orb);
        });

        // Draw spike orbs
        this.spikeOrbs.forEach(orb => {
            this.drawSpikeOrb(orb);
        });

        // Draw boss and boss bullets
        if (this.boss) {
            this.drawBoss();
            this.drawBossBullets();
        }
    }

    updateDifficulty() {
        // Increase difficulty based on score
        this.randomLetterSpawnInterval = Math.max(800, 1000 - this.score * 2); // Minimum 800ms at higher scores
        this.letterSpeedMin = Math.min(3, 0.5 + this.score / 100); // Start slower and max at 3
        this.letterSpeedMax = Math.min(3.5, 1 + this.score / 100); // Start slower and max at 3.5

        if (this.boss) {
            this.boss.shotInterval = Math.max(800, 1500 - this.score * 5);
        }
    }

    update() {
        if (this.gameOver) {
            // Clean up boss and bullets when game is over
            this.boss = null;
            this.bossBullets = [];
            this.bossHealthElement.style.display = 'none';
            return;
        }

        this.updateDifficulty();

        const currentTime = Date.now();

        // Spawn target letter exactly every 5 seconds
        if (currentTime - this.lastTargetSpawn >= this.targetSpawnInterval) {
            this.spawnLetter(true);
            this.lastTargetSpawn = currentTime;
        }

        // Spawn random letters every 1 second
        if (currentTime - this.lastRandomSpawn >= this.randomLetterSpawnInterval) {
            this.spawnLetter(false);
            this.lastRandomSpawn = currentTime;
        }

        // Update existing letters
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

        // Update lives display
        this.updateLivesDisplay();

        // Update boss bullets
        this.updateBossBullets();

        // Shoot boss bullets
        this.shootBossBullets();

        // Update stars
        this.updateStars();

        // Only update player position for mobile
        if (this.isMobile) {
            this.updatePlayerPosition();
        }
    }

    updateLetters() {
        const currentTime = Date.now();
        for (let i = this.letters.length - 1; i >= 0; i--) {
            const letter = this.letters[i];
            letter.y += letter.speed; // Use individual letter speed

            // Remove letters that are off screen
            if (letter.y > this.height) {
                // If the escaped letter was the target, reduce player's life
                if (letter.letter === this.currentTarget) {
                    this.player.lives--;
                    if (this.player.lives <= 0) {
                        this.gameOver = true;
                        this.gameOverElement.style.display = 'block';
                    }
                    this.selectNewTarget();
                }
                this.letters.splice(i, 1);
                continue;
            }

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
                        // Wrong target hit - decrease player's life
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
        this.boss = {
            x: this.width / 4,
            y: 100,
            width: this.width / 2,
            height: 120,
            health: 5,
            maxHealth: 5,
            dx: 1, // Reduced from 2
            dy: 0.5, // Reduced from 1
            lastShot: 0,
            shotInterval: 1000, // Changed to 1000ms (1 second)
            bulletSpeed: 3 // Reduced from 5
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

    updateBoss() {
        if (!this.boss) return;

        // Move boss
        this.boss.x += this.boss.dx;
        this.boss.y += this.boss.dy;

        // Bounce off walls
        if (this.boss.x <= 0 || this.boss.x + this.boss.width >= this.width) {
            this.boss.dx *= -1;
        }
        if (this.boss.y <= 0 || this.boss.y + this.boss.height >= this.height / 2) {
            this.boss.dy *= -1;
        }

        // Shoot at player
        const currentTime = Date.now();
        if (currentTime - this.boss.lastShot > this.boss.shotInterval) {
            // Create 3 bullets shooting downward with random spread
            for (let i = 0; i < 3; i++) {
                // Random angle between 60 and 120 degrees (π/3 to 2π/3)
                const randomAngle = (Math.PI / 3) + (Math.random() * Math.PI / 3);
                const bullet = {
                    x: this.boss.x + this.boss.width / 2,
                    y: this.boss.y + this.boss.height,
                    speed: 3, // Reduced from 5
                    angle: randomAngle
                };
                this.bossBullets.push(bullet);
            }

            this.boss.lastShot = currentTime;
        }

        // Check collision with player bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (this.checkCollision(
                { x: bullet.x - bullet.radius, y: bullet.y - bullet.radius, width: bullet.radius * 2, height: bullet.radius * 2 },
                this.boss
            )) {
                this.bullets.splice(i, 1);
                this.boss.health--;
                this.updateBossHealth();

                if (this.boss.health <= 0) {
                    this.score += 50;
                    this.boss = null;
                    this.bossHealthElement.style.display = 'none';
                    break;
                }
            }
        }
    }

    drawBoss() {
        if (!this.boss) return;

        const x = this.boss.x;
        const y = this.boss.y;
        const w = this.boss.width;
        const h = this.boss.height;

        // Main body gradient
        const gradient = this.ctx.createLinearGradient(x, y, x, y + h);
        gradient.addColorStop(0, '#ff4444');
        gradient.addColorStop(0.5, '#cc0000');
        gradient.addColorStop(1, '#990000');

        // Draw alien spaceship body
        this.ctx.beginPath();
        this.ctx.moveTo(x + w/2, y); // Top center
        this.ctx.bezierCurveTo(
            x + w*0.7, y,         // Control point 1
            x + w, y + h*0.4,     // Control point 2
            x + w*0.8, y + h      // End point right
        );
        this.ctx.lineTo(x + w*0.2, y + h); // Bottom left
        this.ctx.bezierCurveTo(
            x, y + h*0.4,         // Control point 1
            x + w*0.3, y,         // Control point 2
            x + w/2, y            // Back to top center
        );
        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Dome
        this.ctx.beginPath();
        this.ctx.ellipse(x + w/2, y + h*0.3, w*0.3, h*0.3, 0, 0, Math.PI * 2);
        const domeGradient = this.ctx.createRadialGradient(
            x + w/2, y + h*0.3, 0,
            x + w/2, y + h*0.3, w*0.3
        );
        domeGradient.addColorStop(0, 'rgba(255, 200, 200, 0.6)');
        domeGradient.addColorStop(1, 'rgba(255, 0, 0, 0.3)');
        this.ctx.fillStyle = domeGradient;
        this.ctx.fill();

        // Engine lights
        const lightPositions = [
            {x: x + w*0.2, y: y + h*0.8},
            {x: x + w*0.5, y: y + h*0.9},
            {x: x + w*0.8, y: y + h*0.8}
        ];

        lightPositions.forEach(pos => {
            const lightGradient = this.ctx.createRadialGradient(
                pos.x, pos.y, 0,
                pos.x, pos.y, 10
            );
            lightGradient.addColorStop(0, '#ff8888');
            lightGradient.addColorStop(1, '#990000');
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 10, 0, Math.PI*2);
            this.ctx.fillStyle = lightGradient;
            this.ctx.fill();
        });

        // Health bar
        const healthPercentage = this.boss.health / this.boss.maxHealth;
        const healthBarWidth = w * 0.8;
        const healthBarHeight = 10;
        const healthBarX = x + w * 0.1;
        const healthBarY = y - 20;

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight);
    }

    updateLivesDisplay() {
        this.hearts.forEach((heart, index) => {
            heart.style.opacity = index < this.player.lives ? '1' : '0.2';
        });
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    submitScore() {
        const playerName = this.playerNameInput.value.trim() || 'Anonymous';
        let highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        
        // Add new score
        highScores.push({
            name: playerName,
            score: this.score
        });
        
        // Sort and keep top scores
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 10);
        
        // Save to localStorage
        localStorage.setItem('highScores', JSON.stringify(highScores));
        
        // Update display
        this.updateLeaderboard();
        
        // Disable submit button after submission
        this.submitScoreButton.disabled = true;
    }

    updateLeaderboard() {
        // Get existing scores
        let highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        
        // Update leaderboard display
        const leaderboardEntries = document.getElementById('leaderboardEntries');
        if (leaderboardEntries) {
            leaderboardEntries.innerHTML = '';
            highScores.sort((a, b) => b.score - a.score).slice(0, 10).forEach(entry => {
                const div = document.createElement('div');
                div.className = 'leaderboard-entry';
                div.innerHTML = `<span>${entry.name}</span><span>${entry.score}</span>`;
                leaderboardEntries.appendChild(div);
            });
        }
    }

    endGame() {
        this.gameOver = true;
        
        // Stop the game loop
        cancelAnimationFrame(this.animationFrame);
        
        // Clean up boss-related elements
        if (this.boss) {
            this.boss = null;
            this.bossBullets = [];
            this.bossHealthElement.style.display = 'none';
        }

        // Update and show game over screen
        const finalScoreElement = document.getElementById('finalScore');
        if (finalScoreElement) {
            finalScoreElement.textContent = this.score;
        }
        
        // Clear previous input
        this.playerNameInput.value = '';
        
        // Update leaderboard before showing game over screen
        this.updateLeaderboard();
        
        // Show game over screen
        this.gameOverElement.style.display = 'block';
    }

    selectNewTarget() {
        // Get list of letters currently on screen
        const existingLetters = this.letters.map(l => l.letter.arabic);

        // Filter out letters that are already on screen
        const availableLetters = hijaiyahLetters.filter(l => 
            !existingLetters.includes(l.arabic)
        );

        // If no available letters, use all letters
        const letterPool = availableLetters.length > 0 ? availableLetters : hijaiyahLetters;

        // Pick a random letter
        const randomIndex = Math.floor(Math.random() * letterPool.length);
        this.currentTarget = letterPool[randomIndex];

        // Update target display with uppercase text
        const targetElement = document.getElementById('targetText');
        if (targetElement) {
            targetElement.innerHTML = `<div style="text-align: center;">
                <div style="color: #00ffff; font-size: 14px; margin-bottom: 5px; text-transform: uppercase;">TARGET</div>
                <div style="color: white; font-size: 18px; text-transform: uppercase;">${this.currentTarget.trans}</div>
            </div>`;
        }
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
        // Get currently displayed letters
        const displayedLetters = this.letters.map(l => l.letter.arabic);
        
        // Filter out letters that are already on screen
        const availableLetters = hijaiyahLetters.filter(l => !displayedLetters.includes(l.arabic));
        
        // If no available letters, skip spawning
        if (availableLetters.length === 0) return;

        // If forcing target, use current target if not on screen, otherwise pick new target
        let selectedLetter;
        if (forceTarget) {
            if (this.currentTarget && !displayedLetters.includes(this.currentTarget.arabic)) {
                selectedLetter = this.currentTarget;
            } else {
                const randomIndex = Math.floor(Math.random() * availableLetters.length);
                selectedLetter = availableLetters[randomIndex];
                this.currentTarget = selectedLetter;
                this.updateTargetDisplay();
            }
        } else {
            // For non-target letters, randomly select from available letters
            const randomIndex = Math.floor(Math.random() * availableLetters.length);
            selectedLetter = availableLetters[randomIndex];
        }

        // Create new letter object
        const letterObj = {
            letter: selectedLetter,
            x: Math.random() * (this.width - this.bubbleSize),
            y: -this.bubbleSize,
            width: this.bubbleSize,
            height: this.bubbleSize,
            speed: Math.random() * (this.letterSpeedMax - this.letterSpeedMin) + this.letterSpeedMin
        };

        this.letters.push(letterObj);
    }

    updateTargetDisplay() {
        const targetElement = document.getElementById('targetText');
        if (targetElement && this.currentTarget) {
            targetElement.innerHTML = `<div style="text-align: center;">
                <div style="color: #00ffff; font-size: 14px; margin-bottom: 5px; text-transform: uppercase;">TARGET</div>
                <div style="color: white; font-size: 18px; text-transform: uppercase;">${this.currentTarget.trans}</div>
            </div>`;
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

    initDesktopControls() {
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            
            // Calculate scale in case canvas is resized
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            
            // Get cursor position relative to canvas with scaling
            const cursorX = (e.clientX - rect.left) * scaleX;
            const cursorY = (e.clientY - rect.top) * scaleY;
            
            // Center the player exactly on the cursor
            this.player.x = cursorX - (this.player.width / 2);
            this.player.y = cursorY - (this.player.height / 2);

            // Keep player within canvas bounds
            this.player.x = Math.max(0, Math.min(this.width - this.player.width, this.player.x));
            this.player.y = Math.max(0, Math.min(this.height - this.player.height, this.player.y));
        });

        // Shooting with mouse click
        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.shoot();
        });
    }

    initMobileControls() {
        const joystickZone = document.getElementById('joystickZone');
        const shootButton = document.getElementById('shootButton');
        
        // Show mobile controls
        if (joystickZone) joystickZone.style.display = 'block';
        if (shootButton) shootButton.style.display = 'block';
        
        // Initialize joystick
        const options = {
            zone: joystickZone,
            mode: 'static',
            position: { left: '80px', bottom: '80px' },
            size: 120,
            color: '#00ff00',
            lockX: false,
            lockY: false
        };
        
        const manager = nipplejs.create(options);
        
        // Handle joystick movement
        manager.on('move', (evt, data) => {
            const angle = data.angle.radian;
            const force = Math.min(data.force, 2.0);
            
            this.player.vx = Math.cos(angle) * (force * this.mobileSpeed);
            this.player.vy = -Math.sin(angle) * (force * this.mobileSpeed);
        });

        manager.on('end', () => {
            this.player.vx = 0;
            this.player.vy = 0;
        });

        // Initialize shoot button
        if (shootButton) {
            shootButton.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.shoot();
            });
        }
        
        // Prevent default touch behavior
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }

    updatePlayerPosition() {
        if (this.isMobile) {
            // Direct position update for mobile
            this.player.x += this.player.vx;
            this.player.y += this.player.vy;
        } else {
            // Existing keyboard controls for desktop
            if (this.keys.ArrowLeft || this.keys.a) this.player.x -= this.playerSpeed;
            if (this.keys.ArrowRight || this.keys.d) this.player.x += this.playerSpeed;
            if (this.keys.ArrowUp || this.keys.w) this.player.y -= this.playerSpeed;
            if (this.keys.ArrowDown || this.keys.s) this.player.y += this.playerSpeed;
        }

        // Keep player within bounds
        this.player.x = Math.max(this.player.width / 2, Math.min(this.width - this.player.width / 2, this.player.x));
        this.player.y = Math.max(this.player.height / 2, Math.min(this.height - this.player.height / 2, this.player.y));
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
        this.player.x = this.width / 2;
        this.player.y = this.height - 50;
        this.lastHealthOrbSpawn = Date.now();
        this.lastSpikeOrbSpawn = Date.now();
        this.lastTargetSpawn = Date.now();
        this.lastRandomSpawn = Date.now();

        // Clear UI elements
        this.gameOverElement.style.display = 'none';
        this.bossHealthElement.style.display = 'none';
        this.scoreElement.textContent = 'Score: 0';
        this.playerNameInput.value = '';
        
        // Re-enable submit button
        this.submitScoreButton.disabled = false;

        // Reset player state
        this.updateLivesDisplay();
        this.selectNewTarget();
        
        // Restart game loop
        this.gameLoop();
    }

    createStarfield() {
        // Clear existing stars first
        this.stars = [];
        
        // Create 100 stars with random positions and sizes
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2,
                speed: Math.random() * 0.5 + 0.1 // Ensure minimum speed
            });
        }
    }

    updateStars() {
        if (!this.stars || !Array.isArray(this.stars)) {
            this.createStarfield();
            return;
        }

        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = 0;
                star.x = Math.random() * this.canvas.width;
            }
        });
    }

    drawBackground() {
        if (!this.ctx) return;

        // Create space gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000033');
        gradient.addColorStop(1, '#000066');

        // Fill background
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw stars
        if (this.stars && Array.isArray(this.stars)) {
            this.ctx.fillStyle = '#FFFFFF';
            this.stars.forEach(star => {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
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

    drawHealthOrb(orb) {
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

    drawSpikeOrb(orb) {
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
    }

    drawBossBullets() {
        this.ctx.fillStyle = 'red';
        this.bossBullets.forEach(bullet => {
            this.ctx.beginPath();
            this.ctx.arc(bullet.x, bullet.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    updateBossBullets() {
        for (let i = this.bossBullets.length - 1; i >= 0; i--) {
            const bullet = this.bossBullets[i];

            // Update bullet position based on its angle and speed
            bullet.x += Math.cos(bullet.angle) * bullet.speed;
            bullet.y += Math.sin(bullet.angle) * bullet.speed;

            // Check collision with player
            if (this.checkCollision(this.player, {
                x: bullet.x - 5,
                y: bullet.y - 5,
                width: 10,
                height: 10
            })) {
                // Remove the bullet
                this.bossBullets.splice(i, 1);
                // Reduce player health
                this.player.lives--;

                // Check if player is dead
                if (this.player.lives <= 0) {
                    this.gameOver = true;
                }
                continue;
            }

            // Remove bullets that are off screen
            if (bullet.y > this.canvas.height || 
                bullet.y < 0 || 
                bullet.x > this.canvas.width || 
                bullet.x < 0) {
                this.bossBullets.splice(i, 1);
            }
        }
    }

    shootBossBullets() {
        const currentTime = Date.now();
        if (this.boss && !this.gameOver && currentTime - this.boss.lastShot > this.boss.shotInterval) {
            // Create 3 bullets with random downward trajectories
            for (let i = 0; i < 3; i++) {
                // Random angle between 60 and 120 degrees (π/3 to 2π/3)
                const randomAngle = (Math.PI / 3) + (Math.random() * Math.PI / 3);
                const bullet = {
                    x: this.boss.x + this.boss.width / 2,
                    y: this.boss.y + this.boss.height,
                    speed: 3, // Reduced from 5
                    angle: randomAngle
                };
                this.bossBullets.push(bullet);
            }
            this.boss.lastShot = currentTime;
        }
    }

    drawWatermark() {
        const text = "kursuskuba.com";
        this.ctx.save();

        // Set font style
        this.ctx.font = "bold 24px Arial";
        const textWidth = this.ctx.measureText(text).width;
        const x = (this.width - textWidth) / 2;
        const y = 40;

        // Create glowing effect
        this.ctx.shadowColor = "#00ffff";
        this.ctx.shadowBlur = 15;
        this.ctx.lineWidth = 2;

        // Draw outer glow
        this.ctx.strokeStyle = "#0066ff";
        this.ctx.strokeText(text, x, y);

        // Draw inner text with gradient
        const gradient = this.ctx.createLinearGradient(x, y - 20, x, y + 20);
        gradient.addColorStop(0, "#ffffff");
        gradient.addColorStop(0.5, "#00ffff");
        gradient.addColorStop(1, "#0066ff");
        this.ctx.fillStyle = gradient;
        this.ctx.fillText(text, x, y);

        // Add tech lines
        this.ctx.beginPath();
        this.ctx.moveTo(x - 50, y + 5);
        this.ctx.lineTo(x - 20, y + 5);
        this.ctx.moveTo(x + textWidth + 50, y + 5);
        this.ctx.lineTo(x + textWidth + 20, y + 5);
        this.ctx.strokeStyle = "#00ffff";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        this.ctx.restore();
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    new Game();
});

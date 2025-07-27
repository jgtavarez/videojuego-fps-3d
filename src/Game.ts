import * as THREE from 'three';
import { Player } from './Player';
import { Level } from './Level';
import { AudioManager } from './AudioManager';
import { GameState, GameConfig } from './types/GameTypes';

export class Game {
    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private player!: Player;
    private currentLevel: Level | null = null;
    private audioManager: AudioManager;
    
    private gameState: GameState = GameState.MENU;
    private config: GameConfig;
    
    // UI Elements
    private menuElement!: HTMLElement;
    private uiElement!: HTMLElement;
    private hudElements!: {
        ammo: HTMLElement;
        lives: HTMLElement;
        score: HTMLElement;
        level: HTMLElement;
    };
    
    // Game state
    private score: number = 0;
    private lives: number = 3;
    private currentLevelIndex: number = 1;
    private lastDamageTime: number = 0;
    
    // Controls
    private keys: { [key: string]: boolean } = {};
    private mouse = new THREE.Vector2();
    
    constructor(private container: HTMLElement) {
        this.config = {
            initialAmmo: 20,
            initialLives: 3,
            totalLevels: 2
        };
        
        this.initializeUI();
        this.setupScene();
        this.setupControls();
        this.audioManager = new AudioManager();
        
        // Asegurar que el loading se oculte al inicializar
        setTimeout(() => {
            const loading = document.getElementById('loading');
            if (loading) {
                loading.style.display = 'none';
            }
        }, 100);
    }
    
    private initializeUI(): void {
        this.menuElement = document.getElementById('menu')!;
        this.uiElement = document.getElementById('ui')!;
        
        this.hudElements = {
            ammo: document.getElementById('ammo')!,
            lives: document.getElementById('lives')!,
            score: document.getElementById('score')!,
            level: document.getElementById('level')!
        };
        
        this.setupMenuEvents();
    }
    
    private setupMenuEvents(): void {
        document.getElementById('startGame')?.addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('resumeGame')?.addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('exitToMenu')?.addEventListener('click', () => {
            this.exitToMainMenu();
        });
        
        document.getElementById('restartGame')?.addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('backToMenu')?.addEventListener('click', () => {
            this.showMainMenu();
        });
    }
    
    private setupScene(): void {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Color cielo
        
        // Configurar cámara
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Configurar renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        
        // Añadir iluminación
        this.setupLighting();
        
        // Crear jugador
        this.player = new Player(this.camera, this.scene);
        
        // Configurar callback de disparo
        this.player.setShootCallback(() => {
            this.audioManager.playShootSound();
        });
        
        // Manejar redimensionamiento de ventana
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    private setupLighting(): void {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Luz direccional (sol)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }
    
    private setupControls(): void {
        // Eventos de teclado
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            if (event.code === 'Escape') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Eventos de ratón
        document.addEventListener('mousemove', (event) => {
            if (this.gameState === GameState.PLAYING) {
                this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
                this.player.updateLook(event.movementX, event.movementY);
            }
        });
        
        // Listener de clic solo para el canvas del juego
        this.renderer.domElement.addEventListener('click', () => {
            if (this.gameState === GameState.PLAYING) {
                // Disparar solo si hacemos clic en el canvas
                this.player.shoot();
                // Bloquear pointer para controles FPS
                this.renderer.domElement.requestPointerLock();
            }
        });
    }
    
    public async init(): Promise<void> {
        try {
            await this.audioManager.init();
            this.showMainMenu();
        } catch (error) {
            console.error('Error inicializando audio:', error);
            this.showMainMenu();
        }
    }
    
    private showMainMenu(): void {
        this.gameState = GameState.MENU;
        this.menuElement.style.display = 'flex';
        this.uiElement.style.display = 'none';
        
        // Ocultar loading si aún está visible
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        document.getElementById('mainMenu')!.style.display = 'block';
        document.getElementById('pauseMenu')!.style.display = 'none';
        document.getElementById('gameOverMenu')!.style.display = 'none';
        
        document.exitPointerLock();
    }
    

    
    private async startGame(): Promise<void> {
        this.gameState = GameState.PLAYING;
        this.menuElement.style.display = 'none';
        this.uiElement.style.display = 'block';
        
        // Resetear estado del juego
        this.score = 0;
        this.lives = this.config.initialLives;
        this.currentLevelIndex = 1;
        
        this.updateHUD();
        
        // Cargar primer nivel
        await this.loadLevel(1);
        
        // Iniciar música de fondo
        this.audioManager.playBackgroundMusic();
        
        // Pequeño delay para evitar disparo inmediato
        setTimeout(() => {
            this.gameLoop();
        }, 100);
    }
    
    private async loadLevel(levelIndex: number): Promise<void> {
        if (this.currentLevel) {
            this.currentLevel.dispose();
        }
        
        this.currentLevel = new Level(levelIndex, this.scene, this.player);
        await this.currentLevel.init();
        
        this.player.resetAmmo(this.config.initialAmmo);
        this.updateHUD();
    }
    
    private restartGame(): void {
        this.startGame();
    }
    
    private togglePause(): void {
        if (this.gameState === GameState.PLAYING) {
            this.pauseGame();
        } else if (this.gameState === GameState.PAUSED) {
            this.resumeGame();
        }
    }
    
    private pauseGame(): void {
        this.gameState = GameState.PAUSED;
        this.menuElement.style.display = 'flex';
        this.uiElement.style.display = 'none';
        
        document.getElementById('mainMenu')!.style.display = 'none';
        document.getElementById('pauseMenu')!.style.display = 'block';
        document.getElementById('gameOverMenu')!.style.display = 'none';
        
        document.exitPointerLock();
        console.log('Juego pausado');
    }
    
    private resumeGame(): void {
        this.gameState = GameState.PLAYING;
        this.menuElement.style.display = 'none';
        this.uiElement.style.display = 'block';
        
        console.log('Juego reanudado');
        
        // Reanudar el bucle de juego
        this.gameLoop();
    }
    
    private exitToMainMenu(): void {
        // Limpiar el nivel actual
        if (this.currentLevel) {
            this.currentLevel.dispose();
            this.currentLevel = null;
        }
        
        // Limpiar proyectiles del jugador
        this.player.dispose();
        
        // Parar música
        this.audioManager.stopBackgroundMusic();
        
        // Volver al menú principal
        this.showMainMenu();
        console.log('Saliendo al menú principal');
    }
    
    private gameLoop(): void {
        if (this.gameState !== GameState.PLAYING) return;
        
        requestAnimationFrame(() => this.gameLoop());
        
        // Actualizar jugador
        this.player.update(this.keys);
        
        // Actualizar nivel actual
        if (this.currentLevel) {
            this.currentLevel.update();
            this.checkCollisions();
            this.checkLevelCompletion();
        }
        
        this.updateHUD();
        this.render();
    }
    
    private checkCollisions(): void {
        if (!this.currentLevel) return;
        
        // Verificar colisiones con enemigos
        const playerPosition = this.player.getPosition();
        const enemies = this.currentLevel.getEnemies();
        
        for (const enemy of enemies) {
            if (enemy.isAlive() && enemy.isCollidingWith(playerPosition)) {
                console.log(`Colisión detectada! Distancia: ${enemy.getPosition().distanceTo(playerPosition)}`);
                this.takeDamage();
                break;
            }
        }
        
        // Verificar impactos de proyectiles
        const projectiles = this.player.getProjectiles();
        const targets = this.currentLevel.getTargets();
        
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            
            // Verificar colisión con objetivos
            for (let j = targets.length - 1; j >= 0; j--) {
                const target = targets[j];
                if (target.isHitBy(projectile.position)) {
                    this.score += target.getPoints();
                    this.currentLevel.removeTarget(j);
                    this.player.removeProjectile(i);
                    this.audioManager.playHitSound();
                    break;
                }
            }
            
            // Verificar colisión con enemigos
            for (const enemy of enemies) {
                if (enemy.isAlive() && enemy.isHitBy(projectile.position)) {
                    this.score += 25; // Menos puntos por impactar enemigo
                    enemy.takeDamage(50); // Daño específico
                    this.player.removeProjectile(i);
                    this.audioManager.playHitSound();
                    
                    // Puntos extra si matamos al enemigo
                    if (!enemy.isAlive()) {
                        this.score += 75; // Bonus por matar enemigo
                        console.log(`¡Enemigo eliminado! Puntos bonus: 75`);
                    }
                    break;
                }
            }
        }
    }
    
    private checkLevelCompletion(): void {
        if (!this.currentLevel) return;
        
        const targets = this.currentLevel.getTargets();
        const ammo = this.player.getAmmo();
        
        // Nivel completado si no hay más objetivos
        if (targets.length === 0) {
            this.levelComplete();
        }
        // Game over si no hay munición y aún hay objetivos
        else if (ammo <= 0) {
            this.gameOver(false);
        }
    }
    
    private async levelComplete(): Promise<void> {
        if (this.currentLevelIndex < this.config.totalLevels) {
            this.currentLevelIndex++;
            await this.loadLevel(this.currentLevelIndex);
        } else {
            this.gameOver(true);
        }
    }
    
    private takeDamage(): void {
        const currentTime = Date.now();
        // Cooldown de 1 segundo entre daños
        if (currentTime - this.lastDamageTime < 1000) {
            return;
        }
        
        this.lastDamageTime = currentTime;
        this.lives--;
        this.audioManager.playDamageSound();
        
        console.log(`¡Colisión con enemigo! Vidas restantes: ${this.lives}`);
        
        // Efecto visual de daño - flash rojo
        this.showDamageEffect();
        
        if (this.lives <= 0) {
            this.gameOver(false);
        }
    }
    
    private showDamageEffect(): void {
        // Crear overlay rojo temporal
        const damageOverlay = document.createElement('div');
        damageOverlay.style.position = 'absolute';
        damageOverlay.style.top = '0';
        damageOverlay.style.left = '0';
        damageOverlay.style.width = '100%';
        damageOverlay.style.height = '100%';
        damageOverlay.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
        damageOverlay.style.pointerEvents = 'none';
        damageOverlay.style.zIndex = '150';
        
        this.container.appendChild(damageOverlay);
        
        // Remover después de 200ms
        setTimeout(() => {
            if (damageOverlay.parentNode) {
                damageOverlay.parentNode.removeChild(damageOverlay);
            }
        }, 200);
    }
    
    private gameOver(won: boolean): void {
        this.gameState = GameState.GAME_OVER;
        this.audioManager.stopBackgroundMusic();
        
        if (won) {
            this.audioManager.playVictorySound();
        } else {
            this.audioManager.playDefeatSound();
        }
        
        // Mostrar menú de game over
        this.menuElement.style.display = 'flex';
        this.uiElement.style.display = 'none';
        
        document.getElementById('mainMenu')!.style.display = 'none';
        document.getElementById('pauseMenu')!.style.display = 'none';
        document.getElementById('gameOverMenu')!.style.display = 'block';
        
        const gameOverMenu = document.getElementById('gameOverMenu')!;
        const gameOverText = document.getElementById('gameOverText')!;
        const finalScore = document.getElementById('finalScore')!;
        const finalLives = document.getElementById('finalLives')!;
        
        if (won) {
            // Estilo de victoria
            gameOverMenu.style.backgroundColor = 'rgba(0, 100, 0, 0.9)'; // Verde
            gameOverMenu.style.border = '3px solid #00FF00';
            gameOverText.textContent = '🏆 ¡VICTORIA! 🏆';
            gameOverText.style.color = '#00FF00';
            gameOverText.style.textShadow = '2px 2px 4px #004400';
            gameOverText.style.fontSize = '48px';
            
            // Mensaje adicional de victoria
            finalScore.textContent = `🎯 Puntuación Final: ${this.score}`;
            finalLives.textContent = `❤️ Vidas restantes: ${this.lives}`;
            
        } else {
            // Estilo de derrota
            gameOverMenu.style.backgroundColor = 'rgba(100, 0, 0, 0.9)'; // Rojo
            gameOverMenu.style.border = '3px solid #FF0000';
            gameOverText.textContent = '💀 DERROTA 💀';
            gameOverText.style.color = '#FF0000';
            gameOverText.style.textShadow = '2px 2px 4px #440000';
            gameOverText.style.fontSize = '48px';
            
            // Mensaje adicional de derrota
            finalScore.textContent = `💔 Puntuación: ${this.score}`;
            finalLives.textContent = `⚰️ Vidas restantes: ${this.lives}`;
        }
        
        document.exitPointerLock();
    }
    
    private updateHUD(): void {
        this.hudElements.ammo.textContent = this.player.getAmmo().toString();
        this.hudElements.lives.textContent = this.lives.toString();
        this.hudElements.score.textContent = this.score.toString();
        this.hudElements.level.textContent = this.currentLevelIndex.toString();
    }
    
    private render(): void {
        this.renderer.render(this.scene, this.camera);
    }
    
    private onWindowResize(): void {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
} 
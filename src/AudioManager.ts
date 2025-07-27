export class AudioManager {
    private backgroundMusic: HTMLAudioElement | null = null;
    private sounds: { [key: string]: HTMLAudioElement } = {};
    private isAudioEnabled: boolean = true;
    private musicVolume: number = 0.3;
    private effectsVolume: number = 0.5;
    
    constructor() {
        this.createSilentAudio();
    }
    
    public async init(): Promise<void> {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                const context = new AudioContext();
                if (context.state === 'suspended') {
                    await context.resume();
                }
            }
            
            this.createSilentAudio();
            console.log('AudioManager inicializado');
        } catch (error) {
            console.warn('Error inicializando audio:', error);
            this.isAudioEnabled = false;
        }
    }
    
    private createSilentAudio(): void {
        
        // Música de fondo
        this.backgroundMusic = new Audio();
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = this.musicVolume;
        
        // Efectos de sonido
        this.sounds.shoot = new Audio();
        this.sounds.hit = new Audio();
        this.sounds.damage = new Audio();
        this.sounds.victory = new Audio();
        this.sounds.defeat = new Audio();
        
        // Configurar volumen para efectos
        Object.values(this.sounds).forEach(audio => {
            audio.volume = this.effectsVolume;
        });
    }
    
    public playBackgroundMusic(): void {
        if (!this.isAudioEnabled || !this.backgroundMusic) return;
        
        try {
            this.backgroundMusic.src = '/assets/audio/background-music.mp3';
            
            const playPromise = this.backgroundMusic.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn('Error reproduciendo música de fondo:', error);
                });
            }
        } catch (error) {
            console.warn('Error al iniciar música de fondo:', error);
        }
    }
    
    public stopBackgroundMusic(): void {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }
    
    public playShootSound(): void {
        this.playSound('shoot');
    }
    
    public playHitSound(): void {
        this.playSound('hit');
    }
    
    public playDamageSound(): void {
        this.playSound('damage');
    }
    
    public playVictorySound(): void {
        this.playSound('victory');
    }
    
    public playDefeatSound(): void {
        this.playSound('defeat');
    }
    
    private playSound(soundName: string): void {
        if (!this.isAudioEnabled || !this.sounds[soundName]) return;
        
        try {
            const audio = this.sounds[soundName];
            
            
            switch (soundName) {
                case 'shoot':
                    audio.src = '/assets/audio/arrow-shoot.mp3';
                    break;
                case 'hit':
                    audio.src = '/assets/audio/target-hit.mp3';
                    break;
                case 'damage':
                    audio.src = '/assets/audio/player-damage.mp3';
                    break;
                case 'victory':
                    audio.src = '/assets/audio/victory.mp3';
                    break;
            }
            
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn(`Error reproduciendo sonido ${soundName}:`, error);
                });
            }
        } catch (error) {
            console.warn(`Error al reproducir sonido ${soundName}:`, error);
        }
    }
    
    public setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }
    
    public setEffectsVolume(volume: number): void {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(audio => {
            audio.volume = this.effectsVolume;
        });
    }
    
    public toggleAudio(): void {
        this.isAudioEnabled = !this.isAudioEnabled;
        if (!this.isAudioEnabled) {
            this.stopBackgroundMusic();
        }
    }
    
    public isEnabled(): boolean {
        return this.isAudioEnabled;
    }
    
    public loadAudioFile(soundName: string, filePath: string): void {
        if (!this.isAudioEnabled) return;
        
        try {
            if (soundName === 'background') {
                if (this.backgroundMusic) {
                    this.backgroundMusic.src = filePath;
                    this.backgroundMusic.load();
                }
            } else if (this.sounds[soundName]) {
                this.sounds[soundName].src = filePath;
                this.sounds[soundName].load();
            }
        } catch (error) {
            console.warn(`Error cargando archivo de audio ${soundName}:`, error);
        }
    }
    
    public dispose(): void {
        this.stopBackgroundMusic();
        
        if (this.backgroundMusic) {
            this.backgroundMusic = null;
        }
        
        Object.values(this.sounds).forEach(audio => {
            audio.pause();
        });
        this.sounds = {};
    }
}

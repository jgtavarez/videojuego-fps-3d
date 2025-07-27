export enum GameState {
    MENU = 'menu',
    PLAYING = 'playing',
    PAUSED = 'paused',
    GAME_OVER = 'game_over'
}

export interface GameConfig {
    initialAmmo: number;
    initialLives: number;
    totalLevels: number;
}

export interface ProjectileData {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    mesh: THREE.Mesh;
    age: number;
    maxAge: number;
}

export interface TargetData {
    position: THREE.Vector3;
    points: number;
    mesh: THREE.Mesh;
    isDestroyed: boolean;
}

export interface EnemyData {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    mesh: THREE.Mesh;
    health: number;
    maxHealth: number;
    speed: number;
} 
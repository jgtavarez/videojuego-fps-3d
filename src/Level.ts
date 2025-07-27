import * as THREE from 'three';
import { Target } from './Target';
import { Enemy } from './Enemy';
import { Player } from './Player';

export class Level {
    private targets: Target[] = [];
    private enemies: Enemy[] = [];
    private terrain: THREE.Mesh[] = [];
    private levelIndex: number;
    private scene: THREE.Scene;
    private player: Player;
    
    constructor(levelIndex: number, scene: THREE.Scene, player: Player) {
        this.levelIndex = levelIndex;
        this.scene = scene;
        this.player = player;
    }
    
    public async init(): Promise<void> {
        this.clearLevel();
        this.createTerrain();
        
        switch (this.levelIndex) {
            case 1:
                this.setupLevel1();
                break;
            case 2:
                this.setupLevel2();
                break;
            default:
                this.setupLevel1();
        }
    }
    
    private clearLevel(): void {
        // Limpiar objetivos anteriores
        this.targets.forEach(target => target.dispose());
        this.targets = [];
        
        // Limpiar enemigos anteriores
        this.enemies.forEach(enemy => enemy.dispose());
        this.enemies = [];
        
        // Limpiar terreno anterior (excepto el suelo principal)
        this.terrain.forEach(piece => {
            if (piece.parent) {
                piece.parent.remove(piece);
            }
        });
        this.terrain = [];
    }
    
    private createTerrain(): void {
        // Crear suelo principal
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4A5D23 }); // Verde césped
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.terrain.push(ground);
        
        // Añadir algunas rocas decorativas
        for (let i = 0; i < 10; i++) {
            const rockGeometry = new THREE.SphereGeometry(Math.random() * 0.5 + 0.2, 6, 4);
            const rockMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
            const rock = new THREE.Mesh(rockGeometry, rockMaterial);
            rock.position.set(
                (Math.random() - 0.5) * 80,
                0,
                (Math.random() - 0.5) * 80
            );
            rock.castShadow = true;
            rock.receiveShadow = true;
            this.scene.add(rock);
            this.terrain.push(rock);
        }
        
        // Añadir algunos árboles simples
        for (let i = 0; i < 8; i++) {
            const treeGroup = new THREE.Group();
            
            // Tronco
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 2;
            treeGroup.add(trunk);
            
            // Copa
            const foliageGeometry = new THREE.SphereGeometry(2, 8, 6);
            const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
            const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
            foliage.position.y = 4;
            treeGroup.add(foliage);
            
            treeGroup.position.set(
                (Math.random() - 0.5) * 90,
                0,
                (Math.random() - 0.5) * 90
            );
            
            treeGroup.castShadow = true;
            treeGroup.receiveShadow = true;
            this.scene.add(treeGroup);
            this.terrain.push(treeGroup as any);
        }
    }
    
    private setupLevel1(): void {
        // Nivel 1: Galería de tiro básica con dianas fijas
        console.log('Configurando Nivel 1: Galería de Tiro');
        
        // Crear 5 dianas en diferentes posiciones
        const targetPositions = [
            new THREE.Vector3(-15, 3, -20),
            new THREE.Vector3(-5, 3, -25),
            new THREE.Vector3(5, 3, -22),
            new THREE.Vector3(15, 3, -18),
            new THREE.Vector3(0, 3, -30)
        ];
        
        targetPositions.forEach((position, index) => {
            const points = 50 + (index * 10); // Puntos incrementales
            const target = new Target(position, points, this.scene);
            this.targets.push(target);
        });
        
        // Añadir algunos enemigos que patrullan
        const enemyPositions = [
            new THREE.Vector3(-20, 1, -10),
            new THREE.Vector3(20, 1, -15),
            new THREE.Vector3(0, 1, -5)
        ];
        
        enemyPositions.forEach((position) => {
            const patrolPoints = [
                position.clone(),
                position.clone().add(new THREE.Vector3(8, 0, 0)),
                position.clone().add(new THREE.Vector3(8, 0, 8)),
                position.clone().add(new THREE.Vector3(0, 0, 8))
            ];
            
            const enemy = new Enemy(position, this.scene, 'patrol', patrolPoints);
            this.enemies.push(enemy);
        });
    }
    
    private setupLevel2(): void {
        // Nivel 2: Boss level con enemigo perseguidor
        console.log('Configurando Nivel 2: Boss Battle');
        
        // Crear 3 dianas más difíciles de alcanzar
        const targetPositions = [
            new THREE.Vector3(-10, 5, -35),  // Más altas
            new THREE.Vector3(10, 4, -40),
            new THREE.Vector3(0, 6, -45)
        ];
        
        targetPositions.forEach((position, index) => {
            const points = 100 + (index * 25); // Más puntos por ser más difícil
            const target = new Target(position, points, this.scene);
            this.targets.push(target);
        });
        
        // Boss enemy - más grande y persigue al jugador
        const bossPosition = new THREE.Vector3(0, 2, -20);
        const boss = new Boss(bossPosition, this.scene);
        this.enemies.push(boss);
        
        // Algunos enemigos adicionales más agresivos
        const enemyPositions = [
            new THREE.Vector3(-15, 1, -10),
            new THREE.Vector3(15, 1, -10)
        ];
        
        enemyPositions.forEach(position => {
            const enemy = new Enemy(position, this.scene, 'chase');
            this.enemies.push(enemy);
        });
    }
    
    public update(): void {
        const playerPosition = this.player.getPosition();
        
        // Actualizar enemigos
        this.enemies.forEach(enemy => {
            enemy.update(playerPosition);
        });
        
        // Limpiar enemigos muertos
        this.enemies = this.enemies.filter(enemy => {
            if (!enemy.isAlive()) {
                enemy.dispose();
                return false;
            }
            return true;
        });
    }
    
    public getTargets(): Target[] {
        return this.targets;
    }
    
    public getEnemies(): Enemy[] {
        return this.enemies;
    }
    
    public removeTarget(index: number): void {
        if (index >= 0 && index < this.targets.length) {
            this.targets[index].destroy();
            this.targets[index].dispose();
            this.targets.splice(index, 1);
        }
    }
    
    public dispose(): void {
        this.targets.forEach(target => target.dispose());
        this.targets = [];
        
        this.enemies.forEach(enemy => enemy.dispose());
        this.enemies = [];
        
        this.terrain.forEach(piece => {
            if (piece.parent) {
                piece.parent.remove(piece);
            }
        });
        this.terrain = [];
    }
}

// Boss class - enemigo especial para el nivel 2
class Boss extends Enemy {
    constructor(position: THREE.Vector3, scene: THREE.Scene) {
        super(position, scene, 'chase');
        this.health = 300; // Mucha más vida
        this.maxHealth = 300;
        this.speed = 3; // Más rápido
        this.collisionRadius = 2.5; // Más grande (escalado x2)
        
        // Modificar apariencia para que sea más grande
        this.mesh.scale.set(2, 2, 2);
        
        // Cambiar color a dorado para que se vea como boss
        this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
                if (child.material.color.getHex() === 0xFF0000) { // Si es rojo (cuerpo)
                    child.material.color.setHex(0xFFD700); // Cambiar a dorado
                }
            }
        });
    }
    
    public takeDamage(damage: number = 25): void {
        // El boss recibe menos daño
        super.takeDamage(damage);
    }
} 
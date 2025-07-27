import * as THREE from 'three';

export class Enemy {
    protected mesh!: THREE.Object3D;
    protected position: THREE.Vector3;
    protected velocity: THREE.Vector3;
    protected health: number;
    protected maxHealth: number;
    protected speed: number;
    protected collisionRadius: number = 1.5;
    
    // Patrón de movimiento
    private movementPattern: 'patrol' | 'chase' | 'random';
    private patrolPoints: THREE.Vector3[] = [];
    private currentPatrolIndex: number = 0;
    
    constructor(
        position: THREE.Vector3, 
        scene: THREE.Scene, 
        movementPattern: 'patrol' | 'chase' | 'random' = 'patrol',
        patrolPoints?: THREE.Vector3[]
    ) {
        this.position = position.clone();
        this.velocity = new THREE.Vector3();
        this.health = 150;
        this.maxHealth = 150;
        this.speed = 2;
        this.movementPattern = movementPattern;
        
        if (patrolPoints && patrolPoints.length > 0) {
            this.patrolPoints = patrolPoints;
        } else {
            // Crear patrón de patrulla por defecto
            this.patrolPoints = [
                position.clone(),
                position.clone().add(new THREE.Vector3(5, 0, 0)),
                position.clone().add(new THREE.Vector3(5, 0, 5)),
                position.clone().add(new THREE.Vector3(0, 0, 5))
            ];
        }
        
        this.createMesh();
        scene.add(this.mesh);
    }
    
    private createMesh(): void {
        // Crear enemigo como un cubo rojo con ojos
        const group = new THREE.Group();
        
        // Cuerpo principal
        const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 1);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 }); // Rojo enemigo
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        group.add(body);
        
        // Ojos
        const eyeGeometry = new THREE.SphereGeometry(0.1);
        const eyeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.2, 1, 0.5);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.2, 1, 0.5);
        
        group.add(leftEye);
        group.add(rightEye);
        
        // Pupilas
        const pupilGeometry = new THREE.SphereGeometry(0.05);
        const pupilMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(-0.2, 1, 0.55);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(0.2, 1, 0.55);
        
        group.add(leftPupil);
        group.add(rightPupil);
        
        this.mesh = group;
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }
    
    public update(playerPosition?: THREE.Vector3): void {
        switch (this.movementPattern) {
            case 'patrol':
                this.updatePatrol();
                break;
            case 'chase':
                if (playerPosition) {
                    this.updateChase(playerPosition);
                }
                break;
            case 'random':
                this.updateRandom();
                break;
        }
        
        // Aplicar movimiento
        this.position.add(this.velocity.clone().multiplyScalar(0.016));
        this.mesh.position.copy(this.position);
        
        // Hacer que el enemigo mire en la dirección del movimiento
        if (this.velocity.length() > 0.1) {
            const lookDirection = this.position.clone().add(this.velocity.clone().normalize());
            this.mesh.lookAt(lookDirection);
        }
    }
    
    private updatePatrol(): void {
        if (this.patrolPoints.length === 0) return;
        
        const targetPoint = this.patrolPoints[this.currentPatrolIndex];
        const direction = targetPoint.clone().sub(this.position);
        direction.y = 0; // Mantener movimiento horizontal
        
        const distance = direction.length();
        
        if (distance < 0.5) {
            // Llegar al punto de patrulla, ir al siguiente
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
        }
        
        direction.normalize();
        this.velocity.copy(direction.multiplyScalar(this.speed));
    }
    
    private updateChase(playerPosition: THREE.Vector3): void {
        const direction = playerPosition.clone().sub(this.position);
        direction.y = 0; // Mantener movimiento horizontal
        direction.normalize();
        
        this.velocity.copy(direction.multiplyScalar(this.speed * 1.5)); // Más rápido al perseguir
    }
    
    private updateRandom(): void {
        // Cambiar dirección aleatoriamente cada cierto tiempo
        if (Math.random() < 0.02) { // 2% de probabilidad cada frame
            const randomDirection = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                0,
                (Math.random() - 0.5) * 2
            ).normalize();
            
            this.velocity.copy(randomDirection.multiplyScalar(this.speed));
        }
    }
    
    public isCollidingWith(position: THREE.Vector3): boolean {
        const distance = this.position.distanceTo(position);
        console.log(`Checking collision: distance=${distance.toFixed(2)}, radius=${this.collisionRadius}, colliding=${distance <= this.collisionRadius}`);
        return distance <= this.collisionRadius;
    }
    
    public isHitBy(projectilePosition: THREE.Vector3): boolean {
        const distance = this.position.distanceTo(projectilePosition);
        return distance <= this.collisionRadius;
    }
    
    public takeDamage(damage: number = 50): void {
        this.health -= damage;
        console.log(`Enemigo recibe ${damage} de daño. Vida restante: ${this.health}/${this.maxHealth}`);
        
        // Efecto visual de daño
        const originalColor = (this.mesh.children[0] as THREE.Mesh).material as THREE.MeshLambertMaterial;
        const originalColorValue = originalColor.color.getHex();
        
        originalColor.color.setHex(0xFFFFFF); // Flash blanco
        
        setTimeout(() => {
            if (this.health > 0) {
                originalColor.color.setHex(originalColorValue);
            }
        }, 100);
        
        // Mostrar barra de vida temporal
        this.showHealthBar();
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    private showHealthBar(): void {
        // Crear barra de vida sobre el enemigo
        const healthBarGeometry = new THREE.PlaneGeometry(2, 0.1);
        const healthBarMaterial = new THREE.MeshBasicMaterial({ 
            color: this.health / this.maxHealth > 0.5 ? 0x00FF00 : 
                   this.health / this.maxHealth > 0.25 ? 0xFFFF00 : 0xFF0000,
            side: THREE.DoubleSide
        });
        const healthBar = new THREE.Mesh(healthBarGeometry, healthBarMaterial);
        healthBar.position.set(0, 2.5, 0);
        
        // Escalar según vida restante
        healthBar.scale.x = this.health / this.maxHealth;
        
        this.mesh.add(healthBar);
        
        // Remover después de 2 segundos
        setTimeout(() => {
            this.mesh.remove(healthBar);
            healthBarGeometry.dispose();
            healthBarMaterial.dispose();
        }, 2000);
    }
    
    private die(): void {
        console.log(`¡Enemigo eliminado!`);
        this.health = 0;
        
        // Cambiar color a gris (muerto)
        this.mesh.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshLambertMaterial) {
                if (child.material.color.getHex() === 0xFF0000 || child.material.color.getHex() === 0xFFD700) {
                    child.material.color.setHex(0x444444); // Gris oscuro
                }
            }
        });
        
        // Animación de muerte - hacer que el enemigo caiga
        const deathAnimation = () => {
            this.mesh.rotation.x += 0.05;
            this.mesh.position.y -= 0.02;
            
            if (this.mesh.rotation.x < Math.PI / 2) {
                requestAnimationFrame(deathAnimation);
            } else {
                // Marcar para eliminación después de la animación
                setTimeout(() => {
                    this.dispose();
                }, 3000);
            }
        };
        deathAnimation();
    }
    
    public getPosition(): THREE.Vector3 {
        return this.position.clone();
    }
    
    public isAlive(): boolean {
        return this.health > 0;
    }
    
    public dispose(): void {
        if (this.mesh && this.mesh.parent) {
            this.mesh.parent.remove(this.mesh);
        }
        
        // Limpiar geometrías y materiales
        if (this.mesh) {
            this.mesh.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(material => material.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                }
            });
        }
    }
} 
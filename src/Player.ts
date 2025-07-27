import * as THREE from 'three';
import { Projectile } from './Projectile';

export class Player {
    private position: THREE.Vector3;
    private velocity: THREE.Vector3;
    private projectiles: Projectile[] = [];
    
    private ammo: number = 20;
    
    // Controles FPS
    private euler = new THREE.Euler(0, 0, 0, 'YXZ');
    private speed = 5;
    private sensitivity = 0.002;
    
    // Arma (visual)
    private weaponMesh!: THREE.Group;
    
    // Audio callback
    private onShoot?: () => void;
    
    constructor(private camera: THREE.PerspectiveCamera, private scene: THREE.Scene) {
        this.position = new THREE.Vector3(0, 2, 10);
        this.velocity = new THREE.Vector3();
        
        this.camera.position.copy(this.position);
        this.setupWeapon();
    }
    
    public setShootCallback(callback: () => void): void {
        this.onShoot = callback;
    }
    
    private setupWeapon(): void {
        this.weaponMesh = new THREE.Group();
        
        // Crear un arco simple (dos cilindros curvados)
        const bowGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5);
        const bowMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Marrón madera
        
        // Cuerpo del arco
        const bowBody = new THREE.Mesh(bowGeometry, bowMaterial);
        bowBody.rotation.z = Math.PI / 2;
        bowBody.position.set(0.3, -0.3, -0.8);
        
        // Cuerda del arco
        const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, 1.3);
        const stringMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const bowString = new THREE.Mesh(stringGeometry, stringMaterial);
        bowString.rotation.z = Math.PI / 2;
        bowString.position.set(0.2, -0.3, -0.8);
        
        this.weaponMesh.add(bowBody);
        this.weaponMesh.add(bowString);
        
        // Añadir a la cámara para que se mueva con ella
        this.camera.add(this.weaponMesh);
        this.scene.add(this.camera);
    }
    
    public update(keys: { [key: string]: boolean }): void {
        // Resetear velocidad
        this.velocity.set(0, 0, 0);
        
        // Calcular dirección frontal y lateral
        const forward = new THREE.Vector3();
        const right = new THREE.Vector3();
        
        this.camera.getWorldDirection(forward);
        forward.y = 0; // Mantener movimiento horizontal
        forward.normalize();
        
        right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
        
        // Movimiento con flechas del teclado
        if (keys['ArrowUp'] || keys['KeyW']) {
            this.velocity.add(forward.clone().multiplyScalar(this.speed));
        }
        if (keys['ArrowDown'] || keys['KeyS']) {
            this.velocity.add(forward.clone().multiplyScalar(-this.speed));
        }
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.velocity.add(right.clone().multiplyScalar(-this.speed));
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.velocity.add(right.clone().multiplyScalar(this.speed));
        }
        
        // Aplicar movimiento
        this.position.add(this.velocity.clone().multiplyScalar(0.016)); // 60 FPS aproximado
        this.camera.position.copy(this.position);
        
        // Actualizar proyectiles
        this.updateProjectiles();
    }
    
    public updateLook(movementX: number, movementY: number): void {
        this.euler.setFromQuaternion(this.camera.quaternion);
        
        this.euler.y -= movementX * this.sensitivity;
        this.euler.x -= movementY * this.sensitivity;
        
        // Limitar rotación vertical
        this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
        
        this.camera.quaternion.setFromEuler(this.euler);
    }
    
    public shoot(): void {
        if (this.ammo <= 0) return;
        
        this.ammo--;
        
        // Crear proyectil (flecha)
        const projectile = new Projectile(
            this.camera.position.clone(),
            this.camera.getWorldDirection(new THREE.Vector3()),
            this.scene
        );
        
        this.projectiles.push(projectile);
        
        // Efecto de retroceso del arma
        this.weaponRecoil();
        
        // Reproducir sonido de disparo
        if (this.onShoot) {
            this.onShoot();
        }
    }
    
    private weaponRecoil(): void {
        // Animación simple de retroceso
        const originalPosition = this.weaponMesh.position.clone();
        this.weaponMesh.position.z += 0.1;
        
        setTimeout(() => {
            this.weaponMesh.position.copy(originalPosition);
        }, 100);
    }
    
    private updateProjectiles(): void {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            projectile.update();
            
            if (projectile.shouldRemove()) {
                projectile.dispose();
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    public removeProjectile(index: number): void {
        if (index >= 0 && index < this.projectiles.length) {
            this.projectiles[index].dispose();
            this.projectiles.splice(index, 1);
        }
    }
    
    public getProjectiles(): Projectile[] {
        return this.projectiles;
    }
    
    public getPosition(): THREE.Vector3 {
        return this.position.clone();
    }
    
    public getAmmo(): number {
        return this.ammo;
    }
    
    public resetAmmo(amount: number): void {
        this.ammo = amount;
    }
    
    public dispose(): void {
        this.projectiles.forEach(projectile => projectile.dispose());
        this.projectiles = [];
        
        if (this.weaponMesh) {
            this.camera.remove(this.weaponMesh);
        }
    }
} 
import * as THREE from 'three';

export class Target {
    private mesh!: THREE.Object3D;
    private points: number;
    private position: THREE.Vector3;
    private isDestroyed: boolean = false;
    private hitRadius: number = 1;
    
    constructor(position: THREE.Vector3, points: number, scene: THREE.Scene) {
        this.position = position.clone();
        this.points = points;
        
        this.createMesh();
        scene.add(this.mesh);
    }
    
    private createMesh(): void {
        // Crear diana circular con anillos de colores
        const group = new THREE.Group();
        
        // Soporte de la diana
        const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3);
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.y = -1.5;
        group.add(post);
        
        // Diana circular con anillos
        const rings = [
            { radius: 1.0, color: 0xFFFFFF, points: 10 },  // Exterior blanco
            { radius: 0.8, color: 0x000000, points: 20 },  // Negro
            { radius: 0.6, color: 0x0066FF, points: 30 },  // Azul
            { radius: 0.4, color: 0xFF0000, points: 40 },  // Rojo
            { radius: 0.2, color: 0xFFD700, points: 50 }   // Centro dorado
        ];
        
        rings.forEach(ring => {
            const ringGeometry = new THREE.CircleGeometry(ring.radius, 32);
            const ringMaterial = new THREE.MeshLambertMaterial({ 
                color: ring.color,
                side: THREE.DoubleSide
            });
            const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
            ringMesh.rotation.y = Math.PI; // Girar para que mire hacia el jugador
            group.add(ringMesh);
        });
        
        // Marco de la diana
        const frameGeometry = new THREE.RingGeometry(0.95, 1.05, 32);
        const frameMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x654321,
            side: THREE.DoubleSide
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.rotation.y = Math.PI;
        group.add(frame);
        
        this.mesh = group;
        this.mesh.position.copy(this.position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
    }
    
    public isHitBy(projectilePosition: THREE.Vector3): boolean {
        if (this.isDestroyed) return false;
        
        const distance = this.position.distanceTo(projectilePosition);
        return distance <= this.hitRadius;
    }
    
    public getPoints(): number {
        // Calcular puntos basado en la distancia al centro
        // Esto se podría mejorar para dar más puntos por golpear el centro
        return this.points;
    }
    
    public getPosition(): THREE.Vector3 {
        return this.position.clone();
    }
    
    public destroy(): void {
        this.isDestroyed = true;
        
        // Efecto de destrucción - hacer que la diana caiga
        if (this.mesh) {
            // Animación simple de caída
            const fallAnimation = () => {
                this.mesh.rotation.x += 0.02;
                this.mesh.position.y -= 0.05;
                
                if (this.mesh.position.y > this.position.y - 2) {
                    requestAnimationFrame(fallAnimation);
                }
            };
            fallAnimation();
        }
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
    
    public isDestroyed_(): boolean {
        return this.isDestroyed;
    }
} 
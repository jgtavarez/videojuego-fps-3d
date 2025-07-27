import * as THREE from 'three';

export class Projectile {
    public position: THREE.Vector3;
    private velocity: THREE.Vector3;
    private mesh!: THREE.Object3D;
    private age: number = 0;
    private maxAge: number = 5; // 5 segundos de vida
    private speed: number = 20;
    
    constructor(startPosition: THREE.Vector3, direction: THREE.Vector3, scene: THREE.Scene) {
        this.position = startPosition.clone();
        this.velocity = direction.clone().multiplyScalar(this.speed);
        
        this.createMesh();
        scene.add(this.mesh);
    }
    
    private createMesh(): void {
        // Crear flecha (cilindro alargado con cono en la punta)
        const group = new THREE.Group();
        
        // Cuerpo de la flecha - orientado hacia Z positivo
        const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8);
        const shaftMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 }); // Marrón madera
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.rotation.x = Math.PI / 2; // Rotar para que apunte hacia Z
        
        // Punta de la flecha
        const tipGeometry = new THREE.ConeGeometry(0.05, 0.15);
        const tipMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 }); // Gris metal
        const tip = new THREE.Mesh(tipGeometry, tipMaterial);
        tip.position.z = 0.5; // Posicionar en Z en lugar de X
        tip.rotation.x = Math.PI / 2; // Rotar para que apunte hacia Z
        
        // Plumas de la flecha
        const featherGeometry = new THREE.PlaneGeometry(0.1, 0.3);
        const featherMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFF4444, 
            side: THREE.DoubleSide 
        });
        
        for (let i = 0; i < 3; i++) {
            const feather = new THREE.Mesh(featherGeometry, featherMaterial);
            feather.position.z = -0.3; // Posicionar en Z en lugar de X
            feather.rotation.z = (i * Math.PI * 2) / 3; // Rotar alrededor de Z
            group.add(feather);
        }
        
        group.add(shaft);
        group.add(tip);
        
        this.mesh = group;
        this.mesh.position.copy(this.position);
    }
    
    public update(): void {
        this.age += 0.016; // Asumir 60 FPS
        
        // Aplicar gravedad
        this.velocity.y -= 9.8 * 0.016;
        
        // Actualizar posición
        this.position.add(this.velocity.clone().multiplyScalar(0.016));
        this.mesh.position.copy(this.position);
        
        // Rotar la flecha para que apunte en la dirección del movimiento
        const direction = this.velocity.clone().normalize();
        this.mesh.lookAt(this.position.clone().add(direction));
        
        // Verificar colisión con el suelo
        if (this.position.y <= 0) {
            this.velocity.y = 0;
            this.position.y = 0;
            this.velocity.multiplyScalar(0.8); // Fricción
        }
    }
    
    public shouldRemove(): boolean {
        return this.age > this.maxAge || 
               (this.position.y <= 0 && this.velocity.length() < 0.1);
    }
    
    public getPosition(): THREE.Vector3 {
        return this.position.clone();
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
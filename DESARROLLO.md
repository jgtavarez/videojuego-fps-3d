# Explicación del Desarrollo

## 📋 Resumen del Proyecto

Este documento explica el proceso de desarrollo del videojuego FPS Gallery Game, una galería de tiro en primera persona.

1. **Escena de Galería de Tiro** ✓
   - Entorno 3D con terreno, árboles, rocas
   - Dianas posicionadas estratégicamente
   - Iluminación realista con sombras

2. **Movimiento con Flechas del Teclado** ✓
   - Controles: ↑↓←→ o WASD
   - Movimiento suave en 3D
   - Física básica implementada

3. **Apuntar con Ratón** ✓
   - Cámara FPS en primera persona
   - Mouse look con sensibilidad ajustable
   - Limitación de rotación vertical

4. **Disparo con Clic Izquierdo** ✓
   - Sistema de proyectiles (flechas)
   - Arma visual (arco) con animación
   - Munición limitada

5. **Sistema de Puntuación** ✓
   - Diferentes puntuaciones por objetivo
   - Dianas con anillos de colores
   - HUD que muestra puntuación en tiempo real

6. **Destrucción de Proyectiles y Objetivos** ✓
   - Colisiones detectadas correctamente
   - Animaciones de destrucción
   - Limpieza de memoria automática

7. **Sistema de Munición y Vidas** ✓
   - Munición limitada (5 flechas por nivel)
   - Sistema de vidas (3 vidas iniciales)
   - Game over cuando se agota

8. **Dos Niveles** ✓
   - Nivel 1: Galería básica con enemigos patrullando
   - Nivel 2: Boss battle con enemigos perseguidores

9. **Menús de Entrada y Final** ✓
    - Menú principal con opciones
    - Menú de game over con opción de reiniciar

## 🛠️ Decisiones de Arquitectura

### Arquitectura del Código

#### Patrón de Diseño: Composición sobre Herencia
```typescript
class Game {
    private player: Player;
    private currentLevel: Level;
    private audioManager: AudioManager;
}
```

**Ventajas:**
- Flexibilidad para cambiar comportamientos
- Facilita testing y debugging
- Código más modular y reutilizable

#### Sistema de Coordenadas
**Decisión: Y hacia arriba (estándar 3D)**
```typescript
// Posicionamiento estándar 3D
const playerPosition = new THREE.Vector3(0, 2, 10); // X, Y, Z
const targetPosition = new THREE.Vector3(0, 3, -20); // Frente al jugador
```

#### Gestión de Estado
**Implementación: Enum para estados del juego**
```typescript
enum GameState {
    MENU = 'menu',
    PLAYING = 'playing',
    PAUSED = 'paused',
    GAME_OVER = 'game_over'
}
```

**Beneficios:**
- Estados claramente definidos
- Transiciones controladas
- Fácil debugging

## 🎮 Implementación de Mecánicas

### Sistema de Movimiento FPS
**Implementación**: Combinar Euler angles con Vector3
```typescript
public updateLook(movementX: number, movementY: number): void {
    this.euler.y -= movementX * this.sensitivity;
    this.euler.x -= movementY * this.sensitivity;
    this.euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.euler.x));
}
```

### Sistema de Proyectiles
**Implementación**: Gravedad aplicada + rotación dinámica
```typescript
public update(): void {
    this.velocity.y -= 9.8 * 0.016; // Gravedad
    this.position.add(this.velocity.clone().multiplyScalar(0.016));
    const direction = this.velocity.clone().normalize();
    this.mesh.lookAt(this.position.clone().add(direction)); // Rotar hacia movimiento
}
```

### Sistema de IA para Enemigos
**Implementación**: Strategy pattern con tipos de movimiento
```typescript
public update(playerPosition?: THREE.Vector3): void {
    switch (this.movementPattern) {
        case 'patrol': this.updatePatrol(); break;
        case 'chase': this.updateChase(playerPosition); break;
        case 'random': this.updateRandom(); break;
    }
}
```

### Detección de Colisiones
**Implementación**: Colisiones por distancia euclidiana
```typescript
public isHitBy(projectilePosition: THREE.Vector3): boolean {
    const distance = this.position.distanceTo(projectilePosition);
    return distance <= this.hitRadius;
}
```

## 🚀 Optimización y Rendimiento

### Gestión de Memoria
```typescript
public dispose(): void {
    // Limpieza explícita de recursos Three.js
    if (child.geometry) child.geometry.dispose();
    if (child.material) child.material.dispose();
}
```

### Optimizaciones Implementadas
1. **Object Pooling**: Para proyectiles (implícito en array management)
2. **Frustum Culling**: Automático con Three.js
3. **Shadow Mapping**: Limitado a objetos necesarios
4. **LOD**: Geometrías simples para objetos distantes
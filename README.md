# FPS Gallery Game - Call of Duty Style

Un videojuego FPS de galería de tiro desarrollado con Three.js y TypeScript, inspirado en Call of Duty.

## 🎮 Características del Juego

- **Movimiento FPS**: Controles con flechas del teclado y ratón para apuntar
- **Sistema de Disparo**: Arco con flechas como proyectiles
- **Objetivos Dinámicos**: Dianas con sistema de puntuación
- **Enemigos**: Sistema de IA con patrullaje y persecución
- **Niveles**: Dos niveles con dificultad creciente
- **Boss Battle**: Enemigo especial en el nivel 2
- **Menús Interactivos**: Inicio, instrucciones y game over
- **Sistema de Audio**: Preparado para música de fondo y efectos
- **Gráficos 3D**: Renderizado con Three.js y sombras

## 🎯 Controles

- **Flechas del teclado** (↑↓←→) o **WASD**: Movimiento del jugador
- **Ratón**: Apuntar y mirar alrededor
- **Clic izquierdo**: Disparar flecha
- **ESC**: Pausa/Menú

## 🏗️ Arquitectura del Proyecto

### Estructura de Archivos

```
fps-gallery-game/
├── src/
│   ├── main.ts          # Punto de entrada principal
│   ├── Game.ts          # Clase principal del juego
│   ├── Player.ts        # Jugador con controles FPS
│   ├── Projectile.ts    # Sistema de proyectiles (flechas)
│   ├── Target.ts        # Objetivos/dianas
│   ├── Enemy.ts         # Enemigos con IA
│   ├── Level.ts         # Sistema de niveles
│   ├── AudioManager.ts  # Gestor de audio
│   └── types/
│       └── GameTypes.ts # Tipos TypeScript
├── index.html           # HTML principal
├── package.json         # Dependencias
├── tsconfig.json        # Configuración TypeScript
├── vite.config.ts       # Configuración Vite
└── vercel.json          # Configuración Vercel
```

### Clases Principales

#### Game.ts
- **Propósito**: Gestiona el estado global del juego, menús, y bucle principal
- **Responsabilidades**:
  - Inicialización de Three.js (escena, cámara, renderer)
  - Gestión de estados (menú, jugando, pausa, game over)
  - Detección de colisiones
  - Actualización del HUD
  - Transiciones entre niveles

#### Player.ts
- **Propósito**: Controles FPS del jugador
- **Características**:
  - Movimiento con flechas/WASD
  - Cámara en primera persona con ratón
  - Sistema de disparo con munición limitada
  - Arma visual (arco) con animación de retroceso
  - Gestión de proyectiles

#### Projectile.ts
- **Propósito**: Flechas disparadas por el jugador
- **Física**:
  - Gravedad realista
  - Rotación hacia la dirección del movimiento
  - Colisión con el suelo
  - Vida útil limitada
  - Modelo 3D detallado (cuerpo, punta, plumas)

#### Target.ts
- **Propósito**: Dianas para el sistema de puntuación
- **Características**:
  - Diseño de diana con anillos de colores
  - Sistema de puntuación por zona
  - Animación de destrucción
  - Detección de colisiones con proyectiles

#### Enemy.ts
- **Propósito**: Enemigos con IA
- **Patrones de IA**:
  - **Patrol**: Patrullaje entre puntos fijos
  - **Chase**: Persecución del jugador
  - **Random**: Movimiento aleatorio
- **Características**:
  - Sistema de vida
  - Detección de colisiones
  - Animaciones de daño y muerte
  - Boss especial más grande y resistente

#### Level.ts
- **Propósito**: Gestión de niveles y terreno
- **Niveles**:
  - **Nivel 1**: Galería básica con 5 dianas y enemigos patrullando
  - **Nivel 2**: Boss battle con dianas más difíciles
- **Terreno**: Suelo, rocas, árboles generados proceduralmente

#### AudioManager.ts
- **Propósito**: Sistema de audio
- **Preparado para**:
  - Música de fondo
  - Efectos de disparo, impacto, daño
  - Sonidos de victoria/derrota
  - Control de volumen

## 🔧 Decisiones de Desarrollo

### ¿Por qué Three.js?
- **Renderizado 3D nativo en web**: Sin necesidad de plugins
- **Gran comunidad**: Documentación excelente y muchos ejemplos
- **Rendimiento**: Optimizado para WebGL
- **Compatibilidad**: Funciona en todos los navegadores modernos

### ¿Por qué TypeScript?
- **Tipado estático**: Previene errores en tiempo de desarrollo
- **IntelliSense**: Mejor experiencia de desarrollo
- **Escalabilidad**: Fácil mantenimiento del código
- **Integración**: Excelente soporte con Vite

### ¿Por qué Vite?
- **Desarrollo rápido**: Hot reload instantáneo
- **Bundling eficiente**: Optimización automática para producción
- **Configuración mínima**: Funciona out-of-the-box
- **Soporte TypeScript**: Nativo sin configuración adicional

### Sistema de Coordenadas
- **Y hacia arriba**: Estándar 3D con Y como eje vertical
- **Posición inicial**: Jugador en (0, 2, 10) mirando hacia Z negativo
- **Dianas**: Posicionadas en Z negativo para estar frente al jugador

### Sistema de Física
- **Gravedad simple**: 9.8 m/s² aplicada a proyectiles
- **Colisiones básicas**: Detección por distancia euclidiana
- **Sin motor físico**: Implementación custom para simplicidad

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js 16+ 
- npm o yarn

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# El juego estará disponible en http://localhost:3000
```

### Construcción para Producción
```bash
# Construir proyecto
npm run build

# Vista previa de la construcción
npm run preview
```

### Despliegue en Vercel
1. Conecta tu repositorio a Vercel
2. Vercel detectará automáticamente la configuración
3. El despliegue se realizará automáticamente

## 🎵 Añadir Audio

Para añadir archivos de audio reales:

1. Crea la carpeta `public/assets/audio/`
2. Añade tus archivos:
   - `background-music.mp3` - Música de fondo
   - `arrow-shoot.mp3` - Sonido de disparo
   - `target-hit.mp3` - Impacto en diana
   - `player-damage.mp3` - Daño al jugador
   - `victory.mp3` - Victoria

3. Descomentar y usar en AudioManager:
```typescript
audioManager.loadAudioFile('background', '/assets/audio/background-music.mp3');
audioManager.loadAudioFile('shoot', '/assets/audio/arrow-shoot.mp3');
```

## 🎨 Personalización

### Añadir Nuevos Niveles
1. Modificar `Level.ts` añadiendo nuevos casos en `setupLevel()`
2. Actualizar `totalLevels` en `Game.ts`
3. Crear nuevas posiciones de dianas y enemigos

### Cambiar Armas
1. Modificar `Player.ts` en `setupWeapon()`
2. Actualizar `Projectile.ts` para diferentes tipos de proyectiles
3. Ajustar efectos de audio correspondientes

### Nuevos Tipos de Enemigos
1. Extender clase `Enemy` con nuevos patrones de IA
2. Crear nuevas geometrías y materiales
3. Implementar comportamientos específicos

## 🐛 Resolución de Problemas

### Error de WebGL
- Verificar soporte de WebGL en el navegador
- Actualizar drivers de gráficos

### Problemas de Audio
- Los navegadores requieren interacción del usuario antes de reproducir audio
- Verificar formatos de audio soportados (MP3, WAV, OGG)

### Rendimiento
- Reducir número de enemigos/objetivos
- Simplificar geometrías 3D
- Deshabilitar sombras en dispositivos de bajo rendimiento

## 📈 Futuras Mejoras

- **Más Armas**: Pistola, rifle, escopeta
- **Power-ups**: Munición extra, vida, escudo temporal
- **Multijugador**: Modo cooperativo online
- **Editor de Niveles**: Herramienta para crear niveles custom
- **Achievements**: Sistema de logros
- **Leaderboards**: Tabla de puntuaciones
- **VR Support**: Soporte para realidad virtual

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 🙏 Créditos

- **Three.js**: Librería de gráficos 3D
- **Vite**: Build tool y dev server
- **TypeScript**: Lenguaje de programación
- **Vercel**: Plataforma de despliegue

---

¡Disfruta del juego! 🎮🏹🎯 
import { Game } from './Game';

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('gameContainer');
    const loading = document.getElementById('loading');
    
    if (!gameContainer) {
        console.error('No se encontró el contenedor del juego');
        return;
    }
    
    try {
        // Crear instancia del juego
        const game = new Game(gameContainer);
        
        // Inicializar el juego
        game.init().then(() => {
            // El loading se oculta en showMainMenu()
            console.log('Juego inicializado correctamente');
        }).catch((error) => {
            console.error('Error inicializando el juego:', error);
            if (loading) {
                loading.textContent = 'Error cargando el juego';
                loading.style.color = '#ff0000';
            }
        });
        
    } catch (error) {
        console.error('Error creando el juego:', error);
        if (loading) loading.textContent = 'Error inicializando el juego';
    }
}); 
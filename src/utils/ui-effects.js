// ===================================
// UI Effects Utilities
// ===================================

/**
 * Asegura que el fondo de mármol esté presente
 */
export function ensureMarbleBG() {
    if (!document.querySelector('.marble-bg')) {
        const div = document.createElement('div');
        div.className = 'marble-bg';
        document.body.prepend(div);
    }
}

/**
 * Genera una explosión de confetti en la posición especificada
 * @param {number} x - Posición X
 * @param {number} y - Posición Y
 * @param {string[]} emojis - Array de emojis para el confetti
 */
export function confettiBurst(x = window.innerWidth - 40, y = window.innerHeight - 40, emojis = ['✨', '💎', '🪨', '🏛️', '🥂']) {
    for (let i = 0; i < 12; i++) {
        const spark = document.createElement('div');
        spark.className = 'spark';
        spark.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        spark.style.left = x + 'px';
        spark.style.top = y + 'px';
        const dx = (Math.random() - 0.5) * 200;
        const dy = (Math.random() - 0.5) * 200;
        spark.style.setProperty('--dx', dx + 'px');
        spark.style.setProperty('--dy', dy + 'px');
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 900);
    }
}

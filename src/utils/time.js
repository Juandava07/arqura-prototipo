// ===================================
// Time Utilities
// ===================================

/**
 * Obtiene la hora actual en Colombia (UTC-5)
 * @returns {string} Fecha y hora en formato "YYYY-MM-DD HH:MM:SS"
 */
export function getColombiaTime() {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const colombiaOffset = -5 * 60 * 60000; // UTC-5
    const colombiaTime = new Date(utc + colombiaOffset);

    const year = colombiaTime.getFullYear();
    const month = String(colombiaTime.getMonth() + 1).padStart(2, '0');
    const day = String(colombiaTime.getDate()).padStart(2, '0');
    const hours = String(colombiaTime.getHours()).padStart(2, '0');
    const minutes = String(colombiaTime.getMinutes()).padStart(2, '0');
    const seconds = String(colombiaTime.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

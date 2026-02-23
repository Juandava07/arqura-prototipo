// ===================================
// Image Utilities
// ===================================

const PLACEHOLDER = 'assets/placeholder.jpg';

/**
 * Genera un slug sin tildes
 * @param {string} s - String a convertir
 * @returns {string} Slug normalizado
 */
export const slug = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/**
 * Maneja errores de imagen intentando alternativas (jpg <-> jpeg)
 * @param {HTMLImageElement} img - Elemento de imagen
 */
export function imgHandleError(img) {
    if (img.dataset.tried) {
        img.src = PLACEHOLDER;
        return;
    }
    img.dataset.tried = 'true';
    const src = img.src;

    if (src.endsWith('.jpg')) {
        img.src = src.replace(/\.jpg$/, '.jpeg');
    } else if (src.endsWith('.jpeg')) {
        img.src = src.replace(/\.jpeg$/, '.jpg');
    } else if (src.endsWith('.png')) {
        img.src = src.replace(/\.png$/, '.jpg');
    } else {
        img.src = PLACEHOLDER;
    }
}

/**
 * Obtiene la ruta de imagen para un producto
 * @param {Object} p - Producto
 * @returns {string} URL de la imagen
 */
export function getImageFor(p) {
    if (!p) return PLACEHOLDER;
    if (p.image && p.image.startsWith('http')) return p.image;
    if (p.image) return p.image;

    const mat = (p.material || '').toLowerCase();
    const col = (p.color || '').toLowerCase();
    const fin = (p.finish || '').toLowerCase();

    const matMap = { 'mármol': 'marmol', 'marmol': 'marmol', 'granito': 'granito', 'cuarzo': 'cuarzo', 'sinterizado': 'sinterizado' };
    const matKey = matMap[mat] || 'marmol';
    const colSlug = slug(col);
    const finSlug = slug(fin);

    return `assets/products/${matKey}_${colSlug}_${finSlug}.jpg`;
}

export { PLACEHOLDER };

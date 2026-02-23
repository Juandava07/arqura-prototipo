// ===================================
// Products Store
// ===================================

// Note: This module requires Firebase db and DB_REF to be available globally
// In a full refactor, these would be imported from firebase config

let cachedProducts = [];

/**
 * Inicializa productos desde Firebase
 */
export async function seedProducts() {
    // Products are now managed entirely through Firebase
    return loadProductsFromFirebase();
}

/**
 * Carga productos desde Firebase
 * @returns {Array} Lista de productos
 */
export function loadProductsFromFirebase() {
    return cachedProducts || [];
}

/**
 * Guarda productos en Firebase
 * @param {Array} list - Lista de productos
 */
export function saveProductsToFirebase(list) {
    cachedProducts = list;
    if (typeof db !== 'undefined' && typeof DB_REF !== 'undefined') {
        db.ref(`${DB_REF}/products`).set(list);
    }
}

/**
 * Obtiene productos efectivos (actualmente solo desde Firebase)
 * @returns {Array} Lista de productos
 */
export function getEffectiveProducts() {
    return loadProductsFromFirebase();
}

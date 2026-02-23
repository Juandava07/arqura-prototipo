// ===================================
// Orders Store
// ===================================

// Note: This module requires Firebase db and DB_REF to be available globally
// In a full refactor, these would be imported from firebase config

let cachedOrders = [];

/**
 * Guarda pedidos en Firebase
 * @param {Array} list - Lista de pedidos
 */
export function saveOrders(list) {
    cachedOrders = list;
    if (typeof db !== 'undefined' && typeof DB_REF !== 'undefined') {
        db.ref(`${DB_REF}/orders`).set(list);
    }
}

/**
 * Carga pedidos desde Firebase
 * @returns {Array} Lista de pedidos
 */
export function loadOrders() {
    return cachedOrders || [];
}

/**
 * Inicializa pedidos (seed)
 * @returns {Array} Lista de pedidos
 */
export function seedOrders() {
    return loadOrders();
}

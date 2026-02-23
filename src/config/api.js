// ===================================
// API Configuration (PostgreSQL Bridge)
// ===================================

// Cambia esto por la URL que te de Render cuando subas el backend
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://TU-APP-EN-RENDER.onrender.com/api'; // <-- Reemplazar por tu URL real

export const ApiService = {
    async getProducts() {
        const res = await fetch(`${API_BASE_URL}/products`);
        return await res.json();
    },

    async saveProduct(product) {
        const res = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        return await res.json();
    },

    async getOrders() {
        const res = await fetch(`${API_BASE_URL}/orders`);
        return await res.json();
    },

    async createOrder(order) {
        const res = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(order)
        });
        return await res.json();
    },

    async getSettings() {
        const res = await fetch(`${API_BASE_URL}/settings`);
        return await res.json();
    },

    async saveSettings(settings) {
        const res = await fetch(`${API_BASE_URL}/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: settings })
        });
        return await res.json();
    }
};

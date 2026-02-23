// ===================================
// API Configuration (Supabase Bridge)
// ===================================

// Reemplaza estos valores con los de tu proyecto en Supabase (Settings -> API)
const SUPABASE_URL = 'https://alcdmouavdmettxpkbhq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsY2Rtb3VhdmRtZXR0eHBrYmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MDMxMDEsImV4cCI6MjA4NzM3OTEwMX0.2apGV3R5eSHdzqyXdMNZl-KKSb5c6oxnwfTIMfkzeRs';

const API_BASE_URL = `${SUPABASE_URL}/rest/v1`;

const getHeaders = () => ({
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
});

export const ApiService = {
    async getProducts() {
        const res = await fetch(`${API_BASE_URL}/products?select=*&order=name.asc`, {
            headers: getHeaders()
        });
        return await res.json();
    },

    async saveProduct(product) {
        // Usamos UPSERT (insert o update si ya existe)
        const res = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                ...getHeaders(),
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify(product)
        });
        return await res.json();
    },

    async getOrders() {
        const res = await fetch(`${API_BASE_URL}/orders?select=*&order=date_created.desc`, {
            headers: getHeaders()
        });
        return await res.json();
    },

    async createOrder(order) {
        const res = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(order)
        });
        return await res.json();
    },

    async getSettings() {
        const res = await fetch(`${API_BASE_URL}/settings?key=eq.general&select=value`, {
            headers: getHeaders()
        });
        const data = await res.json();
        return data[0]?.value || {};
    },

    async saveSettings(settings) {
        const res = await fetch(`${API_BASE_URL}/settings`, {
            method: 'POST',
            headers: {
                ...getHeaders(),
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ key: 'general', value: settings })
        });
        return await res.json();
    }
};

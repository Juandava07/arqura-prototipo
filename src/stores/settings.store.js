// ===================================
// Settings Store
// ===================================

// Note: This module requires Firebase db and DB_REF to be available globally
// In a full refactor, these would be imported from firebase config

let cachedSettings = null;

const SettingsStore = {
    default() {
        return {
            low_stock_ml: 20,
            critical_stock_ml: 8,
            prediction_days: 14,
            daily_ml_usage_default: 2,
            whatsapp: "573123112366",
            email: "primoslopezylopez@gmail.com",
            maps_src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3342.035444978864!2d-75.53702651179289!3d5.043234488750755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e477b94500560b3%3A0x3d3273d72aaf5566!2sTransform%C3%A1rmoles%20y%20Granitos!5e0!3m2!1ses!2sco!4v1768441900249!5m2!1ses!2sco",
            carousel: [
                { img: 'assets/hero/hero-main.jpeg', title: 'El Arte de lo Extraordinario', subtitle: 'Arqura' },
                { img: 'assets/hero/hero-materials.jpg', title: 'Texturas Únicas', subtitle: 'Selección Premium' },
                { img: 'assets/hero/hero-kitchen.png', title: 'Espacios que Inspiran', subtitle: 'Tecnología Italiana' }
            ]
        };
    },

    load() {
        return cachedSettings || this.default();
    },

    save(v) {
        cachedSettings = v;
        if (typeof db !== 'undefined' && typeof DB_REF !== 'undefined') {
            db.ref(`${DB_REF}/settings`).set(v);
        }
    }
};

/**
 * Calcula alertas de stock bajo
 * @param {Array} products - Lista de productos
 * @returns {Array} Productos con stock bajo
 */
export function getStockAlerts(products) {
    const cfg = SettingsStore.load();
    return products.map(p => {
        const stock = Number(p.stock_ml || 0);
        let level = 'ok';
        if (stock <= cfg.critical_stock_ml) level = 'critical';
        else if (stock <= cfg.low_stock_ml) level = 'low';
        return { id: p.id, name: p.name, stock_ml: stock, level };
    }).filter(x => x.level !== 'ok');
}

export function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

export default SettingsStore;

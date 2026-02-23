// ===================================
// About Store
// ===================================

// Note: This module requires Firebase db and DB_REF to be available globally
// In a full refactor, these would be imported from firebase config

let cachedAbout = null;

const AboutStore = {
    default() {
        return {
            title: 'Arqura · Superficies Premium con Tecnología',
            subtitle: 'Elegimos, Cotizamos y Entregamos Materiales de Alto Nivel con una Experiencia Digital Clara y Confiable.',
            who: 'Unimos <strong>Diseño Arquitectónico</strong> y <strong>Tecnología</strong> para que Elegir Mármol, Granito, Cuarzo o Sinterizados sea Fácil y Transparente.',
            value_points: [
                'Transparencia: Precios por m² visibles y actualizados.',
                'Rapidez: Cotizador con IA y tiempos de Entrega Estimados.',
                'Disponibilidad Real: Stock Sincronizado.',
                'Acompañamiento: Seguimiento con Línea de Tiempo.'
            ],
            trust_points: [
                'Datos Claros · Precios, Stock y Lead.',
                'Privacidad · El Prototipo no usa datos sensibles.',
                'Soporte · Evidencias por Etapa.',
                'Catálogo · Superficies Curadas.'
            ],
            satisfaction_pct: 92
        };
    },

    load() {
        return cachedAbout || this.default();
    },

    save(data) {
        cachedAbout = data;
        if (typeof db !== 'undefined' && typeof DB_REF !== 'undefined') {
            db.ref(`${DB_REF}/about`).set(data);
        }
    },

    reset() {
        this.save(this.default());
    }
};

export default AboutStore;

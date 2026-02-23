// ===================================
// AI Recommendations Service
// ===================================

/**
 * Pick the best product recommendation using AI algorithm
 * @param {Array} products - Available products
 * @param {Array} cart - Current cart items
 * @param {Array} orders - Historical orders
 * @param {string} priority - Priority mode (balanced, cheapest, fastest, stock, match)
 * @returns {Object|null} Recommended product or null
 */
export function pickBestProductAI(products, cart = [], orders = [], priority = 'balanced') {
    // Filter out disabled products and products already in cart
    const all = products.filter(p => !p.disabled);
    if (!all.length) return null;

    const pool = all.filter(p => !cart.some(it => it.id === p.id));
    if (!pool.length) return null;

    // Calculate popularity based on historical orders
    const productPopularity = {};
    orders.forEach(order => {
        (order.items || []).forEach(item => {
            productPopularity[item.name] = (productPopularity[item.name] || 0) + 1;
        });
    });
    const maxPopularity = Math.max(...Object.values(productPopularity), 1);

    // Normalization stats (Min-Max scaling)
    const stats = {
        minPrice: Math.min(...pool.map(p => Number(p.price_per_ml))),
        maxPrice: Math.max(...pool.map(p => Number(p.price_per_ml))),
        minStock: Math.min(...pool.map(p => Number(p.stock_ml))),
        maxStock: Math.max(...pool.map(p => Number(p.stock_ml))),
        minLead: Math.min(...pool.map(p => Number(p.lead_time_days))),
        maxLead: Math.max(...pool.map(p => Number(p.lead_time_days))),
    };

    // Evaluate each product
    const ranked = pool.map(p => {
        // Price score: lower is better
        const priceRange = stats.maxPrice - stats.minPrice;
        const sPrice = priceRange === 0 ? 1 : 1 - ((Number(p.price_per_ml) - stats.minPrice) / priceRange);

        // Stock score: higher is better + penalty for low stock
        const stockRange = stats.maxStock - stats.minStock;
        let sStock = stockRange === 0 ? 1 : (Number(p.stock_ml) - stats.minStock) / stockRange;
        if (Number(p.stock_ml) < 10) {
            sStock *= 0.3; // Severe penalty for low stock
        }

        // Lead time score: lower is better
        const leadRange = stats.maxLead - stats.minLead;
        const sLead = leadRange === 0 ? 1 : 1 - ((Number(p.lead_time_days) - stats.minLead) / leadRange);

        // Popularity score
        const popularity = productPopularity[p.name] || 0;
        const sPopularity = popularity / maxPopularity;

        // Affinity score: similarity with cart (CORRECTED)
        let sAffinity = 0;
        if (cart.length > 0) {
            let totalMatches = 0;
            cart.forEach(it => {
                let itemMatch = 0;
                if (it.material === p.material) itemMatch += 0.5;
                if (it.color === p.color) itemMatch += 0.3;
                if (it.finish === p.finish) itemMatch += 0.2;
                totalMatches += itemMatch;
            });
            sAffinity = Math.min(1, totalMatches / cart.length);
        } else {
            sAffinity = 0.5; // Neutral if cart is empty
        }

        // Calculate final score based on priority
        const weights = {
            balanced: { price: 0.20, stock: 0.20, lead: 0.20, affinity: 0.20, popularity: 0.20 },
            cheapest: { price: 0.60, stock: 0.10, lead: 0.10, affinity: 0.10, popularity: 0.10 },
            fastest: { price: 0.10, stock: 0.10, lead: 0.60, affinity: 0.10, popularity: 0.10 },
            stock: { price: 0.10, stock: 0.60, lead: 0.10, affinity: 0.10, popularity: 0.10 },
            match: { price: 0.10, stock: 0.10, lead: 0.10, affinity: 0.50, popularity: 0.20 }
        }[priority] || { price: 0.20, stock: 0.20, lead: 0.20, affinity: 0.20, popularity: 0.20 };

        const totalScore = (sPrice * weights.price) +
            (sStock * weights.stock) +
            (sLead * weights.lead) +
            (sAffinity * weights.affinity) +
            (sPopularity * weights.popularity);

        return {
            ...p,
            _score: totalScore,
            _affinity: sAffinity,
            _popularity: sPopularity,
            _priority: priority
        };
    });

    // Sort by score (descending)
    ranked.sort((a, b) => b._score - a._score);

    // Exploration factor: 20% chance to suggest diverse material
    if (cart.length > 0 && Math.random() < 0.20) {
        const cartMaterials = [...new Set(cart.map(it => it.material))];
        const diverse = ranked.filter(p => !cartMaterials.includes(p.material));
        if (diverse.length > 0) {
            const topDiverse = diverse.slice(0, 3);
            return topDiverse[Math.floor(Math.random() * topDiverse.length)];
        }
    }

    // Return best match (with small randomness if scores are very close)
    if (ranked.length > 1 && ranked[0]._score - ranked[1]._score < 0.05) {
        return Math.random() > 0.5 ? ranked[0] : ranked[1];
    }

    return ranked[0];
}

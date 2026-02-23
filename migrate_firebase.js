const { Pool } = require('pg');
const axios = require('axios');

// --- CONFIGURATION ---
// Ideally these come from environment variables
const FIREBASE_DB_URL = 'https://arquraapp-default-rtdb.firebaseio.com/arqura_v3.json';
const POSTGRES_URL = process.env.DATABASE_URL || 'postgres://user_arqura:password_arqura@localhost:5432/arqura_db';

const pool = new Pool({
    connectionString: POSTGRES_URL,
    ssl: POSTGRES_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('📡 Fetching data from Firebase...');
        const response = await axios.get(FIREBASE_DB_URL);
        const data = response.data;

        if (!data) {
            console.error('❌ No data found in Firebase or URL is incorrect.');
            return;
        }

        console.log('✅ Firebase data fetched. Starting PostgreSQL insertion...');

        // 1. Migrate Products
        if (data.products) {
            console.log(`📦 Migrating ${Object.keys(data.products).length} products...`);
            const products = Array.isArray(data.products) ? data.products : Object.values(data.products);
            for (const p of products) {
                if (!p) continue;
                await pool.query(
                    'INSERT INTO products (id, name, material, color, finish, stock_ml, price_per_ml, image, base_depth_cm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET name=$2, material=$3, color=$4, finish=$5, stock_ml=$6, price_per_ml=$7, image=$8, base_depth_cm=$9',
                    [p.id, p.name, p.material, p.color, p.finish, p.stock_ml, p.price_per_ml, p.image, p.base_depth_cm]
                );
            }
        }

        // 2. Migrate Orders
        if (data.orders) {
            console.log(`🧾 Migrating ${Object.keys(data.orders).length} orders...`);
            const orders = Array.isArray(data.orders) ? data.orders : Object.values(data.orders);
            for (const o of orders) {
                if (!o) continue;
                await pool.query(
                    'INSERT INTO orders (id, customer_name, customer_email, total, items) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
                    [o.id || `old_${Math.random()}`, o.customer_name || 'N/A', o.customer_email || 'N/A', o.total || 0, JSON.stringify(o.items || [])]
                );
            }
        }

        // 3. Migrate Settings
        if (data.settings) {
            console.log('⚙️ Migrating settings...');
            await pool.query(
                "INSERT INTO settings (key, value) VALUES ('general', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
                [JSON.stringify(data.settings)]
            );
        }

        console.log('🚀 Migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await pool.end();
    }
}

migrate();

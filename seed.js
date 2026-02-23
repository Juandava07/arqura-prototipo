const { Pool } = require('pg');

const pool = new Pool({
    user: 'user_arqura',
    host: 'localhost',
    database: 'arqura_db',
    password: 'password_arqura',
    port: 5432,
});

const initialProducts = [
    { id: 'm-carrara-1', name: 'Mármol Carrara', material: 'Mármol', color: 'Blanco', finish: 'Pulido', stock_ml: 50, price_per_ml: 450000, image: 'assets/products/marmol/blanco.jpg', base_depth_cm: 60 },
    { id: 'g-san-gabriel-1', name: 'Granito San Gabriel', material: 'Granito', color: 'Negro', finish: 'Leather', stock_ml: 30, price_per_ml: 320000, image: 'assets/products/granito/negro.jpg', base_depth_cm: 60 },
    { id: 'q-calacatta-1', name: 'Cuarzo Calacatta', material: 'Cuarzo', color: 'Blanco', finish: 'Brillante', stock_ml: 25, price_per_ml: 580000, image: 'assets/products/cuarzo/calacatta.jpg', base_depth_cm: 60 },
    { id: 's-dekton-1', name: 'Sinterizado Dekton', material: 'Sinterizado', color: 'Gris', finish: 'Mate', stock_ml: 15, price_per_ml: 850000, image: 'assets/products/sinterizado/gris.jpg', base_depth_cm: 60 }
];

async function seed() {
    try {
        console.log('🌱 Iniciando sembrado de productos...');
        for (const p of initialProducts) {
            await pool.query(
                'INSERT INTO products (id, name, material, color, finish, stock_ml, price_per_ml, image, base_depth_cm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO NOTHING',
                [p.id, p.name, p.material, p.color, p.finish, p.stock_ml, p.price_per_ml, p.image, p.base_depth_cm]
            );
        }
        console.log('✅ Productos sembrados correctamente.');
    } catch (err) {
        console.error('❌ Error al sembrar:', err);
    } finally {
        await pool.end();
    }
}

seed();

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

// PostgreSQL Connection
const isLocal = !process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user_arqura:password_arqura@localhost:5432/arqura_db',
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

app.use(cors());
app.use(bodyParser.json());

// n8n Webhook URL (Change this to your actual n8n webhook)
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/order-received';

// API Endpoints

// --- Products ---
app.get('/api/products', async (req, res) => {
  console.log('📥 GET /api/products requested');
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY name ASC');
    console.log(`✅ Returned ${result.rows.length} products`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Database error in GET /products:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/products', async (req, res) => {
  const { id, name, material, color, finish, stock_ml, price_per_ml, image, base_depth_cm } = req.body;
  try {
    await pool.query(
      'INSERT INTO products (id, name, material, color, finish, stock_ml, price_per_ml, image, base_depth_cm) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (id) DO UPDATE SET name=$2, material=$3, color=$4, finish=$5, stock_ml=$6, price_per_ml=$7, image=$8, base_depth_cm=$9',
      [id, name, material, color, finish, stock_ml, price_per_ml, image, base_depth_cm]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Orders ---
app.get('/api/orders', async (req, res) => {
  console.log('📥 GET /api/orders requested');
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY date_created DESC');
    console.log(`✅ Returned ${result.rows.length} orders`);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Database error in GET /orders:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { id, customer_name, customer_email, total, items } = req.body;
  try {
    // 1. Save to PostgreSQL
    await pool.query(
      'INSERT INTO orders (id, customer_name, customer_email, total, items) VALUES ($1, $2, $3, $4, $5)',
      [id, customer_name, customer_email, total, JSON.stringify(items)]
    );

    // 2. Trigger n8n for automation (Data Transmission)
    try {
      await axios.post(N8N_WEBHOOK_URL, {
        orderId: id,
        customer: customer_name,
        email: customer_email,
        total,
        items,
        timestamp: new Date().toISOString()
      });
      console.log('n8n webhook triggered');
    } catch (n8nErr) {
      console.error('Failed to trigger n8n:', n8nErr.message);
      // Don't fail the request if n8n is down, just log it
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Settings ---
app.get('/api/settings', async (req, res) => {
  console.log('📥 GET /api/settings requested');
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key = 'general'");
    console.log('✅ Returned settings');
    res.json(result.rows[0]?.value || {});
  } catch (err) {
    console.error('❌ Database error in GET /settings:', err.message);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/settings', async (req, res) => {
  const { value } = req.body;
  try {
    await pool.query(
      "INSERT INTO settings (key, value) VALUES ('general', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [JSON.stringify(value)]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(port, () => {
  console.log(`Arqura Backend listening at http://localhost:${port}`);
});

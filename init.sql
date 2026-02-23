-- Arqura PostgreSQL Schema

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    material TEXT,
    color TEXT,
    finish TEXT,
    stock_ml DECIMAL(10,2) DEFAULT 0,
    price_per_ml DECIMAL(15,2) DEFAULT 0,
    image TEXT,
    base_depth_cm INTEGER DEFAULT 60,
    disabled BOOLEAN DEFAULT FALSE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(15,2),
    items JSONB,
    status TEXT DEFAULT 'pending'
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- Content Table
CREATE TABLE IF NOT EXISTS content_about (
    id SERIAL PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    who TEXT,
    value_points JSONB,
    trust_points JSONB,
    satisfaction_pct INTEGER
);

-- Insert Demo Settings
INSERT INTO settings (key, value) VALUES ('general', '{
    "low_stock_ml": 20,
    "critical_stock_ml": 8,
    "prediction_days": 14,
    "daily_ml_usage_default": 2,
    "whatsapp": "573123112366",
    "email": "primoslopezylopez@gmail.com",
    "maps_src": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3342.035444978864!2d-75.53702651179289!3d5.043234488750755!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e477b94500560b3%3A0x3d3273d72aaf5566!2sTransform%C3%A1rmoles%20y%20Granitos!5e0!3m2!1ses!2sco!4v1768441900249!5m2!1ses!2sco"
}');

-- Disable RLS for easy testing (Supabase enables this by default)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE content_about DISABLE ROW LEVEL SECURITY;

-- Ensure anonymous access is granted
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE orders TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE content_about TO anon;

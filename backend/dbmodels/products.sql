-- Product Schema (products.sql)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Raw Material', 'Finished Good', 'Semi-Finished')),
    unit VARCHAR(50) NOT NULL, -- Units like 'Pieces', 'Kg', 'Liters', etc.
    current_stock_quantity DECIMAL(10,2) DEFAULT 0,
    minimum_stock_level DECIMAL(10,2) DEFAULT 0,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_name ON products(name);
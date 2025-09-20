-- ============================================================================
-- PRODUCT MANAGEMENT SCHEMA
-- Manufacturing Management System
-- ============================================================================

-- Products table for raw materials and finished goods
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE, -- product code/SKU
    type VARCHAR(20) CHECK (type IN ('Raw','Finished')) NOT NULL,
    unit VARCHAR(50) NOT NULL, -- kg, pcs, liters, etc.
    stock_qty DECIMAL(12,2) DEFAULT 0,
    min_stock_level DECIMAL(12,2) DEFAULT 0, -- for reorder alerts
    unit_cost DECIMAL(10,2) DEFAULT 0.00,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Comments
COMMENT ON TABLE products IS 'Master table for all products including raw materials and finished goods';
COMMENT ON COLUMN products.type IS 'Product type: Raw (materials) or Finished (goods)';
COMMENT ON COLUMN products.code IS 'Unique product code or SKU for identification';
COMMENT ON COLUMN products.unit IS 'Unit of measurement (kg, pcs, liters, etc.)';
COMMENT ON COLUMN products.stock_qty IS 'Current stock quantity (automatically updated from stock ledger)';
COMMENT ON COLUMN products.min_stock_level IS 'Minimum stock level for reorder alerts';
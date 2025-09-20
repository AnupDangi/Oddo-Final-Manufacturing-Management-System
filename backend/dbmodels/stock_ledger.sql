-- Stock Ledger Schema (stock_ledger.sql)
CREATE TABLE stock_ledger (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('Stock In', 'Stock Out', 'Production', 'Consumption', 'Adjustment', 'Transfer')),
    quantity DECIMAL(10,2) NOT NULL, -- Positive for IN, Negative for OUT
    unit_cost DECIMAL(10,2) DEFAULT 0,
    total_value DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_cost) STORED,
    balance_quantity DECIMAL(10,2) NOT NULL, -- Running balance after this transaction
    balance_value DECIMAL(10,2) NOT NULL, -- Running value after this transaction
    reference_type VARCHAR(50), -- 'MO', 'WO', 'Manual', 'Purchase', etc.
    reference_id INTEGER, -- ID of MO, WO, or other reference
    reference_number VARCHAR(100), -- MO-2024-001, WO-2024-001, etc.
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Balance View (Current stock for each product)
CREATE OR REPLACE VIEW current_stock AS
SELECT 
    p.id as product_id,
    p.name as product_name,
    p.type as product_type,
    p.unit,
    p.minimum_stock_level,
    COALESCE(sl.balance_quantity, 0) as current_quantity,
    COALESCE(sl.balance_value, 0) as current_value,
    CASE 
        WHEN COALESCE(sl.balance_quantity, 0) <= p.minimum_stock_level 
        THEN 'Low Stock' 
        ELSE 'In Stock' 
    END as stock_status
FROM products p
LEFT JOIN LATERAL (
    SELECT balance_quantity, balance_value
    FROM stock_ledger 
    WHERE product_id = p.id 
    ORDER BY created_at DESC 
    LIMIT 1
) sl ON true
WHERE p.is_active = true;

-- Indexes
CREATE INDEX idx_stock_ledger_product ON stock_ledger(product_id);
CREATE INDEX idx_stock_ledger_date ON stock_ledger(transaction_date);
CREATE INDEX idx_stock_ledger_reference ON stock_ledger(reference_type, reference_id);
CREATE INDEX idx_stock_ledger_movement ON stock_ledger(movement_type);
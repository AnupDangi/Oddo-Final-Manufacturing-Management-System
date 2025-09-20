-- ============================================================================
-- STOCK MANAGEMENT SCHEMA
-- Manufacturing Management System
-- ============================================================================

-- Stock ledger for tracking all inventory movements
CREATE TABLE IF NOT EXISTS stock_ledger (
    entry_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('IN','OUT','TRANSFER','ADJUSTMENT')) NOT NULL,
    quantity DECIMAL(12,2) NOT NULL, -- positive for IN, negative for OUT
    unit_cost DECIMAL(10,2),
    total_value DECIMAL(12,2) GENERATED ALWAYS AS (quantity * COALESCE(unit_cost, 0)) STORED,
    balance_qty DECIMAL(12,2), -- running balance after this transaction
    source_location VARCHAR(100),
    destination_location VARCHAR(100),
    reference_type VARCHAR(20) CHECK (reference_type IN ('MO','WO','PURCHASE','SALE','ADJUSTMENT')),
    reference_id INT, -- MO ID, WO ID, etc.
    reference_number VARCHAR(50), -- MO-001, WO-001, etc.
    batch_number VARCHAR(50),
    notes TEXT,
    created_by INT REFERENCES users(user_id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stock_product ON stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_timestamp ON stock_ledger(timestamp);
CREATE INDEX IF NOT EXISTS idx_stock_reference ON stock_ledger(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_transaction_type ON stock_ledger(transaction_type);
CREATE INDEX IF NOT EXISTS idx_stock_batch ON stock_ledger(batch_number);

-- Comments
COMMENT ON TABLE stock_ledger IS 'Complete audit trail of all inventory movements and transactions';
COMMENT ON COLUMN stock_ledger.transaction_type IS 'Type of transaction: IN (receipt), OUT (issue), TRANSFER, ADJUSTMENT';
COMMENT ON COLUMN stock_ledger.quantity IS 'Quantity moved - positive for IN transactions, negative for OUT transactions';
COMMENT ON COLUMN stock_ledger.total_value IS 'Automatically calculated as quantity * unit_cost';
COMMENT ON COLUMN stock_ledger.balance_qty IS 'Running stock balance after this transaction';
COMMENT ON COLUMN stock_ledger.reference_type IS 'Source of transaction: MO, WO, PURCHASE, SALE, ADJUSTMENT';
COMMENT ON COLUMN stock_ledger.reference_id IS 'ID of the source record (MO ID, WO ID, etc.)';
COMMENT ON COLUMN stock_ledger.reference_number IS 'Human-readable reference number (MO-001, WO-001, etc.)';
COMMENT ON COLUMN stock_ledger.batch_number IS 'Batch or lot number for traceability';
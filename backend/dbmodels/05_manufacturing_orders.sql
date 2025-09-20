-- ============================================================================
-- MANUFACTURING ORDERS SCHEMA
-- Manufacturing Management System
-- ============================================================================

-- Main manufacturing orders table
CREATE TABLE IF NOT EXISTS manufacturing_orders (
    mo_id SERIAL PRIMARY KEY,
    mo_number VARCHAR(50) UNIQUE NOT NULL, -- MO-2024-001
    product_id INT REFERENCES products(product_id) NOT NULL,
    bom_id INT REFERENCES bom(bom_id),
    quantity DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('Draft','Planned','Released','In Progress','Done','Cancelled')) DEFAULT 'Draft',
    priority VARCHAR(20) CHECK (priority IN ('Low','Medium','High','Urgent')) DEFAULT 'Medium',
    progress_percent DECIMAL(5,2) DEFAULT 0,
    planned_start_date DATE,
    planned_end_date DATE,
    actual_start_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    assignee_id INT REFERENCES users(user_id),
    created_by INT REFERENCES users(user_id) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MO components - materials allocated to this specific manufacturing order
CREATE TABLE IF NOT EXISTS mo_components (
    mo_component_id SERIAL PRIMARY KEY,
    mo_id INT REFERENCES manufacturing_orders(mo_id) ON DELETE CASCADE,
    product_id INT REFERENCES products(product_id), -- component/raw material
    quantity_required DECIMAL(12,2) NOT NULL,
    quantity_consumed DECIMAL(12,2) DEFAULT 0,
    quantity_available DECIMAL(12,2) DEFAULT 0, -- calculated from current stock
    unit_cost DECIMAL(10,2) -- cost at the time of MO creation
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_mo_status ON manufacturing_orders(status);
CREATE INDEX IF NOT EXISTS idx_mo_priority ON manufacturing_orders(priority);
CREATE INDEX IF NOT EXISTS idx_mo_dates ON manufacturing_orders(planned_start_date, planned_end_date);
CREATE INDEX IF NOT EXISTS idx_mo_assignee ON manufacturing_orders(assignee_id);
CREATE INDEX IF NOT EXISTS idx_mo_created_by ON manufacturing_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_mo_product ON manufacturing_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_mo_bom ON manufacturing_orders(bom_id);
CREATE INDEX IF NOT EXISTS idx_mo_components_mo ON mo_components(mo_id);
CREATE INDEX IF NOT EXISTS idx_mo_components_product ON mo_components(product_id);

-- Comments
COMMENT ON TABLE manufacturing_orders IS 'Manufacturing orders for producing finished goods';
COMMENT ON TABLE mo_components IS 'Components and materials allocated to specific manufacturing orders';
COMMENT ON COLUMN manufacturing_orders.mo_number IS 'Unique manufacturing order number (e.g., MO-2024-001)';
COMMENT ON COLUMN manufacturing_orders.status IS 'Order status: Draft, Planned, Released, In Progress, Done, Cancelled';
COMMENT ON COLUMN manufacturing_orders.priority IS 'Order priority: Low, Medium, High, Urgent';
COMMENT ON COLUMN manufacturing_orders.progress_percent IS 'Percentage completion based on work order status';
COMMENT ON COLUMN mo_components.quantity_required IS 'Total quantity of component required for this MO';
COMMENT ON COLUMN mo_components.quantity_consumed IS 'Quantity already consumed/issued from stock';
COMMENT ON COLUMN mo_components.quantity_available IS 'Available quantity in stock when MO was created';
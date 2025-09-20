-- Manufacturing Order Schema (manufacturing_orders.sql)
CREATE TABLE manufacturing_orders (
    id SERIAL PRIMARY KEY,
    mo_number VARCHAR(100) UNIQUE NOT NULL, -- Auto-generated MO number like MO-2024-001
    product_id INTEGER REFERENCES products(id) ON DELETE RESTRICT, -- Finished good to produce
    bom_id INTEGER REFERENCES boms(id) ON DELETE RESTRICT,
    quantity_to_produce DECIMAL(10,2) NOT NULL,
    quantity_produced DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Planned' CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Cancelled')),
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    scheduled_start_date TIMESTAMP,
    actual_start_date TIMESTAMP,
    scheduled_end_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    assignee_id INTEGER REFERENCES users(id), -- Manufacturing Manager
    created_by INTEGER REFERENCES users(id),
    total_cost DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Manufacturing Order Components (Scaled from BOM)
CREATE TABLE mo_components (
    id SERIAL PRIMARY KEY,
    mo_id INTEGER REFERENCES manufacturing_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, -- Raw material
    quantity_required DECIMAL(10,2) NOT NULL,
    quantity_consumed DECIMAL(10,2) DEFAULT 0,
    is_consumed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_mo_status ON manufacturing_orders(status);
CREATE INDEX idx_mo_assignee ON manufacturing_orders(assignee_id);
CREATE INDEX idx_mo_scheduled_start ON manufacturing_orders(scheduled_start_date);
CREATE INDEX idx_mo_components_mo ON mo_components(mo_id);
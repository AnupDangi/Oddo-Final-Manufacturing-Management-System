-- ============================================================================
-- BILL OF MATERIALS (BOM) SCHEMA
-- Manufacturing Management System
-- ============================================================================

-- Main BOM table linking finished products to their recipes
CREATE TABLE IF NOT EXISTS bom (
    bom_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id) ON DELETE CASCADE, -- finished product
    version VARCHAR(10) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    created_by INT REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOM components - raw materials needed to make the finished product
CREATE TABLE IF NOT EXISTS bom_components (
    bom_component_id SERIAL PRIMARY KEY,
    bom_id INT REFERENCES bom(bom_id) ON DELETE CASCADE,
    component_id INT REFERENCES products(product_id) ON DELETE CASCADE, -- raw material
    quantity_required DECIMAL(12,2) NOT NULL,
    wastage_percent DECIMAL(5,2) DEFAULT 0, -- material wastage
    sequence_order INT DEFAULT 1
);

-- BOM operations - routing steps to make the finished product
CREATE TABLE IF NOT EXISTS bom_operations (
    bom_operation_id SERIAL PRIMARY KEY,
    bom_id INT REFERENCES bom(bom_id) ON DELETE CASCADE,
    operation_name VARCHAR(100) NOT NULL,
    work_center_id INT REFERENCES work_centers(work_center_id),
    estimated_duration_minutes INT NOT NULL,
    sequence_order INT NOT NULL,
    description TEXT,
    setup_time_minutes INT DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bom_product ON bom(product_id);
CREATE INDEX IF NOT EXISTS idx_bom_active ON bom(is_active);
CREATE INDEX IF NOT EXISTS idx_bom_components_bom ON bom_components(bom_id);
CREATE INDEX IF NOT EXISTS idx_bom_components_component ON bom_components(component_id);
CREATE INDEX IF NOT EXISTS idx_bom_operations_bom ON bom_operations(bom_id);
CREATE INDEX IF NOT EXISTS idx_bom_operations_work_center ON bom_operations(work_center_id);
CREATE INDEX IF NOT EXISTS idx_bom_operations_sequence ON bom_operations(sequence_order);

-- Comments
COMMENT ON TABLE bom IS 'Bill of Materials - recipes for finished products';
COMMENT ON TABLE bom_components IS 'Raw materials and components required for each BOM';
COMMENT ON TABLE bom_operations IS 'Operations and routing steps for each BOM';
COMMENT ON COLUMN bom.version IS 'BOM version for change tracking';
COMMENT ON COLUMN bom_components.quantity_required IS 'Quantity of component needed per unit of finished product';
COMMENT ON COLUMN bom_components.wastage_percent IS 'Expected material wastage percentage';
COMMENT ON COLUMN bom_operations.estimated_duration_minutes IS 'Estimated time to complete this operation';
COMMENT ON COLUMN bom_operations.setup_time_minutes IS 'Setup time required before starting the operation';
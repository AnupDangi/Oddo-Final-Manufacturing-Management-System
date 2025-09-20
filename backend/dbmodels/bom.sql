-- BOM (Bill of Materials) Schema (boms.sql)
CREATE TABLE boms (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, -- Finished good
    version VARCHAR(50) DEFAULT '1.0',
    is_active BOOLEAN DEFAULT true,
    total_cost DECIMAL(10,2) DEFAULT 0, -- Calculated from components and operations
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOM Components (Raw materials needed)
CREATE TABLE bom_components (
    id SERIAL PRIMARY KEY,
    bom_id INTEGER REFERENCES boms(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, -- Raw material
    quantity_required DECIMAL(10,2) NOT NULL,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity_required * cost_per_unit) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOM Operations (Steps to manufacture)
CREATE TABLE bom_operations (
    id SERIAL PRIMARY KEY,
    bom_id INTEGER REFERENCES boms(id) ON DELETE CASCADE,
    operation_name VARCHAR(255) NOT NULL,
    sequence_number INTEGER NOT NULL, -- Order of operations
    duration_mins INTEGER NOT NULL,
    work_center_id INTEGER REFERENCES work_centers(id),
    description TEXT,
    operation_cost DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_boms_product ON boms(product_id);
CREATE INDEX idx_bom_components_bom ON bom_components(bom_id);
CREATE INDEX idx_bom_operations_bom ON bom_operations(bom_id);
CREATE INDEX idx_bom_operations_sequence ON bom_operations(bom_id, sequence_number);
-- ============================================================================
-- WORK ORDERS SCHEMA
-- Manufacturing Management System
-- ============================================================================

-- Main work orders table for individual operations
CREATE TABLE IF NOT EXISTS work_orders (
    wo_id SERIAL PRIMARY KEY,
    wo_number VARCHAR(50) UNIQUE NOT NULL, -- WO-2024-001
    mo_id INT REFERENCES manufacturing_orders(mo_id) ON DELETE CASCADE,
    bom_operation_id INT REFERENCES bom_operations(bom_operation_id),
    operation_name VARCHAR(100) NOT NULL,
    work_center_id INT REFERENCES work_centers(work_center_id),
    operator_id INT REFERENCES users(user_id),
    sequence_order INT DEFAULT 1,
    estimated_duration_minutes INT,
    actual_duration_minutes INT DEFAULT 0,
    setup_time_minutes INT DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('Planned','Ready','In Progress','Paused','Completed','Cancelled')) DEFAULT 'Planned',
    planned_start_time TIMESTAMP,
    planned_end_time TIMESTAMP,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    quantity_to_produce DECIMAL(12,2),
    quantity_produced DECIMAL(12,2) DEFAULT 0,
    quality_passed DECIMAL(12,2) DEFAULT 0,
    quality_rejected DECIMAL(12,2) DEFAULT 0,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work order costs for tracking labor, machine, material, and overhead costs
CREATE TABLE IF NOT EXISTS work_order_costs (
    cost_id SERIAL PRIMARY KEY,
    wo_id INT REFERENCES work_orders(wo_id) ON DELETE CASCADE,
    cost_type VARCHAR(50) CHECK (cost_type IN ('Labor','Machine','Material','Overhead')) NOT NULL,
    description VARCHAR(200),
    quantity DECIMAL(12,2) DEFAULT 1,
    rate DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(12,2) GENERATED ALWAYS AS (quantity * rate) STORED,
    recorded_by INT REFERENCES users(user_id),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_wo_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_wo_mo_id ON work_orders(mo_id);
CREATE INDEX IF NOT EXISTS idx_wo_operator ON work_orders(operator_id);
CREATE INDEX IF NOT EXISTS idx_wo_work_center ON work_orders(work_center_id);
CREATE INDEX IF NOT EXISTS idx_wo_sequence ON work_orders(sequence_order);
CREATE INDEX IF NOT EXISTS idx_wo_costs_wo ON work_order_costs(wo_id);
CREATE INDEX IF NOT EXISTS idx_wo_costs_type ON work_order_costs(cost_type);

-- Comments
COMMENT ON TABLE work_orders IS 'Individual work orders for specific operations within manufacturing orders';
COMMENT ON TABLE work_order_costs IS 'Cost tracking for work orders by type (Labor, Machine, Material, Overhead)';
COMMENT ON COLUMN work_orders.wo_number IS 'Unique work order number (e.g., WO-2024-001)';
COMMENT ON COLUMN work_orders.status IS 'Work order status: Planned, Ready, In Progress, Paused, Completed, Cancelled';
COMMENT ON COLUMN work_orders.sequence_order IS 'Order in which this operation should be performed';
COMMENT ON COLUMN work_orders.estimated_duration_minutes IS 'Estimated time to complete this work order';
COMMENT ON COLUMN work_orders.actual_duration_minutes IS 'Actual time taken to complete this work order';
COMMENT ON COLUMN work_orders.setup_time_minutes IS 'Time required for setup before starting production';
COMMENT ON COLUMN work_orders.quality_passed IS 'Quantity that passed quality inspection';
COMMENT ON COLUMN work_orders.quality_rejected IS 'Quantity that failed quality inspection';
COMMENT ON COLUMN work_order_costs.total_cost IS 'Automatically calculated as quantity * rate';
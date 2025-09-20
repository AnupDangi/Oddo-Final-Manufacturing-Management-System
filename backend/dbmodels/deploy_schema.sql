-- ============================================================================
-- MANUFACTURING MANAGEMENT SYSTEM - DATABASE DEPLOYMENT SCRIPT
-- This script creates the complete database schema in the correct order
-- ============================================================================

-- Enable extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: USERS & AUTHENTICATION
-- ============================================================================

-- Users table for authentication and role management
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(50) CHECK (role IN ('Admin','Manager','Operator','Inventory')) NOT NULL,
    phone VARCHAR(20),
    department VARCHAR(50),
    profile_image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User activity logs for security and audit
CREATE TABLE IF NOT EXISTS user_activity_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    activity VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- STEP 2: PRODUCT MANAGEMENT
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

-- ============================================================================
-- STEP 3: WORK CENTERS & OPERATIONS
-- ============================================================================

-- Work centers table for machines, areas, or teams
CREATE TABLE IF NOT EXISTS work_centers (
    work_center_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    capacity INT, -- units per hour
    cost_per_hour DECIMAL(10,2) DEFAULT 0,
    location VARCHAR(100),
    description TEXT,
    status VARCHAR(20) CHECK (status IN ('Active','Inactive','Maintenance')) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work center activity logs for tracking downtime, maintenance, etc.
CREATE TABLE IF NOT EXISTS work_center_logs (
    log_id SERIAL PRIMARY KEY,
    work_center_id INT REFERENCES work_centers(work_center_id) ON DELETE CASCADE,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) CHECK (event_type IN ('Downtime','Maintenance','Overtime','Production')) NOT NULL,
    reason TEXT,
    duration_minutes INT,
    cost DECIMAL(10,2),
    recorded_by INT REFERENCES users(user_id)
);

-- ============================================================================
-- STEP 4: BILL OF MATERIALS (BOM)
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

-- ============================================================================
-- STEP 5: MANUFACTURING ORDERS
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

-- ============================================================================
-- STEP 6: WORK ORDERS
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

-- ============================================================================
-- STEP 7: STOCK MANAGEMENT
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

-- ============================================================================
-- STEP 8: REPORTING & ANALYTICS
-- ============================================================================

-- Reports table for storing generated reports and their metadata
CREATE TABLE IF NOT EXISTS reports (
    report_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    report_name VARCHAR(100) NOT NULL,
    report_type VARCHAR(50) CHECK (report_type IN ('KPI','Stock','Production','Cost','User_Activity')) NOT NULL,
    file_path TEXT,
    file_format VARCHAR(10) CHECK (file_format IN ('PDF','Excel','CSV')),
    parameters JSONB, -- store report filters/parameters
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KPI snapshots for historical analytics and dashboard data
CREATE TABLE IF NOT EXISTS kpi_snapshots (
    kpi_id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    orders_planned INT DEFAULT 0,
    orders_in_progress INT DEFAULT 0,
    orders_completed INT DEFAULT 0,
    orders_delayed INT DEFAULT 0,
    avg_production_time_hours DECIMAL(8,2),
    total_production_cost DECIMAL(12,2),
    efficiency_percent DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date)
);

-- ============================================================================
-- STEP 9: AUDIT & TRACEABILITY
-- ============================================================================

-- Audit log for tracking all changes to critical data
CREATE TABLE IF NOT EXISTS audit_log (
    log_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    entity_type VARCHAR(50) NOT NULL, -- 'MO', 'WO', 'Stock', 'BOM', etc.
    entity_id INT NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE'
    field_name VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    ip_address INET,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- STEP 10: INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON user_activity_logs(timestamp);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Work center indexes
CREATE INDEX IF NOT EXISTS idx_work_centers_status ON work_centers(status);
CREATE INDEX IF NOT EXISTS idx_work_centers_code ON work_centers(code);
CREATE INDEX IF NOT EXISTS idx_work_center_logs_center ON work_center_logs(work_center_id);
CREATE INDEX IF NOT EXISTS idx_work_center_logs_date ON work_center_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_work_center_logs_event ON work_center_logs(event_type);

-- BOM indexes
CREATE INDEX IF NOT EXISTS idx_bom_product ON bom(product_id);
CREATE INDEX IF NOT EXISTS idx_bom_active ON bom(is_active);
CREATE INDEX IF NOT EXISTS idx_bom_components_bom ON bom_components(bom_id);
CREATE INDEX IF NOT EXISTS idx_bom_components_component ON bom_components(component_id);
CREATE INDEX IF NOT EXISTS idx_bom_operations_bom ON bom_operations(bom_id);
CREATE INDEX IF NOT EXISTS idx_bom_operations_work_center ON bom_operations(work_center_id);
CREATE INDEX IF NOT EXISTS idx_bom_operations_sequence ON bom_operations(sequence_order);

-- Manufacturing Order indexes
CREATE INDEX IF NOT EXISTS idx_mo_status ON manufacturing_orders(status);
CREATE INDEX IF NOT EXISTS idx_mo_priority ON manufacturing_orders(priority);
CREATE INDEX IF NOT EXISTS idx_mo_dates ON manufacturing_orders(planned_start_date, planned_end_date);
CREATE INDEX IF NOT EXISTS idx_mo_assignee ON manufacturing_orders(assignee_id);
CREATE INDEX IF NOT EXISTS idx_mo_created_by ON manufacturing_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_mo_product ON manufacturing_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_mo_bom ON manufacturing_orders(bom_id);
CREATE INDEX IF NOT EXISTS idx_mo_components_mo ON mo_components(mo_id);
CREATE INDEX IF NOT EXISTS idx_mo_components_product ON mo_components(product_id);

-- Work Order indexes
CREATE INDEX IF NOT EXISTS idx_wo_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_wo_mo_id ON work_orders(mo_id);
CREATE INDEX IF NOT EXISTS idx_wo_operator ON work_orders(operator_id);
CREATE INDEX IF NOT EXISTS idx_wo_work_center ON work_orders(work_center_id);
CREATE INDEX IF NOT EXISTS idx_wo_sequence ON work_orders(sequence_order);
CREATE INDEX IF NOT EXISTS idx_wo_costs_wo ON work_order_costs(wo_id);
CREATE INDEX IF NOT EXISTS idx_wo_costs_type ON work_order_costs(cost_type);

-- Stock Ledger indexes
CREATE INDEX IF NOT EXISTS idx_stock_product ON stock_ledger(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_timestamp ON stock_ledger(timestamp);
CREATE INDEX IF NOT EXISTS idx_stock_reference ON stock_ledger(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_stock_transaction_type ON stock_ledger(transaction_type);
CREATE INDEX IF NOT EXISTS idx_stock_batch ON stock_ledger(batch_number);

-- Reporting indexes
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_kpi_date ON kpi_snapshots(date);
CREATE INDEX IF NOT EXISTS idx_kpi_created ON kpi_snapshots(created_at);

-- Audit indexes
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);

-- ============================================================================
-- STEP 11: SEQUENCES AND FUNCTIONS
-- ============================================================================

-- Generate MO numbers
CREATE SEQUENCE IF NOT EXISTS mo_number_seq START 1;

-- Generate WO numbers  
CREATE SEQUENCE IF NOT EXISTS wo_number_seq START 1;

-- Function to generate MO numbers
CREATE OR REPLACE FUNCTION generate_mo_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'MO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('mo_number_seq')::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to generate WO numbers
CREATE OR REPLACE FUNCTION generate_wo_number()
RETURNS TEXT AS $$
BEGIN
    RETURN 'WO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('wo_number_seq')::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 12: TRIGGERS FOR AUTOMATION
-- ============================================================================

-- Trigger to update products stock_qty when stock_ledger changes
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET stock_qty = (
        SELECT COALESCE(SUM(quantity), 0)
        FROM stock_ledger 
        WHERE product_id = NEW.product_id
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE product_id = NEW.product_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_stock ON stock_ledger;
CREATE TRIGGER trigger_update_product_stock
    AFTER INSERT OR UPDATE OR DELETE ON stock_ledger
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- Trigger to update MO progress based on completed work orders
CREATE OR REPLACE FUNCTION update_mo_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE manufacturing_orders 
    SET progress_percent = (
        SELECT CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE (COUNT(*) FILTER (WHERE status = 'Completed')::DECIMAL / COUNT(*)) * 100
        END
        FROM work_orders 
        WHERE mo_id = COALESCE(NEW.mo_id, OLD.mo_id)
    ),
    status = CASE 
        WHEN (SELECT COUNT(*) FILTER (WHERE status = 'Completed') 
              FROM work_orders 
              WHERE mo_id = COALESCE(NEW.mo_id, OLD.mo_id)) = 
             (SELECT COUNT(*) 
              FROM work_orders 
              WHERE mo_id = COALESCE(NEW.mo_id, OLD.mo_id))
        THEN 'Done'
        WHEN (SELECT COUNT(*) FILTER (WHERE status IN ('In Progress', 'Paused')) 
              FROM work_orders 
              WHERE mo_id = COALESCE(NEW.mo_id, OLD.mo_id)) > 0
        THEN 'In Progress'
        ELSE status
    END,
    updated_at = CURRENT_TIMESTAMP
    WHERE mo_id = COALESCE(NEW.mo_id, OLD.mo_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_mo_progress ON work_orders;
CREATE TRIGGER trigger_update_mo_progress
    AFTER UPDATE OF status ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_mo_progress();

-- Trigger for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        user_id,
        entity_type,
        entity_id,
        action,
        old_value,
        new_value
    ) VALUES (
        COALESCE(NEW.updated_by, NEW.created_by, OLD.updated_by, 1), -- fallback to user_id 1 if not available
        TG_TABLE_NAME,
        COALESCE(NEW.mo_id, NEW.wo_id, NEW.product_id, NEW.user_id, OLD.mo_id, OLD.wo_id, OLD.product_id, OLD.user_id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::text ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW)::text ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
DROP TRIGGER IF EXISTS audit_manufacturing_orders ON manufacturing_orders;
CREATE TRIGGER audit_manufacturing_orders
    AFTER INSERT OR UPDATE OR DELETE ON manufacturing_orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_work_orders ON work_orders;
CREATE TRIGGER audit_work_orders
    AFTER INSERT OR UPDATE OR DELETE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_stock_ledger ON stock_ledger;
CREATE TRIGGER audit_stock_ledger
    AFTER INSERT OR UPDATE OR DELETE ON stock_ledger
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Generic function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to tables with updated_at columns
DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_products_updated_at ON products;
CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_work_centers_updated_at ON work_centers;
CREATE TRIGGER trigger_work_centers_updated_at
    BEFORE UPDATE ON work_centers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_bom_updated_at ON bom;
CREATE TRIGGER trigger_bom_updated_at
    BEFORE UPDATE ON bom
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_mo_updated_at ON manufacturing_orders;
CREATE TRIGGER trigger_mo_updated_at
    BEFORE UPDATE ON manufacturing_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_wo_updated_at ON work_orders;
CREATE TRIGGER trigger_wo_updated_at
    BEFORE UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEPLOYMENT COMPLETE
-- ============================================================================

-- Insert comments for documentation
COMMENT ON SCHEMA public IS 'Manufacturing Management System - Complete Database Schema';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Manufacturing Management System database schema deployed successfully!';
    RAISE NOTICE '📊 All tables, indexes, triggers, and functions have been created.';
    RAISE NOTICE '🔧 Ready for application deployment.';
END $$;
-- ============================================================================
-- TRIGGERS, FUNCTIONS & AUTOMATION SCHEMA
-- Manufacturing Management System
-- ============================================================================

-- ============================================================================
-- SEQUENCES FOR AUTO-GENERATED NUMBERS
-- ============================================================================

-- Generate MO numbers
CREATE SEQUENCE IF NOT EXISTS mo_number_seq START 1;

-- Generate WO numbers  
CREATE SEQUENCE IF NOT EXISTS wo_number_seq START 1;

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

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
-- STOCK MANAGEMENT TRIGGERS
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

CREATE TRIGGER IF NOT EXISTS trigger_update_product_stock
    AFTER INSERT OR UPDATE OR DELETE ON stock_ledger
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- ============================================================================
-- MANUFACTURING ORDER PROGRESS TRIGGERS
-- ============================================================================

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

CREATE TRIGGER IF NOT EXISTS trigger_update_mo_progress
    AFTER UPDATE OF status ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_mo_progress();

-- ============================================================================
-- AUDIT TRIGGERS
-- ============================================================================

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
CREATE TRIGGER IF NOT EXISTS audit_manufacturing_orders
    AFTER INSERT OR UPDATE OR DELETE ON manufacturing_orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER IF NOT EXISTS audit_work_orders
    AFTER INSERT OR UPDATE OR DELETE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER IF NOT EXISTS audit_stock_ledger
    AFTER INSERT OR UPDATE OR DELETE ON stock_ledger
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- TIMESTAMP UPDATE TRIGGERS
-- ============================================================================

-- Generic function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to tables with updated_at columns
CREATE TRIGGER IF NOT EXISTS trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_work_centers_updated_at
    BEFORE UPDATE ON work_centers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_bom_updated_at
    BEFORE UPDATE ON bom
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_mo_updated_at
    BEFORE UPDATE ON manufacturing_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_wo_updated_at
    BEFORE UPDATE ON work_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON FUNCTION generate_mo_number() IS 'Generates unique MO numbers in format MO-YYYY-001';
COMMENT ON FUNCTION generate_wo_number() IS 'Generates unique WO numbers in format WO-YYYY-001';
COMMENT ON FUNCTION update_product_stock() IS 'Automatically updates product stock quantities when stock ledger changes';
COMMENT ON FUNCTION update_mo_progress() IS 'Automatically updates MO progress percentage based on completed work orders';
COMMENT ON FUNCTION audit_trigger_function() IS 'Generic audit function to log all changes to critical tables';
COMMENT ON FUNCTION update_updated_at_column() IS 'Generic function to update the updated_at timestamp on record changes';
-- Database Functions and Triggers (functions.sql)

-- Function to update product stock quantity
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products 
    SET current_stock_quantity = NEW.balance_quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product stock when stock_ledger changes
CREATE TRIGGER trigger_update_product_stock
    AFTER INSERT ON stock_ledger
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- Function to generate sequential numbers
CREATE OR REPLACE FUNCTION generate_sequence_number(prefix TEXT, table_name TEXT, date_part TEXT DEFAULT '')
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    formatted_num TEXT;
BEGIN
    -- Get next sequence number for the day/month/year
    SELECT COALESCE(MAX(CAST(SUBSTRING(
        CASE 
            WHEN table_name = 'manufacturing_orders' THEN mo_number
            WHEN table_name = 'work_orders' THEN wo_number
        END
        FROM LENGTH(prefix || date_part) + 2
    ) AS INTEGER)), 0) + 1 INTO next_num
    FROM (
        SELECT mo_number, wo_number FROM manufacturing_orders
        UNION ALL
        SELECT wo_number as mo_number, wo_number FROM work_orders
    ) t
    WHERE 
        CASE 
            WHEN table_name = 'manufacturing_orders' THEN mo_number
            WHEN table_name = 'work_orders' THEN wo_number
        END LIKE prefix || date_part || '%';
    
    -- Format with leading zeros
    formatted_num := prefix || date_part || '-' || LPAD(next_num::TEXT, 3, '0');
    
    RETURN formatted_num;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate MO number
CREATE OR REPLACE FUNCTION set_mo_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mo_number IS NULL OR NEW.mo_number = '' THEN
        NEW.mo_number := generate_sequence_number('MO', 'manufacturing_orders', TO_CHAR(CURRENT_DATE, '-YYYY'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate WO number
CREATE OR REPLACE FUNCTION set_wo_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.wo_number IS NULL OR NEW.wo_number = '' THEN
        NEW.wo_number := generate_sequence_number('WO', 'work_orders', TO_CHAR(CURRENT_DATE, '-YYYY'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-generating numbers
CREATE TRIGGER trigger_set_mo_number
    BEFORE INSERT ON manufacturing_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_mo_number();

CREATE TRIGGER trigger_set_wo_number
    BEFORE INSERT ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_wo_number();

-- Function to calculate actual duration from time logs
CREATE OR REPLACE FUNCTION calculate_wo_duration(wo_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total_duration INTEGER := 0;
    start_time TIMESTAMP;
    current_duration INTEGER;
BEGIN
    -- Calculate duration from time logs
    FOR start_time IN 
        SELECT timestamp FROM wo_time_logs 
        WHERE work_order_id = wo_id AND action IN ('Start', 'Resume')
        ORDER BY timestamp
    LOOP
        SELECT EXTRACT(EPOCH FROM (
            COALESCE(
                (SELECT timestamp FROM wo_time_logs 
                 WHERE work_order_id = wo_id AND action IN ('Pause', 'Complete') 
                 AND timestamp > start_time 
                 ORDER BY timestamp LIMIT 1),
                CURRENT_TIMESTAMP
            ) - start_time
        ))::INTEGER / 60 INTO current_duration;
        
        total_duration := total_duration + current_duration;
    END LOOP;
    
    RETURN total_duration;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update timestamp triggers to relevant tables
CREATE TRIGGER trigger_update_users_timestamp
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trigger_update_products_timestamp
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trigger_update_boms_timestamp
    BEFORE UPDATE ON boms
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trigger_update_mo_timestamp
    BEFORE UPDATE ON manufacturing_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER trigger_update_wo_timestamp
    BEFORE UPDATE ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
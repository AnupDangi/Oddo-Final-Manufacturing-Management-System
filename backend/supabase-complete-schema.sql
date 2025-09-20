-- ========================================
-- COMPLETE DATABASE SCHEMA FOR SUPABASE
-- Manufacturing Management System
-- ========================================

-- Enable Row Level Security globally
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- ========================================
-- 1. CORE TABLES
-- ========================================

-- Users Table (linked to Supabase auth.users)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Manufacturing Manager', 'Operator', 'Inventory Manager')),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Raw Material', 'Finished Good', 'Semi-Finished')),
    unit VARCHAR(50) NOT NULL, -- Units like 'Pieces', 'Kg', 'Liters', etc.
    current_stock_quantity DECIMAL(10,2) DEFAULT 0,
    minimum_stock_level DECIMAL(10,2) DEFAULT 0,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Centers Table
CREATE TABLE work_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    hourly_cost DECIMAL(10,2) DEFAULT 0,
    capacity_per_hour DECIMAL(10,2) DEFAULT 1, -- How many operations can be done per hour
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    total_working_hours DECIMAL(10,2) DEFAULT 0, -- Track total utilization
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. BOM TABLES
-- ========================================

-- BOMs Table
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

-- BOM Components Table
CREATE TABLE bom_components (
    id SERIAL PRIMARY KEY,
    bom_id INTEGER REFERENCES boms(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, -- Raw material
    quantity_required DECIMAL(10,2) NOT NULL,
    cost_per_unit DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity_required * cost_per_unit) STORED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOM Operations Table
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

-- ========================================
-- 3. MANUFACTURING ORDERS
-- ========================================

-- Manufacturing Orders Table
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

-- Manufacturing Order Components Table
CREATE TABLE mo_components (
    id SERIAL PRIMARY KEY,
    mo_id INTEGER REFERENCES manufacturing_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE, -- Raw material
    quantity_required DECIMAL(10,2) NOT NULL,
    quantity_consumed DECIMAL(10,2) DEFAULT 0,
    is_consumed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 4. WORK ORDERS
-- ========================================

-- Work Orders Table
CREATE TABLE work_orders (
    id SERIAL PRIMARY KEY,
    wo_number VARCHAR(100) UNIQUE NOT NULL, -- Auto-generated WO number like WO-2024-001
    mo_id INTEGER REFERENCES manufacturing_orders(id) ON DELETE CASCADE,
    operation_name VARCHAR(255) NOT NULL,
    sequence_number INTEGER NOT NULL, -- Order of operations
    status VARCHAR(50) DEFAULT 'Planned' CHECK (status IN ('Planned', 'Started', 'Paused', 'Completed', 'Cancelled')),
    operator_id INTEGER REFERENCES users(id), -- Shop-floor worker
    work_center_id INTEGER REFERENCES work_centers(id),
    planned_duration_mins INTEGER NOT NULL,
    actual_duration_mins INTEGER DEFAULT 0,
    scheduled_start TIMESTAMP,
    actual_start TIMESTAMP,
    actual_end TIMESTAMP,
    completion_percentage DECIMAL(5,2) DEFAULT 0, -- 0-100%
    comments TEXT,
    issues TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Order Time Tracking Table
CREATE TABLE wo_time_logs (
    id SERIAL PRIMARY KEY,
    wo_id INTEGER REFERENCES work_orders(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('Start', 'Pause', 'Resume', 'Complete')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operator_id INTEGER REFERENCES users(id),
    comments TEXT
);

-- ========================================
-- 5. INVENTORY & STOCK MANAGEMENT
-- ========================================

-- Stock Ledger Table
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

-- ========================================
-- 6. SUPPORTING TABLES
-- ========================================

-- Work Center Downtime Table
CREATE TABLE work_center_downtime (
    id SERIAL PRIMARY KEY,
    work_center_id INTEGER REFERENCES work_centers(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    reason TEXT,
    downtime_duration_mins INTEGER, -- Calculated field
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profiles Extension (additional user data beyond Supabase auth)
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    avatar_url TEXT,
    department VARCHAR(100),
    employee_id VARCHAR(50),
    hire_date DATE,
    supervisor_id INTEGER REFERENCES users(id),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_by INTEGER REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings Table
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    is_read BOOLEAN DEFAULT false,
    reference_type VARCHAR(50), -- 'MO', 'WO', etc.
    reference_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 7. INDEXES FOR PERFORMANCE
-- ========================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_auth_id ON users(auth_user_id);

-- Products indexes
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_name ON products(name);

-- Work Centers indexes
CREATE INDEX idx_work_centers_name ON work_centers(name);

-- BOMs indexes
CREATE INDEX idx_boms_product ON boms(product_id);
CREATE INDEX idx_bom_components_bom ON bom_components(bom_id);
CREATE INDEX idx_bom_operations_bom ON bom_operations(bom_id);
CREATE INDEX idx_bom_operations_sequence ON bom_operations(bom_id, sequence_number);

-- Manufacturing Orders indexes
CREATE INDEX idx_mo_status ON manufacturing_orders(status);
CREATE INDEX idx_mo_assignee ON manufacturing_orders(assignee_id);
CREATE INDEX idx_mo_scheduled_start ON manufacturing_orders(scheduled_start_date);
CREATE INDEX idx_mo_components_mo ON mo_components(mo_id);

-- Work Orders indexes
CREATE INDEX idx_wo_mo ON work_orders(mo_id);
CREATE INDEX idx_wo_status ON work_orders(status);
CREATE INDEX idx_wo_operator ON work_orders(operator_id);
CREATE INDEX idx_wo_work_center ON work_orders(work_center_id);
CREATE INDEX idx_wo_sequence ON work_orders(mo_id, sequence_number);
CREATE INDEX idx_time_logs_wo ON wo_time_logs(wo_id);

-- Stock Ledger indexes
CREATE INDEX idx_stock_ledger_product ON stock_ledger(product_id);
CREATE INDEX idx_stock_ledger_date ON stock_ledger(transaction_date);
CREATE INDEX idx_stock_ledger_reference ON stock_ledger(reference_type, reference_id);
CREATE INDEX idx_stock_ledger_movement ON stock_ledger(movement_type);

-- Supporting table indexes
CREATE INDEX idx_downtime_work_center ON work_center_downtime(work_center_id);
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- ========================================
-- 8. VIEWS
-- ========================================

-- Current Stock View
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

-- ========================================
-- 9. FUNCTIONS
-- ========================================

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

-- Function to calculate work order duration
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
        WHERE wo_id = wo_id AND action IN ('Start', 'Resume')
        ORDER BY timestamp
    LOOP
        SELECT EXTRACT(EPOCH FROM (
            COALESCE(
                (SELECT timestamp FROM wo_time_logs 
                 WHERE wo_id = wo_id AND action IN ('Pause', 'Complete') 
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

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_user_id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'Operator')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user ID from auth
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 10. TRIGGERS
-- ========================================

-- Stock update trigger
CREATE TRIGGER trigger_update_product_stock
    AFTER INSERT ON stock_ledger
    FOR EACH ROW
    EXECUTE FUNCTION update_product_stock();

-- Auto-generate MO number trigger
CREATE TRIGGER trigger_set_mo_number
    BEFORE INSERT ON manufacturing_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_mo_number();

-- Auto-generate WO number trigger
CREATE TRIGGER trigger_set_wo_number
    BEFORE INSERT ON work_orders
    FOR EACH ROW
    EXECUTE FUNCTION set_wo_number();

-- Update timestamp triggers
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

-- Trigger to automatically create user profile when auth user is created
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ========================================
-- 11. DEFAULT DATA
-- ========================================

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('mo_number_prefix', 'MO', 'Prefix for Manufacturing Order numbers'),
('wo_number_prefix', 'WO', 'Prefix for Work Order numbers'),
('default_currency', 'USD', 'Default currency for costing'),
('enable_barcode_scanning', 'false', 'Enable barcode scanning functionality'),
('auto_consume_materials', 'true', 'Automatically consume materials when WO is completed');

-- Create default admin user (will be linked to Supabase auth user)
-- Note: You'll need to create the auth user first in Supabase Auth, then link it here
-- INSERT INTO users (auth_user_id, name, email, role, phone) VALUES
-- ('your-auth-user-uuid-here', 'System Admin', 'admin@manufacturing.com', 'Admin', '+1234567890');

-- ========================================
-- 12. ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturing_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE boms ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (customize based on your security requirements)
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Admin can view all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'Admin'
        )
    );

CREATE POLICY "Manufacturing managers can view all MOs" ON manufacturing_orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('Admin', 'Manufacturing Manager')
        )
    );

CREATE POLICY "Users can view their assigned MOs" ON manufacturing_orders
    FOR SELECT USING (
        assignee_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        ) OR
        created_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Operators can view their work orders" ON work_orders
    FOR SELECT USING (
        operator_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        ) OR
        created_by IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Inventory managers can view stock data" ON stock_ledger
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('Admin', 'Inventory Manager', 'Manufacturing Manager')
        )
    );

CREATE POLICY "Only admin can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'Admin'
        )
    );

-- Additional RLS policies for other tables
CREATE POLICY "All authenticated users can view products" ON products
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and managers can modify products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('Admin', 'Inventory Manager')
        )
    );

CREATE POLICY "All authenticated users can view BOMs" ON boms
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and managers can modify BOMs" ON boms
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role IN ('Admin', 'Manufacturing Manager')
        )
    );

CREATE POLICY "Users can view their own profiles" ON user_profiles
    FOR SELECT USING (
        user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own profiles" ON user_profiles
    FOR UPDATE USING (
        user_id IN (
            SELECT id FROM users WHERE auth_user_id = auth.uid()
        )
    );

-- ========================================
-- SCHEMA CREATION COMPLETE
-- ========================================

-- Grant necessary permissions for the application
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
SELECT 'Manufacturing Management System database schema created successfully!' as status;
-- ============================================================================
-- AUDIT & TRACEABILITY SCHEMA
-- Manufacturing Management System
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);

-- Comments
COMMENT ON TABLE audit_log IS 'Complete audit trail of all changes to critical manufacturing data';
COMMENT ON COLUMN audit_log.entity_type IS 'Type of entity changed (MO, WO, Stock, BOM, User, etc.)';
COMMENT ON COLUMN audit_log.entity_id IS 'ID of the specific record that was changed';
COMMENT ON COLUMN audit_log.action IS 'Type of action performed (CREATE, UPDATE, DELETE, STATUS_CHANGE)';
COMMENT ON COLUMN audit_log.field_name IS 'Specific field that was changed (for UPDATE actions)';
COMMENT ON COLUMN audit_log.old_value IS 'Previous value before the change';
COMMENT ON COLUMN audit_log.new_value IS 'New value after the change';
COMMENT ON COLUMN audit_log.ip_address IS 'IP address of the user who made the change';
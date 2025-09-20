-- ============================================================================
-- WORK CENTERS & OPERATIONS SCHEMA
-- Manufacturing Management System
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_centers_status ON work_centers(status);
CREATE INDEX IF NOT EXISTS idx_work_centers_code ON work_centers(code);
CREATE INDEX IF NOT EXISTS idx_work_center_logs_center ON work_center_logs(work_center_id);
CREATE INDEX IF NOT EXISTS idx_work_center_logs_date ON work_center_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_work_center_logs_event ON work_center_logs(event_type);

-- Comments
COMMENT ON TABLE work_centers IS 'Work centers representing machines, areas, or teams where operations are performed';
COMMENT ON TABLE work_center_logs IS 'Activity logs for work centers tracking downtime, maintenance, and production events';
COMMENT ON COLUMN work_centers.capacity IS 'Production capacity in units per hour';
COMMENT ON COLUMN work_centers.cost_per_hour IS 'Operating cost per hour for this work center';
COMMENT ON COLUMN work_center_logs.event_type IS 'Type of event: Downtime, Maintenance, Overtime, or Production';
COMMENT ON COLUMN work_center_logs.duration_minutes IS 'Duration of the event in minutes';
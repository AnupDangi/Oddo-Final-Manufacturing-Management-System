-- Work Order Schema (work_orders.sql)
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

-- Work Order Time Tracking (For pause/resume functionality)
CREATE TABLE wo_time_logs (
    id SERIAL PRIMARY KEY,
    wo_id INTEGER REFERENCES work_orders(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL CHECK (action IN ('Start', 'Pause', 'Resume', 'Complete')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    operator_id INTEGER REFERENCES users(id),
    comments TEXT
);

-- Indexes
CREATE INDEX idx_wo_mo ON work_orders(mo_id);
CREATE INDEX idx_wo_status ON work_orders(status);
CREATE INDEX idx_wo_operator ON work_orders(operator_id);
CREATE INDEX idx_wo_work_center ON work_orders(work_center_id);
CREATE INDEX idx_wo_sequence ON work_orders(mo_id, sequence_number);
CREATE INDEX idx_time_logs_wo ON wo_time_logs(wo_id);
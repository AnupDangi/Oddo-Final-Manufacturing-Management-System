-- Work Center Schema (work_centers.sql)
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

-- Downtime tracking table
CREATE TABLE work_center_downtime (
    id SERIAL PRIMARY KEY,
    work_center_id INTEGER REFERENCES work_centers(id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    reason TEXT,
    downtime_duration_mins INTEGER, -- Calculated field
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_work_centers_name ON work_centers(name);
CREATE INDEX idx_downtime_work_center ON work_center_downtime(work_center_id);
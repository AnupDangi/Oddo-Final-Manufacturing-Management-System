-- ============================================================================
-- REPORTING & ANALYTICS SCHEMA
-- Manufacturing Management System
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_kpi_date ON kpi_snapshots(date);
CREATE INDEX IF NOT EXISTS idx_kpi_created ON kpi_snapshots(created_at);

-- Comments
COMMENT ON TABLE reports IS 'Metadata for generated reports including filters and file information';
COMMENT ON TABLE kpi_snapshots IS 'Daily snapshots of key performance indicators for historical analysis';
COMMENT ON COLUMN reports.report_type IS 'Type of report: KPI, Stock, Production, Cost, User_Activity';
COMMENT ON COLUMN reports.file_format IS 'Output format: PDF, Excel, CSV';
COMMENT ON COLUMN reports.parameters IS 'JSON object containing report filters and parameters';
COMMENT ON COLUMN kpi_snapshots.date IS 'Date for which these KPIs were calculated (unique constraint)';
COMMENT ON COLUMN kpi_snapshots.orders_planned IS 'Number of orders in planned status';
COMMENT ON COLUMN kpi_snapshots.orders_in_progress IS 'Number of orders currently in progress';
COMMENT ON COLUMN kpi_snapshots.orders_completed IS 'Number of orders completed on this date';
COMMENT ON COLUMN kpi_snapshots.orders_delayed IS 'Number of orders that are delayed';
COMMENT ON COLUMN kpi_snapshots.avg_production_time_hours IS 'Average production time in hours';
COMMENT ON COLUMN kpi_snapshots.efficiency_percent IS 'Overall production efficiency percentage';
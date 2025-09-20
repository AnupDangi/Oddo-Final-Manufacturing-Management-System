-- ============================================================================
-- USERS & AUTHENTICATION SCHEMA
-- Manufacturing Management System
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_timestamp ON user_activity_logs(timestamp);

-- Comments
COMMENT ON TABLE users IS 'Main users table for authentication and role-based access control';
COMMENT ON TABLE user_activity_logs IS 'Tracks user activities for security and audit purposes';
COMMENT ON COLUMN users.role IS 'User role: Admin, Manager, Operator, or Inventory';
COMMENT ON COLUMN users.is_active IS 'Indicates if user account is active and can login';
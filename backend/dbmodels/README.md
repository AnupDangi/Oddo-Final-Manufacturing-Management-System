# Manufacturing Management System - Database Schema Files Summary

## Overview

This document provides a comprehensive summary of all database schema files created for the Manufacturing Management System. The database schema is designed to support end-to-end manufacturing operations from product definition through production execution and reporting.

## Schema Files Structure

### Individual Schema Files (Modular Approach)

| File | Tables Created | Purpose |
|------|---------------|---------|
| `01_users.sql` | users, user_activity_logs | User authentication and activity tracking |
| `02_products.sql` | products | Product master data (raw materials & finished goods) |
| `03_work_centers.sql` | work_centers, work_center_logs | Work center definitions and activity logging |
| `04_bom.sql` | bom, bom_components, bom_operations | Bill of Materials with components and operations |
| `05_manufacturing_orders.sql` | manufacturing_orders, mo_components | Manufacturing orders and material allocation |
| `06_work_orders.sql` | work_orders, work_order_costs | Work orders and cost tracking |
| `07_stock_ledger.sql` | stock_ledger | Inventory movements and transactions |
| `08_reporting.sql` | reports, kpi_snapshots | Report metadata and KPI tracking |
| `09_audit.sql` | audit_log | Audit trail for all changes |
| `10_triggers_functions.sql` | Functions & Triggers | Automation and data integrity |

### Deployment Files

| File | Purpose |
|------|---------|
| `deploy_schema.sql` | Complete schema deployment in single file |
| `deploy.js` | Node.js deployment script with verification |

## Database Tables Summary

### 1. Users & Authentication (01_users.sql)

#### users
- **Purpose**: Store user credentials and role information
- **Key Features**: Role-based access control (Admin, Manager, Operator, Inventory)
- **Fields**: user_id, name, email, password_hash, role, phone, department, profile_image, is_active

#### user_activity_logs
- **Purpose**: Track user activities for security and audit
- **Key Features**: IP address and user agent tracking
- **Fields**: log_id, user_id, activity, ip_address, user_agent, timestamp

### 2. Product Management (02_products.sql)

#### products
- **Purpose**: Master data for all products (raw materials and finished goods)
- **Key Features**: Stock quantity tracking, minimum stock levels, product codes
- **Fields**: product_id, name, code, type, unit, stock_qty, min_stock_level, unit_cost, description

### 3. Work Centers & Operations (03_work_centers.sql)

#### work_centers
- **Purpose**: Define machines, areas, or teams where operations are performed
- **Key Features**: Capacity planning, cost tracking, status management
- **Fields**: work_center_id, name, code, capacity, cost_per_hour, location, status

#### work_center_logs
- **Purpose**: Track work center activities (downtime, maintenance, production)
- **Key Features**: Event categorization, duration tracking, cost allocation
- **Fields**: log_id, work_center_id, event_type, reason, duration_minutes, cost

### 4. Bill of Materials (04_bom.sql)

#### bom
- **Purpose**: Main BOM records linking finished products to their recipes
- **Key Features**: Version control, activation status
- **Fields**: bom_id, product_id, version, is_active, created_by

#### bom_components
- **Purpose**: Raw materials and components required for each BOM
- **Key Features**: Quantity requirements, wastage calculations, sequencing
- **Fields**: bom_component_id, bom_id, component_id, quantity_required, wastage_percent, sequence_order

#### bom_operations
- **Purpose**: Operations and routing steps for manufacturing
- **Key Features**: Work center assignment, time estimation, sequencing
- **Fields**: bom_operation_id, bom_id, operation_name, work_center_id, estimated_duration_minutes, sequence_order

### 5. Manufacturing Orders (05_manufacturing_orders.sql)

#### manufacturing_orders
- **Purpose**: Production authorization records
- **Key Features**: Status tracking, progress calculation, priority management, scheduling
- **Fields**: mo_id, mo_number, product_id, bom_id, quantity, status, priority, progress_percent, planned_dates, actual_dates

#### mo_components
- **Purpose**: Materials allocated to specific manufacturing orders
- **Key Features**: Requirement vs consumption tracking, availability checking
- **Fields**: mo_component_id, mo_id, product_id, quantity_required, quantity_consumed, quantity_available

### 6. Work Orders (06_work_orders.sql)

#### work_orders
- **Purpose**: Individual operation tasks within manufacturing orders
- **Key Features**: Operator assignment, time tracking, quality metrics, status progression
- **Fields**: wo_id, wo_number, mo_id, operation_name, work_center_id, operator_id, status, time_fields, quantity_fields

#### work_order_costs
- **Purpose**: Detailed cost tracking for work orders
- **Key Features**: Cost categorization (Labor, Machine, Material, Overhead), automatic total calculation
- **Fields**: cost_id, wo_id, cost_type, description, quantity, rate, total_cost

### 7. Stock Management (07_stock_ledger.sql)

#### stock_ledger
- **Purpose**: Complete audit trail of all inventory movements
- **Key Features**: Transaction typing, reference tracking, batch management, automatic value calculation
- **Fields**: entry_id, product_id, transaction_type, quantity, unit_cost, balance_qty, reference_info, batch_number

### 8. Reporting & Analytics (08_reporting.sql)

#### reports
- **Purpose**: Metadata for generated reports
- **Key Features**: Multiple report types, parameter storage, file format support
- **Fields**: report_id, user_id, report_name, report_type, file_path, file_format, parameters

#### kpi_snapshots
- **Purpose**: Daily snapshots of key performance indicators
- **Key Features**: Historical KPI tracking, unique date constraint
- **Fields**: kpi_id, date, orders_planned, orders_in_progress, orders_completed, orders_delayed, avg_production_time, efficiency_percent

### 9. Audit & Traceability (09_audit.sql)

#### audit_log
- **Purpose**: Complete audit trail of all system changes
- **Key Features**: Entity tracking, action logging, field-level changes, IP tracking
- **Fields**: log_id, user_id, entity_type, entity_id, action, field_name, old_value, new_value, ip_address

### 10. Automation & Functions (10_triggers_functions.sql)

#### Functions Created:
- `generate_mo_number()`: Auto-generates manufacturing order numbers
- `generate_wo_number()`: Auto-generates work order numbers
- `update_product_stock()`: Updates product stock from ledger changes
- `update_mo_progress()`: Calculates MO progress from work order completion
- `audit_trigger_function()`: Generic audit logging function
- `update_updated_at_column()`: Updates timestamp on record changes

#### Triggers Created:
- Stock update triggers for automatic inventory management
- Progress calculation triggers for real-time MO status
- Audit triggers for change tracking
- Timestamp triggers for data consistency

## Deployment Instructions

### Method 1: Complete Deployment (Recommended)
```bash
# Using Node.js deployment script
cd backend/dbmodels
node deploy.js

# Or using SQL directly in Supabase
# Execute the contents of deploy_schema.sql in your Supabase SQL editor
```

### Method 2: Individual File Deployment
```bash
# Deploy individual files in order
node deploy.js individual

# Or manually execute each SQL file in sequence:
# 01_users.sql → 02_products.sql → ... → 10_triggers_functions.sql
```

## Key Features & Benefits

### 1. **Data Integrity**
- Foreign key constraints ensure referential integrity
- Check constraints validate data values
- Triggers maintain consistency across related tables

### 2. **Performance Optimization**
- Comprehensive indexing strategy for common query patterns
- Optimized for dashboard and reporting queries
- Efficient filtering and sorting capabilities

### 3. **Audit & Compliance**
- Complete audit trail of all changes
- User activity logging for security
- Traceability throughout the manufacturing process

### 4. **Automation**
- Automatic stock quantity updates
- Real-time progress calculation
- Auto-generated document numbers

### 5. **Scalability**
- Modular design allows for easy extensions
- Support for future enhancements (quality checks, maintenance scheduling)
- Flexible reporting parameters using JSONB

### 6. **Real-time Visibility**
- Status tracking across all entities
- Progress percentage calculations
- KPI snapshots for historical analysis

## Schema Validation Checklist

✅ **Users & Roles**: Support for all required user types (Admin, Manager, Operator, Inventory)  
✅ **Product Management**: Raw materials and finished goods with stock tracking  
✅ **BOM Structure**: Components, operations, and routing with versioning  
✅ **Manufacturing Orders**: Complete order lifecycle with progress tracking  
✅ **Work Orders**: Operation-level tracking with time and quality metrics  
✅ **Work Centers**: Resource management with capacity and costing  
✅ **Stock Management**: Complete inventory audit trail with automatic updates  
✅ **Reporting**: KPI tracking and report generation capabilities  
✅ **Audit Trail**: Complete change tracking with user attribution  
✅ **Automation**: Triggers for data consistency and real-time updates  

## Maintenance & Updates

### Adding New Tables
1. Create new SQL file following naming convention (##_tablename.sql)
2. Update deploy_schema.sql to include new tables
3. Add verification checks to deploy.js
4. Update this documentation

### Modifying Existing Tables
1. Create migration scripts for schema changes
2. Test migrations on development environment
3. Update relevant individual SQL files
4. Rebuild deploy_schema.sql

### Performance Monitoring
- Monitor query performance using database logs
- Add additional indexes as needed based on usage patterns
- Review and optimize triggers for performance impact

This schema provides a robust foundation for the Manufacturing Management System with complete coverage of all requirements specified in the problem statement.
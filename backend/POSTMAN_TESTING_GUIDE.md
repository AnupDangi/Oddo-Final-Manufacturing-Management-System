# Complete Postman Testing Guide - Manufacturing Management System

## Server Information
- **Base URL**: `http://localhost:5000`
- **API Version**: v1
- **Authentication**: JWT Bearer Token

## Environment Setup in Postman

Create a new environment with these variables:
- `base_url`: `http://localhost:5000`
- `token`: `{{auth_token}}` (will be set after login)

## 1. Authentication Setup

### Login (Required First)
```http
POST {{base_url}}/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "your_password"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "user_id": 1,
      "name": "Admin User",
      "email": "admin@company.com",
      "role": "admin"
    }
  }
}
```

**Set Token in Environment:**
Add this to the "Tests" tab in Postman:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.data.token);
}
```

---

## 2. Product Management API (`/api/products`)

### 2.1 Create Product
```http
POST {{base_url}}/api/v1/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Steel Bolt M8x50",
  "description": "High strength steel bolt 8mm diameter, 50mm length",
  "type": "raw_material",
  "unit": "pieces",
  "reorder_level": 100,
  "cost_price": 2.50,
  "selling_price": 4.00,
  "category": "Fasteners"
}
```

### 2.2 Get All Products
```http
GET {{base_url}}/api/v1/products?page=1&limit=10&type=raw_material
Authorization: Bearer {{token}}
```

### 2.3 Get Product by ID
```http
GET {{base_url}}/api/v1/products/1
Authorization: Bearer {{token}}
```

### 2.4 Update Product
```http
PUT {{base_url}}/api/v1/products/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "cost_price": 2.75,
  "reorder_level": 150,
  "notes": "Price updated due to supplier change"
}
```

### 2.5 Check Stock Availability
```http
POST {{base_url}}/api/v1/products/check-stock
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "requirements": [
    { "product_id": 1, "required_quantity": 50 },
    { "product_id": 2, "required_quantity": 25 }
  ]
}
```

### 2.6 Get Low Stock Products
```http
GET {{base_url}}/api/v1/products/low-stock
Authorization: Bearer {{token}}
```

### 2.7 Get Product Statistics
```http
GET {{base_url}}/api/v1/products/statistics
Authorization: Bearer {{token}}
```

### 2.8 Search Products
```http
GET {{base_url}}/api/v1/products/search?q=bolt&type=raw_material&limit=20
Authorization: Bearer {{token}}
```

---

## 3. Work Centers API (`/api/work-centers`)

### 3.1 Create Work Center
```http
POST {{base_url}}/api/v1/work-centers
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Assembly Line 1",
  "description": "Main product assembly line with conveyor system",
  "capacity_per_hour": 50,
  "cost_per_hour": 25.00,
  "department": "Production",
  "location": "Building A - Floor 1"
}
```

### 3.2 Get All Work Centers
```http
GET {{base_url}}/api/v1/work-centers?page=1&limit=10
Authorization: Bearer {{token}}
```

### 3.3 Get Work Center by ID
```http
GET {{base_url}}/api/v1/work-centers/1
Authorization: Bearer {{token}}
```

### 3.4 Update Work Center
```http
PUT {{base_url}}/api/v1/work-centers/1
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "capacity_per_hour": 55,
  "cost_per_hour": 27.50,
  "notes": "Capacity increased after equipment upgrade"
}
```

### 3.5 Log Downtime
```http
POST {{base_url}}/api/v1/work-centers/1/downtime
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "reason": "Preventive maintenance",
  "downtime_minutes": 120,
  "notes": "Scheduled maintenance for conveyor belt and sensors"
}
```

### 3.6 Get Utilization Report
```http
GET {{base_url}}/api/v1/work-centers/1/utilization?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {{token}}
```

### 3.7 Get Work Center Statistics
```http
GET {{base_url}}/api/v1/work-centers/statistics
Authorization: Bearer {{token}}
```

---

## 4. Bill of Materials (BOM) API (`/api/boms`)

### 4.1 Create BOM
```http
POST {{base_url}}/api/v1/boms
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "product_id": 1,
  "version": "v1.0",
  "description": "Standard assembly BOM for Product A",
  "components": [
    {
      "component_product_id": 2,
      "quantity_required": 4,
      "waste_percentage": 5,
      "notes": "Main assembly bolts - M8x50"
    },
    {
      "component_product_id": 3,
      "quantity_required": 2,
      "waste_percentage": 2,
      "notes": "Support brackets - Steel"
    }
  ]
}
```

### 4.2 Get All BOMs
```http
GET {{base_url}}/api/v1/boms?page=1&limit=10
Authorization: Bearer {{token}}
```

### 4.3 Get BOM by ID
```http
GET {{base_url}}/api/v1/boms/1
Authorization: Bearer {{token}}
```

### 4.4 Calculate Scaled BOM
```http
POST {{base_url}}/api/v1/boms/1/calculate
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "target_quantity": 100
}
```

### 4.5 Get Material Cost
```http
GET {{base_url}}/api/v1/boms/1/cost?quantity=50
Authorization: Bearer {{token}}
```

### 4.6 Clone BOM
```http
POST {{base_url}}/api/v1/boms/1/clone
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "new_version": "v2.0",
  "description": "Updated BOM with design changes for improved efficiency"
}
```

### 4.7 Update BOM Components
```http
PUT {{base_url}}/api/v1/boms/1/components
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "components": [
    {
      "component_product_id": 2,
      "quantity_required": 5,
      "waste_percentage": 3,
      "notes": "Increased quantity for reinforcement"
    },
    {
      "component_product_id": 4,
      "quantity_required": 1,
      "waste_percentage": 1,
      "notes": "New component added"
    }
  ]
}
```

---

## 5. Manufacturing Orders API (`/api/manufacturing-orders`)

### 5.1 Create Manufacturing Order
```http
POST {{base_url}}/api/v1/manufacturing-orders
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "product_id": 1,
  "quantity": 100,
  "planned_start_date": "2024-02-01T08:00:00Z",
  "planned_end_date": "2024-02-05T17:00:00Z",
  "priority": "high",
  "notes": "Rush order for customer ABC"
}
```

### 5.2 Get All Manufacturing Orders
```http
GET {{base_url}}/api/v1/manufacturing-orders?page=1&limit=10&status=planned&priority=high
Authorization: Bearer {{token}}
```

### 5.3 Get Manufacturing Order by ID
```http
GET {{base_url}}/api/v1/manufacturing-orders/1
Authorization: Bearer {{token}}
```

### 5.4 Update Manufacturing Order Status
```http
PATCH {{base_url}}/api/v1/manufacturing-orders/1/status
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "status": "released",
  "notes": "Materials confirmed available, releasing to production"
}
```

### 5.5 Get Material Requirements
```http
GET {{base_url}}/api/v1/manufacturing-orders/1/material-requirements
Authorization: Bearer {{token}}
```

### 5.6 Check Material Availability
```http
POST {{base_url}}/api/v1/manufacturing-orders/1/check-materials
Authorization: Bearer {{token}}
```

### 5.7 Generate Work Orders
```http
POST {{base_url}}/api/v1/manufacturing-orders/1/generate-work-orders
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "work_center_assignments": [
    {
      "work_center_id": 1,
      "operation": "Assembly",
      "sequence": 1
    },
    {
      "work_center_id": 2,
      "operation": "Quality Check",
      "sequence": 2
    }
  ]
}
```

### 5.8 Cancel Manufacturing Order
```http
PATCH {{base_url}}/api/v1/manufacturing-orders/1/cancel
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "reason": "Customer cancelled order due to changed requirements"
}
```

---

## 6. Work Orders API (`/api/work-orders`)

### 6.1 Create Work Order
```http
POST {{base_url}}/api/v1/work-orders
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "mo_id": 1,
  "work_center_id": 1,
  "operation": "Assembly",
  "sequence": 1,
  "planned_quantity": 100,
  "estimated_hours": 8,
  "notes": "Standard assembly operation"
}
```

### 6.2 Get All Work Orders
```http
GET {{base_url}}/api/v1/work-orders?page=1&limit=10&status=pending&work_center_id=1
Authorization: Bearer {{token}}
```

### 6.3 Start Work Order
```http
POST {{base_url}}/api/v1/work-orders/1/start
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "operator_id": 5,
  "notes": "Starting assembly operation on Assembly Line 1"
}
```

### 6.4 Pause Work Order
```http
POST {{base_url}}/api/v1/work-orders/1/pause
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "reason": "Equipment maintenance",
  "notes": "Pausing for scheduled maintenance break"
}
```

### 6.5 Resume Work Order
```http
POST {{base_url}}/api/v1/work-orders/1/resume
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "notes": "Resuming after maintenance completion"
}
```

### 6.6 Complete Work Order
```http
POST {{base_url}}/api/v1/work-orders/1/complete
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "actual_quantity": 98,
  "quality_check": "passed",
  "notes": "Completed successfully, 2 units failed quality check"
}
```

### 6.7 Log Time
```http
POST {{base_url}}/api/v1/work-orders/1/time-log
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "hours_worked": 2.5,
  "activity": "Assembly",
  "notes": "Morning shift work on main assembly"
}
```

### 6.8 Get Work Orders by Operator
```http
GET {{base_url}}/api/v1/work-orders/by-operator/5?status=in_progress
Authorization: Bearer {{token}}
```

---

## 7. Stock Ledger API (`/api/stock-ledger`)

### 7.1 Record Stock Movement
```http
POST {{base_url}}/api/v1/stock-ledger/movement
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "product_id": 1,
  "movement_type": "in",
  "quantity": 500,
  "reference_type": "purchase",
  "reason": "Purchase receipt from supplier XYZ",
  "notes": "Batch: B2024-001, Expiry: 2025-12-31"
}
```

### 7.2 Get All Stock Movements
```http
GET {{base_url}}/api/v1/stock-ledger?page=1&limit=20&product_id=1&movement_type=out
Authorization: Bearer {{token}}
```

### 7.3 Get Current Stock Levels
```http
GET {{base_url}}/api/v1/stock-ledger/stock-levels?product_type=raw_material&low_stock=true
Authorization: Bearer {{token}}
```

### 7.4 Perform Stock Adjustment
```http
POST {{base_url}}/api/v1/stock-ledger/adjustment
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "product_id": 1,
  "adjustment_quantity": -10,
  "reason": "Physical count variance",
  "notes": "Cycle count revealed 10 units missing"
}
```

### 7.5 Transfer Stock
```http
POST {{base_url}}/api/v1/stock-ledger/transfer
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "product_id": 1,
  "from_location": "Warehouse A",
  "to_location": "Production Floor",
  "quantity": 50,
  "notes": "Transfer for production order MO202401001"
}
```

### 7.6 Consume Materials
```http
POST {{base_url}}/api/v1/stock-ledger/consume
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "mo_id": 1,
  "consumption_details": [
    {
      "product_id": 2,
      "quantity_consumed": 400
    },
    {
      "product_id": 3,
      "quantity_consumed": 200
    }
  ],
  "notes": "Material consumption for MO202401001 - Batch 1"
}
```

### 7.7 Receive Production
```http
POST {{base_url}}/api/v1/stock-ledger/receive-production
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "mo_id": 1,
  "product_id": 1,
  "quantity_produced": 98,
  "quality_status": "passed",
  "notes": "Production completed successfully, 2 units rejected in quality check"
}
```

### 7.8 Get Stock Valuation
```http
GET {{base_url}}/api/v1/stock-ledger/valuation?product_type=finished_good
Authorization: Bearer {{token}}
```

### 7.9 Get ABC Analysis
```http
GET {{base_url}}/api/v1/stock-ledger/abc-analysis?analysis_period=90&classification_basis=value
Authorization: Bearer {{token}}
```

---

## 8. Dashboard API (`/api/dashboard`)

### 8.1 Get Dashboard Overview
```http
GET {{base_url}}/api/v1/dashboard/overview?date_range=30
Authorization: Bearer {{token}}
```

### 8.2 Get Production KPIs
```http
GET {{base_url}}/api/v1/dashboard/production-kpis?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {{token}}
```

### 8.3 Get Inventory KPIs
```http
GET {{base_url}}/api/v1/dashboard/inventory-kpis?product_type=raw_material
Authorization: Bearer {{token}}
```

### 8.4 Get Work Center Utilization
```http
GET {{base_url}}/api/v1/dashboard/work-center-utilization?work_center_id=1&start_date=2024-01-01
Authorization: Bearer {{token}}
```

### 8.5 Get Real-time Status
```http
GET {{base_url}}/api/v1/dashboard/real-time-status
Authorization: Bearer {{token}}
```

### 8.6 Get Low Stock Alerts
```http
GET {{base_url}}/api/v1/dashboard/low-stock-alerts?threshold_multiplier=1.5
Authorization: Bearer {{token}}
```

### 8.7 Get Recent Activities
```http
GET {{base_url}}/api/v1/dashboard/recent-activities?limit=20&activity_types=production,inventory
Authorization: Bearer {{token}}
```

### 8.8 Get Quality Metrics
```http
GET {{base_url}}/api/v1/dashboard/quality-metrics?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer {{token}}
```

---

## 9. Error Handling Examples

### 9.1 Unauthorized Request (401)
```http
GET {{base_url}}/api/v1/products
# Without Authorization header
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### 9.2 Forbidden Access (403)
```http
POST {{base_url}}/api/v1/products
Authorization: Bearer {{operator_token}}
# Operator trying to create product (Admin/Manager only)
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 9.3 Validation Error (400)
```http
POST {{base_url}}/api/v1/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "",
  "type": "invalid_type"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Name, type, and unit are required",
  "error": "Validation failed"
}
```

### 9.4 Resource Not Found (404)
```http
GET {{base_url}}/api/v1/products/99999
Authorization: Bearer {{token}}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---

## 10. Collection Setup in Postman

### 10.1 Pre-request Script (Collection Level)
```javascript
// Set common headers
pm.request.headers.add({
    key: 'Content-Type',
    value: 'application/json'
});

// Add authentication if token exists
if (pm.environment.get("token")) {
    pm.request.headers.add({
        key: 'Authorization',
        value: 'Bearer ' + pm.environment.get("token")
    });
}
```

### 10.2 Tests Script (Collection Level)
```javascript
// Log response time
console.log("Response time: " + pm.response.responseTime + "ms");

// Check for successful response
if (pm.response.code >= 200 && pm.response.code < 300) {
    console.log("✅ Request successful");
} else {
    console.log("❌ Request failed with status: " + pm.response.code);
}

// Parse response if JSON
try {
    const response = pm.response.json();
    console.log("Response:", response);
    
    // Store commonly used IDs for chaining requests
    if (response.data && response.data.product_id) {
        pm.environment.set("last_product_id", response.data.product_id);
    }
    if (response.data && response.data.mo_id) {
        pm.environment.set("last_mo_id", response.data.mo_id);
    }
    if (response.data && response.data.wo_id) {
        pm.environment.set("last_wo_id", response.data.wo_id);
    }
} catch (e) {
    console.log("Response is not JSON");
}
```

---

## 11. Testing Workflows

### 11.1 Complete Production Flow
1. **Login** → Get authentication token
2. **Create Products** → Raw materials and finished goods
3. **Create Work Centers** → Production facilities
4. **Create BOM** → Define material requirements
5. **Create Manufacturing Order** → Plan production
6. **Check Material Availability** → Verify stock
7. **Generate Work Orders** → Break down into operations
8. **Start Work Order** → Begin production
9. **Log Time** → Track work progress
10. **Complete Work Order** → Finish operation
11. **Receive Production** → Update stock
12. **View Dashboard** → Monitor KPIs

### 11.2 Inventory Management Flow
1. **Create Products** → Set up inventory items
2. **Record Stock Movements** → Purchases, adjustments
3. **Check Stock Levels** → Monitor current inventory
4. **Set Up Alerts** → Low stock notifications
5. **Perform Adjustments** → Cycle count corrections
6. **Transfer Stock** → Move between locations
7. **Generate Reports** → ABC analysis, valuation

---

## 12. Performance Testing

### 12.1 Load Testing Scenarios
- **Concurrent Users**: Test with 10-50 concurrent requests
- **Bulk Operations**: Create multiple products/orders
- **Dashboard Refresh**: Rapid successive calls to dashboard endpoints
- **Search Operations**: Test search functionality with various filters

### 12.2 Response Time Expectations
- **Simple CRUD**: < 200ms
- **Complex Calculations**: < 500ms (BOM scaling, cost analysis)
- **Dashboard Queries**: < 1000ms
- **Reports**: < 2000ms

---

## 13. Environment Variables for Different Stages

### Development Environment
```
base_url: http://localhost:5000
token: (set after login)
admin_email: admin@company.com
admin_password: admin123
```

### Staging Environment
```
base_url: https://staging.yourapp.com
token: (set after login)
admin_email: admin@staging.com
admin_password: staging123
```

### Production Environment
```
base_url: https://api.yourapp.com
token: (set after login)
admin_email: admin@production.com
admin_password: (secure_password)
```

---

This comprehensive guide covers all API endpoints with practical examples. Import this into Postman as a collection and follow the authentication setup to start testing all manufacturing operations!
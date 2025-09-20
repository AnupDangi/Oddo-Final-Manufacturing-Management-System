# Manufacturing Management System API Testing Guide

## Server Setup
The server is running on `http://localhost:5000`

## Authentication
All routes (except login/register) require JWT authentication via Bearer token in Authorization header.

### Sample User Login
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@company.com",
  "password": "your_password"
}
```

Response will include `token` - use this in all subsequent requests as:
```
Authorization: Bearer your_jwt_token_here
```

## API Endpoints Testing

### 1. Products API (`/api/products`)

#### Create Product
```http
POST http://localhost:5000/api/products
Authorization: Bearer your_token
Content-Type: application/json

{
  "name": "Steel Bolt M8",
  "description": "High strength steel bolt 8mm diameter",
  "type": "raw_material",
  "unit": "pieces",
  "reorder_level": 100,
  "cost_price": 2.50,
  "selling_price": 4.00,
  "category": "Fasteners"
}
```

#### Get All Products
```http
GET http://localhost:5000/api/products?page=1&limit=10&type=raw_material
Authorization: Bearer your_token
```

#### Get Product by ID
```http
GET http://localhost:5000/api/products/1
Authorization: Bearer your_token
```

#### Update Product
```http
PUT http://localhost:5000/api/products/1
Authorization: Bearer your_token
Content-Type: application/json

{
  "cost_price": 2.75,
  "reorder_level": 150
}
```

#### Check Stock Availability
```http
POST http://localhost:5000/api/products/check-stock
Authorization: Bearer your_token
Content-Type: application/json

{
  "requirements": [
    { "product_id": 1, "required_quantity": 50 },
    { "product_id": 2, "required_quantity": 25 }
  ]
}
```

#### Get Low Stock Products
```http
GET http://localhost:5000/api/products/low-stock
Authorization: Bearer your_token
```

#### Get Product Statistics
```http
GET http://localhost:5000/api/products/statistics
Authorization: Bearer your_token
```

### 2. Work Centers API (`/api/work-centers`)

#### Create Work Center
```http
POST http://localhost:5000/api/work-centers
Authorization: Bearer your_token
Content-Type: application/json

{
  "name": "Assembly Line 1",
  "description": "Main product assembly line",
  "capacity_per_hour": 50,
  "cost_per_hour": 25.00,
  "department": "Production"
}
```

#### Get All Work Centers
```http
GET http://localhost:5000/api/work-centers
Authorization: Bearer your_token
```

#### Log Downtime
```http
POST http://localhost:5000/api/work-centers/1/downtime
Authorization: Bearer your_token
Content-Type: application/json

{
  "reason": "Machine maintenance",
  "downtime_minutes": 120,
  "notes": "Scheduled maintenance for conveyor belt"
}
```

#### Get Utilization Report
```http
GET http://localhost:5000/api/work-centers/1/utilization?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer your_token
```

### 3. BOM (Bill of Materials) API (`/api/boms`)

#### Create BOM
```http
POST http://localhost:5000/api/boms
Authorization: Bearer your_token
Content-Type: application/json

{
  "product_id": 1,
  "version": "v1.0",
  "description": "Standard assembly BOM",
  "components": [
    {
      "component_product_id": 2,
      "quantity_required": 4,
      "waste_percentage": 5,
      "notes": "Main assembly bolts"
    },
    {
      "component_product_id": 3,
      "quantity_required": 2,
      "waste_percentage": 2,
      "notes": "Support brackets"
    }
  ]
}
```

#### Calculate Scaled BOM
```http
POST http://localhost:5000/api/boms/1/calculate
Authorization: Bearer your_token
Content-Type: application/json

{
  "target_quantity": 100
}
```

#### Get Material Cost
```http
GET http://localhost:5000/api/boms/1/cost?quantity=50
Authorization: Bearer your_token
```

#### Clone BOM
```http
POST http://localhost:5000/api/boms/1/clone
Authorization: Bearer your_token
Content-Type: application/json

{
  "new_version": "v2.0",
  "description": "Updated BOM with design changes"
}
```

## Role-Based Access Testing

Different endpoints require different user roles:

### Admin Access (All operations)
- Can access all endpoints
- Can manage users, products, BOMs, work centers

### Manager Access (Most operations)
- Can view and modify production data
- Cannot manage user accounts

### Operator Access (Limited operations)
- Can view products and BOMs
- Can update work orders and production data
- Cannot create/delete core entities

### Inventory Access (Stock-focused)
- Can manage products and stock
- Can view BOMs for inventory planning
- Cannot access work center operations

## Error Response Format
All errors return consistent format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Success Response Format
All successful responses include:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { /* response data */ }
}
```

## Testing Tools

### Option 1: Postman
1. Import the collection (create one with above endpoints)
2. Set environment variable for base URL: `http://localhost:5000`
3. Set authorization token after login

### Option 2: VS Code REST Client
Install REST Client extension and create `.rest` files with the above requests.

### Option 3: curl Commands
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"your_password"}'

# Create Product (replace TOKEN with actual token)
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","type":"raw_material","unit":"pieces"}'
```

## Database Schema Dependencies

Before testing, ensure your Supabase database has these tables:
- `users` (with authentication)
- `products` 
- `work_centers`
- `boms` and `bom_components`
- `work_center_downtime`

## Common Issues & Solutions

1. **401 Unauthorized**: Check if JWT token is valid and not expired
2. **403 Forbidden**: User role doesn't have permission for this operation
3. **404 Not Found**: Resource doesn't exist or user doesn't have access
4. **400 Bad Request**: Invalid request data - check required fields
5. **500 Internal Server Error**: Check server logs for database connection issues

Run the server with `npm start` or `node server.js` and test these endpoints!
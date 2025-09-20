# Manufacturing ERP System API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### 1. Register User
**POST** `/api/v1/auth/register`

**Description:** Register a new user in the system

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "Admin123",
  "role": "Admin",
  "phone": "1234567890"
}
```

**Roles:** `Admin`, `Manufacturing Manager`, `Operator`, `Inventory Manager`

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Admin",
      "phone": "1234567890",
      "isActive": true
    },
    "token": "jwt_token_here"
  }
}
```

### 2. Login User
**POST** `/api/v1/auth/login`

**Description:** Authenticate user and get access token

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "Admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Admin"
    },
    "token": "jwt_token_here"
  }
}
```

### 3. Get User Profile
**GET** `/api/v1/auth/profile`

**Description:** Get current user profile information

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "Admin",
      "phone": "1234567890",
      "isActive": true,
      "createdAt": "2025-09-20T10:00:00.000Z",
      "updatedAt": "2025-09-20T10:00:00.000Z"
    }
  }
}
```

---

## 📦 Product Endpoints

### 1. Create Product
**POST** `/api/v1/products`

**Description:** Create a new product (raw material, WIP, or finished good)

**Headers:** `Authorization: Bearer TOKEN`

**Access:** Admin, Inventory Manager

**Request Body:**
```json
{
  "name": "Wood Plank 2x4",
  "sku": "RM-WD-001",
  "description": "High quality wood plank for furniture",
  "unit_of_measure": "PCS",
  "category": "Raw Material",
  "reorder_point": 50,
  "standard_cost": 25.00
}
```

**Categories:** `Raw Material`, `Work in Progress`, `Finished Good`

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "product_id",
    "name": "Wood Plank 2x4",
    "sku": "RM-WD-001",
    "description": "High quality wood plank for furniture",
    "unit_of_measure": "PCS",
    "category": "Raw Material",
    "current_stock": 0,
    "reorder_point": 50,
    "standard_cost": 25.00,
    "is_active": true,
    "created_at": "2025-09-20T10:00:00.000Z"
  }
}
```

### 2. Get All Products
**GET** `/api/v1/products`

**Description:** Get all products with optional filtering

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `category`: Filter by category
- `search`: Search in name, SKU, or description

**Example:**
```
GET /api/v1/products?search=wooden&category=Finished Good&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Wooden Table",
      "sku": "FG-TBL-001",
      "category": "Finished Good",
      "standard_cost": 150,
      "current_stock": 10
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 45,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3. Search Products with BOM Details
**GET** `/api/v1/products/search-with-bom`

**Description:** Search products and automatically show BOM components and pricing

**Query Parameters:**
- `search`: Search term (searches name, SKU, description)
- `category`: Filter by category

**Example:**
```
GET /api/v1/products/search-with-bom?search=wooden
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "68cec8db19f9511b1d3d52a0",
      "name": "Wooden Table",
      "sku": "WT001",
      "description": "Beautiful wooden dining table",
      "category": "Finished Good",
      "unit_of_measure": "PCS",
      "standard_cost": 150,
      "current_stock": 0,
      "bom_details": {
        "bom_id": "bom_id_here",
        "version": "1.0",
        "components": [
          {
            "product": "Wood Plank 2x4",
            "sku": "RM-WD-001",
            "quantity_required": 4,
            "unit_cost": 25,
            "total_cost": 100
          },
          {
            "product": "Metal Screws",
            "sku": "RM-SCR-001",
            "quantity_required": 12,
            "unit_cost": 0.5,
            "total_cost": 6
          }
        ],
        "total_material_cost": 106,
        "estimated_selling_price": 137.80
      }
    }
  ],
  "count": 1
}
```

### 4. Get Product by ID
**GET** `/api/v1/products/:id`

**Description:** Get a specific product by ID

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "product_id",
    "name": "Wooden Table",
    "sku": "FG-TBL-001",
    "description": "Beautiful wooden dining table",
    "category": "Finished Good",
    "unit_of_measure": "PCS",
    "standard_cost": 150,
    "current_stock": 0,
    "reorder_point": 5,
    "is_active": true,
    "created_at": "2025-09-20T10:00:00.000Z",
    "updated_at": "2025-09-20T10:00:00.000Z"
  }
}
```

### 5. Update Product
**PUT** `/api/v1/products/:id`

**Description:** Update an existing product

**Headers:** `Authorization: Bearer TOKEN`

**Access:** Admin, Inventory Manager

**Request Body:**
```json
{
  "name": "Updated Wooden Table",
  "description": "Premium wooden dining table",
  "standard_cost": 175.00,
  "reorder_point": 10
}
```

---

## 🔧 BOM (Bill of Materials) Endpoints

### 1. Create BOM
**POST** `/api/v1/boms`

**Description:** Create a new Bill of Materials for a finished product

**Headers:** `Authorization: Bearer TOKEN`

**Access:** Admin, Manufacturing Manager

**Request Body:**
```json
{
  "product": "68cec8db19f9511b1d3d52a0",
  "version": "1.0",
  "components": [
    {
      "component_product": "raw_material_1_id",
      "quantity_required": 4
    },
    {
      "component_product": "raw_material_2_id",
      "quantity_required": 12
    }
  ],
  "description": "Standard wooden table BOM",
  "is_default": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "BOM created successfully",
  "data": {
    "_id": "bom_id",
    "product": "68cec8db19f9511b1d3d52a0",
    "version": "1.0",
    "components": [
      {
        "component_product": "raw_material_1_id",
        "quantity_required": 4,
        "_id": "component_id_1"
      },
      {
        "component_product": "raw_material_2_id",
        "quantity_required": 12,
        "_id": "component_id_2"
      }
    ],
    "description": "Standard wooden table BOM",
    "is_active": true,
    "is_default": true,
    "created_at": "2025-09-20T10:00:00.000Z"
  }
}
```

### 2. Get All BOMs
**GET** `/api/v1/boms`

**Description:** Get all BOMs with filtering options

**Headers:** `Authorization: Bearer TOKEN`

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `product_id`: Filter by product
- `search`: Search term

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "bom_id",
      "product": {
        "_id": "product_id",
        "name": "Wooden Table",
        "sku": "WT001"
      },
      "version": "1.0",
      "components": [...],
      "is_active": true
    }
  ],
  "pagination": {...}
}
```

### 3. Get BOMs for Product
**GET** `/api/v1/boms/product/:productId`

**Description:** Get all BOMs for a specific product

**Headers:** `Authorization: Bearer TOKEN`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "bom_id",
      "version": "1.0",
      "components": [...],
      "is_active": true,
      "is_default": true
    }
  ],
  "count": 1
}
```

---

## 🏭 Manufacturing Order Endpoints

### 1. Create Manufacturing Order (by Product ID)
**POST** `/api/v1/manufacturing-orders`

**Description:** Create a new manufacturing order using product ID. System automatically finds active BOM for the product.

**Headers:** `Authorization: Bearer TOKEN`

**Access:** Admin, Manufacturing Manager

**Request Body:**
```json
{
  "product": "68cec8db19f9511b1d3d52a0",
  "quantity": 5,
  "planned_start_date": "2025-09-21",
  "planned_end_date": "2025-09-25"
}
```

### 1B. Create Manufacturing Order (by Product Name/SKU) - Frontend Friendly
**POST** `/api/v1/manufacturing-orders/by-product-search`

**Description:** Create a new manufacturing order by searching for product by name or SKU. Perfect for frontend where users don't know product IDs.

**Headers:** `Authorization: Bearer TOKEN`

**Access:** Admin, Manufacturing Manager

**Request Body:**
```json
{
  "product_search": "Wooden Table",
  "quantity": 5,
  "planned_start_date": "2025-09-21",
  "planned_end_date": "2025-09-25"
}
```

**Alternative Request (by SKU):**
```json
{
  "product_search": "WT001",
  "quantity": 5,
  "planned_start_date": "2025-09-21",
  "planned_end_date": "2025-09-25"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Manufacturing order created successfully",
  "data": {
    "manufacturing_order": {
      "_id": "mo_id",
      "product": "68cec8db19f9511b1d3d52a0",
      "bom_version": "bom_id",
      "quantity": 5,
      "planned_start_date": "2025-09-21T00:00:00.000Z",
      "planned_end_date": "2025-09-25T00:00:00.000Z",
      "status": "Draft",
      "created_at": "2025-09-20T10:00:00.000Z"
    },
    "product_details": {
      "_id": "68cec8db19f9511b1d3d52a0",
      "name": "Wooden Table",
      "sku": "WT001",
      "category": "Finished Good"
    },
    "bom_details": {
      "bom_id": "bom_id",
      "version": "1.0",
      "components": [
        {
          "product": "Wood Plank 2x4",
          "sku": "RM-WD-001",
          "quantity_required": 20,
          "unit_cost": 25,
          "total_cost": 500
        },
        {
          "product": "Metal Screws",
          "sku": "RM-SCR-001",
          "quantity_required": 60,
          "unit_cost": 0.5,
          "total_cost": 30
        }
      ],
      "total_material_cost": 530
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Manufacturing order created successfully",
  "data": {
    "manufacturing_order": {
      "_id": "mo_id",
      "product": "68cec8db19f9511b1d3d52a0",
      "bom_version": "bom_id",
      "quantity": 5,
      "planned_start_date": "2025-09-21T00:00:00.000Z",
      "planned_end_date": "2025-09-25T00:00:00.000Z",
      "status": "Draft",
      "created_at": "2025-09-20T10:00:00.000Z"
    },
    "bom_details": {
      "bom_id": "bom_id",
      "version": "1.0",
      "components": [
        {
          "product": "Wood Plank 2x4",
          "sku": "RM-WD-001",
          "quantity_required": 20,
          "unit_cost": 25,
          "total_cost": 500
        },
        {
          "product": "Metal Screws",
          "sku": "RM-SCR-001",
          "quantity_required": 60,
          "unit_cost": 0.5,
          "total_cost": 30
        }
      ],
      "total_material_cost": 530
    }
  }
}
```

### 2. Get All Manufacturing Orders
**GET** `/api/v1/manufacturing-orders`

**Description:** Get all manufacturing orders with filtering

**Headers:** `Authorization: Bearer TOKEN`

**Access:** Admin, Manufacturing Manager, Operator

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `status`: Filter by status
- `start_date`: Filter by date range
- `end_date`: Filter by date range

**Example:**
```
GET /api/v1/manufacturing-orders?status=Draft&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Manufacturing orders retrieved successfully",
  "data": [
    {
      "_id": "mo_id",
      "product": {
        "_id": "product_id",
        "name": "Wooden Table",
        "sku": "WT001"
      },
      "quantity": 5,
      "status": "Draft",
      "planned_start_date": "2025-09-21T00:00:00.000Z",
      "planned_end_date": "2025-09-25T00:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### 3. Get Manufacturing Order by ID
**GET** `/api/v1/manufacturing-orders/:id`

**Description:** Get a specific manufacturing order by ID

**Headers:** `Authorization: Bearer TOKEN`

**Access:** Admin, Manufacturing Manager, Operator

**Response:**
```json
{
  "success": true,
  "message": "Manufacturing order retrieved successfully",
  "data": {
    "_id": "mo_id",
    "product": {
      "_id": "product_id",
      "name": "Wooden Table",
      "sku": "WT001"
    },
    "bom_version": {
      "_id": "bom_id",
      "version": "1.0",
      "components": [...]
    },
    "quantity": 5,
    "status": "Draft",
    "planned_start_date": "2025-09-21T00:00:00.000Z",
    "planned_end_date": "2025-09-25T00:00:00.000Z",
    "created_at": "2025-09-20T10:00:00.000Z"
  }
}
```

### 4. Update Manufacturing Order Status
**PATCH** `/api/v1/manufacturing-orders/:id/status`

**Description:** Update the status of a manufacturing order

**Headers:** `Authorization: Bearer TOKEN`

**Access:** Admin, Manufacturing Manager, Operator

**Request Body:**
```json
{
  "status": "In Progress",
  "notes": "Started production on schedule"
}
```

**Status Options:** `Draft`, `Confirmed`, `In Progress`, `Completed`, `Cancelled`

**Response:**
```json
{
  "success": true,
  "message": "Manufacturing order status updated to In Progress",
  "data": {
    "_id": "mo_id",
    "status": "In Progress",
    "updated_at": "2025-09-20T11:00:00.000Z"
  }
}
```

### 5. Get Manufacturing Orders by Status
**GET** `/api/v1/manufacturing-orders/by-status/:status`

**Description:** Get all manufacturing orders with a specific status

**Headers:** `Authorization: Bearer TOKEN`

**Access:** Admin, Manufacturing Manager, Operator

**Example:**
```
GET /api/v1/manufacturing-orders/by-status/Draft
```

**Response:**
```json
{
  "success": true,
  "message": "Manufacturing orders with status 'Draft' retrieved successfully",
  "data": [
    {
      "_id": "mo_id",
      "product": {...},
      "quantity": 5,
      "status": "Draft"
    }
  ]
}
```

---

## 🎯 Frontend Integration Workflow

### Manufacturing Order Creation Flow

**For Frontend Developers - Recommended Approach:**

1. **User searches for product:**
   ```javascript
   // User types in search box: "Wooden"
   const searchResponse = await fetch('/api/v1/products/search-with-bom?search=wooden');
   const products = await searchResponse.json();
   
   // Show dropdown with product names and pricing information
   // User selects: "Wooden Table - $150 (Material Cost: $106)"
   ```

2. **Create manufacturing order directly by product name:**
   ```javascript
   // No need to store product ID, just use the product name
   const orderData = {
     product_search: "Wooden Table", // What user sees and selects
     quantity: 5,
     planned_start_date: "2025-09-21",
     planned_end_date: "2025-09-25"
   };
   
   const response = await fetch('/api/v1/manufacturing-orders/by-product-search', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + token
     },
     body: JSON.stringify(orderData)
   });
   ```

3. **System automatically handles:**
   - ✅ Product lookup by name/SKU
   - ✅ BOM discovery and selection
   - ✅ Material cost calculation
   - ✅ Component requirement calculation

**Benefits for Frontend:**
- No need to manage product IDs
- Users work with familiar product names
- Automatic BOM integration
- Real-time cost calculations
- Better user experience

---

## 📊 Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🚀 Testing Workflow

### Complete Testing Scenario

1. **Register and Login:**
   ```bash
   # Register
   curl -X POST http://localhost:5000/api/v1/auth/register \
   -H "Content-Type: application/json" \
   -d '{"name":"Admin","email":"admin@test.com","password":"Admin123","role":"Admin"}'

   # Login
   curl -X POST http://localhost:5000/api/v1/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"admin@test.com","password":"Admin123"}'
   ```

2. **Create Raw Materials:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/products \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{"name":"Wood Plank","sku":"RM-001","category":"Raw Material","unit_of_measure":"PCS","reorder_point":50,"standard_cost":25}'
   ```

3. **Create Finished Good:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/products \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{"name":"Wooden Table","sku":"FG-001","category":"Finished Good","unit_of_measure":"PCS","reorder_point":5,"standard_cost":150}'
   ```

4. **Create BOM:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/boms \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{"product":"FINISHED_GOOD_ID","components":[{"component_product":"RAW_MATERIAL_ID","quantity_required":4}]}'
   ```

5. **Search Products with BOM:**
   ```bash
   curl -X GET "http://localhost:5000/api/v1/products/search-with-bom?search=wooden" \
   -H "Authorization: Bearer YOUR_TOKEN"
   ```

6. **Create Manufacturing Order (Traditional way with Product ID):**
   ```bash
   curl -X POST http://localhost:5000/api/v1/manufacturing-orders \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{"product":"FINISHED_GOOD_ID","quantity":5,"planned_start_date":"2025-09-21","planned_end_date":"2025-09-25"}'
   ```

7. **Create Manufacturing Order (Frontend Friendly - by Product Name):**
   ```bash
   curl -X POST http://localhost:5000/api/v1/manufacturing-orders/by-product-search \
   -H "Content-Type: application/json" \
   -H "Authorization: Bearer YOUR_TOKEN" \
   -d '{"product_search":"Wooden Table","quantity":5,"planned_start_date":"2025-09-21","planned_end_date":"2025-09-25"}'
   ```

---

## 📝 Notes

- Replace `YOUR_TOKEN` with the actual JWT token received from login
- Replace ID placeholders with actual MongoDB ObjectIds
- All dates should be in ISO format or YYYY-MM-DD
- Manufacturing orders automatically find and use active BOMs for products
- Product search with BOM shows pricing and component breakdown
- System calculates material costs and estimated selling prices automatically

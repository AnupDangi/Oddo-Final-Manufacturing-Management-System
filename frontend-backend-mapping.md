# Frontend-Backend Field Mapping Analysis

## Manufacturing Orders

### Frontend Fields (ManufacturingOrderForm.jsx):
- `reference` (e.g., 'MO-000001') - Auto-generated display reference
- `finishedProduct` - Product name/selection
- `quantity` - Quantity to produce
- `billOfMaterial` - BOM selection
- `assignee` - User assigned to the order
- `scheduleDate` - Planned schedule date
- `status` - Current status ('Draft', 'Confirmed', etc.)
- `workOrders` - Array of associated work orders

### Frontend Fields (DashboardComponent.jsx - manufacturingOrders array):
- `id` - Unique identifier
- `reference` - Display reference
- `product` - Product name
- `startDate` - When to start
- `finishedProduct` - Product name
- `componentStatus` - 'Available' or 'Not Available'
- `quantity` - Amount to produce
- `unit` - Units (e.g., 'Units')
- `status` - Current status
- `state` - Alternative status field
- `priority` - 'High', 'Medium', 'Low'
- `dueDate` - Completion deadline
- `assignee` - Assigned user
- `progress` - Completion percentage
- `description` - Order description
- `bomId` - Associated BOM
- `workCenter` - Work center assignment

### Backend Model (ManufacturingOrderModel.js):
- `product` - ObjectId ref to Product
- `bom_version` - ObjectId ref to BOM
- `quantity` - Number
- `planned_start_date` - Date
- `planned_end_date` - Date
- `actual_start_date` - Date (optional)
- `actual_end_date` - Date (optional)
- `status` - Enum: ['Draft', 'Confirmed', 'In Progress', 'Completed', 'Cancelled']

### Missing Backend Fields for Manufacturing Orders:
- `reference` (auto-generated reference number)
- `assignee` (ObjectId ref to User)
- `priority` (enum: 'Low', 'Medium', 'High')
- `description` (String)
- `work_center` (ObjectId ref to WorkCenter)
- `progress` (Number, 0-100)
- `component_status` (calculated field or enum)

## Work Centers

### Frontend Fields (WorkCenterTableComponent.jsx):
- `id` - Unique identifier
- `name` - Work center name
- `costPerHour` - Hourly cost
- `location` - Physical location
- `capacity` - Capacity description (e.g., '100 units/hour')
- `status` - 'Active' or 'Maintenance'

### Backend Model (WorkCenterModel.js):
- `name` - String (required, unique)
- `description` - String (optional)
- `capacity_per_hour` - Number (required)
- `hourly_rate` - Number (required)
- `is_active` - Boolean (default: true)

### Missing Backend Fields for Work Centers:
- `location` (String)
- `status` (enum: 'Active', 'Maintenance', 'Inactive')

## Work Orders

### Frontend Fields (WorkOrdersComponent.jsx):
- `id` - Unique identifier (e.g., 'WO-001')
- `operation` - Operation name
- `workCenter` - Associated work center
- `finishedProduct` - Final product
- `expectedDuration` - Expected time
- `realDuration` - Actual time taken
- `status` - 'To Do', 'In Progress', 'Done'
- `progress` - Completion percentage
- `manufacturingOrder` - Associated MO

### Frontend Fields (ManufacturingOrderForm.jsx workOrders):
- `id` - Unique identifier
- `operation` - Operation name
- `workCenter` - Work center name
- `duration` - Expected duration
- `realDuration` - Actual duration
- `status` - Current status
- `isTimerRunning` - Boolean for timer state

### Backend Model (WorkOrderModel.js):
- `manufacturing_order` - ObjectId ref to ManufacturingOrder
- `work_center` - ObjectId ref to WorkCenter
- `sequence_number` - Number (required)
- `planned_hours` - Number (required)
- `actual_hours` - Number (optional)
- `status` - Enum: ['Pending', 'In Progress', 'Completed', 'Cancelled']
- `start_time` - Date (optional)
- `end_time` - Date (optional)
- `operator` - ObjectId ref to User (optional)

### Missing Backend Fields for Work Orders:
- `operation` (String) - Operation name/description
- `reference` (String) - Auto-generated reference (e.g., 'WO-001')
- `progress` (Number, 0-100)
- `finished_product` (ObjectId ref to Product) - Can be derived from manufacturing_order

## Stock Ledger

### Frontend Fields (StockLedgerTableComponent.jsx):
- `id` - Unique identifier
- `product` - Product name
- `unitCost` - Cost per unit
- `unit` - Unit of measure
- `totalValue` - Total value of stock
- `onHand` - Current stock quantity
- `freeToUse` - Available quantity
- `incoming` - Incoming quantity
- `outgoing` - Outgoing quantity

### Backend Model (StockLedgerModel.js):
- `product` - ObjectId ref to Product
- `transaction_type` - Enum: ['Receipt', 'Issue', 'Adjustment']
- `quantity` - Number
- `reference_type` - Enum: ['Manufacturing Order', 'Work Order', 'Manual', 'Purchase Order']
- `reference_id` - String
- `unit_cost` - Number

### Issues with Stock Ledger:
The backend model represents individual transactions, but frontend shows aggregated stock levels. Need:
- Aggregation methods in controller
- Current stock calculation logic
- `free_to_use`, `incoming`, `outgoing` calculation methods

## BOM (Bills of Material)

### Frontend Fields (BOMTableComponent.jsx):
- `id` - Unique identifier
- `finishedProduct` - Product name
- `reference` - Reference code (e.g., '[3001]')
- `components` - Array of component materials
- `operations` - Array of operations

### Frontend Form Fields:
- `finishedProduct` - Product selection
- `reference` - Reference number
- `components` - Array with: product, quantity, units
- `operations` - Array with: operation, workCenter, expectedDuration

### Backend Model (BOMModel.js):
- `product` - ObjectId ref to Product
- `version` - String (required)
- `components` - Array of bomItemSchema
  - `component_product` - ObjectId ref to Product
  - `quantity_required` - Number
- `is_active` - Boolean
- `is_default` - Boolean

### Missing Backend Fields for BOM:
- `reference` (String) - Display reference
- `operations` - Array of operation steps (should be separate OperationModel or embedded)

## Products

### Backend Model (ProductModel.js):
- `name` - String (required)
- `description` - String
- `sku` - String (required, unique)
- `unit_of_measure` - String (required)
- `category` - Enum: ['Raw Material', 'Work in Progress', 'Finished Good']
- `current_stock` - Number (default: 0)
- `reorder_point` - Number (required)
- `standard_cost` - Number (required)
- `is_active` - Boolean (default: true)

This model looks complete for current frontend needs.

## Summary of Required Backend Updates:

### 1. ManufacturingOrder Model Updates:
- Add `reference` (String, auto-generated)
- Add `assignee` (ObjectId ref to User)
- Add `priority` (enum: 'Low', 'Medium', 'High')
- Add `description` (String)
- Add `work_center` (ObjectId ref to WorkCenter)
- Add `progress` (Number, 0-100)

### 2. WorkCenter Model Updates:
- Add `location` (String)
- Change `is_active` to `status` (enum: 'Active', 'Maintenance', 'Inactive')

### 3. WorkOrder Model Updates:
- Add `operation` (String)
- Add `reference` (String, auto-generated)
- Add `progress` (Number, 0-100)
- Change status enum to include 'To Do', 'Done'

### 4. BOM Model Updates:
- Add `reference` (String)
- Add operations schema or separate OperationModel

### 5. StockLedger Controller Updates:
- Add aggregation methods for current stock levels
- Add calculated fields for free_to_use, incoming, outgoing

### 6. New API Services Needed:
- WorkCenter CRUD operations
- BOM CRUD operations  
- WorkOrder CRUD operations
- StockLedger aggregation endpoints
- Product CRUD operations
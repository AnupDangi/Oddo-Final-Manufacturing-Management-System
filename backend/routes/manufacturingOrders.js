import express from 'express';
import ManufacturingOrderController from '../controllers/ManufacturingOrderController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Manufacturing Order Routes
 * Base path: /api/manufacturing-orders
 */

// Create manufacturing order - Admin, Manager only
router.post('/', 
  requireRole(['admin', 'manager']), 
  ManufacturingOrderController.createManufacturingOrder
);

// Get all manufacturing orders with filtering - Admin, Manager, Operator
router.get('/', 
  requireRole(['admin', 'manager', 'operator']), 
  ManufacturingOrderController.getAllManufacturingOrders
);

// Search manufacturing orders for dropdown - Admin, Manager, Operator
router.get('/search', 
  requireRole(['admin', 'manager', 'operator']), 
  ManufacturingOrderController.searchForDropdown
);

// Get manufacturing order statistics - Admin, Manager
router.get('/statistics', 
  requireRole(['admin', 'manager']), 
  ManufacturingOrderController.getStatistics
);

// Get manufacturing orders by status - Admin, Manager, Operator
router.get('/by-status/:status', 
  requireRole(['admin', 'manager', 'operator']), 
  ManufacturingOrderController.getByStatus
);

// Get manufacturing order by ID - Admin, Manager, Operator
router.get('/:id', 
  requireRole(['admin', 'manager', 'operator']), 
  ManufacturingOrderController.getManufacturingOrderById
);

// Update manufacturing order - Admin, Manager only
router.put('/:id', 
  requireRole(['admin', 'manager']), 
  ManufacturingOrderController.updateManufacturingOrder
);

// Update manufacturing order status - Admin, Manager, Operator
router.patch('/:id/status', 
  requireRole(['admin', 'manager', 'operator']), 
  ManufacturingOrderController.updateStatus
);

// Cancel manufacturing order - Admin, Manager only
router.patch('/:id/cancel', 
  requireRole(['admin', 'manager']), 
  ManufacturingOrderController.cancelManufacturingOrder
);

// Get material requirements - Admin, Manager, Inventory
router.get('/:id/material-requirements', 
  requireRole(['admin', 'manager', 'inventory']), 
  ManufacturingOrderController.getMaterialRequirements
);

// Check material availability - Admin, Manager, Inventory
router.post('/:id/check-materials', 
  requireRole(['admin', 'manager', 'inventory']), 
  ManufacturingOrderController.checkMaterialAvailability
);

// Generate work orders - Admin, Manager only
router.post('/:id/generate-work-orders', 
  requireRole(['admin', 'manager']), 
  ManufacturingOrderController.generateWorkOrders
);

export default router;
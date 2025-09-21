import express from 'express';
import ManufacturingOrderController from '../controllers/ManufacturingOrderController.js';
import { auth as authenticateToken, authorize as requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Manufacturing Order Routes
 * Base path: /api/manufacturing-orders
 */

// Create manufacturing order - Admin, Manager only
router.post('/', 
  requireRole('Admin', 'Manufacturing Manager'), 
  ManufacturingOrderController.createManufacturingOrder
);

// Create manufacturing order by product search (frontend friendly) - Admin, Manager only
router.post('/by-product-search', 
  requireRole('Admin', 'Manufacturing Manager'), 
  ManufacturingOrderController.createByProductSearch
);

// Get all manufacturing orders with filtering - Admin, Manager, Operator
router.get('/', 
  requireRole('Admin', 'Manufacturing Manager', 'Production Operator'), 
  ManufacturingOrderController.getAllManufacturingOrders
);

// Search manufacturing orders for dropdown - Admin, Manager, Operator
router.get('/search', 
  requireRole('Admin', 'Manufacturing Manager', 'Production Operator'), 
  ManufacturingOrderController.searchForDropdown
);

// Get manufacturing order statistics - Admin, Manager
router.get('/statistics', 
  requireRole('Admin', 'Manufacturing Manager'), 
  ManufacturingOrderController.getStatistics
);

// Get manufacturing orders by status - Admin, Manager, Operator
router.get('/by-status/:status', 
  requireRole('Admin', 'Manufacturing Manager', 'Production Operator'), 
  ManufacturingOrderController.getByStatus
);

// Get manufacturing order by ID - Admin, Manager, Operator
router.get('/:id', 
  requireRole('Admin', 'Manufacturing Manager', 'Production Operator'), 
  ManufacturingOrderController.getManufacturingOrderById
);

// Update manufacturing order - Admin, Manager only
router.put('/:id', 
  requireRole('Admin', 'Manufacturing Manager'), 
  ManufacturingOrderController.updateManufacturingOrder
);

// Update manufacturing order status - Admin, Manager, Operator
router.patch('/:id/status', 
  requireRole('Admin', 'Manufacturing Manager', 'Production Operator'), 
  ManufacturingOrderController.updateStatus
);

// Cancel manufacturing order - Admin, Manager only
router.patch('/:id/cancel', 
  requireRole('Admin', 'Manufacturing Manager'), 
  ManufacturingOrderController.cancelManufacturingOrder
);

// Get material requirements - Admin, Manager, Inventory
router.get('/:id/material-requirements', 
  requireRole('Admin', 'Manufacturing Manager', 'Inventory Manager'), 
  ManufacturingOrderController.getMaterialRequirements
);

// Check material availability - Admin, Manager, Inventory
router.post('/:id/check-materials', 
  requireRole('Admin', 'Manufacturing Manager', 'Inventory Manager'), 
  ManufacturingOrderController.checkMaterialAvailability
);

// Generate work orders - Admin, Manager only
router.post('/:id/generate-work-orders', 
  requireRole('Admin', 'Manufacturing Manager'), 
  ManufacturingOrderController.generateWorkOrders
);

export default router;
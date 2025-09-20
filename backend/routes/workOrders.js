import express from 'express';
import WorkOrderController from '../controllers/WorkOrderController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Work Order Routes
 * Base path: /api/work-orders
 */

// Create work order - Admin, Manager only
router.post('/', 
  requireRole(['admin', 'manager']), 
  WorkOrderController.createWorkOrder
);

// Get all work orders with filtering - Admin, Manager, Operator
router.get('/', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.getAllWorkOrders
);

// Search work orders for dropdown - Admin, Manager, Operator
router.get('/search', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.searchForDropdown
);

// Get work order statistics - Admin, Manager
router.get('/statistics', 
  requireRole(['admin', 'manager']), 
  WorkOrderController.getStatistics
);

// Get work orders by status - Admin, Manager, Operator
router.get('/by-status/:status', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.getByStatus
);

// Get work orders by work center - Admin, Manager, Operator
router.get('/by-work-center/:workCenterId', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.getByWorkCenter
);

// Get work orders by operator - Admin, Manager, Operator (own orders)
router.get('/by-operator/:operatorId', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.getByOperator
);

// Get work order by ID - Admin, Manager, Operator
router.get('/:id', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.getWorkOrderById
);

// Update work order - Admin, Manager only
router.put('/:id', 
  requireRole(['admin', 'manager']), 
  WorkOrderController.updateWorkOrder
);

// Start work order - Admin, Manager, Operator
router.post('/:id/start', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.startWorkOrder
);

// Pause work order - Admin, Manager, Operator
router.post('/:id/pause', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.pauseWorkOrder
);

// Resume work order - Admin, Manager, Operator
router.post('/:id/resume', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.resumeWorkOrder
);

// Complete work order - Admin, Manager, Operator
router.post('/:id/complete', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.completeWorkOrder
);

// Cancel work order - Admin, Manager only
router.patch('/:id/cancel', 
  requireRole(['admin', 'manager']), 
  WorkOrderController.cancelWorkOrder
);

// Log time for work order - Admin, Manager, Operator
router.post('/:id/time-log', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.logTime
);

// Get time logs for work order - Admin, Manager, Operator
router.get('/:id/time-logs', 
  requireRole(['admin', 'manager', 'operator']), 
  WorkOrderController.getTimeLogs
);

export default router;
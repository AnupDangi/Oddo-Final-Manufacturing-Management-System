import express from 'express';
import { WorkOrderController } from '../controllers/WorkOrderController.js';
import { auth, authorize } from '../middlewares/auth.js'; // Assuming you have these

const router = express.Router();

// Get all work orders (accessible to all roles)
router.get('/', auth, WorkOrderController.getAllWorkOrders);

// Get a single work order by ID (accessible to all roles)
router.get('/:id', auth, WorkOrderController.getWorkOrderById);

// Create a new work order (restricted to Admin and Manufacturing Manager)
router.post(
    '/',
    auth,
    authorize('Admin', 'Manufacturing Manager'),
    WorkOrderController.createWorkOrder
);

// Start a work order (accessible to all roles)
router.post(
    '/:id/start',
    auth,
    WorkOrderController.startWorkOrder
);

// Complete a work order (accessible to all roles)
router.post(
    '/:id/complete',
    auth,
    WorkOrderController.completeWorkOrder
);

export default router;
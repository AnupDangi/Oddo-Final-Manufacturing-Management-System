import express from 'express';
import { WorkCenterController } from '../controllers/WorkCenterController.js';
import { auth, authorize } from '../middlewares/auth.js'; // Assuming you have these

const router = express.Router();

// Create a new work center (Admin/Manager only)
router.post(
    '/',
    auth,
    authorize('Admin', 'Manufacturing Manager'),
    WorkCenterController.createWorkCenter
);

// Get all work centers (All authenticated users)
router.get('/', auth, WorkCenterController.getAllWorkCenters);

// Get a single work center by ID (All authenticated users)
router.get('/:id', auth, WorkCenterController.getWorkCenterById);

// Update a work center by ID (Admin/Manager only)
router.put(
    '/:id',
    auth,
    authorize('Admin', 'Manufacturing Manager'),
    WorkCenterController.updateWorkCenter
);

// Deactivate a work center by ID (Admin only)
router.delete(
    '/:id',
    auth,
    authorize('Admin'),
    WorkCenterController.deleteWorkCenter
);

export default router;
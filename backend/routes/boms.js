import express from 'express';
import BOMController from '../controllers/BOMController.js';
import { auth as authenticateToken, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Create BOM - Admin/Manager only
router.post('/', authorize('Admin', 'Manufacturing Manager'), BOMController.createBOM);

// Get all BOMs - All authenticated users
router.get('/', BOMController.getAllBOMs);

// Get BOM statistics - Admin/Manager only
router.get('/statistics', authorize('Admin', 'Manufacturing Manager'), BOMController.getBOMStatistics);

// Get BOMs for a specific product - All authenticated users
router.get('/product/:productId', BOMController.getBOMsByProduct);

// Get default BOM for a product - All authenticated users
router.get('/product/:productId/default', BOMController.getDefaultBOMByProduct);

// Get BOM by ID - All authenticated users
router.get('/:bomId', BOMController.getBOMById);

// Update BOM - Admin/Manager only
router.put('/:bomId', authorize('Admin', 'Manufacturing Manager'), BOMController.updateBOM);

// Delete BOM - Admin only
router.delete('/:bomId', authorize('Admin'), BOMController.deleteBOM);

// Scale BOM for manufacturing quantity - All authenticated users
router.post('/:bomId/scale', BOMController.scaleBOM);

// Calculate BOM cost - Admin/Manager only
router.post('/:bomId/cost', authorize('Admin', 'Manufacturing Manager'), BOMController.calculateBOMCost);

// Clone BOM (create new version) - Admin/Manager only
router.post('/:bomId/clone', authorize('Admin', 'Manufacturing Manager'), BOMController.cloneBOM);

export default router;
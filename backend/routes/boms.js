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

// Get BOM by product - All authenticated users
router.get('/product/:productId', (req, res) => {
  // Filter BOMs by product using the getAllBOMs method
  req.query.product = req.params.productId;
  BOMController.getAllBOMs(req, res);
});

// Get BOM by ID - All authenticated users
router.get('/:id', BOMController.getBOMById);

// Update BOM - Admin/Manager only
router.put('/:id', authorize('Admin', 'Manufacturing Manager'), BOMController.updateBOM);

// Delete BOM - Admin only
router.delete('/:id', authorize('Admin'), BOMController.deleteBOM);

export default router;
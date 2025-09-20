import express from 'express';
import BOMController from '../controllers/BOMController.js';
import { 
  requireAuth, 
  requireAdmin, 
  requireAdminOrManager,
  requireActiveUser,
  authenticateToken
} from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication and active user check to all routes
router.use(authenticateToken);
router.use(requireActiveUser);

// ===== BOM CRUD ROUTES =====

/**
 * @route   POST /api/v1/boms
 * @desc    Create a new BOM
 * @access  Private (Admin/Manager)
 */
router.post('/', requireAdminOrManager, BOMController.createBOM);

/**
 * @route   GET /api/v1/boms
 * @desc    Get all BOMs with pagination and filtering
 * @access  Private (All authenticated users)
 * @query   page, limit, product_id, search, is_active
 */
router.get('/', requireAuth, BOMController.getAllBOMs);

/**
 * @route   GET /api/v1/boms/statistics
 * @desc    Get BOM statistics overview
 * @access  Private (Manager/Admin)
 */
router.get('/statistics', requireAdminOrManager, BOMController.getBOMStatistics);

/**
 * @route   GET /api/v1/boms/product/:productId
 * @desc    Get all BOMs for a specific product
 * @access  Private (All authenticated users)
 */
router.get('/product/:productId', requireAuth, BOMController.getBOMsByProduct);

/**
 * @route   GET /api/v1/boms/product/:productId/default
 * @desc    Get default BOM for a specific product
 * @access  Private (All authenticated users)
 */
router.get('/product/:productId/default', requireAuth, BOMController.getDefaultBOMByProduct);

/**
 * @route   GET /api/v1/boms/:bomId
 * @desc    Get BOM by ID
 * @access  Private (All authenticated users)
 */
router.get('/:bomId', requireAuth, BOMController.getBOMById);

/**
 * @route   PUT /api/v1/boms/:bomId
 * @desc    Update BOM by ID
 * @access  Private (Admin/Manager)
 */
router.put('/:bomId', requireAdminOrManager, BOMController.updateBOM);

/**
 * @route   DELETE /api/v1/boms/:bomId
 * @desc    Deactivate BOM (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:bomId', requireAdmin, BOMController.deleteBOM);

// ===== BOM UTILITY ROUTES =====

/**
 * @route   POST /api/v1/boms/:bomId/scale
 * @desc    Scale BOM components and operations for a specific quantity
 * @access  Private (All authenticated users)
 * @body    { quantity: number }
 */
router.post('/:bomId/scale', requireAuth, BOMController.scaleBOM);

/**
 * @route   POST /api/v1/boms/:bomId/cost
 * @desc    Calculate BOM cost for a specific quantity
 * @access  Private (Manager/Admin)
 * @body    { quantity?: number }
 */
router.post('/:bomId/cost', requireAdminOrManager, BOMController.calculateBOMCost);

/**
 * @route   POST /api/v1/boms/:bomId/clone
 * @desc    Clone BOM to create a new version
 * @access  Private (Admin/Manager)
 * @body    { new_version: string, is_default?: boolean }
 */
router.post('/:bomId/clone', requireAdminOrManager, BOMController.cloneBOM);

// ===== VALIDATION MIDDLEWARE =====

/**
 * Validation middleware for BOM creation/update
 */
const validateBOMData = (req, res, next) => {
  const { product_id, components, operations, version } = req.body;
  const errors = [];

  // Product ID validation (for creation)
  if (req.method === 'POST' && (!product_id || isNaN(product_id) || parseInt(product_id) <= 0)) {
    errors.push('Valid product ID is required');
  }

  // Components validation
  if (components !== undefined) {
    if (!Array.isArray(components)) {
      errors.push('Components must be an array');
    } else if (components.length === 0) {
      errors.push('At least one component is required');
    } else {
      components.forEach((component, index) => {
        if (!component.product_id || isNaN(component.product_id) || parseInt(component.product_id) <= 0) {
          errors.push(`Component ${index + 1}: Valid product_id is required`);
        }
        if (!component.quantity || isNaN(component.quantity) || parseFloat(component.quantity) <= 0) {
          errors.push(`Component ${index + 1}: Valid positive quantity is required`);
        }
      });
    }
  }

  // Operations validation
  if (operations !== undefined) {
    if (!Array.isArray(operations)) {
      errors.push('Operations must be an array');
    } else if (operations.length === 0) {
      errors.push('At least one operation is required');
    } else {
      operations.forEach((operation, index) => {
        if (!operation.operation_name || operation.operation_name.trim().length === 0) {
          errors.push(`Operation ${index + 1}: Operation name is required`);
        }
        if (!operation.duration_minutes || isNaN(operation.duration_minutes) || parseInt(operation.duration_minutes) <= 0) {
          errors.push(`Operation ${index + 1}: Valid positive duration in minutes is required`);
        }
        if (operation.work_center_id && (isNaN(operation.work_center_id) || parseInt(operation.work_center_id) <= 0)) {
          errors.push(`Operation ${index + 1}: Work center ID must be a valid number if provided`);
        }
      });
    }
  }

  // Version validation
  if (version !== undefined && (!version || version.trim().length === 0)) {
    errors.push('Version cannot be empty if provided');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validation middleware for scaling operations
 */
const validateScaleData = (req, res, next) => {
  const { quantity } = req.body;
  const errors = [];

  if (!quantity || isNaN(quantity) || parseFloat(quantity) <= 0) {
    errors.push('Valid positive quantity is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validation middleware for cost calculation
 */
const validateCostData = (req, res, next) => {
  const { quantity } = req.body;
  const errors = [];

  if (quantity !== undefined && (isNaN(quantity) || parseFloat(quantity) <= 0)) {
    errors.push('Quantity must be a positive number if provided');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Validation middleware for cloning
 */
const validateCloneData = (req, res, next) => {
  const { new_version } = req.body;
  const errors = [];

  if (!new_version || new_version.trim().length === 0) {
    errors.push('New version is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Apply validation to relevant routes
router.post('/', validateBOMData);
router.put('/:bomId', validateBOMData);
router.post('/:bomId/scale', validateScaleData);
router.post('/:bomId/cost', validateCostData);
router.post('/:bomId/clone', validateCloneData);

// ===== ROUTE PARAMETER VALIDATION =====

/**
 * Validate BOM ID parameter
 */
const validateBOMId = (req, res, next) => {
  const { bomId } = req.params;
  
  if (!bomId || isNaN(bomId) || parseInt(bomId) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid BOM ID is required'
    });
  }

  req.params.bomId = parseInt(bomId);
  next();
};

/**
 * Validate Product ID parameter
 */
const validateProductId = (req, res, next) => {
  const { productId } = req.params;
  
  if (!productId || isNaN(productId) || parseInt(productId) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid product ID is required'
    });
  }

  req.params.productId = parseInt(productId);
  next();
};

// Apply ID validation to routes that need it
router.get('/product/:productId', validateProductId);
router.get('/product/:productId/default', validateProductId);
router.get('/:bomId', validateBOMId);
router.put('/:bomId', validateBOMId);
router.delete('/:bomId', validateBOMId);
router.post('/:bomId/scale', validateBOMId);
router.post('/:bomId/cost', validateBOMId);
router.post('/:bomId/clone', validateBOMId);

export default router;
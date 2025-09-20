import express from 'express';
import ProductController from '../controllers/ProductController.js';
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

// ===== PRODUCT CRUD ROUTES =====

/**
 * @route   POST /api/v1/products
 * @desc    Create a new product
 * @access  Private (Admin/Manager)
 */
router.post('/', requireAdminOrManager, ProductController.createProduct);

/**
 * @route   GET /api/v1/products
 * @desc    Get all products with pagination and filtering
 * @access  Private (All authenticated users)
 * @query   page, limit, type, category, is_active, search, low_stock
 */
router.get('/', requireAuth, ProductController.getAllProducts);

/**
 * @route   GET /api/v1/products/search
 * @desc    Search products for dropdown/autocomplete
 * @access  Private (All authenticated users)
 * @query   q (search term), type (filter by product type)
 */
router.get('/search', requireAuth, ProductController.searchProducts);

/**
 * @route   GET /api/v1/products/low-stock
 * @desc    Get products below reorder level
 * @access  Private (All authenticated users)
 */
router.get('/low-stock', requireAuth, ProductController.getLowStockProducts);

/**
 * @route   GET /api/v1/products/statistics
 * @desc    Get product statistics overview
 * @access  Private (Manager/Admin)
 */
router.get('/statistics', requireAdminOrManager, ProductController.getProductStatistics);

/**
 * @route   POST /api/v1/products/check-stock
 * @desc    Check stock availability for multiple products
 * @access  Private (All authenticated users)
 * @body    { requirements: [{ product_id: number, required_quantity: number }] }
 */
router.post('/check-stock', requireAuth, ProductController.checkStockAvailability);

/**
 * @route   GET /api/v1/products/type/:type
 * @desc    Get products by type (raw_material, finished_good, semi_finished)
 * @access  Private (All authenticated users)
 */
router.get('/type/:type', requireAuth, ProductController.getProductsByType);

/**
 * @route   GET /api/v1/products/:productId
 * @desc    Get product by ID
 * @access  Private (All authenticated users)
 */
router.get('/:productId', requireAuth, ProductController.getProductById);

/**
 * @route   PUT /api/v1/products/:productId
 * @desc    Update product by ID
 * @access  Private (Admin/Manager)
 */
router.put('/:productId', requireAdminOrManager, ProductController.updateProduct);

/**
 * @route   DELETE /api/v1/products/:productId
 * @desc    Deactivate product (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:productId', requireAdmin, ProductController.deleteProduct);

/**
 * @route   GET /api/v1/products/:productId/stock
 * @desc    Get current stock information for a product
 * @access  Private (All authenticated users)
 */
router.get('/:productId/stock', requireAuth, ProductController.getProductStock);

// ===== VALIDATION MIDDLEWARE =====

/**
 * Validation middleware for product creation/update
 */
const validateProductData = (req, res, next) => {
  const { name, type, unit, reorder_level, cost_price, selling_price } = req.body;
  const errors = [];

  // Name validation
  if (name && name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters long');
  }

  // Type validation
  if (type && !['raw_material', 'finished_good', 'semi_finished'].includes(type)) {
    errors.push('Product type must be raw_material, finished_good, or semi_finished');
  }

  // Unit validation
  if (unit && unit.trim().length < 1) {
    errors.push('Unit is required and cannot be empty');
  }

  // Numeric validations
  if (reorder_level !== undefined && (isNaN(reorder_level) || parseFloat(reorder_level) < 0)) {
    errors.push('Reorder level must be a non-negative number');
  }

  if (cost_price !== undefined && (isNaN(cost_price) || parseFloat(cost_price) < 0)) {
    errors.push('Cost price must be a non-negative number');
  }

  if (selling_price !== undefined && (isNaN(selling_price) || parseFloat(selling_price) < 0)) {
    errors.push('Selling price must be a non-negative number');
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
router.post('/', validateProductData);
router.put('/:productId', validateProductData);

// ===== ROUTE PARAMETER VALIDATION =====

/**
 * Validate product ID parameter
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

// Apply product ID validation to routes that need it
router.get('/:productId', validateProductId);
router.put('/:productId', validateProductId);
router.delete('/:productId', validateProductId);
router.get('/:productId/stock', validateProductId);

/**
 * Validate product type parameter
 */
const validateProductType = (req, res, next) => {
  const { type } = req.params;
  
  if (!['raw_material', 'finished_good', 'semi_finished'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid product type. Must be raw_material, finished_good, or semi_finished'
    });
  }

  next();
};

// Apply type validation to type routes
router.get('/type/:type', validateProductType);

export default router;
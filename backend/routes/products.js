import express from 'express';
import { ProductController } from '../controllers/ProductController.js';
import { auth, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

// Protected routes
router.post(
    '/', // Changed from '/products' to '/'
    auth, 
    authorize('Admin', 'Inventory Manager'), 
    ProductController.createProduct
);
router.post(
    '/bulk', 
    auth, 
    authorize('Admin', 'Inventory Manager'), 
    ProductController.createMultipleProducts
);

router.put(
    '/:id', // Changed from '/products/:id' to '/:id'
    auth, 
    authorize('Admin', 'Inventory Manager'), 
    ProductController.updateProduct
);

router.patch(
    '/:id/stock', // Changed from '/products/:id/stock' to '/:id/stock'
    auth, 
    authorize('Admin', 'Inventory Manager', 'Operator'), 
    ProductController.updateStock
);

router.delete(
    '/:id', // Changed from '/products/:id' to '/:id'
    auth, 
    authorize('Admin'), 
    ProductController.deleteProduct
);

// NOTE: This route needs to be defined BEFORE '/:id' to work correctly
router.get(
    '/inventory/low-stock', 
    auth, 
    authorize('Admin', 'Inventory Manager'), 
    ProductController.getLowStockProducts
);


export default router;
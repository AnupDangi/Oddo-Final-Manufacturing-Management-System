import express from 'express';
import StockLedgerController from '../controllers/StockLedgerController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Stock Ledger Routes
 * Base path: /api/stock-ledger
 */

// Record stock movement - Admin, Manager, Inventory
router.post('/movement', 
  requireRole(['admin', 'manager', 'inventory']), 
  StockLedgerController.recordMovement
);

// Get all stock movements - Admin, Manager, Inventory
router.get('/', 
  requireRole(['admin', 'manager', 'inventory']), 
  StockLedgerController.getAllMovements
);

// Get current stock levels - Admin, Manager, Inventory, Operator
router.get('/stock-levels', 
  requireRole(['admin', 'manager', 'inventory', 'operator']), 
  StockLedgerController.getStockLevels
);

// Get stock valuation - Admin, Manager, Inventory
router.get('/valuation', 
  requireRole(['admin', 'manager', 'inventory']), 
  StockLedgerController.getStockValuation
);

// Get statistics - Admin, Manager, Inventory
router.get('/statistics', 
  requireRole(['admin', 'manager', 'inventory']), 
  StockLedgerController.getStatistics
);

// Get inventory aging report - Admin, Manager, Inventory
router.get('/aging', 
  requireRole(['admin', 'manager', 'inventory']), 
  StockLedgerController.getInventoryAging
);

// Get ABC analysis - Admin, Manager, Inventory
router.get('/abc-analysis', 
  requireRole(['admin', 'manager', 'inventory']), 
  StockLedgerController.getABCAnalysis
);

// Perform stock adjustment - Admin, Manager, Inventory
router.post('/adjustment', 
  requireRole(['admin', 'manager', 'inventory']), 
  StockLedgerController.performStockAdjustment
);

// Transfer stock - Admin, Manager, Inventory
router.post('/transfer', 
  requireRole(['admin', 'manager', 'inventory']), 
  StockLedgerController.transferStock
);

// Consume materials for manufacturing - Admin, Manager, Operator
router.post('/consume', 
  requireRole(['admin', 'manager', 'operator']), 
  StockLedgerController.consumeMaterials
);

// Receive production output - Admin, Manager, Operator
router.post('/receive-production', 
  requireRole(['admin', 'manager', 'operator']), 
  StockLedgerController.receiveProduction
);

// Get stock movements by product - Admin, Manager, Inventory
router.get('/product/:productId', 
  requireRole(['admin', 'manager', 'inventory']), 
  StockLedgerController.getMovementsByProduct
);

// Get audit trail for product - Admin, Manager, Inventory
router.get('/audit/:productId', 
  requireRole(['admin', 'manager', 'inventory']), 
  StockLedgerController.getAuditTrail
);

export default router;
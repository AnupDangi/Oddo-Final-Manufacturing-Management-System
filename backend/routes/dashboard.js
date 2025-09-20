import express from 'express';
import DashboardController from '../controllers/DashboardController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

/**
 * Dashboard Routes
 * Base path: /api/dashboard
 */

// Get main dashboard overview - All roles
router.get('/overview', 
  requireRole(['admin', 'manager', 'operator', 'inventory']), 
  DashboardController.getDashboardOverview
);

// Get real-time status - All roles
router.get('/real-time-status', 
  requireRole(['admin', 'manager', 'operator', 'inventory']), 
  DashboardController.getRealTimeStatus
);

// Get alerts and notifications - All roles
router.get('/alerts', 
  requireRole(['admin', 'manager', 'operator', 'inventory']), 
  DashboardController.getAlerts
);

// Get recent activities - All roles
router.get('/recent-activities', 
  requireRole(['admin', 'manager', 'operator', 'inventory']), 
  DashboardController.getRecentActivities
);

// Get production KPIs - Admin, Manager, Operator
router.get('/production-kpis', 
  requireRole(['admin', 'manager', 'operator']), 
  DashboardController.getProductionKPIs
);

// Get inventory KPIs - Admin, Manager, Inventory
router.get('/inventory-kpis', 
  requireRole(['admin', 'manager', 'inventory']), 
  DashboardController.getInventoryKPIs
);

// Get work center utilization - Admin, Manager, Operator
router.get('/work-center-utilization', 
  requireRole(['admin', 'manager', 'operator']), 
  DashboardController.getWorkCenterUtilization
);

// Get low stock alerts - Admin, Manager, Inventory
router.get('/low-stock-alerts', 
  requireRole(['admin', 'manager', 'inventory']), 
  DashboardController.getLowStockAlerts
);

// Get production schedule - Admin, Manager, Operator
router.get('/production-schedule', 
  requireRole(['admin', 'manager', 'operator']), 
  DashboardController.getProductionSchedule
);

// Get quality metrics - Admin, Manager, Operator
router.get('/quality-metrics', 
  requireRole(['admin', 'manager', 'operator']), 
  DashboardController.getQualityMetrics
);

// Get cost analytics - Admin, Manager only
router.get('/cost-analytics', 
  requireRole(['admin', 'manager']), 
  DashboardController.getCostAnalytics
);

// Get efficiency trends - Admin, Manager, Operator
router.get('/efficiency-trends', 
  requireRole(['admin', 'manager', 'operator']), 
  DashboardController.getEfficiencyTrends
);

// Get operator performance - Admin, Manager only
router.get('/operator-performance', 
  requireRole(['admin', 'manager']), 
  DashboardController.getOperatorPerformance
);

// Get top products analysis - Admin, Manager, Inventory
router.get('/top-products', 
  requireRole(['admin', 'manager', 'inventory']), 
  DashboardController.getTopProducts
);

export default router;
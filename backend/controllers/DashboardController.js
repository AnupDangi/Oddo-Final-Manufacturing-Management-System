import DashboardModel from '../models/DashboardModel.js';

/**
 * Dashboard Controller
 * Handles real-time KPIs, manufacturing status overview, and analytics
 */

class DashboardController {
  /**
   * Get main dashboard overview
   * GET /api/dashboard/overview
   * Access: Admin, Manager, Operator, Inventory
   */
  static async getDashboardOverview(req, res) {
    try {
      const { date_range = '30' } = req.query; // days

      const overview = await DashboardModel.getOverview(parseInt(date_range));

      res.json({
        success: true,
        message: 'Dashboard overview retrieved successfully',
        data: overview
      });
    } catch (error) {
      console.error('Get dashboard overview error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve dashboard overview',
        error: error.message
      });
    }
  }

  /**
   * Get production KPIs
   * GET /api/dashboard/production-kpis
   * Access: Admin, Manager, Operator
   */
  static async getProductionKPIs(req, res) {
    try {
      const { 
        start_date = null, 
        end_date = null,
        work_center_id = null
      } = req.query;

      const options = {
        start_date,
        end_date,
        work_center_id: work_center_id ? parseInt(work_center_id) : null
      };

      const kpis = await DashboardModel.getProductionKPIs(options);

      res.json({
        success: true,
        message: 'Production KPIs retrieved successfully',
        data: kpis
      });
    } catch (error) {
      console.error('Get production KPIs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve production KPIs',
        error: error.message
      });
    }
  }

  /**
   * Get inventory KPIs
   * GET /api/dashboard/inventory-kpis
   * Access: Admin, Manager, Inventory
   */
  static async getInventoryKPIs(req, res) {
    try {
      const { 
        product_type = null,
        category = null
      } = req.query;

      const options = {
        product_type,
        category
      };

      const kpis = await DashboardModel.getInventoryKPIs(options);

      res.json({
        success: true,
        message: 'Inventory KPIs retrieved successfully',
        data: kpis
      });
    } catch (error) {
      console.error('Get inventory KPIs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory KPIs',
        error: error.message
      });
    }
  }

  /**
   * Get work center utilization
   * GET /api/dashboard/work-center-utilization
   * Access: Admin, Manager, Operator
   */
  static async getWorkCenterUtilization(req, res) {
    try {
      const { 
        start_date = null, 
        end_date = null,
        work_center_id = null
      } = req.query;

      const options = {
        start_date,
        end_date,
        work_center_id: work_center_id ? parseInt(work_center_id) : null
      };

      const utilization = await DashboardModel.getWorkCenterUtilization(options);

      res.json({
        success: true,
        message: 'Work center utilization retrieved successfully',
        data: utilization
      });
    } catch (error) {
      console.error('Get work center utilization error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve work center utilization',
        error: error.message
      });
    }
  }

  /**
   * Get recent activities feed
   * GET /api/dashboard/recent-activities
   * Access: Admin, Manager, Operator, Inventory
   */
  static async getRecentActivities(req, res) {
    try {
      const { 
        limit = 20,
        activity_types = null // comma-separated list
      } = req.query;

      const options = {
        limit: parseInt(limit),
        activity_types: activity_types ? activity_types.split(',') : null
      };

      const activities = await DashboardModel.getRecentActivities(options);

      res.json({
        success: true,
        message: 'Recent activities retrieved successfully',
        data: activities
      });
    } catch (error) {
      console.error('Get recent activities error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve recent activities',
        error: error.message
      });
    }
  }

  /**
   * Get low stock alerts
   * GET /api/dashboard/low-stock-alerts
   * Access: Admin, Manager, Inventory
   */
  static async getLowStockAlerts(req, res) {
    try {
      const { 
        threshold_multiplier = 1, // multiplier for reorder level
        product_type = null
      } = req.query;

      const options = {
        threshold_multiplier: parseFloat(threshold_multiplier),
        product_type
      };

      const alerts = await DashboardModel.getLowStockAlerts(options);

      res.json({
        success: true,
        message: 'Low stock alerts retrieved successfully',
        data: alerts
      });
    } catch (error) {
      console.error('Get low stock alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve low stock alerts',
        error: error.message
      });
    }
  }

  /**
   * Get production schedule
   * GET /api/dashboard/production-schedule
   * Access: Admin, Manager, Operator
   */
  static async getProductionSchedule(req, res) {
    try {
      const { 
        days_ahead = 7,
        work_center_id = null,
        status = null
      } = req.query;

      const options = {
        days_ahead: parseInt(days_ahead),
        work_center_id: work_center_id ? parseInt(work_center_id) : null,
        status
      };

      const schedule = await DashboardModel.getProductionSchedule(options);

      res.json({
        success: true,
        message: 'Production schedule retrieved successfully',
        data: schedule
      });
    } catch (error) {
      console.error('Get production schedule error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve production schedule',
        error: error.message
      });
    }
  }

  /**
   * Get quality metrics
   * GET /api/dashboard/quality-metrics
   * Access: Admin, Manager, Operator
   */
  static async getQualityMetrics(req, res) {
    try {
      const { 
        start_date = null, 
        end_date = null,
        product_id = null
      } = req.query;

      const options = {
        start_date,
        end_date,
        product_id: product_id ? parseInt(product_id) : null
      };

      const metrics = await DashboardModel.getQualityMetrics(options);

      res.json({
        success: true,
        message: 'Quality metrics retrieved successfully',
        data: metrics
      });
    } catch (error) {
      console.error('Get quality metrics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve quality metrics',
        error: error.message
      });
    }
  }

  /**
   * Get cost analytics
   * GET /api/dashboard/cost-analytics
   * Access: Admin, Manager
   */
  static async getCostAnalytics(req, res) {
    try {
      const { 
        start_date = null, 
        end_date = null,
        cost_type = 'all' // 'material', 'labor', 'overhead', 'all'
      } = req.query;

      const options = {
        start_date,
        end_date,
        cost_type
      };

      const analytics = await DashboardModel.getCostAnalytics(options);

      res.json({
        success: true,
        message: 'Cost analytics retrieved successfully',
        data: analytics
      });
    } catch (error) {
      console.error('Get cost analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve cost analytics',
        error: error.message
      });
    }
  }

  /**
   * Get efficiency trends
   * GET /api/dashboard/efficiency-trends
   * Access: Admin, Manager, Operator
   */
  static async getEfficiencyTrends(req, res) {
    try {
      const { 
        period = 'daily', // 'daily', 'weekly', 'monthly'
        days_back = 30,
        work_center_id = null
      } = req.query;

      const options = {
        period,
        days_back: parseInt(days_back),
        work_center_id: work_center_id ? parseInt(work_center_id) : null
      };

      const trends = await DashboardModel.getEfficiencyTrends(options);

      res.json({
        success: true,
        message: 'Efficiency trends retrieved successfully',
        data: trends
      });
    } catch (error) {
      console.error('Get efficiency trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve efficiency trends',
        error: error.message
      });
    }
  }

  /**
   * Get operator performance
   * GET /api/dashboard/operator-performance
   * Access: Admin, Manager
   */
  static async getOperatorPerformance(req, res) {
    try {
      const { 
        start_date = null, 
        end_date = null,
        operator_id = null,
        metric = 'efficiency' // 'efficiency', 'quality', 'output'
      } = req.query;

      const options = {
        start_date,
        end_date,
        operator_id: operator_id ? parseInt(operator_id) : null,
        metric
      };

      const performance = await DashboardModel.getOperatorPerformance(options);

      res.json({
        success: true,
        message: 'Operator performance retrieved successfully',
        data: performance
      });
    } catch (error) {
      console.error('Get operator performance error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve operator performance',
        error: error.message
      });
    }
  }

  /**
   * Get top products analysis
   * GET /api/dashboard/top-products
   * Access: Admin, Manager, Inventory
   */
  static async getTopProducts(req, res) {
    try {
      const { 
        metric = 'production', // 'production', 'consumption', 'value'
        period_days = 30,
        limit = 10
      } = req.query;

      const options = {
        metric,
        period_days: parseInt(period_days),
        limit: parseInt(limit)
      };

      const topProducts = await DashboardModel.getTopProducts(options);

      res.json({
        success: true,
        message: 'Top products analysis retrieved successfully',
        data: topProducts
      });
    } catch (error) {
      console.error('Get top products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve top products analysis',
        error: error.message
      });
    }
  }

  /**
   * Get real-time status
   * GET /api/dashboard/real-time-status
   * Access: Admin, Manager, Operator, Inventory
   */
  static async getRealTimeStatus(req, res) {
    try {
      const status = await DashboardModel.getRealTimeStatus();

      res.json({
        success: true,
        message: 'Real-time status retrieved successfully',
        data: status
      });
    } catch (error) {
      console.error('Get real-time status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve real-time status',
        error: error.message
      });
    }
  }

  /**
   * Get alerts and notifications
   * GET /api/dashboard/alerts
   * Access: Admin, Manager, Operator, Inventory
   */
  static async getAlerts(req, res) {
    try {
      const { 
        severity = null, // 'low', 'medium', 'high', 'critical'
        category = null, // 'inventory', 'production', 'quality', 'maintenance'
        limit = 50
      } = req.query;

      const options = {
        severity,
        category,
        limit: parseInt(limit)
      };

      const alerts = await DashboardModel.getAlerts(options);

      res.json({
        success: true,
        message: 'Alerts retrieved successfully',
        data: alerts
      });
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve alerts',
        error: error.message
      });
    }
  }
}

export default DashboardController;
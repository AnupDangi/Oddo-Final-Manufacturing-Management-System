import StockLedgerModel from '../models/StockLedgerModel.js';

/**
 * Stock Ledger Controller
 * Handles inventory movements, stock tracking, and inventory reports
 */

class StockLedgerController {
  /**
   * Record stock movement (in/out)
   * POST /api/stock-ledger/movement
   * Required: product_id, movement_type, quantity
   * Access: Admin, Manager, Inventory
   */
  static async recordMovement(req, res) {
    try {
      const { 
        product_id, 
        movement_type, 
        quantity, 
        reference_type = null,
        reference_id = null,
        reason,
        notes 
      } = req.body;

      // Validation
      if (!product_id || !movement_type || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Product ID, movement type, and quantity are required'
        });
      }

      if (!['in', 'out'].includes(movement_type)) {
        return res.status(400).json({
          success: false,
          message: 'Movement type must be "in" or "out"'
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      const movementData = {
        product_id: parseInt(product_id),
        movement_type,
        quantity: parseFloat(quantity),
        reference_type,
        reference_id: reference_id ? parseInt(reference_id) : null,
        reason,
        notes,
        recorded_by: req.user.user_id
      };

      const movement = await StockLedgerModel.recordMovement(movementData);

      res.status(201).json({
        success: true,
        message: 'Stock movement recorded successfully',
        data: movement
      });
    } catch (error) {
      console.error('Record movement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to record stock movement',
        error: error.message
      });
    }
  }

  /**
   * Get all stock movements with filtering and pagination
   * GET /api/stock-ledger
   * Access: Admin, Manager, Inventory
   */
  static async getAllMovements(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        product_id = null,
        movement_type = null,
        reference_type = null,
        start_date = null,
        end_date = null
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        product_id: product_id ? parseInt(product_id) : null,
        movement_type,
        reference_type,
        start_date,
        end_date
      };

      const result = await StockLedgerModel.findAll(options);

      res.json({
        success: true,
        message: 'Stock movements retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get movements error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve stock movements',
        error: error.message
      });
    }
  }

  /**
   * Get stock movements by product
   * GET /api/stock-ledger/product/:productId
   * Access: Admin, Manager, Inventory
   */
  static async getMovementsByProduct(req, res) {
    try {
      const { productId } = req.params;
      const { start_date, end_date, movement_type } = req.query;

      const options = {
        start_date,
        end_date,
        movement_type
      };

      const movements = await StockLedgerModel.getByProduct(parseInt(productId), options);

      res.json({
        success: true,
        message: 'Product stock movements retrieved successfully',
        data: movements
      });
    } catch (error) {
      console.error('Get movements by product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product stock movements',
        error: error.message
      });
    }
  }

  /**
   * Get current stock levels for all products
   * GET /api/stock-ledger/stock-levels
   * Access: Admin, Manager, Inventory, Operator
   */
  static async getStockLevels(req, res) {
    try {
      const { 
        product_type = null, 
        low_stock = false,
        category = null
      } = req.query;

      const options = {
        product_type,
        low_stock: low_stock === 'true',
        category
      };

      const stockLevels = await StockLedgerModel.getCurrentStockLevels(options);

      res.json({
        success: true,
        message: 'Current stock levels retrieved successfully',
        data: stockLevels
      });
    } catch (error) {
      console.error('Get stock levels error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve stock levels',
        error: error.message
      });
    }
  }

  /**
   * Get stock valuation report
   * GET /api/stock-ledger/valuation
   * Access: Admin, Manager, Inventory
   */
  static async getStockValuation(req, res) {
    try {
      const { 
        product_type = null,
        category = null,
        as_of_date = null
      } = req.query;

      const options = {
        product_type,
        category,
        as_of_date
      };

      const valuation = await StockLedgerModel.getStockValuation(options);

      res.json({
        success: true,
        message: 'Stock valuation retrieved successfully',
        data: valuation
      });
    } catch (error) {
      console.error('Get stock valuation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve stock valuation',
        error: error.message
      });
    }
  }

  /**
   * Perform stock adjustment
   * POST /api/stock-ledger/adjustment
   * Required: product_id, adjustment_quantity, reason
   * Access: Admin, Manager, Inventory
   */
  static async performStockAdjustment(req, res) {
    try {
      const { 
        product_id, 
        adjustment_quantity, 
        reason, 
        notes 
      } = req.body;

      // Validation
      if (!product_id || adjustment_quantity === undefined || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Product ID, adjustment quantity, and reason are required'
        });
      }

      if (adjustment_quantity === 0) {
        return res.status(400).json({
          success: false,
          message: 'Adjustment quantity cannot be zero'
        });
      }

      const adjustmentData = {
        product_id: parseInt(product_id),
        adjustment_quantity: parseFloat(adjustment_quantity),
        reason,
        notes,
        adjusted_by: req.user.user_id
      };

      const adjustment = await StockLedgerModel.performAdjustment(adjustmentData);

      res.status(201).json({
        success: true,
        message: 'Stock adjustment performed successfully',
        data: adjustment
      });
    } catch (error) {
      console.error('Stock adjustment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to perform stock adjustment',
        error: error.message
      });
    }
  }

  /**
   * Transfer stock between locations (if applicable)
   * POST /api/stock-ledger/transfer
   * Required: product_id, from_location, to_location, quantity
   * Access: Admin, Manager, Inventory
   */
  static async transferStock(req, res) {
    try {
      const { 
        product_id, 
        from_location, 
        to_location, 
        quantity, 
        notes 
      } = req.body;

      // Validation
      if (!product_id || !from_location || !to_location || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Product ID, from location, to location, and quantity are required'
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      if (from_location === to_location) {
        return res.status(400).json({
          success: false,
          message: 'From and to locations cannot be the same'
        });
      }

      const transferData = {
        product_id: parseInt(product_id),
        from_location,
        to_location,
        quantity: parseFloat(quantity),
        notes,
        transferred_by: req.user.user_id
      };

      const transfer = await StockLedgerModel.transferStock(transferData);

      res.status(201).json({
        success: true,
        message: 'Stock transfer completed successfully',
        data: transfer
      });
    } catch (error) {
      console.error('Stock transfer error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to transfer stock',
        error: error.message
      });
    }
  }

  /**
   * Get inventory aging report
   * GET /api/stock-ledger/aging
   * Access: Admin, Manager, Inventory
   */
  static async getInventoryAging(req, res) {
    try {
      const { 
        product_type = null,
        category = null,
        aging_periods = '30,60,90' 
      } = req.query;

      const periods = aging_periods.split(',').map(p => parseInt(p.trim()));

      const options = {
        product_type,
        category,
        aging_periods: periods
      };

      const aging = await StockLedgerModel.getInventoryAging(options);

      res.json({
        success: true,
        message: 'Inventory aging report retrieved successfully',
        data: aging
      });
    } catch (error) {
      console.error('Get inventory aging error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory aging report',
        error: error.message
      });
    }
  }

  /**
   * Get ABC analysis (inventory classification)
   * GET /api/stock-ledger/abc-analysis
   * Access: Admin, Manager, Inventory
   */
  static async getABCAnalysis(req, res) {
    try {
      const { 
        analysis_period = 90,
        classification_basis = 'value' // 'value' or 'quantity'
      } = req.query;

      const options = {
        analysis_period: parseInt(analysis_period),
        classification_basis
      };

      const abcAnalysis = await StockLedgerModel.getABCAnalysis(options);

      res.json({
        success: true,
        message: 'ABC analysis retrieved successfully',
        data: abcAnalysis
      });
    } catch (error) {
      console.error('Get ABC analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve ABC analysis',
        error: error.message
      });
    }
  }

  /**
   * Consume materials for manufacturing order
   * POST /api/stock-ledger/consume
   * Required: mo_id, consumption_details
   * Access: Admin, Manager, Operator
   */
  static async consumeMaterials(req, res) {
    try {
      const { 
        mo_id, 
        consumption_details, // [{ product_id, quantity_consumed }]
        notes 
      } = req.body;

      // Validation
      if (!mo_id || !consumption_details || !Array.isArray(consumption_details)) {
        return res.status(400).json({
          success: false,
          message: 'Manufacturing Order ID and consumption details are required'
        });
      }

      if (consumption_details.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'At least one consumption entry is required'
        });
      }

      const consumptionData = {
        mo_id: parseInt(mo_id),
        consumption_details,
        notes,
        consumed_by: req.user.user_id
      };

      const consumption = await StockLedgerModel.consumeMaterials(consumptionData);

      res.status(201).json({
        success: true,
        message: 'Materials consumed successfully',
        data: consumption
      });
    } catch (error) {
      console.error('Consume materials error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to consume materials',
        error: error.message
      });
    }
  }

  /**
   * Receive production output
   * POST /api/stock-ledger/receive-production
   * Required: mo_id, product_id, quantity_produced
   * Access: Admin, Manager, Operator
   */
  static async receiveProduction(req, res) {
    try {
      const { 
        mo_id, 
        product_id, 
        quantity_produced, 
        quality_status = 'passed',
        notes 
      } = req.body;

      // Validation
      if (!mo_id || !product_id || !quantity_produced) {
        return res.status(400).json({
          success: false,
          message: 'Manufacturing Order ID, product ID, and quantity produced are required'
        });
      }

      if (quantity_produced <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity produced must be greater than 0'
        });
      }

      if (!['passed', 'failed', 'rework'].includes(quality_status)) {
        return res.status(400).json({
          success: false,
          message: 'Quality status must be passed, failed, or rework'
        });
      }

      const productionData = {
        mo_id: parseInt(mo_id),
        product_id: parseInt(product_id),
        quantity_produced: parseFloat(quantity_produced),
        quality_status,
        notes,
        received_by: req.user.user_id
      };

      const production = await StockLedgerModel.receiveProduction(productionData);

      res.status(201).json({
        success: true,
        message: 'Production output received successfully',
        data: production
      });
    } catch (error) {
      console.error('Receive production error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to receive production output',
        error: error.message
      });
    }
  }

  /**
   * Get stock movement history for audit
   * GET /api/stock-ledger/audit/:productId
   * Access: Admin, Manager, Inventory
   */
  static async getAuditTrail(req, res) {
    try {
      const { productId } = req.params;
      const { start_date, end_date } = req.query;

      const options = {
        start_date,
        end_date
      };

      const auditTrail = await StockLedgerModel.getAuditTrail(parseInt(productId), options);

      res.json({
        success: true,
        message: 'Audit trail retrieved successfully',
        data: auditTrail
      });
    } catch (error) {
      console.error('Get audit trail error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve audit trail',
        error: error.message
      });
    }
  }

  /**
   * Get stock ledger statistics
   * GET /api/stock-ledger/statistics
   * Access: Admin, Manager, Inventory
   */
  static async getStatistics(req, res) {
    try {
      const { start_date, end_date } = req.query;

      const options = {
        start_date,
        end_date
      };

      const statistics = await StockLedgerModel.getStatistics(options);

      res.json({
        success: true,
        message: 'Stock ledger statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve stock ledger statistics',
        error: error.message
      });
    }
  }
}

export default StockLedgerController;
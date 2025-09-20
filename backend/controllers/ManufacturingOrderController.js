import ManufacturingOrderModel from '../models/ManufacturingOrderModel.js';

/**
 * Manufacturing Order Controller
 * Handles manufacturing order lifecycle, BOM integration, and production planning
 */

class ManufacturingOrderController {
  /**
   * Create a new manufacturing order
   * POST /api/manufacturing-orders
   * Required: product_id, quantity, priority
   * Access: Admin, Manager
   */
  static async createManufacturingOrder(req, res) {
    try {
      const { 
        product_id, 
        quantity, 
        planned_start_date, 
        planned_end_date, 
        priority = 'medium', 
        notes 
      } = req.body;

      // Validation
      if (!product_id || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Product ID and quantity are required'
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be low, medium, high, or urgent'
        });
      }

      const manufacturingOrderData = {
        product_id,
        quantity: parseFloat(quantity),
        planned_start_date,
        planned_end_date,
        priority,
        notes,
        created_by: req.user.user_id
      };

      const manufacturingOrder = await ManufacturingOrderModel.create(manufacturingOrderData);

      res.status(201).json({
        success: true,
        message: 'Manufacturing order created successfully',
        data: manufacturingOrder
      });
    } catch (error) {
      console.error('Create manufacturing order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create manufacturing order',
        error: error.message
      });
    }
  }

  /**
   * Get all manufacturing orders with filtering and pagination
   * GET /api/manufacturing-orders
   * Access: Admin, Manager, Operator
   */
  static async getAllManufacturingOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        priority = null,
        product_id = null,
        created_by = null,
        start_date = null,
        end_date = null
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        priority,
        product_id: product_id ? parseInt(product_id) : null,
        created_by: created_by ? parseInt(created_by) : null,
        start_date,
        end_date
      };

      const result = await ManufacturingOrderModel.findAll(options);

      res.json({
        success: true,
        message: 'Manufacturing orders retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get manufacturing orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve manufacturing orders',
        error: error.message
      });
    }
  }

  /**
   * Get manufacturing order by ID with components and work orders
   * GET /api/manufacturing-orders/:id
   * Access: Admin, Manager, Operator
   */
  static async getManufacturingOrderById(req, res) {
    try {
      const { id } = req.params;

      const manufacturingOrder = await ManufacturingOrderModel.findById(parseInt(id));

      if (!manufacturingOrder) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found'
        });
      }

      res.json({
        success: true,
        message: 'Manufacturing order retrieved successfully',
        data: manufacturingOrder
      });
    } catch (error) {
      console.error('Get manufacturing order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve manufacturing order',
        error: error.message
      });
    }
  }

  /**
   * Update manufacturing order
   * PUT /api/manufacturing-orders/:id
   * Access: Admin, Manager
   */
  static async updateManufacturingOrder(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Prevent certain fields from being updated
      const restrictedFields = ['mo_id', 'created_by', 'created_at'];
      restrictedFields.forEach(field => delete updateData[field]);

      // Validate priority if provided
      if (updateData.priority && !['low', 'medium', 'high', 'urgent'].includes(updateData.priority)) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be low, medium, high, or urgent'
        });
      }

      // Validate status if provided
      if (updateData.status && !['planned', 'released', 'in_progress', 'completed', 'cancelled'].includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const updatedManufacturingOrder = await ManufacturingOrderModel.update(parseInt(id), updateData);

      if (!updatedManufacturingOrder) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found'
        });
      }

      res.json({
        success: true,
        message: 'Manufacturing order updated successfully',
        data: updatedManufacturingOrder
      });
    } catch (error) {
      console.error('Update manufacturing order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update manufacturing order',
        error: error.message
      });
    }
  }

  /**
   * Update manufacturing order status
   * PATCH /api/manufacturing-orders/:id/status
   * Access: Admin, Manager, Operator
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      if (!['planned', 'released', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const updatedManufacturingOrder = await ManufacturingOrderModel.updateStatus(
        parseInt(id), 
        status, 
        req.user.user_id,
        notes
      );

      if (!updatedManufacturingOrder) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found'
        });
      }

      res.json({
        success: true,
        message: `Manufacturing order status updated to ${status}`,
        data: updatedManufacturingOrder
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update manufacturing order status',
        error: error.message
      });
    }
  }

  /**
   * Get material requirements for manufacturing order
   * GET /api/manufacturing-orders/:id/material-requirements
   * Access: Admin, Manager, Inventory
   */
  static async getMaterialRequirements(req, res) {
    try {
      const { id } = req.params;

      const requirements = await ManufacturingOrderModel.getMaterialRequirements(parseInt(id));

      if (!requirements) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found or no BOM available'
        });
      }

      res.json({
        success: true,
        message: 'Material requirements calculated successfully',
        data: requirements
      });
    } catch (error) {
      console.error('Get material requirements error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate material requirements',
        error: error.message
      });
    }
  }

  /**
   * Check material availability for manufacturing order
   * POST /api/manufacturing-orders/:id/check-materials
   * Access: Admin, Manager, Inventory
   */
  static async checkMaterialAvailability(req, res) {
    try {
      const { id } = req.params;

      const availability = await ManufacturingOrderModel.checkMaterialAvailability(parseInt(id));

      if (!availability) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found or no BOM available'
        });
      }

      res.json({
        success: true,
        message: 'Material availability checked successfully',
        data: availability
      });
    } catch (error) {
      console.error('Check material availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check material availability',
        error: error.message
      });
    }
  }

  /**
   * Generate work orders for manufacturing order
   * POST /api/manufacturing-orders/:id/generate-work-orders
   * Access: Admin, Manager
   */
  static async generateWorkOrders(req, res) {
    try {
      const { id } = req.params;
      const { work_center_assignments } = req.body;

      const workOrders = await ManufacturingOrderModel.generateWorkOrders(
        parseInt(id), 
        work_center_assignments,
        req.user.user_id
      );

      res.status(201).json({
        success: true,
        message: 'Work orders generated successfully',
        data: workOrders
      });
    } catch (error) {
      console.error('Generate work orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate work orders',
        error: error.message
      });
    }
  }

  /**
   * Get manufacturing orders by status
   * GET /api/manufacturing-orders/by-status/:status
   * Access: Admin, Manager, Operator
   */
  static async getByStatus(req, res) {
    try {
      const { status } = req.params;

      if (!['planned', 'released', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const manufacturingOrders = await ManufacturingOrderModel.getByStatus(status);

      res.json({
        success: true,
        message: `Manufacturing orders with status '${status}' retrieved successfully`,
        data: manufacturingOrders
      });
    } catch (error) {
      console.error('Get by status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve manufacturing orders by status',
        error: error.message
      });
    }
  }

  /**
   * Get manufacturing order statistics
   * GET /api/manufacturing-orders/statistics
   * Access: Admin, Manager
   */
  static async getStatistics(req, res) {
    try {
      const { start_date, end_date } = req.query;

      const statistics = await ManufacturingOrderModel.getStatistics(start_date, end_date);

      res.json({
        success: true,
        message: 'Manufacturing order statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve manufacturing order statistics',
        error: error.message
      });
    }
  }

  /**
   * Cancel manufacturing order
   * PATCH /api/manufacturing-orders/:id/cancel
   * Access: Admin, Manager
   */
  static async cancelManufacturingOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const cancelledOrder = await ManufacturingOrderModel.cancel(
        parseInt(id), 
        req.user.user_id,
        reason
      );

      if (!cancelledOrder) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found or cannot be cancelled'
        });
      }

      res.json({
        success: true,
        message: 'Manufacturing order cancelled successfully',
        data: cancelledOrder
      });
    } catch (error) {
      console.error('Cancel manufacturing order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel manufacturing order',
        error: error.message
      });
    }
  }

  /**
   * Search manufacturing orders for dropdown/autocomplete
   * GET /api/manufacturing-orders/search
   * Access: Admin, Manager, Operator
   */
  static async searchForDropdown(req, res) {
    try {
      const { search, status, limit = 50 } = req.query;

      const manufacturingOrders = await ManufacturingOrderModel.searchForDropdown(search, status, parseInt(limit));

      res.json({
        success: true,
        message: 'Manufacturing orders search completed',
        data: manufacturingOrders
      });
    } catch (error) {
      console.error('Search manufacturing orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search manufacturing orders',
        error: error.message
      });
    }
  }
}

export default ManufacturingOrderController;
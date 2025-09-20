import WorkOrderModel from '../models/WorkOrderModel.js';

/**
 * Work Order Controller
 * Handles work order execution, time tracking, and operator management
 */

class WorkOrderController {
  /**
   * Create a new work order
   * POST /api/work-orders
   * Required: mo_id, work_center_id, operation
   * Access: Admin, Manager
   */
  static async createWorkOrder(req, res) {
    try {
      const { 
        mo_id, 
        work_center_id, 
        operation, 
        sequence = 1,
        planned_quantity,
        estimated_hours,
        notes 
      } = req.body;

      // Validation
      if (!mo_id || !work_center_id || !operation) {
        return res.status(400).json({
          success: false,
          message: 'Manufacturing Order ID, Work Center ID, and operation are required'
        });
      }

      if (planned_quantity && planned_quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Planned quantity must be greater than 0'
        });
      }

      const workOrderData = {
        mo_id: parseInt(mo_id),
        work_center_id: parseInt(work_center_id),
        operation,
        sequence: parseInt(sequence),
        planned_quantity: planned_quantity ? parseFloat(planned_quantity) : null,
        estimated_hours: estimated_hours ? parseFloat(estimated_hours) : null,
        notes,
        created_by: req.user.user_id
      };

      const workOrder = await WorkOrderModel.create(workOrderData);

      res.status(201).json({
        success: true,
        message: 'Work order created successfully',
        data: workOrder
      });
    } catch (error) {
      console.error('Create work order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create work order',
        error: error.message
      });
    }
  }

  /**
   * Get all work orders with filtering and pagination
   * GET /api/work-orders
   * Access: Admin, Manager, Operator
   */
  static async getAllWorkOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status = null,
        mo_id = null,
        work_center_id = null,
        operator_id = null,
        operation = null,
        start_date = null,
        end_date = null
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        mo_id: mo_id ? parseInt(mo_id) : null,
        work_center_id: work_center_id ? parseInt(work_center_id) : null,
        operator_id: operator_id ? parseInt(operator_id) : null,
        operation,
        start_date,
        end_date
      };

      const result = await WorkOrderModel.findAll(options);

      res.json({
        success: true,
        message: 'Work orders retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get work orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve work orders',
        error: error.message
      });
    }
  }

  /**
   * Get work order by ID
   * GET /api/work-orders/:id
   * Access: Admin, Manager, Operator
   */
  static async getWorkOrderById(req, res) {
    try {
      const { id } = req.params;

      const workOrder = await WorkOrderModel.findById(parseInt(id));

      if (!workOrder) {
        return res.status(404).json({
          success: false,
          message: 'Work order not found'
        });
      }

      res.json({
        success: true,
        message: 'Work order retrieved successfully',
        data: workOrder
      });
    } catch (error) {
      console.error('Get work order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve work order',
        error: error.message
      });
    }
  }

  /**
   * Update work order
   * PUT /api/work-orders/:id
   * Access: Admin, Manager
   */
  static async updateWorkOrder(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Prevent certain fields from being updated
      const restrictedFields = ['wo_id', 'mo_id', 'created_by', 'created_at'];
      restrictedFields.forEach(field => delete updateData[field]);

      // Validate status if provided
      if (updateData.status && !['pending', 'in_progress', 'paused', 'completed', 'cancelled'].includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const updatedWorkOrder = await WorkOrderModel.update(parseInt(id), updateData);

      if (!updatedWorkOrder) {
        return res.status(404).json({
          success: false,
          message: 'Work order not found'
        });
      }

      res.json({
        success: true,
        message: 'Work order updated successfully',
        data: updatedWorkOrder
      });
    } catch (error) {
      console.error('Update work order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update work order',
        error: error.message
      });
    }
  }

  /**
   * Start work order execution
   * POST /api/work-orders/:id/start
   * Access: Admin, Manager, Operator
   */
  static async startWorkOrder(req, res) {
    try {
      const { id } = req.params;
      const { operator_id, notes } = req.body;

      const startedWorkOrder = await WorkOrderModel.start(
        parseInt(id),
        operator_id || req.user.user_id,
        notes
      );

      if (!startedWorkOrder) {
        return res.status(404).json({
          success: false,
          message: 'Work order not found or cannot be started'
        });
      }

      res.json({
        success: true,
        message: 'Work order started successfully',
        data: startedWorkOrder
      });
    } catch (error) {
      console.error('Start work order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start work order',
        error: error.message
      });
    }
  }

  /**
   * Pause work order execution
   * POST /api/work-orders/:id/pause
   * Access: Admin, Manager, Operator
   */
  static async pauseWorkOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason, notes } = req.body;

      const pausedWorkOrder = await WorkOrderModel.pause(
        parseInt(id),
        req.user.user_id,
        reason,
        notes
      );

      if (!pausedWorkOrder) {
        return res.status(404).json({
          success: false,
          message: 'Work order not found or cannot be paused'
        });
      }

      res.json({
        success: true,
        message: 'Work order paused successfully',
        data: pausedWorkOrder
      });
    } catch (error) {
      console.error('Pause work order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to pause work order',
        error: error.message
      });
    }
  }

  /**
   * Resume work order execution
   * POST /api/work-orders/:id/resume
   * Access: Admin, Manager, Operator
   */
  static async resumeWorkOrder(req, res) {
    try {
      const { id } = req.params;
      const { notes } = req.body;

      const resumedWorkOrder = await WorkOrderModel.resume(
        parseInt(id),
        req.user.user_id,
        notes
      );

      if (!resumedWorkOrder) {
        return res.status(404).json({
          success: false,
          message: 'Work order not found or cannot be resumed'
        });
      }

      res.json({
        success: true,
        message: 'Work order resumed successfully',
        data: resumedWorkOrder
      });
    } catch (error) {
      console.error('Resume work order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resume work order',
        error: error.message
      });
    }
  }

  /**
   * Complete work order
   * POST /api/work-orders/:id/complete
   * Access: Admin, Manager, Operator
   */
  static async completeWorkOrder(req, res) {
    try {
      const { id } = req.params;
      const { actual_quantity, quality_check, notes } = req.body;

      const completedWorkOrder = await WorkOrderModel.complete(
        parseInt(id),
        req.user.user_id,
        actual_quantity ? parseFloat(actual_quantity) : null,
        quality_check,
        notes
      );

      if (!completedWorkOrder) {
        return res.status(404).json({
          success: false,
          message: 'Work order not found or cannot be completed'
        });
      }

      res.json({
        success: true,
        message: 'Work order completed successfully',
        data: completedWorkOrder
      });
    } catch (error) {
      console.error('Complete work order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete work order',
        error: error.message
      });
    }
  }

  /**
   * Get work orders by status
   * GET /api/work-orders/by-status/:status
   * Access: Admin, Manager, Operator
   */
  static async getByStatus(req, res) {
    try {
      const { status } = req.params;

      if (!['pending', 'in_progress', 'paused', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const workOrders = await WorkOrderModel.getByStatus(status);

      res.json({
        success: true,
        message: `Work orders with status '${status}' retrieved successfully`,
        data: workOrders
      });
    } catch (error) {
      console.error('Get by status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve work orders by status',
        error: error.message
      });
    }
  }

  /**
   * Get work orders by work center
   * GET /api/work-orders/by-work-center/:workCenterId
   * Access: Admin, Manager, Operator
   */
  static async getByWorkCenter(req, res) {
    try {
      const { workCenterId } = req.params;
      const { status, start_date, end_date } = req.query;

      const options = {
        status,
        start_date,
        end_date
      };

      const workOrders = await WorkOrderModel.getByWorkCenter(parseInt(workCenterId), options);

      res.json({
        success: true,
        message: 'Work orders for work center retrieved successfully',
        data: workOrders
      });
    } catch (error) {
      console.error('Get by work center error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve work orders by work center',
        error: error.message
      });
    }
  }

  /**
   * Get work orders by operator
   * GET /api/work-orders/by-operator/:operatorId
   * Access: Admin, Manager, Operator (own orders)
   */
  static async getByOperator(req, res) {
    try {
      const { operatorId } = req.params;
      const { status, start_date, end_date } = req.query;

      // Check if user can access this operator's work orders
      if (req.user.role === 'operator' && req.user.user_id !== parseInt(operatorId)) {
        return res.status(403).json({
          success: false,
          message: 'Operators can only view their own work orders'
        });
      }

      const options = {
        status,
        start_date,
        end_date
      };

      const workOrders = await WorkOrderModel.getByOperator(parseInt(operatorId), options);

      res.json({
        success: true,
        message: 'Work orders for operator retrieved successfully',
        data: workOrders
      });
    } catch (error) {
      console.error('Get by operator error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve work orders by operator',
        error: error.message
      });
    }
  }

  /**
   * Log time entry for work order
   * POST /api/work-orders/:id/time-log
   * Access: Admin, Manager, Operator
   */
  static async logTime(req, res) {
    try {
      const { id } = req.params;
      const { hours_worked, activity, notes } = req.body;

      if (!hours_worked || hours_worked <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Hours worked must be greater than 0'
        });
      }

      const timeLog = await WorkOrderModel.logTime(
        parseInt(id),
        req.user.user_id,
        parseFloat(hours_worked),
        activity,
        notes
      );

      res.status(201).json({
        success: true,
        message: 'Time logged successfully',
        data: timeLog
      });
    } catch (error) {
      console.error('Log time error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to log time',
        error: error.message
      });
    }
  }

  /**
   * Get time logs for work order
   * GET /api/work-orders/:id/time-logs
   * Access: Admin, Manager, Operator
   */
  static async getTimeLogs(req, res) {
    try {
      const { id } = req.params;

      const timeLogs = await WorkOrderModel.getTimeLogs(parseInt(id));

      res.json({
        success: true,
        message: 'Time logs retrieved successfully',
        data: timeLogs
      });
    } catch (error) {
      console.error('Get time logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve time logs',
        error: error.message
      });
    }
  }

  /**
   * Get work order statistics
   * GET /api/work-orders/statistics
   * Access: Admin, Manager
   */
  static async getStatistics(req, res) {
    try {
      const { start_date, end_date, work_center_id, operator_id } = req.query;

      const options = {
        start_date,
        end_date,
        work_center_id: work_center_id ? parseInt(work_center_id) : null,
        operator_id: operator_id ? parseInt(operator_id) : null
      };

      const statistics = await WorkOrderModel.getStatistics(options);

      res.json({
        success: true,
        message: 'Work order statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve work order statistics',
        error: error.message
      });
    }
  }

  /**
   * Cancel work order
   * PATCH /api/work-orders/:id/cancel
   * Access: Admin, Manager
   */
  static async cancelWorkOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const cancelledOrder = await WorkOrderModel.cancel(
        parseInt(id),
        req.user.user_id,
        reason
      );

      if (!cancelledOrder) {
        return res.status(404).json({
          success: false,
          message: 'Work order not found or cannot be cancelled'
        });
      }

      res.json({
        success: true,
        message: 'Work order cancelled successfully',
        data: cancelledOrder
      });
    } catch (error) {
      console.error('Cancel work order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel work order',
        error: error.message
      });
    }
  }

  /**
   * Search work orders for dropdown/autocomplete
   * GET /api/work-orders/search
   * Access: Admin, Manager, Operator
   */
  static async searchForDropdown(req, res) {
    try {
      const { search, status, work_center_id, limit = 50 } = req.query;

      const workOrders = await WorkOrderModel.searchForDropdown(
        search,
        status,
        work_center_id ? parseInt(work_center_id) : null,
        parseInt(limit)
      );

      res.json({
        success: true,
        message: 'Work orders search completed',
        data: workOrders
      });
    } catch (error) {
      console.error('Search work orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search work orders',
        error: error.message
      });
    }
  }
}

export default WorkOrderController;
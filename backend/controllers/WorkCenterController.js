import WorkCenterModel from '../models/WorkCenterModel.js';

/**
 * Work Center Controller for Manufacturing Management System
 * Handles work centers, capacity management, downtime tracking, and utilization
 */

class WorkCenterController {
  /**
   * Create a new work center
   * @route POST /api/v1/work-centers
   * @access Private (Admin/Manager)
   */
  static async createWorkCenter(req, res) {
    try {
      const { name, description, hourly_cost, capacity_per_hour, location } = req.body;

      // Validate required fields
      if (!name || name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Work center name is required and must be at least 2 characters long'
        });
      }

      const workCenter = await WorkCenterModel.create({
        name: name.trim(),
        description,
        hourly_cost: parseFloat(hourly_cost) || 0,
        capacity_per_hour: parseFloat(capacity_per_hour) || 1,
        location
      });

      res.status(201).json({
        success: true,
        message: 'Work center created successfully',
        data: workCenter
      });

    } catch (error) {
      console.error('Create work center error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create work center',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get all work centers with filtering and pagination
   * @route GET /api/v1/work-centers
   * @access Private (All authenticated users)
   */
  static async getAllWorkCenters(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        is_active = true,
        search,
        location
      } = req.query;

      const result = await WorkCenterModel.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        is_active: is_active === 'true',
        search,
        location
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get all work centers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve work centers',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get work center by ID
   * @route GET /api/v1/work-centers/:workCenterId
   * @access Private (All authenticated users)
   */
  static async getWorkCenterById(req, res) {
    try {
      const { workCenterId } = req.params;

      if (!workCenterId || isNaN(workCenterId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid work center ID is required'
        });
      }

      const workCenter = await WorkCenterModel.findById(parseInt(workCenterId));

      if (!workCenter) {
        return res.status(404).json({
          success: false,
          message: 'Work center not found'
        });
      }

      res.json({
        success: true,
        data: workCenter
      });

    } catch (error) {
      console.error('Get work center by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve work center',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update work center
   * @route PUT /api/v1/work-centers/:workCenterId
   * @access Private (Admin/Manager)
   */
  static async updateWorkCenter(req, res) {
    try {
      const { workCenterId } = req.params;
      const { name, description, hourly_cost, capacity_per_hour, location, is_active } = req.body;

      if (!workCenterId || isNaN(workCenterId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid work center ID is required'
        });
      }

      // Validate name if provided
      if (name && name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Work center name must be at least 2 characters long'
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description;
      if (hourly_cost !== undefined) updateData.hourly_cost = parseFloat(hourly_cost);
      if (capacity_per_hour !== undefined) updateData.capacity_per_hour = parseFloat(capacity_per_hour);
      if (location !== undefined) updateData.location = location;
      if (is_active !== undefined) updateData.is_active = is_active;

      const workCenter = await WorkCenterModel.update(parseInt(workCenterId), updateData);

      res.json({
        success: true,
        message: 'Work center updated successfully',
        data: workCenter
      });

    } catch (error) {
      console.error('Update work center error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update work center',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete work center (soft delete)
   * @route DELETE /api/v1/work-centers/:workCenterId
   * @access Private (Admin only)
   */
  static async deleteWorkCenter(req, res) {
    try {
      const { workCenterId } = req.params;

      if (!workCenterId || isNaN(workCenterId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid work center ID is required'
        });
      }

      const workCenter = await WorkCenterModel.softDelete(parseInt(workCenterId));

      res.json({
        success: true,
        message: 'Work center deactivated successfully',
        data: workCenter
      });

    } catch (error) {
      console.error('Delete work center error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate work center',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Log downtime for a work center
   * @route POST /api/v1/work-centers/:workCenterId/downtime
   * @access Private (Manager/Operator)
   */
  static async logDowntime(req, res) {
    try {
      const { workCenterId } = req.params;
      const { start_time, end_time, reason } = req.body;

      if (!workCenterId || isNaN(workCenterId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid work center ID is required'
        });
      }

      if (!start_time || !reason) {
        return res.status(400).json({
          success: false,
          message: 'Start time and reason are required'
        });
      }

      const downtime = await WorkCenterModel.logDowntime({
        work_center_id: parseInt(workCenterId),
        start_time,
        end_time,
        reason
      });

      res.status(201).json({
        success: true,
        message: 'Downtime logged successfully',
        data: downtime
      });

    } catch (error) {
      console.error('Log downtime error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to log downtime',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * End downtime for a work center
   * @route PUT /api/v1/work-centers/downtime/:downtimeId/end
   * @access Private (Manager/Operator)
   */
  static async endDowntime(req, res) {
    try {
      const { downtimeId } = req.params;
      const { end_time } = req.body;

      if (!downtimeId || isNaN(downtimeId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid downtime ID is required'
        });
      }

      const downtime = await WorkCenterModel.endDowntime(parseInt(downtimeId), end_time);

      res.json({
        success: true,
        message: 'Downtime ended successfully',
        data: downtime
      });

    } catch (error) {
      console.error('End downtime error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end downtime',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get downtime logs for a work center
   * @route GET /api/v1/work-centers/:workCenterId/downtime
   * @access Private (All authenticated users)
   */
  static async getDowntimeLogs(req, res) {
    try {
      const { workCenterId } = req.params;
      const { page = 1, limit = 20, start_date, end_date } = req.query;

      if (!workCenterId || isNaN(workCenterId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid work center ID is required'
        });
      }

      const result = await WorkCenterModel.getDowntimeLogs(parseInt(workCenterId), {
        page: parseInt(page),
        limit: parseInt(limit),
        start_date,
        end_date
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get downtime logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve downtime logs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get work center utilization statistics
   * @route GET /api/v1/work-centers/:workCenterId/utilization
   * @access Private (Manager/Admin)
   */
  static async getUtilizationStats(req, res) {
    try {
      const { workCenterId } = req.params;
      const { start_date, end_date } = req.query;

      if (!workCenterId || isNaN(workCenterId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid work center ID is required'
        });
      }

      const stats = await WorkCenterModel.getUtilizationStats(parseInt(workCenterId), {
        start_date,
        end_date
      });

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get utilization stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve utilization statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get work center statistics overview
   * @route GET /api/v1/work-centers/statistics
   * @access Private (Manager/Admin)
   */
  static async getWorkCenterStatistics(req, res) {
    try {
      const stats = await WorkCenterModel.getStatistics();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get work center statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve work center statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Search work centers for dropdown/autocomplete
   * @route GET /api/v1/work-centers/search
   * @access Private (All authenticated users)
   */
  static async searchWorkCenters(req, res) {
    try {
      const { q: searchTerm } = req.query;

      const workCenters = await WorkCenterModel.searchForDropdown(searchTerm);

      res.json({
        success: true,
        data: workCenters
      });

    } catch (error) {
      console.error('Search work centers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search work centers',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update working hours (internal method - usually called after work order completion)
   * @route PUT /api/v1/work-centers/:workCenterId/working-hours
   * @access Private (System/Internal)
   */
  static async updateWorkingHours(req, res) {
    try {
      const { workCenterId } = req.params;
      const { additional_hours } = req.body;

      if (!workCenterId || isNaN(workCenterId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid work center ID is required'
        });
      }

      if (!additional_hours || isNaN(additional_hours) || additional_hours <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid positive additional hours value is required'
        });
      }

      const workCenter = await WorkCenterModel.updateWorkingHours(
        parseInt(workCenterId), 
        parseFloat(additional_hours)
      );

      res.json({
        success: true,
        message: 'Working hours updated successfully',
        data: workCenter
      });

    } catch (error) {
      console.error('Update working hours error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update working hours',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default WorkCenterController;
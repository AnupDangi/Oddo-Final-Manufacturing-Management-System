import { mongoose } from '../config/database.js';
import { workCenterSchema, workCenterDowntimeSchema } from '../schemas/index.js';

/**
 * Work Center Model for Manufacturing ERP System
 * Handles work center management, capacity tracking, and downtime logging
 */

// Create models
const WorkCenter = mongoose.model('WorkCenter', workCenterSchema);
const WorkCenterDowntime = mongoose.model('WorkCenterDowntime', workCenterDowntimeSchema);

class WorkCenterModel {
  /**
   * Create a new work center
   */
  static async create(workCenterData) {
    try {
      const workCenter = new WorkCenter(workCenterData);
      await workCenter.save();
      return await this.findById(workCenter._id);
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Work center code already exists');
      }
      throw new Error(`Work center creation failed: ${error.message}`);
    }
  }

  /**
   * Get work center by ID
   */
  static async findById(id) {
    try {
      const workCenter = await WorkCenter.findById(id)
        .populate('supervisors', 'name email')
        .populate('createdBy updatedBy', 'name email');
      
      if (!workCenter) {
        throw new Error('Work center not found');
      }
      
      return workCenter;
    } catch (error) {
      throw new Error(`Work center retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get all work centers with filters
   */
  static async getAll(filters = {}) {
    try {
      const {
        department,
        isActive = true,
        search,
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc'
      } = filters;

      const query = {};
      
      if (department) query.department = department;
      if (isActive !== undefined) query.isActive = isActive;
      
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { code: new RegExp(search, 'i') },
          { location: new RegExp(search, 'i') }
        ];
      }

      const skip = (page - 1) * limit;
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const workCenters = await WorkCenter.find(query)
        .populate('supervisors', 'name email')
        .populate('createdBy updatedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await WorkCenter.countDocuments(query);

      return {
        workCenters,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };
    } catch (error) {
      throw new Error(`Work centers retrieval failed: ${error.message}`);
    }
  }

  /**
   * Update work center
   */
  static async update(id, updateData, updatedBy) {
    try {
      updateData.updatedBy = updatedBy;
      
      const workCenter = await WorkCenter.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('supervisors createdBy updatedBy', 'name email');

      if (!workCenter) {
        throw new Error('Work center not found');
      }

      return workCenter;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Work center code already exists');
      }
      throw new Error(`Work center update failed: ${error.message}`);
    }
  }

  /**
   * Delete work center (soft delete)
   */
  static async delete(id) {
    try {
      const workCenter = await WorkCenter.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!workCenter) {
        throw new Error('Work center not found');
      }

      return { message: 'Work center deleted successfully' };
    } catch (error) {
      throw new Error(`Work center deletion failed: ${error.message}`);
    }
  }

  /**
   * Get work center by code
   */
  static async findByCode(code) {
    try {
      const workCenter = await WorkCenter.findOne({ 
        code: code.toUpperCase(), 
        isActive: true 
      }).populate('supervisors', 'name email');
      
      if (!workCenter) {
        throw new Error('Work center not found');
      }
      
      return workCenter;
    } catch (error) {
      throw new Error(`Work center retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get work centers by department
   */
  static async getByDepartment(department) {
    try {
      const workCenters = await WorkCenter.find({ 
        department, 
        isActive: true 
      }).populate('supervisors', 'name email');
      
      return workCenters;
    } catch (error) {
      throw new Error(`Work centers by department retrieval failed: ${error.message}`);
    }
  }

  /**
   * Log downtime
   */
  static async logDowntime(downtimeData) {
    try {
      // Validate work center exists
      const workCenter = await WorkCenter.findById(downtimeData.workCenterId);
      if (!workCenter) {
        throw new Error('Work center not found');
      }

      // Calculate downtime minutes if end time is provided
      if (downtimeData.endTime && downtimeData.startTime) {
        const startTime = new Date(downtimeData.startTime);
        const endTime = new Date(downtimeData.endTime);
        downtimeData.downtimeMinutes = Math.round((endTime - startTime) / (1000 * 60));
      }

      const downtime = new WorkCenterDowntime(downtimeData);
      await downtime.save();
      
      return await WorkCenterDowntime.findById(downtime._id)
        .populate('workCenterId', 'name code')
        .populate('reportedBy', 'name email');
    } catch (error) {
      throw new Error(`Downtime logging failed: ${error.message}`);
    }
  }

  /**
   * Update downtime record
   */
  static async updateDowntime(id, updateData) {
    try {
      // Recalculate downtime minutes if times are updated
      if (updateData.endTime && updateData.startTime) {
        const startTime = new Date(updateData.startTime);
        const endTime = new Date(updateData.endTime);
        updateData.downtimeMinutes = Math.round((endTime - startTime) / (1000 * 60));
      }

      const downtime = await WorkCenterDowntime.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('workCenterId', 'name code')
       .populate('reportedBy', 'name email');

      if (!downtime) {
        throw new Error('Downtime record not found');
      }

      return downtime;
    } catch (error) {
      throw new Error(`Downtime update failed: ${error.message}`);
    }
  }

  /**
   * Get downtime history
   */
  static async getDowntimeHistory(workCenterId, filters = {}) {
    try {
      const {
        startDate,
        endDate,
        reason,
        page = 1,
        limit = 10
      } = filters;

      const query = { workCenterId };
      
      if (startDate) query.downtimeDate = { $gte: new Date(startDate) };
      if (endDate) {
        query.downtimeDate = { 
          ...query.downtimeDate, 
          $lte: new Date(endDate) 
        };
      }
      if (reason) query.reason = reason;

      const skip = (page - 1) * limit;

      const downtimes = await WorkCenterDowntime.find(query)
        .populate('workCenterId', 'name code')
        .populate('reportedBy', 'name email')
        .sort({ downtimeDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await WorkCenterDowntime.countDocuments(query);

      return {
        downtimes,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      throw new Error(`Downtime history retrieval failed: ${error.message}`);
    }
  }

  /**
   * Calculate utilization statistics
   */
  static async calculateUtilization(workCenterId, options = {}) {
    try {
      const { startDate, endDate } = options;
      
      // Default to last 30 days if no dates provided
      const end = endDate ? new Date(endDate) : new Date();
      const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

      const workCenter = await WorkCenter.findById(workCenterId);
      if (!workCenter) {
        throw new Error('Work center not found');
      }

      // Get work orders for this period
      const WorkOrderModel = (await import('./WorkOrderModel.js')).default;
      const workOrders = await WorkOrderModel.getByWorkCenter(workCenterId, {
        startDate: start,
        endDate: end,
        status: 'completed'
      });

      // Get downtime for this period
      const downtimes = await WorkCenterDowntime.find({
        workCenterId,
        downtimeDate: { $gte: start, $lte: end }
      });

      // Calculate metrics
      const totalWorkHours = workOrders.reduce((sum, wo) => sum + (wo.actualHours || 0), 0);
      const totalDowntimeHours = downtimes.reduce((sum, dt) => sum + (dt.downtimeMinutes / 60), 0);
      
      // Calculate available hours (8 hours per day)
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const availableHours = days * 8;
      const effectiveAvailableHours = availableHours - totalDowntimeHours;
      
      const utilizationPercentage = effectiveAvailableHours > 0 
        ? (totalWorkHours / effectiveAvailableHours) * 100 
        : 0;

      return {
        workCenterId,
        workCenterName: workCenter.name,
        period: { start, end },
        availableHours,
        totalWorkHours,
        totalDowntimeHours,
        effectiveAvailableHours,
        utilizationPercentage: Math.min(utilizationPercentage, 100),
        totalWorkOrders: workOrders.length,
        averageHoursPerOrder: workOrders.length > 0 ? totalWorkHours / workOrders.length : 0
      };
    } catch (error) {
      throw new Error(`Utilization calculation failed: ${error.message}`);
    }
  }

  /**
   * Get work center statistics
   */
  static async getStatistics() {
    try {
      const [
        totalWorkCenters,
        byDepartment,
        activeWorkCenters,
        totalCapacity
      ] = await Promise.all([
        WorkCenter.countDocuments(),
        WorkCenter.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$department', count: { $sum: 1 } } }
        ]),
        WorkCenter.countDocuments({ isActive: true }),
        WorkCenter.aggregate([
          { $match: { isActive: true } },
          { $group: { 
            _id: null, 
            totalCapacity: { $sum: '$capacityPerHour' }
          }}
        ])
      ]);

      return {
        total: totalWorkCenters,
        active: activeWorkCenters,
        inactive: totalWorkCenters - activeWorkCenters,
        byDepartment: byDepartment.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        totalCapacityPerHour: totalCapacity[0]?.totalCapacity || 0
      };
    } catch (error) {
      throw new Error(`Statistics calculation failed: ${error.message}`);
    }
  }

  /**
   * Get work centers for dropdown
   */
  static async getForDropdown(department = null) {
    try {
      const query = { isActive: true };
      if (department) query.department = department;

      const workCenters = await WorkCenter.find(query)
        .select('name code department capacityPerHour')
        .sort({ name: 1 });

      return workCenters.map(wc => ({
        id: wc._id,
        name: wc.name,
        code: wc.code,
        department: wc.department,
        capacityPerHour: wc.capacityPerHour
      }));
    } catch (error) {
      throw new Error(`Work centers dropdown retrieval failed: ${error.message}`);
    }
  }

  /**
   * Check work center availability
   */
  static async checkAvailability(workCenterId, date, hours) {
    try {
      const workCenter = await WorkCenter.findById(workCenterId);
      if (!workCenter) {
        throw new Error('Work center not found');
      }

      // Get scheduled work orders for the date
      const WorkOrderModel = (await import('./WorkOrderModel.js')).default;
      const scheduledOrders = await WorkOrderModel.getByWorkCenter(workCenterId, {
        date,
        status: ['pending', 'in_progress']
      });

      const scheduledHours = scheduledOrders.reduce((sum, wo) => sum + (wo.estimatedHours || 0), 0);
      const availableHours = 8 - scheduledHours; // Assuming 8-hour workday

      return {
        workCenterId,
        date,
        requiredHours: hours,
        scheduledHours,
        availableHours,
        canSchedule: availableHours >= hours,
        utilizationPercentage: (scheduledHours / 8) * 100
      };
    } catch (error) {
      throw new Error(`Availability check failed: ${error.message}`);
    }
  }
}

export default WorkCenterModel;
export { WorkCenter, WorkCenterDowntime };
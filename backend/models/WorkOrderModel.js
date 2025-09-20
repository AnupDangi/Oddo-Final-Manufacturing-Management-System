import { supabase } from '../config/db.js';

/**
 * Work Order Model for Manufacturing Management System
 * Handles work order execution, time tracking, and operator management
 */

class WorkOrderModel {
  /**
   * Create a new work order
   */
  static async create(woData) {
    try {
      const { 
        mo_id, 
        work_center_id, 
        operation, 
        sequence = 1,
        planned_quantity,
        estimated_hours,
        notes,
        created_by 
      } = woData;
      
      // Validate required fields
      if (!mo_id || !work_center_id || !operation || !created_by) {
        throw new Error('MO ID, work center ID, operation, and created_by are required');
      }

      // Generate WO number
      const woNumber = await this.generateWONumber();

      const { data, error } = await supabase
        .from('work_orders')
        .insert([{
          wo_number: woNumber,
          mo_id,
          work_center_id,
          operation,
          sequence,
          planned_quantity,
          estimated_hours,
          notes,
          status: 'pending',
          created_by
        }])
        .select(`
          *,
          manufacturing_orders:mo_id (
            mo_number,
            quantity,
            products:product_id (
              name,
              unit
            )
          ),
          work_centers:work_center_id (
            name,
            department,
            capacity_per_hour
          ),
          users:created_by (
            name,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Work order creation failed: ${error.message}`);
    }
  }

  /**
   * Generate unique WO number
   */
  static async generateWONumber() {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      
      // Get the latest WO number for this month
      const { data, error } = await supabase
        .from('work_orders')
        .select('wo_number')
        .like('wo_number', `WO${year}${month}%`)
        .order('wo_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      let sequence = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].wo_number;
        const lastSequence = parseInt(lastNumber.slice(-4));
        sequence = lastSequence + 1;
      }

      return `WO${year}${month}${String(sequence).padStart(4, '0')}`;
    } catch (error) {
      throw new Error(`WO number generation failed: ${error.message}`);
    }
  }

  /**
   * Get all work orders with filtering and pagination
   */
  static async findAll(options = {}) {
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
      } = options;

      let query = supabase
        .from('work_orders')
        .select(`
          *,
          manufacturing_orders:mo_id (
            mo_number,
            quantity,
            products:product_id (
              name,
              unit
            )
          ),
          work_centers:work_center_id (
            name,
            department
          ),
          operators:operator_id (
            name,
            email
          )
        `, { count: 'exact' });

      // Apply filters
      if (status) query = query.eq('status', status);
      if (mo_id) query = query.eq('mo_id', mo_id);
      if (work_center_id) query = query.eq('work_center_id', work_center_id);
      if (operator_id) query = query.eq('operator_id', operator_id);
      if (operation) query = query.ilike('operation', `%${operation}%`);
      if (start_date) query = query.gte('created_at', start_date);
      if (end_date) query = query.lte('created_at', end_date);

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Order by sequence and creation date
      query = query.order('sequence').order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      throw new Error(`Work orders lookup failed: ${error.message}`);
    }
  }

  /**
   * Get work order by ID with related data
   */
  static async findById(woId) {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          manufacturing_orders:mo_id (
            mo_number,
            quantity,
            status,
            products:product_id (
              name,
              unit
            )
          ),
          work_centers:work_center_id (
            name,
            department,
            capacity_per_hour,
            cost_per_hour
          ),
          operators:operator_id (
            name,
            email
          ),
          users:created_by (
            name,
            email
          )
        `)
        .eq('wo_id', woId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(`Work order lookup failed: ${error.message}`);
    }
  }

  /**
   * Update work order
   */
  static async update(woId, updateData) {
    try {
      const allowedUpdates = [
        'operation', 'sequence', 'planned_quantity', 'estimated_hours', 
        'notes', 'operator_id'
      ];
      
      const updates = {};
      
      // Filter allowed updates
      for (const key of allowedUpdates) {
        if (updateData[key] !== undefined) {
          updates[key] = updateData[key];
        }
      }

      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('wo_id', woId)
        .select(`
          *,
          manufacturing_orders:mo_id (
            mo_number,
            products:product_id (
              name,
              unit
            )
          ),
          work_centers:work_center_id (
            name,
            department
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Work order update failed: ${error.message}`);
    }
  }

  /**
   * Start work order execution
   */
  static async start(woId, operatorId, notes = null) {
    try {
      // Check if work order can be started
      const wo = await this.findById(woId);
      if (!wo) {
        throw new Error('Work order not found');
      }

      if (wo.status !== 'pending' && wo.status !== 'paused') {
        throw new Error('Work order cannot be started from current status');
      }

      const updates = {
        status: 'in_progress',
        operator_id: operatorId,
        actual_start_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updates.notes = notes;
      }

      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('wo_id', woId)
        .select(`
          *,
          work_centers:work_center_id (
            name,
            department
          ),
          operators:operator_id (
            name,
            email
          )
        `)
        .single();

      if (error) throw error;

      // Log the status change
      await this.logStatusChange(woId, 'in_progress', operatorId, notes);

      return data;
    } catch (error) {
      throw new Error(`Work order start failed: ${error.message}`);
    }
  }

  /**
   * Pause work order execution
   */
  static async pause(woId, operatorId, reason = null, notes = null) {
    try {
      const wo = await this.findById(woId);
      if (!wo) {
        throw new Error('Work order not found');
      }

      if (wo.status !== 'in_progress') {
        throw new Error('Only in-progress work orders can be paused');
      }

      const updates = {
        status: 'paused',
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updates.notes = notes;
      }

      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('wo_id', woId)
        .select()
        .single();

      if (error) throw error;

      // Log the pause
      await this.logStatusChange(woId, 'paused', operatorId, `${reason ? reason + ': ' : ''}${notes || ''}`);

      return data;
    } catch (error) {
      throw new Error(`Work order pause failed: ${error.message}`);
    }
  }

  /**
   * Resume work order execution
   */
  static async resume(woId, operatorId, notes = null) {
    try {
      const wo = await this.findById(woId);
      if (!wo) {
        throw new Error('Work order not found');
      }

      if (wo.status !== 'paused') {
        throw new Error('Only paused work orders can be resumed');
      }

      const updates = {
        status: 'in_progress',
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updates.notes = notes;
      }

      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('wo_id', woId)
        .select()
        .single();

      if (error) throw error;

      // Log the resume
      await this.logStatusChange(woId, 'resumed', operatorId, notes);

      return data;
    } catch (error) {
      throw new Error(`Work order resume failed: ${error.message}`);
    }
  }

  /**
   * Complete work order
   */
  static async complete(woId, operatorId, actualQuantity = null, qualityCheck = null, notes = null) {
    try {
      const wo = await this.findById(woId);
      if (!wo) {
        throw new Error('Work order not found');
      }

      if (wo.status !== 'in_progress') {
        throw new Error('Only in-progress work orders can be completed');
      }

      const updates = {
        status: 'completed',
        actual_end_time: new Date().toISOString(),
        actual_quantity: actualQuantity || wo.planned_quantity,
        quality_check: qualityCheck,
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updates.notes = notes;
      }

      // Calculate total hours if start time exists
      if (wo.actual_start_time) {
        const startTime = new Date(wo.actual_start_time);
        const endTime = new Date();
        updates.actual_hours = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
      }

      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('wo_id', woId)
        .select()
        .single();

      if (error) throw error;

      // Log the completion
      await this.logStatusChange(woId, 'completed', operatorId, notes);

      return data;
    } catch (error) {
      throw new Error(`Work order completion failed: ${error.message}`);
    }
  }

  /**
   * Log status changes for audit trail
   */
  static async logStatusChange(woId, newStatus, changedBy, notes) {
    try {
      await supabase
        .from('wo_status_history')
        .insert([{
          wo_id: woId,
          status: newStatus,
          changed_by: changedBy,
          notes,
          changed_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Status change logging failed:', error.message);
    }
  }

  /**
   * Get work orders by status
   */
  static async getByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          manufacturing_orders:mo_id (
            mo_number,
            products:product_id (
              name
            )
          ),
          work_centers:work_center_id (
            name,
            department
          )
        `)
        .eq('status', status)
        .order('sequence');

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Work orders by status lookup failed: ${error.message}`);
    }
  }

  /**
   * Get work orders by work center
   */
  static async getByWorkCenter(workCenterId, options = {}) {
    try {
      const { status, start_date, end_date } = options;

      let query = supabase
        .from('work_orders')
        .select(`
          *,
          manufacturing_orders:mo_id (
            mo_number,
            products:product_id (
              name
            )
          )
        `)
        .eq('work_center_id', workCenterId);

      if (status) query = query.eq('status', status);
      if (start_date) query = query.gte('created_at', start_date);
      if (end_date) query = query.lte('created_at', end_date);

      query = query.order('sequence').order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Work orders by work center lookup failed: ${error.message}`);
    }
  }

  /**
   * Get work orders by operator
   */
  static async getByOperator(operatorId, options = {}) {
    try {
      const { status, start_date, end_date } = options;

      let query = supabase
        .from('work_orders')
        .select(`
          *,
          manufacturing_orders:mo_id (
            mo_number,
            products:product_id (
              name
            )
          ),
          work_centers:work_center_id (
            name,
            department
          )
        `)
        .eq('operator_id', operatorId);

      if (status) query = query.eq('status', status);
      if (start_date) query = query.gte('actual_start_time', start_date);
      if (end_date) query = query.lte('actual_end_time', end_date);

      query = query.order('actual_start_time', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Work orders by operator lookup failed: ${error.message}`);
    }
  }

  /**
   * Log time entry for work order
   */
  static async logTime(woId, operatorId, hoursWorked, activity = null, notes = null) {
    try {
      const { data, error } = await supabase
        .from('work_order_time_logs')
        .insert([{
          wo_id: woId,
          operator_id: operatorId,
          hours_worked: hoursWorked,
          activity,
          notes,
          log_date: new Date().toISOString()
        }])
        .select(`
          *,
          operators:operator_id (
            name,
            email
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Time logging failed: ${error.message}`);
    }
  }

  /**
   * Get time logs for work order
   */
  static async getTimeLogs(woId) {
    try {
      const { data, error } = await supabase
        .from('work_order_time_logs')
        .select(`
          *,
          operators:operator_id (
            name,
            email
          )
        `)
        .eq('wo_id', woId)
        .order('log_date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Time logs lookup failed: ${error.message}`);
    }
  }

  /**
   * Get work order statistics
   */
  static async getStatistics(options = {}) {
    try {
      const { start_date, end_date, work_center_id, operator_id } = options;

      let query = supabase
        .from('work_orders')
        .select('status, actual_hours, actual_quantity, planned_quantity, created_at');

      if (work_center_id) query = query.eq('work_center_id', work_center_id);
      if (operator_id) query = query.eq('operator_id', operator_id);
      if (start_date) query = query.gte('created_at', start_date);
      if (end_date) query = query.lte('created_at', end_date);

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total_work_orders: data.length,
        by_status: {
          pending: data.filter(wo => wo.status === 'pending').length,
          in_progress: data.filter(wo => wo.status === 'in_progress').length,
          paused: data.filter(wo => wo.status === 'paused').length,
          completed: data.filter(wo => wo.status === 'completed').length,
          cancelled: data.filter(wo => wo.status === 'cancelled').length
        },
        completion_rate: data.length > 0 ? (data.filter(wo => wo.status === 'completed').length / data.length) * 100 : 0,
        total_planned_quantity: data.reduce((sum, wo) => sum + (wo.planned_quantity || 0), 0),
        total_actual_quantity: data.reduce((sum, wo) => sum + (wo.actual_quantity || 0), 0),
        total_hours: data.reduce((sum, wo) => sum + (wo.actual_hours || 0), 0),
        average_efficiency: data.length > 0 ? 
          data.filter(wo => wo.actual_quantity && wo.planned_quantity)
              .reduce((sum, wo) => sum + (wo.actual_quantity / wo.planned_quantity), 0) / 
          data.filter(wo => wo.actual_quantity && wo.planned_quantity).length * 100 : 0
      };

      return stats;
    } catch (error) {
      throw new Error(`Statistics lookup failed: ${error.message}`);
    }
  }

  /**
   * Cancel work order
   */
  static async cancel(woId, cancelledBy, reason = null) {
    try {
      const wo = await this.findById(woId);
      if (!wo) {
        throw new Error('Work order not found');
      }

      if (wo.status === 'completed' || wo.status === 'cancelled') {
        throw new Error('Cannot cancel completed or already cancelled work order');
      }

      const updates = {
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : wo.notes,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('wo_id', woId)
        .select()
        .single();

      if (error) throw error;

      // Log cancellation
      await this.logStatusChange(woId, 'cancelled', cancelledBy, reason);

      return data;
    } catch (error) {
      throw new Error(`Work order cancellation failed: ${error.message}`);
    }
  }

  /**
   * Search work orders for dropdown/autocomplete
   */
  static async searchForDropdown(searchTerm, status = null, workCenterId = null, limit = 50) {
    try {
      let query = supabase
        .from('work_orders')
        .select(`
          wo_id,
          wo_number,
          operation,
          status,
          manufacturing_orders:mo_id (
            mo_number,
            products:product_id (
              name
            )
          )
        `);

      if (status) query = query.eq('status', status);
      if (workCenterId) query = query.eq('work_center_id', workCenterId);

      if (searchTerm) {
        query = query.or(`wo_number.ilike.%${searchTerm}%,operation.ilike.%${searchTerm}%`);
      }

      query = query.order('wo_number', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Work order search failed: ${error.message}`);
    }
  }
}

export default WorkOrderModel;
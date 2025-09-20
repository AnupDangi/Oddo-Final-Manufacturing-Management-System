import { supabase } from '../config/db.js';

/**
 * Manufacturing Order Model for Manufacturing Management System
 * Handles manufacturing order lifecycle, BOM integration, and production planning
 */

class ManufacturingOrderModel {
  /**
   * Create a new manufacturing order
   */
  static async create(moData) {
    try {
      const { 
        product_id, 
        quantity, 
        planned_start_date, 
        planned_end_date, 
        priority = 'medium', 
        notes, 
        created_by 
      } = moData;
      
      // Validate required fields
      if (!product_id || !quantity || !created_by) {
        throw new Error('Product ID, quantity, and created_by are required');
      }

      if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
        throw new Error('Priority must be low, medium, high, or urgent');
      }

      // Generate MO number
      const moNumber = await this.generateMONumber();

      const { data, error } = await supabase
        .from('manufacturing_orders')
        .insert([{
          mo_number: moNumber,
          product_id,
          quantity,
          planned_start_date,
          planned_end_date,
          priority,
          notes,
          status: 'planned',
          created_by,
          is_active: true
        }])
        .select(`
          *,
          products:product_id (
            name,
            type,
            unit
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
      throw new Error(`Manufacturing order creation failed: ${error.message}`);
    }
  }

  /**
   * Generate unique MO number
   */
  static async generateMONumber() {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      
      // Get the latest MO number for this month
      const { data, error } = await supabase
        .from('manufacturing_orders')
        .select('mo_number')
        .like('mo_number', `MO${year}${month}%`)
        .order('mo_number', { ascending: false })
        .limit(1);

      if (error) throw error;

      let sequence = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].mo_number;
        const lastSequence = parseInt(lastNumber.slice(-4));
        sequence = lastSequence + 1;
      }

      return `MO${year}${month}${String(sequence).padStart(4, '0')}`;
    } catch (error) {
      throw new Error(`MO number generation failed: ${error.message}`);
    }
  }

  /**
   * Get all manufacturing orders with filtering and pagination
   */
  static async findAll(options = {}) {
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
      } = options;

      let query = supabase
        .from('manufacturing_orders')
        .select(`
          *,
          products:product_id (
            name,
            type,
            unit
          ),
          users:created_by (
            name,
            email
          )
        `, { count: 'exact' });

      // Apply filters
      if (status) query = query.eq('status', status);
      if (priority) query = query.eq('priority', priority);
      if (product_id) query = query.eq('product_id', product_id);
      if (created_by) query = query.eq('created_by', created_by);
      if (start_date) query = query.gte('planned_start_date', start_date);
      if (end_date) query = query.lte('planned_end_date', end_date);

      query = query.eq('is_active', true);

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false });

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
      throw new Error(`Manufacturing orders lookup failed: ${error.message}`);
    }
  }

  /**
   * Get manufacturing order by ID with related data
   */
  static async findById(moId) {
    try {
      const { data: mo, error: moError } = await supabase
        .from('manufacturing_orders')
        .select(`
          *,
          products:product_id (
            name,
            type,
            unit
          ),
          users:created_by (
            name,
            email
          )
        `)
        .eq('mo_id', moId)
        .eq('is_active', true)
        .single();

      if (moError && moError.code !== 'PGRST116') throw moError;
      if (!mo) return null;

      // Get related work orders
      const { data: workOrders, error: woError } = await supabase
        .from('work_orders')
        .select(`
          *,
          work_centers:work_center_id (
            name,
            department
          )
        `)
        .eq('mo_id', moId)
        .order('created_at');

      if (woError) throw woError;

      return {
        ...mo,
        work_orders: workOrders || []
      };
    } catch (error) {
      throw new Error(`Manufacturing order lookup failed: ${error.message}`);
    }
  }

  /**
   * Update manufacturing order
   */
  static async update(moId, updateData) {
    try {
      const allowedUpdates = [
        'quantity', 'planned_start_date', 'planned_end_date', 
        'priority', 'notes', 'is_active'
      ];
      
      const updates = {};
      
      // Filter allowed updates
      for (const key of allowedUpdates) {
        if (updateData[key] !== undefined) {
          updates[key] = updateData[key];
        }
      }

      // Add updated timestamp
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('manufacturing_orders')
        .update(updates)
        .eq('mo_id', moId)
        .select(`
          *,
          products:product_id (
            name,
            type,
            unit
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
      throw new Error(`Manufacturing order update failed: ${error.message}`);
    }
  }

  /**
   * Update manufacturing order status
   */
  static async updateStatus(moId, status, updatedBy, notes = null) {
    try {
      if (!['planned', 'released', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        throw new Error('Invalid status value');
      }

      const updates = {
        status,
        updated_at: new Date().toISOString()
      };

      // Set specific timestamps based on status
      if (status === 'in_progress' && !updates.actual_start_date) {
        updates.actual_start_date = new Date().toISOString();
      } else if (status === 'completed' && !updates.actual_end_date) {
        updates.actual_end_date = new Date().toISOString();
      }

      if (notes) {
        updates.notes = notes;
      }

      const { data, error } = await supabase
        .from('manufacturing_orders')
        .update(updates)
        .eq('mo_id', moId)
        .select(`
          *,
          products:product_id (
            name,
            type,
            unit
          )
        `)
        .single();

      if (error) throw error;

      // Log status change
      await this.logStatusChange(moId, status, updatedBy, notes);

      return data;
    } catch (error) {
      throw new Error(`Status update failed: ${error.message}`);
    }
  }

  /**
   * Log status changes for audit trail
   */
  static async logStatusChange(moId, newStatus, changedBy, notes) {
    try {
      await supabase
        .from('mo_status_history')
        .insert([{
          mo_id: moId,
          status: newStatus,
          changed_by: changedBy,
          notes,
          changed_at: new Date().toISOString()
        }]);
    } catch (error) {
      // Log error but don't fail the main operation
      console.error('Status change logging failed:', error.message);
    }
  }

  /**
   * Get material requirements for manufacturing order
   */
  static async getMaterialRequirements(moId) {
    try {
      const mo = await this.findById(moId);
      if (!mo) {
        throw new Error('Manufacturing order not found');
      }

      // Get active BOM for the product
      const { data: bom, error: bomError } = await supabase
        .from('boms')
        .select(`
          *,
          bom_components:bom_components (
            *,
            products:component_product_id (
              name,
              unit,
              cost_price,
              current_stock
            )
          )
        `)
        .eq('product_id', mo.product_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (bomError && bomError.code !== 'PGRST116') throw bomError;
      if (!bom) {
        throw new Error('No active BOM found for this product');
      }

      // Calculate scaled requirements
      const requirements = bom.bom_components.map(component => {
        const baseQuantity = component.quantity_required;
        const wastePercentage = component.waste_percentage || 0;
        const quantityWithWaste = baseQuantity * (1 + wastePercentage / 100);
        const totalRequired = quantityWithWaste * mo.quantity;

        return {
          component_product_id: component.component_product_id,
          product_name: component.products.name,
          unit: component.products.unit,
          base_quantity_per_unit: baseQuantity,
          waste_percentage: wastePercentage,
          quantity_with_waste: quantityWithWaste,
          total_required: totalRequired,
          current_stock: component.products.current_stock,
          cost_per_unit: component.products.cost_price,
          total_cost: totalRequired * component.products.cost_price,
          stock_sufficient: component.products.current_stock >= totalRequired
        };
      });

      const totalMaterialCost = requirements.reduce((sum, req) => sum + req.total_cost, 0);

      return {
        mo_id: moId,
        mo_number: mo.mo_number,
        product_name: mo.products.name,
        quantity: mo.quantity,
        bom_version: bom.version,
        requirements,
        total_material_cost: totalMaterialCost,
        cost_per_unit: totalMaterialCost / mo.quantity
      };
    } catch (error) {
      throw new Error(`Material requirements calculation failed: ${error.message}`);
    }
  }

  /**
   * Check material availability for manufacturing order
   */
  static async checkMaterialAvailability(moId) {
    try {
      const requirements = await this.getMaterialRequirements(moId);
      
      const shortages = requirements.requirements.filter(req => !req.stock_sufficient);
      const allAvailable = shortages.length === 0;

      return {
        ...requirements,
        all_materials_available: allAvailable,
        shortages: shortages.map(shortage => ({
          component_product_id: shortage.component_product_id,
          product_name: shortage.product_name,
          required: shortage.total_required,
          available: shortage.current_stock,
          shortage_quantity: shortage.total_required - shortage.current_stock
        }))
      };
    } catch (error) {
      throw new Error(`Material availability check failed: ${error.message}`);
    }
  }

  /**
   * Generate work orders for manufacturing order
   */
  static async generateWorkOrders(moId, workCenterAssignments, createdBy) {
    try {
      const mo = await this.findById(moId);
      if (!mo) {
        throw new Error('Manufacturing order not found');
      }

      if (mo.status !== 'planned' && mo.status !== 'released') {
        throw new Error('Work orders can only be generated for planned or released manufacturing orders');
      }

      // workCenterAssignments = [{ work_center_id: 1, operation: 'Assembly', sequence: 1 }, ...]
      const workOrdersToCreate = workCenterAssignments.map((assignment, index) => ({
        mo_id: moId,
        work_center_id: assignment.work_center_id,
        operation: assignment.operation,
        sequence: assignment.sequence || index + 1,
        planned_quantity: mo.quantity,
        status: 'pending',
        created_by: createdBy
      }));

      const { data, error } = await supabase
        .from('work_orders')
        .insert(workOrdersToCreate)
        .select(`
          *,
          work_centers:work_center_id (
            name,
            department,
            capacity_per_hour
          )
        `);

      if (error) throw error;

      // Update MO status to released if it was planned
      if (mo.status === 'planned') {
        await this.updateStatus(moId, 'released', createdBy, 'Work orders generated');
      }

      return data;
    } catch (error) {
      throw new Error(`Work order generation failed: ${error.message}`);
    }
  }

  /**
   * Get manufacturing orders by status
   */
  static async getByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('manufacturing_orders')
        .select(`
          *,
          products:product_id (
            name,
            type,
            unit
          ),
          users:created_by (
            name,
            email
          )
        `)
        .eq('status', status)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Manufacturing orders by status lookup failed: ${error.message}`);
    }
  }

  /**
   * Get manufacturing order statistics
   */
  static async getStatistics(startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('manufacturing_orders')
        .select('status, priority, created_at, quantity')
        .eq('is_active', true);

      if (startDate) query = query.gte('created_at', startDate);
      if (endDate) query = query.lte('created_at', endDate);

      const { data, error } = await query;

      if (error) throw error;

      // Calculate statistics
      const stats = {
        total_orders: data.length,
        by_status: {
          planned: data.filter(mo => mo.status === 'planned').length,
          released: data.filter(mo => mo.status === 'released').length,
          in_progress: data.filter(mo => mo.status === 'in_progress').length,
          completed: data.filter(mo => mo.status === 'completed').length,
          cancelled: data.filter(mo => mo.status === 'cancelled').length
        },
        by_priority: {
          low: data.filter(mo => mo.priority === 'low').length,
          medium: data.filter(mo => mo.priority === 'medium').length,
          high: data.filter(mo => mo.priority === 'high').length,
          urgent: data.filter(mo => mo.priority === 'urgent').length
        },
        total_planned_quantity: data.reduce((sum, mo) => sum + mo.quantity, 0),
        completed_orders: data.filter(mo => mo.status === 'completed').length,
        completion_rate: data.length > 0 ? (data.filter(mo => mo.status === 'completed').length / data.length) * 100 : 0
      };

      return stats;
    } catch (error) {
      throw new Error(`Statistics lookup failed: ${error.message}`);
    }
  }

  /**
   * Cancel manufacturing order
   */
  static async cancel(moId, cancelledBy, reason = null) {
    try {
      // Check if MO can be cancelled
      const mo = await this.findById(moId);
      if (!mo) {
        throw new Error('Manufacturing order not found');
      }

      if (mo.status === 'completed' || mo.status === 'cancelled') {
        throw new Error('Cannot cancel completed or already cancelled manufacturing order');
      }

      // Cancel related work orders
      await supabase
        .from('work_orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('mo_id', moId)
        .in('status', ['pending', 'in_progress']);

      // Update MO status
      const updates = {
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : mo.notes,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('manufacturing_orders')
        .update(updates)
        .eq('mo_id', moId)
        .select(`
          *,
          products:product_id (
            name,
            type,
            unit
          )
        `)
        .single();

      if (error) throw error;

      // Log cancellation
      await this.logStatusChange(moId, 'cancelled', cancelledBy, reason);

      return data;
    } catch (error) {
      throw new Error(`Manufacturing order cancellation failed: ${error.message}`);
    }
  }

  /**
   * Search manufacturing orders for dropdown/autocomplete
   */
  static async searchForDropdown(searchTerm, status = null, limit = 50) {
    try {
      let query = supabase
        .from('manufacturing_orders')
        .select(`
          mo_id,
          mo_number,
          status,
          quantity,
          products:product_id (
            name
          )
        `)
        .eq('is_active', true);

      if (status) {
        query = query.eq('status', status);
      }

      if (searchTerm) {
        query = query.or(`mo_number.ilike.%${searchTerm}%`);
      }

      query = query.order('mo_number', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Manufacturing order search failed: ${error.message}`);
    }
  }

  /**
   * Soft delete manufacturing order (deactivate)
   */
  static async softDelete(moId) {
    try {
      const { data, error } = await supabase
        .from('manufacturing_orders')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('mo_id', moId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Manufacturing order deactivation failed: ${error.message}`);
    }
  }
}

export default ManufacturingOrderModel;
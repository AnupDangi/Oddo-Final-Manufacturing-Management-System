import { supabase } from '../config/db.js';

/**
 * Dashboard Model for Manufacturing Management System
 * Handles real-time KPIs, analytics, and dashboard data aggregation
 */

class DashboardModel {
  /**
   * Get main dashboard overview
   */
  static async getOverview(dateRange = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Get production summary
      const { data: moData, error: moError } = await supabase
        .from('manufacturing_orders')
        .select('status, quantity, created_at')
        .gte('created_at', startDate.toISOString())
        .eq('is_active', true);

      if (moError) throw moError;

      // Get inventory summary
      const { data: stockData, error: stockError } = await supabase
        .from('products')
        .select('current_stock, reorder_level, cost_price')
        .eq('is_active', true);

      if (stockError) throw stockError;

      // Get work order summary
      const { data: woData, error: woError } = await supabase
        .from('work_orders')
        .select('status, actual_hours, created_at')
        .gte('created_at', startDate.toISOString());

      if (woError) throw woError;

      // Calculate metrics
      const totalMOs = moData.length;
      const completedMOs = moData.filter(mo => mo.status === 'completed').length;
      const inProgressMOs = moData.filter(mo => mo.status === 'in_progress').length;
      const totalProduction = moData.reduce((sum, mo) => sum + (mo.quantity || 0), 0);

      const lowStockItems = stockData.filter(p => p.current_stock <= p.reorder_level).length;
      const totalStockValue = stockData.reduce((sum, p) => sum + (p.current_stock * p.cost_price), 0);

      const totalWOs = woData.length;
      const completedWOs = woData.filter(wo => wo.status === 'completed').length;
      const totalHours = woData.reduce((sum, wo) => sum + (wo.actual_hours || 0), 0);

      return {
        date_range: dateRange,
        production: {
          total_orders: totalMOs,
          completed_orders: completedMOs,
          in_progress_orders: inProgressMOs,
          completion_rate: totalMOs > 0 ? (completedMOs / totalMOs) * 100 : 0,
          total_production_quantity: totalProduction
        },
        inventory: {
          total_products: stockData.length,
          low_stock_items: lowStockItems,
          total_stock_value: totalStockValue,
          stock_alert_percentage: stockData.length > 0 ? (lowStockItems / stockData.length) * 100 : 0
        },
        operations: {
          total_work_orders: totalWOs,
          completed_work_orders: completedWOs,
          work_order_completion_rate: totalWOs > 0 ? (completedWOs / totalWOs) * 100 : 0,
          total_production_hours: totalHours
        }
      };
    } catch (error) {
      throw new Error(`Dashboard overview calculation failed: ${error.message}`);
    }
  }

  /**
   * Get production KPIs
   */
  static async getProductionKPIs(options = {}) {
    try {
      const { start_date, end_date, work_center_id } = options;

      let woQuery = supabase
        .from('work_orders')
        .select(`
          status,
          planned_quantity,
          actual_quantity,
          estimated_hours,
          actual_hours,
          actual_start_time,
          actual_end_time,
          work_center_id
        `);

      if (work_center_id) woQuery = woQuery.eq('work_center_id', work_center_id);
      if (start_date) woQuery = woQuery.gte('actual_start_time', start_date);
      if (end_date) woQuery = woQuery.lte('actual_end_time', end_date);

      const { data: workOrders, error: woError } = await woQuery;
      if (woError) throw woError;

      // Calculate KPIs
      const completedWOs = workOrders.filter(wo => wo.status === 'completed');
      
      const totalPlannedQuantity = completedWOs.reduce((sum, wo) => sum + (wo.planned_quantity || 0), 0);
      const totalActualQuantity = completedWOs.reduce((sum, wo) => sum + (wo.actual_quantity || 0), 0);
      const totalPlannedHours = completedWOs.reduce((sum, wo) => sum + (wo.estimated_hours || 0), 0);
      const totalActualHours = completedWOs.reduce((sum, wo) => sum + (wo.actual_hours || 0), 0);

      const quantityEfficiency = totalPlannedQuantity > 0 ? (totalActualQuantity / totalPlannedQuantity) * 100 : 0;
      const timeEfficiency = totalActualHours > 0 ? (totalPlannedHours / totalActualHours) * 100 : 0;
      const overallEfficiency = (quantityEfficiency + timeEfficiency) / 2;

      return {
        period: { start_date, end_date },
        work_center_id,
        total_work_orders: workOrders.length,
        completed_work_orders: completedWOs.length,
        completion_rate: workOrders.length > 0 ? (completedWOs.length / workOrders.length) * 100 : 0,
        quantity_efficiency: quantityEfficiency,
        time_efficiency: timeEfficiency,
        overall_efficiency: overallEfficiency,
        total_planned_quantity: totalPlannedQuantity,
        total_actual_quantity: totalActualQuantity,
        total_planned_hours: totalPlannedHours,
        total_actual_hours: totalActualHours
      };
    } catch (error) {
      throw new Error(`Production KPIs calculation failed: ${error.message}`);
    }
  }

  /**
   * Get inventory KPIs
   */
  static async getInventoryKPIs(options = {}) {
    try {
      const { product_type, category } = options;

      let query = supabase
        .from('products')
        .select('current_stock, reorder_level, cost_price, type, category')
        .eq('is_active', true);

      if (product_type) query = query.eq('type', product_type);
      if (category) query = query.eq('category', category);

      const { data: products, error } = await query;
      if (error) throw error;

      // Calculate inventory metrics
      const totalProducts = products.length;
      const lowStockProducts = products.filter(p => p.current_stock <= p.reorder_level);
      const outOfStockProducts = products.filter(p => p.current_stock === 0);
      const totalStockValue = products.reduce((sum, p) => sum + (p.current_stock * p.cost_price), 0);

      // Group by type
      const byType = products.reduce((acc, product) => {
        if (!acc[product.type]) {
          acc[product.type] = {
            count: 0,
            total_value: 0,
            total_quantity: 0,
            low_stock_count: 0
          };
        }
        acc[product.type].count++;
        acc[product.type].total_value += product.current_stock * product.cost_price;
        acc[product.type].total_quantity += product.current_stock;
        if (product.current_stock <= product.reorder_level) {
          acc[product.type].low_stock_count++;
        }
        return acc;
      }, {});

      return {
        filters: { product_type, category },
        summary: {
          total_products: totalProducts,
          low_stock_products: lowStockProducts.length,
          out_of_stock_products: outOfStockProducts.length,
          total_stock_value: totalStockValue,
          low_stock_percentage: totalProducts > 0 ? (lowStockProducts.length / totalProducts) * 100 : 0
        },
        by_type: byType,
        alerts: {
          critical: outOfStockProducts.length,
          warning: lowStockProducts.length - outOfStockProducts.length,
          healthy: totalProducts - lowStockProducts.length
        }
      };
    } catch (error) {
      throw new Error(`Inventory KPIs calculation failed: ${error.message}`);
    }
  }

  /**
   * Get work center utilization
   */
  static async getWorkCenterUtilization(options = {}) {
    try {
      const { start_date, end_date, work_center_id } = options;

      let wcQuery = supabase
        .from('work_centers')
        .select(`
          work_center_id,
          name,
          capacity_per_hour
        `)
        .eq('is_active', true);

      if (work_center_id) wcQuery = wcQuery.eq('work_center_id', work_center_id);

      const { data: workCenters, error: wcError } = await wcQuery;
      if (wcError) throw wcError;

      const utilizationData = [];

      for (const wc of workCenters) {
        // Get work orders for this work center
        let woQuery = supabase
          .from('work_orders')
          .select('actual_hours, status, actual_start_time, actual_end_time')
          .eq('work_center_id', wc.work_center_id);

        if (start_date) woQuery = woQuery.gte('actual_start_time', start_date);
        if (end_date) woQuery = woQuery.lte('actual_end_time', end_date);

        const { data: workOrders, error: woError } = await woQuery;
        if (woError) throw woError;

        // Get downtime for this work center
        let downtimeQuery = supabase
          .from('work_center_downtime')
          .select('downtime_minutes')
          .eq('work_center_id', wc.work_center_id);

        if (start_date) downtimeQuery = downtimeQuery.gte('downtime_date', start_date);
        if (end_date) downtimeQuery = downtimeQuery.lte('downtime_date', end_date);

        const { data: downtime, error: dtError } = await downtimeQuery;
        if (dtError) throw dtError;

        // Calculate utilization
        const totalWorkHours = workOrders.reduce((sum, wo) => sum + (wo.actual_hours || 0), 0);
        const totalDowntimeHours = downtime.reduce((sum, dt) => sum + (dt.downtime_minutes / 60), 0);
        
        // Calculate available hours (assuming 8-hour work days)
        const daysInPeriod = start_date && end_date 
          ? Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24))
          : 30; // default to 30 days
        
        const availableHours = daysInPeriod * 8; // 8 hours per day
        const effectiveAvailableHours = availableHours - totalDowntimeHours;
        
        const utilizationPercentage = effectiveAvailableHours > 0 
          ? (totalWorkHours / effectiveAvailableHours) * 100 
          : 0;

        utilizationData.push({
          work_center_id: wc.work_center_id,
          work_center_name: wc.name,
          capacity_per_hour: wc.capacity_per_hour,
          total_work_hours: totalWorkHours,
          total_downtime_hours: totalDowntimeHours,
          available_hours: availableHours,
          effective_available_hours: effectiveAvailableHours,
          utilization_percentage: Math.min(utilizationPercentage, 100), // Cap at 100%
          total_work_orders: workOrders.length,
          completed_work_orders: workOrders.filter(wo => wo.status === 'completed').length
        });
      }

      return {
        period: { start_date, end_date },
        work_centers: utilizationData,
        overall_utilization: utilizationData.length > 0 
          ? utilizationData.reduce((sum, wc) => sum + wc.utilization_percentage, 0) / utilizationData.length 
          : 0
      };
    } catch (error) {
      throw new Error(`Work center utilization calculation failed: ${error.message}`);
    }
  }

  /**
   * Get recent activities feed
   */
  static async getRecentActivities(options = {}) {
    try {
      const { limit = 20, activity_types } = options;

      const activities = [];

      // Get recent manufacturing orders
      if (!activity_types || activity_types.includes('production')) {
        const { data: moData, error: moError } = await supabase
          .from('manufacturing_orders')
          .select(`
            mo_id,
            mo_number,
            status,
            created_at,
            updated_at,
            products:product_id (name),
            users:created_by (name)
          `)
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (!moError) {
          moData.forEach(mo => {
            activities.push({
              type: 'production',
              title: `Manufacturing Order ${mo.mo_number}`,
              description: `${mo.status} - ${mo.products?.name}`,
              user: mo.users?.name,
              timestamp: mo.updated_at,
              reference_id: mo.mo_id,
              reference_type: 'manufacturing_order'
            });
          });
        }
      }

      // Get recent stock movements
      if (!activity_types || activity_types.includes('inventory')) {
        const { data: stockData, error: stockError } = await supabase
          .from('stock_ledger')
          .select(`
            movement_type,
            quantity,
            reason,
            movement_date,
            products:product_id (name),
            users:recorded_by (name)
          `)
          .order('movement_date', { ascending: false })
          .limit(limit);

        if (!stockError) {
          stockData.forEach(movement => {
            activities.push({
              type: 'inventory',
              title: `Stock ${movement.movement_type === 'in' ? 'Receipt' : 'Issue'}`,
              description: `${movement.quantity} ${movement.products?.name} - ${movement.reason}`,
              user: movement.users?.name,
              timestamp: movement.movement_date,
              reference_type: 'stock_movement'
            });
          });
        }
      }

      // Get recent work order updates
      if (!activity_types || activity_types.includes('operations')) {
        const { data: woData, error: woError } = await supabase
          .from('work_orders')
          .select(`
            wo_number,
            status,
            operation,
            updated_at,
            work_centers:work_center_id (name),
            operators:operator_id (name)
          `)
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (!woError) {
          woData.forEach(wo => {
            activities.push({
              type: 'operations',
              title: `Work Order ${wo.wo_number}`,
              description: `${wo.status} - ${wo.operation} at ${wo.work_centers?.name}`,
              user: wo.operators?.name,
              timestamp: wo.updated_at,
              reference_type: 'work_order'
            });
          });
        }
      }

      // Sort all activities by timestamp and limit
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return activities.slice(0, limit);
    } catch (error) {
      throw new Error(`Recent activities retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts(options = {}) {
    try {
      const { threshold_multiplier = 1, product_type } = options;

      let query = supabase
        .from('products')
        .select('product_id, name, type, unit, current_stock, reorder_level, cost_price')
        .eq('is_active', true);

      if (product_type) query = query.eq('type', product_type);

      const { data: products, error } = await query;
      if (error) throw error;

      // Filter products below threshold
      const alerts = products
        .filter(product => product.current_stock <= (product.reorder_level * threshold_multiplier))
        .map(product => {
          let severity;
          if (product.current_stock === 0) {
            severity = 'critical';
          } else if (product.current_stock <= product.reorder_level * 0.5) {
            severity = 'high';
          } else if (product.current_stock <= product.reorder_level) {
            severity = 'medium';
          } else {
            severity = 'low';
          }

          return {
            ...product,
            severity,
            shortage_quantity: Math.max(0, product.reorder_level - product.current_stock),
            stock_days_remaining: this.calculateStockDaysRemaining(product.product_id, product.current_stock)
          };
        })
        .sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        });

      return {
        threshold_multiplier,
        total_alerts: alerts.length,
        by_severity: {
          critical: alerts.filter(a => a.severity === 'critical').length,
          high: alerts.filter(a => a.severity === 'high').length,
          medium: alerts.filter(a => a.severity === 'medium').length,
          low: alerts.filter(a => a.severity === 'low').length
        },
        alerts
      };
    } catch (error) {
      throw new Error(`Low stock alerts calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate estimated stock days remaining (simplified calculation)
   */
  static calculateStockDaysRemaining(productId, currentStock) {
    // This is a simplified calculation - in reality, you'd analyze historical consumption
    // For now, assume average consumption of 10% of current stock per day
    if (currentStock <= 0) return 0;
    const estimatedDailyConsumption = Math.max(1, currentStock * 0.1);
    return Math.floor(currentStock / estimatedDailyConsumption);
  }

  /**
   * Get production schedule
   */
  static async getProductionSchedule(options = {}) {
    try {
      const { days_ahead = 7, work_center_id, status } = options;

      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days_ahead);

      let query = supabase
        .from('manufacturing_orders')
        .select(`
          mo_id,
          mo_number,
          quantity,
          status,
          priority,
          planned_start_date,
          planned_end_date,
          products:product_id (name, type),
          users:created_by (name)
        `)
        .gte('planned_start_date', today.toISOString())
        .lte('planned_start_date', futureDate.toISOString())
        .eq('is_active', true);

      if (status) query = query.eq('status', status);

      const { data: manufacturingOrders, error: moError } = await query;
      if (moError) throw moError;

      // Get associated work orders
      const schedule = [];
      for (const mo of manufacturingOrders) {
        let woQuery = supabase
          .from('work_orders')
          .select(`
            wo_id,
            wo_number,
            operation,
            sequence,
            planned_quantity,
            status,
            work_centers:work_center_id (work_center_id, name, department)
          `)
          .eq('mo_id', mo.mo_id);

        if (work_center_id) woQuery = woQuery.eq('work_center_id', work_center_id);

        const { data: workOrders, error: woError } = await woQuery;
        if (woError) continue;

        schedule.push({
          ...mo,
          work_orders: workOrders
        });
      }

      return {
        period: {
          start_date: today.toISOString(),
          end_date: futureDate.toISOString(),
          days_ahead
        },
        filters: { work_center_id, status },
        total_orders: schedule.length,
        schedule: schedule.sort((a, b) => new Date(a.planned_start_date) - new Date(b.planned_start_date))
      };
    } catch (error) {
      throw new Error(`Production schedule retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get quality metrics (simplified - would need quality tables in real implementation)
   */
  static async getQualityMetrics(options = {}) {
    try {
      const { start_date, end_date, product_id } = options;

      // This is simplified - in a real system you'd have quality check tables
      let query = supabase
        .from('work_orders')
        .select('planned_quantity, actual_quantity, quality_check, completed_at')
        .eq('status', 'completed')
        .not('quality_check', 'is', null);

      if (product_id) {
        // Would need to join through manufacturing orders
        query = query.eq('manufacturing_orders.product_id', product_id);
      }
      if (start_date) query = query.gte('completed_at', start_date);
      if (end_date) query = query.lte('completed_at', end_date);

      const { data: workOrders, error } = await query;
      if (error) throw error;

      const totalProduced = workOrders.reduce((sum, wo) => sum + (wo.actual_quantity || 0), 0);
      const passedQuality = workOrders.filter(wo => wo.quality_check === 'passed');
      const failedQuality = workOrders.filter(wo => wo.quality_check === 'failed');
      const reworkRequired = workOrders.filter(wo => wo.quality_check === 'rework');

      const qualityRate = totalProduced > 0 
        ? (passedQuality.reduce((sum, wo) => sum + wo.actual_quantity, 0) / totalProduced) * 100 
        : 0;

      return {
        period: { start_date, end_date },
        product_id,
        summary: {
          total_produced: totalProduced,
          quality_passed: passedQuality.length,
          quality_failed: failedQuality.length,
          rework_required: reworkRequired.length,
          quality_rate: qualityRate,
          defect_rate: 100 - qualityRate
        }
      };
    } catch (error) {
      throw new Error(`Quality metrics calculation failed: ${error.message}`);
    }
  }

  /**
   * Get real-time status
   */
  static async getRealTimeStatus() {
    try {
      const now = new Date();

      // Get current work orders status
      const { data: activeWOs, error: woError } = await supabase
        .from('work_orders')
        .select('status')
        .in('status', ['pending', 'in_progress', 'paused']);

      if (woError) throw woError;

      // Get current manufacturing orders status
      const { data: activeMOs, error: moError } = await supabase
        .from('manufacturing_orders')
        .select('status')
        .in('status', ['planned', 'released', 'in_progress'])
        .eq('is_active', true);

      if (moError) throw moError;

      // Get critical stock levels
      const { data: criticalStock, error: stockError } = await supabase
        .from('products')
        .select('product_id')
        .eq('current_stock', 0)
        .eq('is_active', true);

      if (stockError) throw stockError;

      return {
        timestamp: now.toISOString(),
        work_orders: {
          pending: activeWOs.filter(wo => wo.status === 'pending').length,
          in_progress: activeWOs.filter(wo => wo.status === 'in_progress').length,
          paused: activeWOs.filter(wo => wo.status === 'paused').length
        },
        manufacturing_orders: {
          planned: activeMOs.filter(mo => mo.status === 'planned').length,
          released: activeMOs.filter(mo => mo.status === 'released').length,
          in_progress: activeMOs.filter(mo => mo.status === 'in_progress').length
        },
        alerts: {
          out_of_stock_items: criticalStock.length,
          total_active_orders: activeMOs.length,
          total_active_work_orders: activeWOs.length
        }
      };
    } catch (error) {
      throw new Error(`Real-time status retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get alerts and notifications
   */
  static async getAlerts(options = {}) {
    try {
      const { severity, category, limit = 50 } = options;

      const alerts = [];

      // Stock alerts
      if (!category || category === 'inventory') {
        const { data: products, error } = await supabase
          .from('products')
          .select('product_id, name, current_stock, reorder_level')
          .lte('current_stock', 'reorder_level')
          .eq('is_active', true);

        if (!error) {
          products.forEach(product => {
            const alertSeverity = product.current_stock === 0 ? 'critical' : 'medium';
            if (!severity || severity === alertSeverity) {
              alerts.push({
                id: `stock_${product.product_id}`,
                type: 'inventory',
                severity: alertSeverity,
                title: product.current_stock === 0 ? 'Out of Stock' : 'Low Stock',
                message: `${product.name} - Current: ${product.current_stock}, Reorder: ${product.reorder_level}`,
                created_at: new Date().toISOString(),
                reference_id: product.product_id,
                reference_type: 'product'
              });
            }
          });
        }
      }

      // Production alerts (overdue manufacturing orders)
      if (!category || category === 'production') {
        const { data: overdueMOs, error } = await supabase
          .from('manufacturing_orders')
          .select('mo_id, mo_number, planned_end_date, products:product_id (name)')
          .lt('planned_end_date', new Date().toISOString())
          .in('status', ['planned', 'released', 'in_progress'])
          .eq('is_active', true);

        if (!error) {
          overdueMOs.forEach(mo => {
            const alertSeverity = 'high';
            if (!severity || severity === alertSeverity) {
              alerts.push({
                id: `overdue_mo_${mo.mo_id}`,
                type: 'production',
                severity: alertSeverity,
                title: 'Overdue Manufacturing Order',
                message: `${mo.mo_number} for ${mo.products?.name} is overdue`,
                created_at: new Date().toISOString(),
                reference_id: mo.mo_id,
                reference_type: 'manufacturing_order'
              });
            }
          });
        }
      }

      // Sort by severity and limit
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      alerts.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

      return alerts.slice(0, limit);
    } catch (error) {
      throw new Error(`Alerts retrieval failed: ${error.message}`);
    }
  }
}

export default DashboardModel;
import { supabase } from '../config/db.js';
import ProductModel from './ProductModel.js';

/**
 * Stock Ledger Model for Manufacturing Management System
 * Handles inventory movements, stock tracking, and inventory analytics
 */

class StockLedgerModel {
  /**
   * Record stock movement (in/out)
   */
  static async recordMovement(movementData) {
    try {
      const { 
        product_id, 
        movement_type, 
        quantity, 
        reference_type = null,
        reference_id = null,
        reason,
        notes,
        recorded_by 
      } = movementData;
      
      // Validate movement type
      if (!['in', 'out'].includes(movement_type)) {
        throw new Error('Movement type must be "in" or "out"');
      }

      // Get current stock
      const currentStock = await ProductModel.getCurrentStock(product_id);
      if (!currentStock) {
        throw new Error('Product not found');
      }

      // Check if we have enough stock for outward movement
      if (movement_type === 'out' && currentStock.current_stock < quantity) {
        throw new Error('Insufficient stock for outward movement');
      }

      // Calculate new stock level
      const newStockLevel = movement_type === 'in' 
        ? currentStock.current_stock + quantity 
        : currentStock.current_stock - quantity;

      // Start transaction
      const { data: movement, error: movementError } = await supabase
        .from('stock_ledger')
        .insert([{
          product_id,
          movement_type,
          quantity,
          reference_type,
          reference_id,
          reason,
          notes,
          previous_stock: currentStock.current_stock,
          new_stock: newStockLevel,
          recorded_by,
          movement_date: new Date().toISOString()
        }])
        .select(`
          *,
          products:product_id (
            name,
            unit,
            reorder_level
          ),
          users:recorded_by (
            name,
            email
          )
        `)
        .single();

      if (movementError) throw movementError;

      // Update product stock
      await ProductModel.updateStock(product_id, newStockLevel);

      return movement;
    } catch (error) {
      throw new Error(`Stock movement recording failed: ${error.message}`);
    }
  }

  /**
   * Get all stock movements with filtering and pagination
   */
  static async findAll(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        product_id = null,
        movement_type = null,
        reference_type = null,
        start_date = null,
        end_date = null
      } = options;

      let query = supabase
        .from('stock_ledger')
        .select(`
          *,
          products:product_id (
            name,
            unit,
            type
          ),
          users:recorded_by (
            name,
            email
          )
        `, { count: 'exact' });

      // Apply filters
      if (product_id) query = query.eq('product_id', product_id);
      if (movement_type) query = query.eq('movement_type', movement_type);
      if (reference_type) query = query.eq('reference_type', reference_type);
      if (start_date) query = query.gte('movement_date', start_date);
      if (end_date) query = query.lte('movement_date', end_date);

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Order by movement date (newest first)
      query = query.order('movement_date', { ascending: false });

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
      throw new Error(`Stock movements lookup failed: ${error.message}`);
    }
  }

  /**
   * Get stock movements by product
   */
  static async getByProduct(productId, options = {}) {
    try {
      const { start_date, end_date, movement_type } = options;

      let query = supabase
        .from('stock_ledger')
        .select(`
          *,
          users:recorded_by (
            name,
            email
          )
        `)
        .eq('product_id', productId);

      if (movement_type) query = query.eq('movement_type', movement_type);
      if (start_date) query = query.gte('movement_date', start_date);
      if (end_date) query = query.lte('movement_date', end_date);

      query = query.order('movement_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Product stock movements lookup failed: ${error.message}`);
    }
  }

  /**
   * Get current stock levels for all products
   */
  static async getCurrentStockLevels(options = {}) {
    try {
      const { product_type, low_stock, category } = options;

      let query = supabase
        .from('products')
        .select('product_id, name, type, unit, current_stock, reorder_level, cost_price, category')
        .eq('is_active', true);

      if (product_type) query = query.eq('type', product_type);
      if (category) query = query.eq('category', category);
      if (low_stock) query = query.lt('current_stock', 'reorder_level');

      query = query.order('name');

      const { data, error } = await query;

      if (error) throw error;

      // Add stock status to each product
      const stockLevels = data.map(product => ({
        ...product,
        stock_status: this.getStockStatus(product.current_stock, product.reorder_level),
        stock_value: product.current_stock * product.cost_price
      }));

      return stockLevels;
    } catch (error) {
      throw new Error(`Stock levels lookup failed: ${error.message}`);
    }
  }

  /**
   * Get stock status based on current stock and reorder level
   */
  static getStockStatus(currentStock, reorderLevel) {
    if (currentStock <= 0) return 'out_of_stock';
    if (currentStock <= reorderLevel) return 'low_stock';
    if (currentStock <= reorderLevel * 2) return 'normal';
    return 'high_stock';
  }

  /**
   * Get stock valuation report
   */
  static async getStockValuation(options = {}) {
    try {
      const { product_type, category, as_of_date } = options;

      let query = supabase
        .from('products')
        .select('product_id, name, type, unit, current_stock, cost_price, category')
        .eq('is_active', true);

      if (product_type) query = query.eq('type', product_type);
      if (category) query = query.eq('category', category);

      const { data, error } = await query;

      if (error) throw error;

      // Calculate valuation
      const valuation = data.map(product => {
        const stockValue = product.current_stock * product.cost_price;
        return {
          ...product,
          stock_value: stockValue
        };
      });

      // Calculate totals
      const totalStockValue = valuation.reduce((sum, item) => sum + item.stock_value, 0);
      const totalProducts = valuation.length;
      const totalQuantity = valuation.reduce((sum, item) => sum + item.current_stock, 0);

      // Group by type
      const byType = valuation.reduce((acc, item) => {
        if (!acc[item.type]) {
          acc[item.type] = { count: 0, value: 0, quantity: 0 };
        }
        acc[item.type].count++;
        acc[item.type].value += item.stock_value;
        acc[item.type].quantity += item.current_stock;
        return acc;
      }, {});

      return {
        as_of_date: as_of_date || new Date().toISOString(),
        products: valuation,
        summary: {
          total_stock_value: totalStockValue,
          total_products: totalProducts,
          total_quantity: totalQuantity,
          by_type: byType
        }
      };
    } catch (error) {
      throw new Error(`Stock valuation calculation failed: ${error.message}`);
    }
  }

  /**
   * Perform stock adjustment
   */
  static async performAdjustment(adjustmentData) {
    try {
      const { 
        product_id, 
        adjustment_quantity, 
        reason, 
        notes, 
        adjusted_by 
      } = adjustmentData;

      // Get current stock
      const currentStock = await ProductModel.getCurrentStock(product_id);
      if (!currentStock) {
        throw new Error('Product not found');
      }

      const newStockLevel = currentStock.current_stock + adjustment_quantity;

      if (newStockLevel < 0) {
        throw new Error('Stock adjustment would result in negative stock');
      }

      // Record the adjustment as a movement
      const movementType = adjustment_quantity > 0 ? 'in' : 'out';
      const quantity = Math.abs(adjustment_quantity);

      const movement = await this.recordMovement({
        product_id,
        movement_type: movementType,
        quantity,
        reference_type: 'adjustment',
        reason: `Stock Adjustment: ${reason}`,
        notes,
        recorded_by: adjusted_by
      });

      return movement;
    } catch (error) {
      throw new Error(`Stock adjustment failed: ${error.message}`);
    }
  }

  /**
   * Transfer stock between locations
   */
  static async transferStock(transferData) {
    try {
      const { 
        product_id, 
        from_location, 
        to_location, 
        quantity, 
        notes, 
        transferred_by 
      } = transferData;

      // Record outward movement from source location
      const outMovement = await this.recordMovement({
        product_id,
        movement_type: 'out',
        quantity,
        reference_type: 'transfer',
        reason: `Transfer to ${to_location}`,
        notes: `From: ${from_location}, To: ${to_location}. ${notes || ''}`,
        recorded_by: transferred_by
      });

      // Record inward movement to destination location
      const inMovement = await this.recordMovement({
        product_id,
        movement_type: 'in',
        quantity,
        reference_type: 'transfer',
        reason: `Transfer from ${from_location}`,
        notes: `From: ${from_location}, To: ${to_location}. ${notes || ''}`,
        recorded_by: transferred_by
      });

      return {
        out_movement: outMovement,
        in_movement: inMovement,
        transfer_details: {
          product_id,
          from_location,
          to_location,
          quantity,
          transferred_by,
          transfer_date: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Stock transfer failed: ${error.message}`);
    }
  }

  /**
   * Get inventory aging report
   */
  static async getInventoryAging(options = {}) {
    try {
      const { product_type, category, aging_periods = [30, 60, 90] } = options;

      let query = supabase
        .from('stock_ledger')
        .select(`
          product_id,
          movement_date,
          quantity,
          movement_type,
          products:product_id (
            name,
            type,
            unit,
            current_stock,
            cost_price,
            category
          )
        `)
        .eq('movement_type', 'in');

      if (product_type) {
        query = query.eq('products.type', product_type);
      }

      query = query.order('movement_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Calculate aging for each product
      const today = new Date();
      const productAging = {};

      data.forEach(movement => {
        const productId = movement.product_id;
        const movementDate = new Date(movement.movement_date);
        const daysOld = Math.floor((today - movementDate) / (1000 * 60 * 60 * 24));

        if (!productAging[productId]) {
          productAging[productId] = {
            ...movement.products,
            product_id: productId,
            aging_buckets: aging_periods.reduce((acc, period, index) => {
              const bucketName = index === 0 
                ? `0-${period} days`
                : index === aging_periods.length - 1
                ? `${aging_periods[index-1]}+ days`
                : `${aging_periods[index-1]}-${period} days`;
              acc[bucketName] = { quantity: 0, value: 0 };
              return acc;
            }, {})
          };
        }

        // Determine which bucket this movement falls into
        let bucketKey;
        for (let i = 0; i < aging_periods.length; i++) {
          if (daysOld <= aging_periods[i]) {
            bucketKey = i === 0 
              ? `0-${aging_periods[i]} days`
              : `${aging_periods[i-1]}-${aging_periods[i]} days`;
            break;
          }
        }
        
        if (!bucketKey) {
          bucketKey = `${aging_periods[aging_periods.length-1]}+ days`;
        }

        if (productAging[productId].aging_buckets[bucketKey]) {
          productAging[productId].aging_buckets[bucketKey].quantity += movement.quantity;
          productAging[productId].aging_buckets[bucketKey].value += 
            movement.quantity * movement.products.cost_price;
        }
      });

      return Object.values(productAging);
    } catch (error) {
      throw new Error(`Inventory aging calculation failed: ${error.message}`);
    }
  }

  /**
   * Get ABC analysis
   */
  static async getABCAnalysis(options = {}) {
    try {
      const { analysis_period = 90, classification_basis = 'value' } = options;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - analysis_period);

      // Get movement data for the period
      const { data, error } = await supabase
        .from('stock_ledger')
        .select(`
          product_id,
          quantity,
          movement_type,
          products:product_id (
            name,
            type,
            cost_price,
            current_stock
          )
        `)
        .gte('movement_date', startDate.toISOString())
        .lte('movement_date', endDate.toISOString());

      if (error) throw error;

      // Calculate consumption/usage for each product
      const productUsage = {};

      data.forEach(movement => {
        const productId = movement.product_id;
        
        if (!productUsage[productId]) {
          productUsage[productId] = {
            ...movement.products,
            product_id: productId,
            total_quantity_used: 0,
            total_value_used: 0
          };
        }

        if (movement.movement_type === 'out') {
          productUsage[productId].total_quantity_used += movement.quantity;
          productUsage[productId].total_value_used += 
            movement.quantity * movement.products.cost_price;
        }
      });

      // Convert to array and sort
      const products = Object.values(productUsage);
      const sortKey = classification_basis === 'value' ? 'total_value_used' : 'total_quantity_used';
      products.sort((a, b) => b[sortKey] - a[sortKey]);

      // Calculate cumulative percentages and classify
      const total = products.reduce((sum, product) => sum + product[sortKey], 0);
      let cumulative = 0;

      const classifiedProducts = products.map(product => {
        cumulative += product[sortKey];
        const cumulativePercentage = (cumulative / total) * 100;

        let classification;
        if (cumulativePercentage <= 80) {
          classification = 'A';
        } else if (cumulativePercentage <= 95) {
          classification = 'B';
        } else {
          classification = 'C';
        }

        return {
          ...product,
          percentage_of_total: (product[sortKey] / total) * 100,
          cumulative_percentage: cumulativePercentage,
          abc_classification: classification
        };
      });

      // Calculate summary statistics
      const summary = {
        analysis_period_days: analysis_period,
        classification_basis,
        total_products: products.length,
        class_a: classifiedProducts.filter(p => p.abc_classification === 'A').length,
        class_b: classifiedProducts.filter(p => p.abc_classification === 'B').length,
        class_c: classifiedProducts.filter(p => p.abc_classification === 'C').length,
        total_value: classification_basis === 'value' ? total : null,
        total_quantity: classification_basis === 'quantity' ? total : null
      };

      return {
        summary,
        products: classifiedProducts
      };
    } catch (error) {
      throw new Error(`ABC analysis calculation failed: ${error.message}`);
    }
  }

  /**
   * Consume materials for manufacturing order
   */
  static async consumeMaterials(consumptionData) {
    try {
      const { mo_id, consumption_details, notes, consumed_by } = consumptionData;

      const consumedItems = [];

      for (const item of consumption_details) {
        const { product_id, quantity_consumed } = item;

        const movement = await this.recordMovement({
          product_id,
          movement_type: 'out',
          quantity: quantity_consumed,
          reference_type: 'manufacturing_order',
          reference_id: mo_id,
          reason: `Material consumption for MO`,
          notes,
          recorded_by: consumed_by
        });

        consumedItems.push(movement);
      }

      return {
        mo_id,
        consumed_items,
        total_items: consumedItems.length,
        consumption_date: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Material consumption failed: ${error.message}`);
    }
  }

  /**
   * Receive production output
   */
  static async receiveProduction(productionData) {
    try {
      const { 
        mo_id, 
        product_id, 
        quantity_produced, 
        quality_status = 'passed', 
        notes, 
        received_by 
      } = productionData;

      // Only add to stock if quality passed
      if (quality_status === 'passed') {
        const movement = await this.recordMovement({
          product_id,
          movement_type: 'in',
          quantity: quantity_produced,
          reference_type: 'manufacturing_order',
          reference_id: mo_id,
          reason: `Production output from MO`,
          notes: `Quality: ${quality_status}. ${notes || ''}`,
          recorded_by: received_by
        });

        return {
          mo_id,
          product_id,
          quantity_produced,
          quality_status,
          movement,
          production_date: new Date().toISOString()
        };
      } else {
        // Record for tracking but don't add to stock
        return {
          mo_id,
          product_id,
          quantity_produced,
          quality_status,
          notes: `Quality: ${quality_status} - Not added to stock. ${notes || ''}`,
          production_date: new Date().toISOString()
        };
      }
    } catch (error) {
      throw new Error(`Production receipt failed: ${error.message}`);
    }
  }

  /**
   * Get audit trail for product
   */
  static async getAuditTrail(productId, options = {}) {
    try {
      const { start_date, end_date } = options;

      let query = supabase
        .from('stock_ledger')
        .select(`
          *,
          users:recorded_by (
            name,
            email
          )
        `)
        .eq('product_id', productId);

      if (start_date) query = query.gte('movement_date', start_date);
      if (end_date) query = query.lte('movement_date', end_date);

      query = query.order('movement_date', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      // Calculate running balance
      let runningBalance = 0;
      const auditTrail = data.map(movement => {
        if (movement.movement_type === 'in') {
          runningBalance += movement.quantity;
        } else {
          runningBalance -= movement.quantity;
        }

        return {
          ...movement,
          running_balance: runningBalance
        };
      });

      return auditTrail;
    } catch (error) {
      throw new Error(`Audit trail lookup failed: ${error.message}`);
    }
  }

  /**
   * Get stock ledger statistics
   */
  static async getStatistics(options = {}) {
    try {
      const { start_date, end_date } = options;

      let query = supabase
        .from('stock_ledger')
        .select('movement_type, quantity, movement_date');

      if (start_date) query = query.gte('movement_date', start_date);
      if (end_date) query = query.lte('movement_date', end_date);

      const { data, error } = await query;

      if (error) throw error;

      const stats = {
        total_movements: data.length,
        inward_movements: data.filter(m => m.movement_type === 'in').length,
        outward_movements: data.filter(m => m.movement_type === 'out').length,
        total_inward_quantity: data
          .filter(m => m.movement_type === 'in')
          .reduce((sum, m) => sum + m.quantity, 0),
        total_outward_quantity: data
          .filter(m => m.movement_type === 'out')
          .reduce((sum, m) => sum + m.quantity, 0),
        net_movement: data.reduce((sum, m) => {
          return sum + (m.movement_type === 'in' ? m.quantity : -m.quantity);
        }, 0)
      };

      return stats;
    } catch (error) {
      throw new Error(`Statistics lookup failed: ${error.message}`);
    }
  }
}

export default StockLedgerModel;
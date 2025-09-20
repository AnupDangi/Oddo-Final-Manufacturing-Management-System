import { supabase } from '../config/db.js';

/**
 * BOM (Bill of Materials) Model for Manufacturing Management System
 * Handles component relationships and material calculations
 */

class BOMModel {
  /**
   * Create a new BOM
   */
  static async create(bomData) {
    try {
      const { product_id, version, description, components } = bomData;
      
      // Validate required fields
      if (!product_id || !version) {
        throw new Error('Product ID and version are required');
      }

      if (!components || !Array.isArray(components) || components.length === 0) {
        throw new Error('At least one component is required');
      }

      // Check if BOM with same product_id and version already exists
      const { data: existing } = await supabase
        .from('boms')
        .select('bom_id')
        .eq('product_id', product_id)
        .eq('version', version)
        .single();

      if (existing) {
        throw new Error(`BOM version ${version} already exists for this product`);
      }

      // Create BOM header
      const { data: bomHeader, error: bomError } = await supabase
        .from('boms')
        .insert([{
          product_id,
          version,
          description,
          is_active: true
        }])
        .select()
        .single();

      if (bomError) throw bomError;

      // Create BOM components
      const componentsToInsert = components.map(comp => ({
        bom_id: bomHeader.bom_id,
        component_product_id: comp.component_product_id,
        quantity_required: comp.quantity_required,
        waste_percentage: comp.waste_percentage || 0,
        notes: comp.notes
      }));

      const { data: bomComponents, error: componentsError } = await supabase
        .from('bom_components')
        .insert(componentsToInsert)
        .select(`
          *,
          products:component_product_id (
            name,
            unit,
            cost_price
          )
        `);

      if (componentsError) throw componentsError;

      return {
        ...bomHeader,
        components: bomComponents
      };
    } catch (error) {
      throw new Error(`BOM creation failed: ${error.message}`);
    }
  }

  /**
   * Get all BOMs with filtering and pagination
   */
  static async findAll(options = {}) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        product_id = null,
        is_active = true,
        search = null
      } = options;

      let query = supabase
        .from('boms')
        .select(`
          *,
          products:product_id (
            name,
            type
          )
        `, { count: 'exact' });

      // Apply filters
      if (product_id) query = query.eq('product_id', product_id);
      if (is_active !== null) query = query.eq('is_active', is_active);
      
      // Search functionality
      if (search) {
        query = query.or(`description.ilike.%${search}%,version.ilike.%${search}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // Order by product name and version
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
      throw new Error(`BOMs lookup failed: ${error.message}`);
    }
  }

  /**
   * Get BOM by ID with components
   */
  static async findById(bomId) {
    try {
      const { data: bom, error: bomError } = await supabase
        .from('boms')
        .select(`
          *,
          products:product_id (
            name,
            type,
            unit
          )
        `)
        .eq('bom_id', bomId)
        .eq('is_active', true)
        .single();

      if (bomError && bomError.code !== 'PGRST116') throw bomError;
      if (!bom) return null;

      // Get BOM components
      const { data: components, error: componentsError } = await supabase
        .from('bom_components')
        .select(`
          *,
          products:component_product_id (
            name,
            unit,
            cost_price,
            current_stock
          )
        `)
        .eq('bom_id', bomId)
        .order('component_id');

      if (componentsError) throw componentsError;

      return {
        ...bom,
        components: components || []
      };
    } catch (error) {
      throw new Error(`BOM lookup failed: ${error.message}`);
    }
  }

  /**
   * Get BOM by product ID and version
   */
  static async findByProductAndVersion(productId, version) {
    try {
      const { data: bom, error: bomError } = await supabase
        .from('boms')
        .select('bom_id')
        .eq('product_id', productId)
        .eq('version', version)
        .eq('is_active', true)
        .single();

      if (bomError && bomError.code !== 'PGRST116') throw bomError;
      if (!bom) return null;

      return await this.findById(bom.bom_id);
    } catch (error) {
      throw new Error(`BOM lookup by product and version failed: ${error.message}`);
    }
  }

  /**
   * Update BOM header information
   */
  static async update(bomId, updateData) {
    try {
      const allowedUpdates = ['description', 'is_active'];
      
      const updates = {};
      
      // Filter allowed updates (version and product_id cannot be changed)
      for (const key of allowedUpdates) {
        if (updateData[key] !== undefined) {
          updates[key] = updateData[key];
        }
      }

      // Add updated timestamp
      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('boms')
        .update(updates)
        .eq('bom_id', bomId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`BOM update failed: ${error.message}`);
    }
  }

  static async updateComponents(bomId, components) {
    try {
      // First, delete existing components
      const { error: deleteError } = await supabase
        .from('bom_components')
        .delete()
        .eq('bom_id', bomId);

      if (deleteError) throw deleteError;

      // Insert new components
      const componentsToInsert = components.map(comp => ({
        bom_id: bomId,
        component_product_id: comp.component_product_id,
        quantity_required: comp.quantity_required,
        waste_percentage: comp.waste_percentage || 0,
        notes: comp.notes
      }));

      const { data: newComponents, error: insertError } = await supabase
        .from('bom_components')
        .insert(componentsToInsert)
        .select(`
          *,
          products:component_product_id (
            name,
            unit,
            cost_price
          )
        `);

      if (insertError) throw insertError;

      return newComponents;
    } catch (error) {
      throw new Error(`BOM components update failed: ${error.message}`);
    }
  }

  /**
   * Calculate scaled BOM for a given quantity
   */
  static async calculateScaledBOM(bomId, targetQuantity) {
    try {
      const bom = await this.findById(bomId);
      if (!bom) {
        throw new Error('BOM not found');
      }

      const scaledComponents = bom.components.map(component => {
        const baseQuantity = component.quantity_required;
        const wastePercentage = component.waste_percentage || 0;
        
        // Calculate quantity with waste
        const quantityWithWaste = baseQuantity * (1 + wastePercentage / 100);
        const scaledQuantity = quantityWithWaste * targetQuantity;

        return {
          ...component,
          base_quantity_required: baseQuantity,
          quantity_with_waste: quantityWithWaste,
          scaled_quantity: scaledQuantity,
          total_cost: scaledQuantity * component.products.cost_price,
          available_stock: component.products.current_stock,
          stock_sufficient: component.products.current_stock >= scaledQuantity
        };
      });

      const totalCost = scaledComponents.reduce((sum, comp) => sum + comp.total_cost, 0);
      const allComponentsAvailable = scaledComponents.every(comp => comp.stock_sufficient);

      return {
        bom_id: bomId,
        product: bom.products,
        target_quantity: targetQuantity,
        components: scaledComponents,
        total_cost: totalCost,
        cost_per_unit: totalCost / targetQuantity,
        all_components_available: allComponentsAvailable,
        shortages: scaledComponents
          .filter(comp => !comp.stock_sufficient)
          .map(comp => ({
            component_product_id: comp.component_product_id,
            product_name: comp.products.name,
            required: comp.scaled_quantity,
            available: comp.available_stock,
            shortage: comp.scaled_quantity - comp.available_stock
          }))
      };
    } catch (error) {
      throw new Error(`BOM calculation failed: ${error.message}`);
    }
  }

  /**
   * Get material cost breakdown for a BOM
   */
  static async getMaterialCost(bomId, quantity = 1) {
    try {
      const bom = await this.findById(bomId);
      if (!bom) {
        throw new Error('BOM not found');
      }

      const costBreakdown = bom.components.map(component => {
        const baseQuantity = component.quantity_required;
        const wastePercentage = component.waste_percentage || 0;
        const quantityWithWaste = baseQuantity * (1 + wastePercentage / 100);
        const totalQuantity = quantityWithWaste * quantity;
        const unitCost = component.products.cost_price;
        const totalCost = totalQuantity * unitCost;

        return {
          component_product_id: component.component_product_id,
          product_name: component.products.name,
          unit: component.products.unit,
          base_quantity: baseQuantity,
          waste_percentage: wastePercentage,
          quantity_with_waste: quantityWithWaste,
          total_quantity: totalQuantity,
          unit_cost: unitCost,
          total_cost: totalCost,
          cost_percentage: 0 // Will be calculated after total
        };
      });

      const totalMaterialCost = costBreakdown.reduce((sum, item) => sum + item.total_cost, 0);

      // Calculate cost percentages
      costBreakdown.forEach(item => {
        item.cost_percentage = totalMaterialCost > 0 ? (item.total_cost / totalMaterialCost) * 100 : 0;
      });

      return {
        bom_id: bomId,
        product_name: bom.products.name,
        quantity: quantity,
        cost_breakdown: costBreakdown,
        total_material_cost: totalMaterialCost,
        cost_per_unit: totalMaterialCost / quantity
      };
    } catch (error) {
      throw new Error(`Material cost calculation failed: ${error.message}`);
    }
  }

  /**
   * Clone BOM to create new version
   */
  static async cloneBOM(bomId, newVersion, description = null) {
    try {
      const originalBOM = await this.findById(bomId);
      if (!originalBOM) {
        throw new Error('Original BOM not found');
      }

      // Check if new version already exists
      const existingBOM = await this.findByProductAndVersion(originalBOM.product_id, newVersion);
      if (existingBOM) {
        throw new Error(`BOM version ${newVersion} already exists for this product`);
      }

      // Create new BOM
      const newBOMData = {
        product_id: originalBOM.product_id,
        version: newVersion,
        description: description || `Cloned from version ${originalBOM.version}`,
        components: originalBOM.components.map(comp => ({
          component_product_id: comp.component_product_id,
          quantity_required: comp.quantity_required,
          waste_percentage: comp.waste_percentage,
          notes: comp.notes
        }))
      };

      return await this.create(newBOMData);
    } catch (error) {
      throw new Error(`BOM cloning failed: ${error.message}`);
    }
  }

  /**
   * Get all versions of a BOM for a product
   */
  static async getVersionsByProduct(productId) {
    try {
      const { data, error } = await supabase
        .from('boms')
        .select(`
          bom_id,
          version,
          description,
          is_active,
          created_at,
          updated_at
        `)
        .eq('product_id', productId)
        .order('version', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`BOM versions lookup failed: ${error.message}`);
    }
  }

  /**
   * Get BOM statistics
   */
  static async getStatistics() {
    try {
      // Get total BOMs
      const { data: totalBOMs, error: totalError } = await supabase
        .from('boms')
        .select('bom_id')
        .eq('is_active', true);

      if (totalError) throw totalError;

      // Get BOMs by product type
      const { data: bomsByType, error: typeError } = await supabase
        .from('boms')
        .select(`
          bom_id,
          products:product_id (
            type
          )
        `)
        .eq('is_active', true);

      if (typeError) throw typeError;

      // Get component usage statistics
      const { data: componentStats, error: componentError } = await supabase
        .from('bom_components')
        .select(`
          component_product_id,
          products:component_product_id (
            name
          )
        `);

      if (componentError) throw componentError;

      // Calculate most used components
      const componentUsage = {};
      componentStats.forEach(comp => {
        const productName = comp.products.name;
        componentUsage[productName] = (componentUsage[productName] || 0) + 1;
      });

      const mostUsedComponents = Object.entries(componentUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ product_name: name, usage_count: count }));

      const stats = {
        total_boms: totalBOMs.length,
        finished_goods_boms: bomsByType.filter(b => b.products.type === 'finished_good').length,
        semi_finished_boms: bomsByType.filter(b => b.products.type === 'semi_finished').length,
        total_unique_components: Object.keys(componentUsage).length,
        most_used_components: mostUsedComponents
      };

      return stats;
    } catch (error) {
      throw new Error(`BOM statistics lookup failed: ${error.message}`);
    }
  }

  /**
   * Soft delete BOM (deactivate)
   */
  static async softDelete(bomId) {
    try {
      const { data, error } = await supabase
        .from('boms')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('bom_id', bomId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`BOM deactivation failed: ${error.message}`);
    }
  }

  /**
   * Search BOMs for dropdown/autocomplete
   */
  static async searchForDropdown(searchTerm, productId = null) {
    try {
      let query = supabase
        .from('boms')
        .select(`
          bom_id,
          version,
          description,
          products:product_id (
            name
          )
        `)
        .eq('is_active', true);

      if (productId) {
        query = query.eq('product_id', productId);
      }

      if (searchTerm) {
        query = query.or(`version.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      query = query.order('version').limit(50);

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`BOM search failed: ${error.message}`);
    }
  }
}

export default BOMModel;
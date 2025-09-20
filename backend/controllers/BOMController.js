import BOMModel from '../models/BOMModel.js';

/**
 * BOM (Bill of Materials) Controller for Manufacturing Management System
 * Handles product recipes, component scaling, cost calculations, and version management
 */

class BOMController {
  /**
   * Create a new BOM
   * @route POST /api/v1/boms
   * @access Private (Admin/Manager)
   */
  static async createBOM(req, res) {
    try {
      const { product_id, version, components, operations, description, is_default } = req.body;

      // Validate required fields
      if (!product_id || !components || !operations) {
        return res.status(400).json({
          success: false,
          message: 'Product ID, components, and operations are required'
        });
      }

      if (!Array.isArray(components) || components.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Components must be a non-empty array'
        });
      }

      if (!Array.isArray(operations) || operations.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Operations must be a non-empty array'
        });
      }

      // Validate components structure
      for (const component of components) {
        if (!component.product_id || !component.quantity || component.quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Each component must have product_id and positive quantity'
          });
        }
      }

      // Validate operations structure
      for (const operation of operations) {
        if (!operation.operation_name || !operation.duration_minutes || operation.duration_minutes <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Each operation must have operation_name and positive duration_minutes'
          });
        }
      }

      const bom = await BOMModel.create({
        product_id: parseInt(product_id),
        version: version || '1.0',
        components,
        operations,
        description,
        is_default: is_default || false
      });

      res.status(201).json({
        success: true,
        message: 'BOM created successfully',
        data: bom
      });

    } catch (error) {
      console.error('Create BOM error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create BOM',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get all BOMs with filtering and pagination
   * @route GET /api/v1/boms
   * @access Private (All authenticated users)
   */
  static async getAllBOMs(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        product_id,
        search,
        is_active = true
      } = req.query;

      const result = await BOMModel.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        product_id: product_id ? parseInt(product_id) : null,
        search,
        is_active: is_active === 'true'
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get all BOMs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve BOMs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get BOM by ID
   * @route GET /api/v1/boms/:bomId
   * @access Private (All authenticated users)
   */
  static async getBOMById(req, res) {
    try {
      const { bomId } = req.params;

      if (!bomId || isNaN(bomId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid BOM ID is required'
        });
      }

      const bom = await BOMModel.findById(parseInt(bomId));

      if (!bom) {
        return res.status(404).json({
          success: false,
          message: 'BOM not found'
        });
      }

      res.json({
        success: true,
        data: bom
      });

    } catch (error) {
      console.error('Get BOM by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve BOM',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get default BOM for a product
   * @route GET /api/v1/boms/product/:productId/default
   * @access Private (All authenticated users)
   */
  static async getDefaultBOMByProduct(req, res) {
    try {
      const { productId } = req.params;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required'
        });
      }

      const bom = await BOMModel.getDefaultByProductId(parseInt(productId));

      if (!bom) {
        return res.status(404).json({
          success: false,
          message: 'Default BOM not found for this product'
        });
      }

      res.json({
        success: true,
        data: bom
      });

    } catch (error) {
      console.error('Get default BOM error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve default BOM',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get all BOMs for a product
   * @route GET /api/v1/boms/product/:productId
   * @access Private (All authenticated users)
   */
  static async getBOMsByProduct(req, res) {
    try {
      const { productId } = req.params;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required'
        });
      }

      const boms = await BOMModel.getAllByProductId(parseInt(productId));

      res.json({
        success: true,
        data: boms,
        count: boms.length
      });

    } catch (error) {
      console.error('Get BOMs by product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve BOMs for product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update BOM
   * @route PUT /api/v1/boms/:bomId
   * @access Private (Admin/Manager)
   */
  static async updateBOM(req, res) {
    try {
      const { bomId } = req.params;
      const { version, components, operations, description, is_default, is_active } = req.body;

      if (!bomId || isNaN(bomId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid BOM ID is required'
        });
      }

      // Validate components if provided
      if (components) {
        if (!Array.isArray(components) || components.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Components must be a non-empty array'
          });
        }

        for (const component of components) {
          if (!component.product_id || !component.quantity || component.quantity <= 0) {
            return res.status(400).json({
              success: false,
              message: 'Each component must have product_id and positive quantity'
            });
          }
        }
      }

      // Validate operations if provided
      if (operations) {
        if (!Array.isArray(operations) || operations.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Operations must be a non-empty array'
          });
        }

        for (const operation of operations) {
          if (!operation.operation_name || !operation.duration_minutes || operation.duration_minutes <= 0) {
            return res.status(400).json({
              success: false,
              message: 'Each operation must have operation_name and positive duration_minutes'
            });
          }
        }
      }

      const updateData = {};
      if (version !== undefined) updateData.version = version;
      if (components !== undefined) updateData.components = components;
      if (operations !== undefined) updateData.operations = operations;
      if (description !== undefined) updateData.description = description;
      if (is_default !== undefined) updateData.is_default = is_default;
      if (is_active !== undefined) updateData.is_active = is_active;

      const bom = await BOMModel.update(parseInt(bomId), updateData);

      res.json({
        success: true,
        message: 'BOM updated successfully',
        data: bom
      });

    } catch (error) {
      console.error('Update BOM error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update BOM',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete BOM (soft delete)
   * @route DELETE /api/v1/boms/:bomId
   * @access Private (Admin only)
   */
  static async deleteBOM(req, res) {
    try {
      const { bomId } = req.params;

      if (!bomId || isNaN(bomId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid BOM ID is required'
        });
      }

      const bom = await BOMModel.softDelete(parseInt(bomId));

      res.json({
        success: true,
        message: 'BOM deactivated successfully',
        data: bom
      });

    } catch (error) {
      console.error('Delete BOM error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate BOM',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Scale BOM for manufacturing quantity
   * @route POST /api/v1/boms/:bomId/scale
   * @access Private (All authenticated users)
   */
  static async scaleBOM(req, res) {
    try {
      const { bomId } = req.params;
      const { quantity } = req.body;

      if (!bomId || isNaN(bomId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid BOM ID is required'
        });
      }

      if (!quantity || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid positive quantity is required'
        });
      }

      const scaledBOM = await BOMModel.scaleBOMForQuantity(parseInt(bomId), parseFloat(quantity));

      res.json({
        success: true,
        data: scaledBOM
      });

    } catch (error) {
      console.error('Scale BOM error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to scale BOM',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Calculate BOM cost
   * @route POST /api/v1/boms/:bomId/cost
   * @access Private (Manager/Admin)
   */
  static async calculateBOMCost(req, res) {
    try {
      const { bomId } = req.params;
      const { quantity = 1 } = req.body;

      if (!bomId || isNaN(bomId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid BOM ID is required'
        });
      }

      if (quantity && (isNaN(quantity) || quantity <= 0)) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be a positive number'
        });
      }

      const costCalculation = await BOMModel.calculateBOMCost(parseInt(bomId), parseFloat(quantity));

      res.json({
        success: true,
        data: costCalculation
      });

    } catch (error) {
      console.error('Calculate BOM cost error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate BOM cost',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Clone BOM (create new version)
   * @route POST /api/v1/boms/:bomId/clone
   * @access Private (Admin/Manager)
   */
  static async cloneBOM(req, res) {
    try {
      const { bomId } = req.params;
      const { new_version, is_default = false } = req.body;

      if (!bomId || isNaN(bomId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid BOM ID is required'
        });
      }

      if (!new_version || new_version.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'New version is required'
        });
      }

      const clonedBOM = await BOMModel.clone(parseInt(bomId), new_version.trim(), is_default);

      res.status(201).json({
        success: true,
        message: 'BOM cloned successfully',
        data: clonedBOM
      });

    } catch (error) {
      console.error('Clone BOM error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clone BOM',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get BOM statistics
   * @route GET /api/v1/boms/statistics
   * @access Private (Manager/Admin)
   */
  static async getBOMStatistics(req, res) {
    try {
      const stats = await BOMModel.getStatistics();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get BOM statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve BOM statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default BOMController;
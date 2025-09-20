import ProductModel from '../models/ProductModel.js';

/**
 * Product Controller for Manufacturing Management System
 * Handles CRUD operations for products (raw materials, finished goods, semi-finished)
 */

class ProductController {
  /**
   * Create a new product
   * @route POST /api/v1/products
   * @access Private (Admin/Manager)
   */
  static async createProduct(req, res) {
    try {
      const { name, description, type, unit, reorder_level, cost_price, selling_price, category } = req.body;

      // Validate required fields
      if (!name || !type || !unit) {
        return res.status(400).json({
          success: false,
          message: 'Name, type, and unit are required'
        });
      }

      // Validate product type
      if (!['raw_material', 'finished_good', 'semi_finished'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Type must be raw_material, finished_good, or semi_finished'
        });
      }

      const product = await ProductModel.create({
        name: name.trim(),
        description,
        type,
        unit,
        reorder_level: parseFloat(reorder_level) || 0,
        cost_price: parseFloat(cost_price) || 0,
        selling_price: parseFloat(selling_price) || 0,
        category
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
      });

    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get all products with filtering and pagination
   * @route GET /api/v1/products
   * @access Private (All authenticated users)
   */
  static async getAllProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        category,
        is_active = true,
        search,
        low_stock = false
      } = req.query;

      const result = await ProductModel.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        type,
        category,
        is_active: is_active === 'true',
        search,
        low_stock: low_stock === 'true'
      });

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get all products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve products',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get product by ID
   * @route GET /api/v1/products/:productId
   * @access Private (All authenticated users)
   */
  static async getProductById(req, res) {
    try {
      const { productId } = req.params;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required'
        });
      }

      const product = await ProductModel.findById(parseInt(productId));

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        data: product
      });

    } catch (error) {
      console.error('Get product by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Update product
   * @route PUT /api/v1/products/:productId
   * @access Private (Admin/Manager)
   */
  static async updateProduct(req, res) {
    try {
      const { productId } = req.params;
      const { name, description, unit, reorder_level, cost_price, selling_price, category, is_active } = req.body;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required'
        });
      }

      // Validate name if provided
      if (name && name.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Product name must be at least 2 characters long'
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name.trim();
      if (description !== undefined) updateData.description = description;
      if (unit !== undefined) updateData.unit = unit;
      if (reorder_level !== undefined) updateData.reorder_level = parseFloat(reorder_level);
      if (cost_price !== undefined) updateData.cost_price = parseFloat(cost_price);
      if (selling_price !== undefined) updateData.selling_price = parseFloat(selling_price);
      if (category !== undefined) updateData.category = category;
      if (is_active !== undefined) updateData.is_active = is_active;

      const product = await ProductModel.update(parseInt(productId), updateData);

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
      });

    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Delete product (soft delete)
   * @route DELETE /api/v1/products/:productId
   * @access Private (Admin only)
   */
  static async deleteProduct(req, res) {
    try {
      const { productId } = req.params;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required'
        });
      }

      const product = await ProductModel.softDelete(parseInt(productId));

      res.json({
        success: true,
        message: 'Product deactivated successfully',
        data: product
      });

    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate product',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get products by type
   * @route GET /api/v1/products/type/:type
   * @access Private (All authenticated users)
   */
  static async getProductsByType(req, res) {
    try {
      const { type } = req.params;

      if (!['raw_material', 'finished_good', 'semi_finished'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product type. Must be raw_material, finished_good, or semi_finished'
        });
      }

      const products = await ProductModel.getByType(type);

      res.json({
        success: true,
        data: products
      });

    } catch (error) {
      console.error('Get products by type error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve products by type',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get current stock for a product
   * @route GET /api/v1/products/:productId/stock
   * @access Private (All authenticated users)
   */
  static async getProductStock(req, res) {
    try {
      const { productId } = req.params;

      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Valid product ID is required'
        });
      }

      const stockInfo = await ProductModel.getCurrentStock(parseInt(productId));

      res.json({
        success: true,
        data: stockInfo
      });

    } catch (error) {
      console.error('Get product stock error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product stock',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Check stock availability for multiple products
   * @route POST /api/v1/products/check-stock
   * @access Private (All authenticated users)
   */
  static async checkStockAvailability(req, res) {
    try {
      const { requirements } = req.body;

      if (!requirements || !Array.isArray(requirements) || requirements.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Requirements array is required with product_id and required_quantity'
        });
      }

      // Validate requirements format
      for (const req_item of requirements) {
        if (!req_item.product_id || !req_item.required_quantity || req_item.required_quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Each requirement must have product_id and positive required_quantity'
          });
        }
      }

      const stockCheck = await ProductModel.checkStockAvailability(requirements);

      res.json({
        success: true,
        data: stockCheck
      });

    } catch (error) {
      console.error('Check stock availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check stock availability',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get low stock products
   * @route GET /api/v1/products/low-stock
   * @access Private (All authenticated users)
   */
  static async getLowStockProducts(req, res) {
    try {
      const products = await ProductModel.getLowStockProducts();

      res.json({
        success: true,
        data: products,
        count: products.length
      });

    } catch (error) {
      console.error('Get low stock products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve low stock products',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get product statistics
   * @route GET /api/v1/products/statistics
   * @access Private (Manager/Admin)
   */
  static async getProductStatistics(req, res) {
    try {
      const stats = await ProductModel.getStatistics();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get product statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve product statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Search products for dropdown/autocomplete
   * @route GET /api/v1/products/search
   * @access Private (All authenticated users)
   */
  static async searchProducts(req, res) {
    try {
      const { q: searchTerm, type } = req.query;

      if (type && !['raw_material', 'finished_good', 'semi_finished'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type filter'
        });
      }

      const products = await ProductModel.searchForDropdown(searchTerm, type);

      res.json({
        success: true,
        data: products
      });

    } catch (error) {
      console.error('Search products error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search products',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

export default ProductController;
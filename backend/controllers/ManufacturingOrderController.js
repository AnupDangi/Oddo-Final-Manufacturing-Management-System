import ManufacturingOrder from '../models/ManufacturingOrderModel.js';
import BOM from '../models/BOMModel.js';
import Product from '../models/ProductModel.js';

/**
 * Manufacturing Order Controller
 * Handles manufacturing order lifecycle, BOM integration, and production planning
 */

class ManufacturingOrderController {
  /**
   * Create a new manufacturing order
   * POST /api/manufacturing-orders
   * Required: product_id, quantity, priority
   * Access: Admin, Manager
   */
  static async createManufacturingOrder(req, res) {
    try {
      const { 
        product, 
        quantity, 
        planned_start_date, 
        planned_end_date,
        assignee,
        priority = 'Normal',
        description,
        work_center
      } = req.body;

      // Validation
      if (!product || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Product and quantity are required'
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      // Automatically get the active BOM for the product
      const bom = await BOM.getActiveBOM(product);
      if (!bom) {
        return res.status(404).json({
          success: false,
          message: 'No active BOM found for this product. Please create a BOM first.'
        });
      }

      // Calculate cost for the manufacturing order
      const costCalculation = await BOM.calculateBOMCost(bom._id, quantity);

      // Prepare expanded components for the manufacturing order
      const componentsRequired = costCalculation.components.map(comp => ({
        component_product: comp.product_id || comp._id, // Ensure we have the ObjectId
        quantity_required: comp.quantity_required,
        total_cost: comp.total_cost
      }));

      const manufacturingOrderData = {
        product,
        bom_version: bom._id,
        quantity: parseFloat(quantity),
        planned_start_date,
        planned_end_date,
        assignee,
        priority,
        description,
        work_center,
        components_required: componentsRequired,
        status: 'Draft'
      };

      const manufacturingOrder = await ManufacturingOrder.create(manufacturingOrderData);

      // Populate the created order for response
      const populatedOrder = await ManufacturingOrder.findById(manufacturingOrder._id)
        .populate('product', 'name sku category')
        .populate('bom_version', 'reference version')
        .populate('components_required.component_product', 'name sku unit_of_measure standard_cost')
        .populate('assignee', 'name email')
        .populate('work_center', 'name location');

      // Return detailed response with BOM information
      res.status(201).json({
        success: true,
        message: 'Manufacturing order created successfully',
        data: {
          manufacturing_order: populatedOrder,
          bom_details: {
            bom_id: bom._id,
            version: bom.version,
            components: costCalculation.components,
            total_material_cost: costCalculation.total_material_cost
          }
        }
      });
    } catch (error) {
      console.error('Create manufacturing order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create manufacturing order',
        error: error.message
      });
    }
  }

  /**
   * Create a new manufacturing order by product search (frontend friendly)
   * POST /api/manufacturing-orders/by-product-search
   * Required: product_search (name or SKU), quantity
   * Access: Admin, Manager
   */
  static async createByProductSearch(req, res) {
    try {
      const { 
        product_search, 
        quantity, 
        planned_start_date, 
        planned_end_date,
        assignee,
        priority = 'Normal',
        description,
        work_center
      } = req.body;

      // Validation
      if (!product_search || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Product search term and quantity are required'
        });
      }

      if (quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Quantity must be greater than 0'
        });
      }

      // Search for the product by name or SKU
      const product = await Product.findOne({
        $or: [
          { name: { $regex: product_search, $options: 'i' } },
          { sku: { $regex: product_search, $options: 'i' } }
        ],
        is_active: true
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `No product found with name or SKU containing: ${product_search}`
        });
      }

      // Check if it's a finished good (can be manufactured)
      if (product.category !== 'Finished Good') {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is a ${product.category}. Only Finished Goods can be manufactured.`
        });
      }

      // Automatically get the active BOM for the product
      const bom = await BOM.getActiveBOM(product._id);
      if (!bom) {
        return res.status(404).json({
          success: false,
          message: `No active BOM found for product "${product.name}". Please create a BOM first.`
        });
      }

      // Calculate cost for the manufacturing order
      const costCalculation = await BOM.calculateBOMCost(bom._id, quantity);

      // Prepare expanded components for the manufacturing order
      const componentsRequired = costCalculation.components.map(comp => ({
        component_product: comp.product_id || comp._id, // Ensure we have the ObjectId
        quantity_required: comp.quantity_required,
        total_cost: comp.total_cost
      }));

      const manufacturingOrderData = {
        product: product._id,
        bom_version: bom._id,
        quantity: parseFloat(quantity),
        planned_start_date,
        planned_end_date,
        assignee,
        priority,
        description,
        work_center,
        components_required: componentsRequired,
        status: 'Draft'
      };

      const manufacturingOrder = await ManufacturingOrder.create(manufacturingOrderData);

      // Populate the created order for response
      const populatedOrder = await ManufacturingOrder.findById(manufacturingOrder._id)
        .populate('product', 'name sku category')
        .populate('bom_version', 'reference version')
        .populate('components_required.component_product', 'name sku unit_of_measure standard_cost')
        .populate('assignee', 'name email')
        .populate('work_center', 'name location');

      // Return detailed response with product and BOM information
      res.status(201).json({
        success: true,
        message: 'Manufacturing order created successfully',
        data: {
          manufacturing_order: populatedOrder,
          product_details: {
            _id: product._id,
            name: product.name,
            sku: product.sku,
            category: product.category
          },
          bom_details: {
            bom_id: bom._id,
            version: bom.version,
            components: costCalculation.components,
            total_material_cost: costCalculation.total_material_cost
          }
        }
      });
    } catch (error) {
      console.error('Create manufacturing order by search error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create manufacturing order',
        error: error.message
      });
    }
  }

  /**
   * Get all manufacturing orders with filtering and pagination
   * GET /api/manufacturing-orders
   * Access: Admin, Manager, Operator
   */
  static async getAllManufacturingOrders(req, res) {
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
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        priority,
        product_id: product_id ? parseInt(product_id) : null,
        created_by: created_by ? parseInt(created_by) : null,
        start_date,
        end_date
      };

      // Build query filters
      const queryFilters = {};
      if (status) queryFilters.status = status;
      if (priority) queryFilters.priority = priority;
      if (product_id) queryFilters.product = product_id;
      if (created_by) queryFilters.assignee = created_by;
      if (start_date || end_date) {
        queryFilters.planned_start_date = {};
        if (start_date) queryFilters.planned_start_date.$gte = new Date(start_date);
        if (end_date) queryFilters.planned_start_date.$lte = new Date(end_date);
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Get total count for pagination
      const totalCount = await ManufacturingOrder.countDocuments(queryFilters);
      
      // Get the data with population
      const manufacturingOrders = await ManufacturingOrder.find(queryFilters)
        .populate('product', 'name sku category')
        .populate('bom_version', 'reference version')
        .populate('components_required.component_product', 'name sku unit_of_measure standard_cost')
        .populate('assignee', 'name email')
        .populate('work_center', 'name location')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ created_at: -1 });

      res.json({
        success: true,
        message: 'Manufacturing orders retrieved successfully',
        data: manufacturingOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Get manufacturing orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve manufacturing orders',
        error: error.message
      });
    }
  }

  /**
   * Get manufacturing order by ID with components and work orders
   * GET /api/manufacturing-orders/:id
   * Access: Admin, Manager, Operator
   */
  static async getManufacturingOrderById(req, res) {
    try {
      const { id } = req.params;

      const manufacturingOrder = await ManufacturingOrder.findById(id)
        .populate('product', 'name sku category')
        .populate('bom_version', 'reference version')
        .populate('components_required.component_product', 'name sku unit_of_measure standard_cost')
        .populate('assignee', 'name email')
        .populate('work_center', 'name location');

      if (!manufacturingOrder) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found'
        });
      }

      res.json({
        success: true,
        message: 'Manufacturing order retrieved successfully',
        data: manufacturingOrder
      });
    } catch (error) {
      console.error('Get manufacturing order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve manufacturing order',
        error: error.message
      });
    }
  }

  /**
   * Update manufacturing order
   * PUT /api/manufacturing-orders/:id
   * Access: Admin, Manager
   */
  static async updateManufacturingOrder(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Prevent certain fields from being updated
      const restrictedFields = ['mo_id', 'created_by', 'created_at'];
      restrictedFields.forEach(field => delete updateData[field]);

      // Validate priority if provided
      if (updateData.priority && !['Low', 'Normal', 'High', 'Urgent'].includes(updateData.priority)) {
        return res.status(400).json({
          success: false,
          message: 'Priority must be Low, Normal, High, or Urgent'
        });
      }

      // Validate status if provided
      if (updateData.status && !['Draft', 'Ready', 'In Progress', 'Done', 'Cancelled'].includes(updateData.status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const updatedManufacturingOrder = await ManufacturingOrder.findByIdAndUpdate(id, updateData, { new: true })
        .populate('product', 'name sku category')
        .populate('bom_version', 'reference version')
        .populate('components_required.component_product', 'name sku unit_of_measure standard_cost')
        .populate('assignee', 'name email')
        .populate('work_center', 'name location');

      if (!updatedManufacturingOrder) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found'
        });
      }

      res.json({
        success: true,
        message: 'Manufacturing order updated successfully',
        data: updatedManufacturingOrder
      });
    } catch (error) {
      console.error('Update manufacturing order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update manufacturing order',
        error: error.message
      });
    }
  }

  /**
   * Update manufacturing order status
   * PATCH /api/manufacturing-orders/:id/status
   * Access: Admin, Manager, Operator
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      if (!['planned', 'released', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const updatedManufacturingOrder = await ManufacturingOrder.findByIdAndUpdate(
        parseInt(id), 
        status, 
        req.user.user_id,
        notes
      );

      if (!updatedManufacturingOrder) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found'
        });
      }

      res.json({
        success: true,
        message: `Manufacturing order status updated to ${status}`,
        data: updatedManufacturingOrder
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update manufacturing order status',
        error: error.message
      });
    }
  }

  /**
   * Get material requirements for manufacturing order
   * GET /api/manufacturing-orders/:id/material-requirements
   * Access: Admin, Manager, Inventory
   */
  static async getMaterialRequirements(req, res) {
    try {
      const { id } = req.params;

      const requirements = await ManufacturingOrder.findById(id).populate('bom_version');

      if (!requirements) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found or no BOM available'
        });
      }

      res.json({
        success: true,
        message: 'Material requirements calculated successfully',
        data: requirements
      });
    } catch (error) {
      console.error('Get material requirements error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate material requirements',
        error: error.message
      });
    }
  }

  /**
   * Check material availability for manufacturing order
   * POST /api/manufacturing-orders/:id/check-materials
   * Access: Admin, Manager, Inventory
   */
  static async checkMaterialAvailability(req, res) {
    try {
      const { id } = req.params;

      const availability = await ManufacturingOrder.findById(id).populate('bom_version');

      if (!availability) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found or no BOM available'
        });
      }

      res.json({
        success: true,
        message: 'Material availability checked successfully',
        data: availability
      });
    } catch (error) {
      console.error('Check material availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check material availability',
        error: error.message
      });
    }
  }

  /**
   * Generate work orders for manufacturing order
   * POST /api/manufacturing-orders/:id/generate-work-orders
   * Access: Admin, Manager
   */
  static async generateWorkOrders(req, res) {
    try {
      const { id } = req.params;
      const { work_center_assignments } = req.body;

      const workOrders = await ManufacturingOrder.findById(
        parseInt(id), 
        work_center_assignments,
        req.user.user_id
      );

      res.status(201).json({
        success: true,
        message: 'Work orders generated successfully',
        data: workOrders
      });
    } catch (error) {
      console.error('Generate work orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate work orders',
        error: error.message
      });
    }
  }

  /**
   * Get manufacturing orders by status
   * GET /api/manufacturing-orders/by-status/:status
   * Access: Admin, Manager, Operator
   */
  static async getByStatus(req, res) {
    try {
      const { status } = req.params;

      if (!['planned', 'released', 'in_progress', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }

      const manufacturingOrders = await ManufacturingOrder.find({ status });

      res.json({
        success: true,
        message: `Manufacturing orders with status '${status}' retrieved successfully`,
        data: manufacturingOrders
      });
    } catch (error) {
      console.error('Get by status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve manufacturing orders by status',
        error: error.message
      });
    }
  }

  /**
   * Get manufacturing order statistics
   * GET /api/manufacturing-orders/statistics
   * Access: Admin, Manager
   */
  static async getStatistics(req, res) {
    try {
      const { start_date, end_date } = req.query;

      const statistics = await ManufacturingOrder.aggregate([
        {
          $match: {
            created_at: {
              $gte: new Date(start_date),
              $lte: new Date(end_date)
            }
          }
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        success: true,
        message: 'Manufacturing order statistics retrieved successfully',
        data: statistics
      });
    } catch (error) {
      console.error('Get statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve manufacturing order statistics',
        error: error.message
      });
    }
  }

  /**
   * Cancel manufacturing order
   * PATCH /api/manufacturing-orders/:id/cancel
   * Access: Admin, Manager
   */
  static async cancelManufacturingOrder(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const cancelledOrder = await ManufacturingOrder.findByIdAndUpdate(
        parseInt(id), 
        req.user.user_id,
        reason
      );

      if (!cancelledOrder) {
        return res.status(404).json({
          success: false,
          message: 'Manufacturing order not found or cannot be cancelled'
        });
      }

      res.json({
        success: true,
        message: 'Manufacturing order cancelled successfully',
        data: cancelledOrder
      });
    } catch (error) {
      console.error('Cancel manufacturing order error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel manufacturing order',
        error: error.message
      });
    }
  }

  /**
   * Search manufacturing orders for dropdown/autocomplete
   * GET /api/manufacturing-orders/search
   * Access: Admin, Manager, Operator
   */
  static async searchForDropdown(req, res) {
    try {
      const { search, status, limit = 50 } = req.query;

      const query = {};
      if (status) query.status = status;
      if (search) query.product = { $regex: search, $options: 'i' };
      
      const manufacturingOrders = await ManufacturingOrder.find(query).limit(parseInt(limit));

      res.json({
        success: true,
        message: 'Manufacturing orders search completed',
        data: manufacturingOrders
      });
    } catch (error) {
      console.error('Search manufacturing orders error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search manufacturing orders',
        error: error.message
      });
    }
  }
}

export default ManufacturingOrderController;
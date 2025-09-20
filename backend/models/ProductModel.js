import { mongoose } from '../config/database.js';
import { productSchema } from '../schemas/index.js';

/**
 * Product Model for Manufacturing ERP System
 * Handles product management, inventory tracking, and stock operations
 */

// Add pre-save middleware for calculations
productSchema.pre('save', function(next) {
  // Ensure current stock is not negative
  if (this.currentStock < 0) {
    this.currentStock = 0;
  }
  
  // Set max stock level if not provided
  if (!this.maxStockLevel) {
    this.maxStockLevel = this.reorderLevel * 5; // Default to 5x reorder level
  }
  
  next();
});

// Instance methods
productSchema.methods.isLowStock = function() {
  return this.currentStock <= this.reorderLevel;
};

productSchema.methods.isOutOfStock = function() {
  return this.currentStock === 0;
};

productSchema.methods.updateStock = function(quantity, operation = 'add') {
  if (operation === 'add') {
    this.currentStock += quantity;
  } else if (operation === 'subtract') {
    this.currentStock = Math.max(0, this.currentStock - quantity);
  } else if (operation === 'set') {
    this.currentStock = Math.max(0, quantity);
  }
  return this.save();
};

productSchema.methods.getStockValue = function() {
  return this.currentStock * this.costPrice;
};

// Static methods
productSchema.statics.findByType = function(type) {
  return this.find({ type, isActive: true });
};

productSchema.statics.findLowStock = function() {
  return this.find({
    $expr: { $lte: ['$currentStock', '$reorderLevel'] },
    isActive: true
  });
};

productSchema.statics.findOutOfStock = function() {
  return this.find({ currentStock: 0, isActive: true });
};

// Create and export the model
const Product = mongoose.model('Product', productSchema);

class ProductModel {
  /**
   * Create a new product
   */
  static async create(productData) {
    try {
      const product = new Product(productData);
      await product.save();
      return await this.findById(product._id);
    } catch (error) {
      throw new Error(`Product creation failed: ${error.message}`);
    }
  }

  /**
   * Get product by ID
   */
  static async findById(id) {
    try {
      const product = await Product.findById(id)
        .populate('createdBy updatedBy', 'name email');
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      return product;
    } catch (error) {
      throw new Error(`Product retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get all products with filters and pagination
   */
  static async getAll(filters = {}) {
    try {
      const {
        type,
        category,
        isActive = true,
        search,
        lowStock,
        outOfStock,
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc'
      } = filters;

      const query = {};
      
      if (type) query.type = type;
      if (category) query.category = new RegExp(category, 'i');
      if (isActive !== undefined) query.isActive = isActive;
      
      if (search) {
        query.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') }
        ];
      }
      
      if (lowStock) {
        query.$expr = { $lte: ['$currentStock', '$reorderLevel'] };
      }
      
      if (outOfStock) {
        query.currentStock = 0;
      }

      const skip = (page - 1) * limit;
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const products = await Product.find(query)
        .populate('createdBy updatedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Product.countDocuments(query);

      return {
        products,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };
    } catch (error) {
      throw new Error(`Products retrieval failed: ${error.message}`);
    }
  }

  /**
   * Update product
   */
  static async update(id, updateData, updatedBy) {
    try {
      updateData.updatedBy = updatedBy;
      
      const product = await Product.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy updatedBy', 'name email');

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw new Error(`Product update failed: ${error.message}`);
    }
  }

  /**
   * Delete product (soft delete)
   */
  static async delete(id) {
    try {
      const product = await Product.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!product) {
        throw new Error('Product not found');
      }

      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw new Error(`Product deletion failed: ${error.message}`);
    }
  }

  /**
   * Update product stock
   */
  static async updateStock(id, quantity, operation = 'add', reason = 'manual_adjustment', updatedBy, referenceId = null) {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      const oldStock = product.currentStock;
      
      // Update stock based on operation
      await product.updateStock(quantity, operation);
      
      // Create stock ledger entry
      const StockLedgerModel = (await import('./StockLedgerModel.js')).default;
      
      const movementType = operation === 'add' ? 'in' : 'out';
      const actualQuantity = operation === 'add' ? quantity : -quantity;
      
      await StockLedgerModel.create({
        productId: id,
        movementType,
        quantity: Math.abs(actualQuantity),
        unit: product.unit,
        unitCost: product.costPrice,
        totalValue: Math.abs(actualQuantity) * product.costPrice,
        balanceQuantity: product.currentStock,
        reason,
        referenceId,
        recordedBy: updatedBy
      });

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Stock update failed: ${error.message}`);
    }
  }

  /**
   * Check stock availability
   */
  static async checkStockAvailability(id, requiredQuantity) {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      return {
        productId: id,
        productName: product.name,
        currentStock: product.currentStock,
        requiredQuantity,
        available: product.currentStock >= requiredQuantity,
        shortage: Math.max(0, requiredQuantity - product.currentStock)
      };
    } catch (error) {
      throw new Error(`Stock availability check failed: ${error.message}`);
    }
  }

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts(thresholdMultiplier = 1) {
    try {
      const products = await Product.find({
        $expr: { $lte: ['$currentStock', { $multiply: ['$reorderLevel', thresholdMultiplier] }] },
        isActive: true
      }).populate('createdBy', 'name email');

      return products.map(product => ({
        ...product.toObject(),
        severity: product.currentStock === 0 ? 'critical' : 
                 product.currentStock <= product.reorderLevel * 0.5 ? 'high' : 'medium',
        shortfall: Math.max(0, product.reorderLevel - product.currentStock)
      }));
    } catch (error) {
      throw new Error(`Low stock alerts retrieval failed: ${error.message}`);
    }
  }

  /**
   * Get product statistics
   */
  static async getStatistics() {
    try {
      const [
        totalProducts,
        byType,
        lowStockCount,
        outOfStockCount,
        totalStockValue
      ] = await Promise.all([
        Product.countDocuments({ isActive: true }),
        Product.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$type', count: { $sum: 1 } } }
        ]),
        Product.countDocuments({
          $expr: { $lte: ['$currentStock', '$reorderLevel'] },
          isActive: true
        }),
        Product.countDocuments({ currentStock: 0, isActive: true }),
        Product.aggregate([
          { $match: { isActive: true } },
          { $group: { 
            _id: null, 
            totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }
          }}
        ])
      ]);

      return {
        total: totalProducts,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        lowStock: lowStockCount,
        outOfStock: outOfStockCount,
        totalStockValue: totalStockValue[0]?.totalValue || 0
      };
    } catch (error) {
      throw new Error(`Statistics calculation failed: ${error.message}`);
    }
  }

  /**
   * Search products for dropdown/autocomplete
   */
  static async searchForDropdown(searchTerm, type = null, limit = 10) {
    try {
      const query = {
        isActive: true,
        name: new RegExp(searchTerm, 'i')
      };
      
      if (type) query.type = type;

      const products = await Product.find(query)
        .select('name type unit currentStock costPrice')
        .limit(parseInt(limit))
        .sort({ name: 1 });

      return products.map(product => ({
        id: product._id,
        name: product.name,
        type: product.type,
        unit: product.unit,
        currentStock: product.currentStock,
        costPrice: product.costPrice
      }));
    } catch (error) {
      throw new Error(`Product search failed: ${error.message}`);
    }
  }

  /**
   * Bulk stock update
   */
  static async bulkStockUpdate(updates, updatedBy) {
    try {
      const results = [];
      
      for (const update of updates) {
        try {
          const result = await this.updateStock(
            update.productId,
            update.quantity,
            update.operation,
            update.reason || 'bulk_update',
            updatedBy,
            update.referenceId
          );
          results.push({ success: true, product: result });
        } catch (error) {
          results.push({ 
            success: false, 
            productId: update.productId, 
            error: error.message 
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Bulk stock update failed: ${error.message}`);
    }
  }

  /**
   * Get product cost history (simplified)
   */
  static async getCostHistory(id, days = 30) {
    try {
      const product = await Product.findById(id);
      if (!product) {
        throw new Error('Product not found');
      }

      // This is simplified - in a real system you'd track cost changes
      return {
        productId: id,
        currentCost: product.costPrice,
        costHistory: [
          {
            date: product.updatedAt,
            cost: product.costPrice,
            changedBy: product.updatedBy
          }
        ]
      };
    } catch (error) {
      throw new Error(`Cost history retrieval failed: ${error.message}`);
    }
  }
}

export default ProductModel;
export { Product };
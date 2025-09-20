import Product from '../models/ProductModel.js';
import BOM from '../models/BOMModel.js';

export class ProductController {
    // Create a new product
    static async createProduct(req, res) {
        try {
            const { 
                name, 
                description, 
                sku, 
                unit_of_measure, 
                category,
                reorder_point,
                standard_cost
            } = req.body;

            // Validate required fields
            if (!name || !sku || !unit_of_measure || !category || !reorder_point || !standard_cost) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required fields'
                });
            }

            // Check if SKU already exists
            const existingProduct = await Product.findOne({ sku });
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'Product with this SKU already exists'
                });
            }

            const product = new Product({
                name,
                description,
                sku,
                unit_of_measure,
                category,
                current_stock: 0,
                reorder_point,
                standard_cost,
                is_active: true
            });

            await product.save();

            res.status(201).json({
                success: true,
                message: 'Product created successfully',
                data: product
            });
        } catch (error) {
            console.error('Create product error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating product'
            });
        }
    }

    // Get all products
    static async getAllProducts(req, res) {
        try {
            const { category, search, active } = req.query;
            
            let query = {};
            
            // Filter by category if provided
            if (category) {
                query.category = category;
            }

            // Filter by active status if provided
            if (active !== undefined) {
                query.is_active = active === 'true';
            }

            // Search in name or SKU
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { sku: { $regex: search, $options: 'i' } }
                ];
            }

            const products = await Product.find(query)
                .sort({ created_at: -1 });

            res.status(200).json({
                success: true,
                count: products.length,
                data: products
            });
        } catch (error) {
            console.error('Get products error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving products'
            });
        }
    }

    // Get single product
    static async getProductById(req, res) {
        try {
            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            console.error('Get product error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving product'
            });
        }
    }

    // Update product
    static async updateProduct(req, res) {
        try {
            const {
                name,
                description,
                unit_of_measure,
                category,
                reorder_point,
                standard_cost,
                is_active
            } = req.body;

            let product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            product.name = name || product.name;
            product.description = description || product.description;
            product.unit_of_measure = unit_of_measure || product.unit_of_measure;
            product.category = category || product.category;
            product.reorder_point = reorder_point || product.reorder_point;
            product.standard_cost = standard_cost || product.standard_cost;
            product.is_active = is_active !== undefined ? is_active : product.is_active;

            await product.save();

            res.status(200).json({
                success: true,
                message: 'Product updated successfully',
                data: product
            });
        } catch (error) {
            console.error('Update product error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating product'
            });
        }
    }

    // Update stock
    static async updateStock(req, res) {
        try {
            const { quantity_change } = req.body;

            if (quantity_change === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide quantity change'
                });
            }

            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            const newStock = product.current_stock + quantity_change;

            if (newStock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock'
                });
            }

            product.current_stock = newStock;
            await product.save();

            res.status(200).json({
                success: true,
                message: 'Stock updated successfully',
                data: {
                    id: product._id,
                    sku: product.sku,
                    current_stock: product.current_stock
                }
            });
        } catch (error) {
            console.error('Update stock error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating stock'
            });
        }
    }
    static async createMultipleProducts(req, res) {
        try {
            const products = req.body;

            // Check if the body is an array and not empty
            if (!Array.isArray(products) || products.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Request body must be a non-empty array of products.'
                });
            }

            // Use Mongoose's insertMany for efficient bulk insertion
            const createdProducts = await Product.insertMany(products, { ordered: false });

            res.status(201).json({
                success: true,
                message: `${createdProducts.length} products created successfully`,
                data: createdProducts
            });
        } catch (error) {
            console.error('Bulk create product error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating products',
                error: error.message
            });
        }
    }
    // Delete product (soft delete)
    static async deleteProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            product.is_active = false;
            await product.save();

            res.status(200).json({
                success: true,
                message: 'Product deleted successfully'
            });
        } catch (error) {
            console.error('Delete product error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting product'
            });
        }
    }

    // Get low stock products
    static async getLowStockProducts(req, res) {
        try {
            const products = await Product.find({
                is_active: true,
                $expr: {
                    $lte: ['$current_stock', '$reorder_point']
                }
            });

            res.status(200).json({
                success: true,
                count: products.length,
                data: products
            });
        } catch (error) {
            console.error('Get low stock products error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving low stock products'
            });
        }
    }

    // Search products with BOM and pricing information
    static async searchProductsWithBOM(req, res) {
        try {
            const { search, category } = req.query;
            
            // Build search query
            const query = { is_active: true };
            
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { sku: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (category) {
                query.category = category;
            }

            const products = await Product.find(query).limit(20);
            
            // For each product, get BOM and calculate cost
            const productsWithBOM = await Promise.all(
                products.map(async (product) => {
                    try {
                        const bom = await BOM.getActiveBOM(product._id);
                        let bomDetails = null;
                        
                        if (bom) {
                            const costCalculation = await BOM.calculateBOMCost(bom._id, 1);
                            bomDetails = {
                                bom_id: bom._id,
                                version: bom.version,
                                components: costCalculation.components,
                                total_material_cost: costCalculation.total_material_cost,
                                estimated_selling_price: costCalculation.total_material_cost * 1.3 // 30% markup
                            };
                        }
                        
                        return {
                            _id: product._id,
                            name: product.name,
                            sku: product.sku,
                            description: product.description,
                            category: product.category,
                            unit_of_measure: product.unit_of_measure,
                            standard_cost: product.standard_cost,
                            current_stock: product.current_stock,
                            bom_details: bomDetails
                        };
                    } catch (error) {
                        console.error(`Error processing product ${product._id}:`, error);
                        return {
                            _id: product._id,
                            name: product.name,
                            sku: product.sku,
                            description: product.description,
                            category: product.category,
                            unit_of_measure: product.unit_of_measure,
                            standard_cost: product.standard_cost,
                            current_stock: product.current_stock,
                            bom_details: null
                        };
                    }
                })
            );

            res.json({
                success: true,
                data: productsWithBOM,
                count: productsWithBOM.length
            });

        } catch (error) {
            console.error('Search products with BOM error:', error);
            res.status(500).json({
                success: false,
                message: 'Error searching products'
            });
        }
    }
}
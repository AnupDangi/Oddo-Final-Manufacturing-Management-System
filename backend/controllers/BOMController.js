import BOM from '../models/BOMModel.js';
import Product from '../models/ProductModel.js';
import StockLedger from '../models/StockLedgerModel.js';

export class BOMController {
    // Create new BOM
    static async createBOM(req, res) {
        try {
            const { product, version, components } = req.body;

            // Validate required fields
            if (!product || !version || !components || !components.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide product, version and components'
                });
            }

            // Check if product exists
            const productExists = await Product.findById(product);
            if (!productExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Product not found'
                });
            }

            // Check if BOM version already exists for this product
            const existingBOM = await BOM.findOne({ product, version });
            if (existingBOM) {
                return res.status(400).json({
                    success: false,
                    message: 'BOM version already exists for this product'
                });
            }

            // Validate all component products exist
            for (const component of components) {
                const componentProduct = await Product.findById(component.component_product);
                if (!componentProduct) {
                    return res.status(404).json({
                        success: false,
                        message: `Component product with ID ${component.component_product} not found`
                    });
                }
            }

            const bom = new BOM({
                product,
                version,
                components,
                is_active: true
            });

            await bom.save();

            // Populate component details
            const populatedBOM = await BOM.findById(bom._id)
                .populate('product', 'name sku')
                .populate('components.component_product', 'name sku');

            res.status(201).json({
                success: true,
                message: 'BOM created successfully',
                data: populatedBOM
            });
        } catch (error) {
            console.error('Create BOM error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating BOM'
            });
        }
    }

    // Get all BOMs
    static async getAllBOMs(req, res) {
        try {
            const { product, active } = req.query;
            
            let query = {};
            
            if (product) {
                query.product = product;
            }
            
            if (active !== undefined) {
                query.is_active = active === 'true';
            }

            const boms = await BOM.find(query)
                .populate('product', 'name sku')
                .populate('components.component_product', 'name sku')
                .sort({ created_at: -1 });

            res.status(200).json({
                success: true,
                count: boms.length,
                data: boms
            });
        } catch (error) {
            console.error('Get BOMs error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving BOMs'
            });
        }
    }

    // Get single BOM
    static async getBOMById(req, res) {
        try {
            const bom = await BOM.findById(req.params.id)
                .populate('product', 'name sku')
                .populate('components.component_product', 'name sku');

            if (!bom) {
                return res.status(404).json({
                    success: false,
                    message: 'BOM not found'
                });
            }

            res.status(200).json({
                success: true,
                data: bom
            });
        } catch (error) {
            console.error('Get BOM error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving BOM'
            });
        }
    }

    // Update BOM
    static async updateBOM(req, res) {
        try {
            const { components, is_active } = req.body;
            
            let bom = await BOM.findById(req.params.id);

            if (!bom) {
                return res.status(404).json({
                    success: false,
                    message: 'BOM not found'
                });
            }

            // If updating components, validate they exist
            if (components) {
                for (const component of components) {
                    const componentProduct = await Product.findById(component.component_product);
                    if (!componentProduct) {
                        return res.status(404).json({
                            success: false,
                            message: `Component product with ID ${component.component_product} not found`
                        });
                    }
                }
                bom.components = components;
            }

            if (is_active !== undefined) {
                bom.is_active = is_active;
            }

            await bom.save();

            const updatedBOM = await BOM.findById(bom._id)
                .populate('product', 'name sku')
                .populate('components.component_product', 'name sku');

            res.status(200).json({
                success: true,
                message: 'BOM updated successfully',
                data: updatedBOM
            });
        } catch (error) {
            console.error('Update BOM error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating BOM'
            });
        }
    }

    // Delete BOM (soft delete)
    static async deleteBOM(req, res) {
        try {
            const bom = await BOM.findById(req.params.id);

            if (!bom) {
                return res.status(404).json({
                    success: false,
                    message: 'BOM not found'
                });
            }

            bom.is_active = false;
            await bom.save();

            res.status(200).json({
                success: true,
                message: 'BOM deleted successfully'
            });
        } catch (error) {
            console.error('Delete BOM error:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting BOM'
            });
        }
    }
}

// Export as default to support both import styles
export default BOMController;
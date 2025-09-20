import StockLedger from '../models/StockLedgerModel.js';
import Product from '../models/ProductModel.js';

export class StockLedgerController {
    // Create stock transaction
    static async createTransaction(req, res) {
        try {
            const {
                product,
                transaction_type,
                quantity,
                reference_type,
                reference_id,
                unit_cost
            } = req.body;

            // Validate required fields
            if (!product || !transaction_type || !quantity || !reference_type || !unit_cost) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide all required fields'
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

            // Create stock ledger entry
            const transaction = new StockLedger({
                product,
                transaction_type,
                quantity,
                reference_type,
                reference_id,
                unit_cost
            });

            await transaction.save();

            // Update product stock
            const quantityChange = transaction_type === 'Receipt' ? quantity : -quantity;
            const newStock = productExists.current_stock + quantityChange;

            if (newStock < 0) {
                await transaction.delete();
                return res.status(400).json({
                    success: false,
                    message: 'Insufficient stock'
                });
            }

            productExists.current_stock = newStock;
            await productExists.save();

            const populatedTransaction = await StockLedger.findById(transaction._id)
                .populate('product', 'name sku')
                .populate('reference_id');

            res.status(201).json({
                success: true,
                message: 'Stock transaction created successfully',
                data: populatedTransaction
            });
        } catch (error) {
            console.error('Create transaction error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating stock transaction'
            });
        }
    }

    // Get stock ledger entries
    static async getStockLedger(req, res) {
        try {
            const { product, transaction_type, start_date, end_date } = req.query;
            
            let query = {};
            
            if (product) {
                query.product = product;
            }
            
            if (transaction_type) {
                query.transaction_type = transaction_type;
            }

            if (start_date || end_date) {
                query.created_at = {};
                if (start_date) {
                    query.created_at.$gte = new Date(start_date);
                }
                if (end_date) {
                    query.created_at.$lte = new Date(end_date);
                }
            }

            const transactions = await StockLedger.find(query)
                .populate('product', 'name sku')
                .populate('reference_id')
                .sort({ created_at: -1 });

            res.status(200).json({
                success: true,
                count: transactions.length,
                data: transactions
            });
        } catch (error) {
            console.error('Get stock ledger error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving stock ledger'
            });
        }
    }

    // Get product stock history
    static async getProductStockHistory(req, res) {
        try {
            const { productId } = req.params;
            const { start_date, end_date } = req.query;

            let query = { product: productId };

            if (start_date || end_date) {
                query.created_at = {};
                if (start_date) {
                    query.created_at.$gte = new Date(start_date);
                }
                if (end_date) {
                    query.created_at.$lte = new Date(end_date);
                }
            }

            const transactions = await StockLedger.find(query)
                .populate('product', 'name sku')
                .populate('reference_id')
                .sort({ created_at: 1 });

            res.status(200).json({
                success: true,
                count: transactions.length,
                data: transactions
            });
        } catch (error) {
            console.error('Get product history error:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving product stock history'
            });
        }
    }
}
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    unit_of_measure: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Raw Material', 'Work in Progress', 'Finished Good']
    },
    current_stock: {
        type: Number,
        default: 0
    },
    reorder_point: {
        type: Number,
        required: true
    },
    standard_cost: {
        type: Number,
        required: true
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Indexes
productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
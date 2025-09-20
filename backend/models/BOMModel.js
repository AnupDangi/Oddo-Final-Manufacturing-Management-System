import mongoose from 'mongoose';

const bomItemSchema = new mongoose.Schema({
    component_product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity_required: {
        type: Number,
        required: true
    }
});

const bomSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    version: {
        type: String,
        required: true
    },
    components: [bomItemSchema],
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

// Compound unique index
bomSchema.index({ product: 1, version: 1 }, { unique: true });

const BOM = mongoose.model('BOM', bomSchema);
export default BOM;
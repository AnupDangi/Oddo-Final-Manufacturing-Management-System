import mongoose from 'mongoose';

const manufacturingOrderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    bom_version: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BOM',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    planned_start_date: {
        type: Date,
        required: true
    },
    planned_end_date: {
        type: Date,
        required: true
    },
    actual_start_date: Date,
    actual_end_date: Date,
    status: {
        type: String,
        enum: ['Draft', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Draft'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

manufacturingOrderSchema.index({ status: 1 });
manufacturingOrderSchema.index({ planned_start_date: 1 });
manufacturingOrderSchema.index({ planned_end_date: 1 });

const ManufacturingOrder = mongoose.model('ManufacturingOrder', manufacturingOrderSchema);
export default ManufacturingOrder;
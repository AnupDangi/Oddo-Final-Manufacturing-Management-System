import mongoose from 'mongoose';

// Auto-increment plugin for reference numbers
import AutoIncrement from 'mongoose-sequence';
const autoIncrement = AutoIncrement(mongoose);

const manufacturingOrderSchema = new mongoose.Schema({
    reference: {
        type: String,
        unique: true
    },
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
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    description: {
        type: String
    },
    work_center: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkCenter'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    components_required: [{
        component_product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity_required: {
            type: Number,
            required: true
        },
        total_cost: {
            type: Number,
            default: 0
        }
    }],
    work_orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkOrder'
    }],
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

// Add auto-increment for MO reference numbers
manufacturingOrderSchema.plugin(autoIncrement, {
    inc_field: 'mo_sequence',
    start_seq: 1
});

// Pre-save middleware to generate reference
manufacturingOrderSchema.pre('save', function(next) {
    if (this.isNew && !this.reference) {
        this.reference = `MO-${String(this.mo_sequence || 1).padStart(6, '0')}`;
    }
    next();
});

manufacturingOrderSchema.index({ status: 1 });
manufacturingOrderSchema.index({ planned_start_date: 1 });
manufacturingOrderSchema.index({ planned_end_date: 1 });
manufacturingOrderSchema.index({ reference: 1 });
manufacturingOrderSchema.index({ assignee: 1 });
manufacturingOrderSchema.index({ priority: 1 });

const ManufacturingOrder = mongoose.model('ManufacturingOrder', manufacturingOrderSchema);
export default ManufacturingOrder;
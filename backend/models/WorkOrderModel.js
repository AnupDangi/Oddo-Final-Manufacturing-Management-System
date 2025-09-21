import mongoose from 'mongoose';

// Auto-increment plugin for reference numbers
import AutoIncrement from 'mongoose-sequence';
const autoIncrement = AutoIncrement(mongoose);

const workOrderSchema = new mongoose.Schema({
    reference: {
        type: String,
        unique: true
    },
    manufacturing_order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ManufacturingOrder',
        required: true
    },
    work_center: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkCenter',
        required: true
    },
    operation: {
        type: String,
        required: true
    },
    sequence_number: {
        type: Number,
        required: true
    },
    planned_hours: {
        type: Number,
        required: true
    },
    actual_hours: Number,
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Done', 'Cancelled'],
        default: 'To Do'
    },
    start_time: Date,
    end_time: Date,
    operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Add auto-increment for WO reference numbers
workOrderSchema.plugin(autoIncrement, {
    inc_field: 'wo_sequence',
    start_seq: 1
});

// Pre-save middleware to generate reference
workOrderSchema.pre('save', function(next) {
    if (this.isNew && !this.reference) {
        this.reference = `WO-${String(this.wo_sequence || 1).padStart(3, '0')}`;
    }
    next();
});

workOrderSchema.index({ manufacturing_order: 1, sequence_number: 1 }, { unique: true });
workOrderSchema.index({ status: 1 });
workOrderSchema.index({ reference: 1 });
workOrderSchema.index({ work_center: 1 });

const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);
export default WorkOrder;
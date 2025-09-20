import mongoose from 'mongoose';

const workOrderSchema = new mongoose.Schema({
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
    sequence_number: {
        type: Number,
        required: true
    },
    planned_hours: {
        type: Number,
        required: true
    },
    actual_hours: Number,
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
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

workOrderSchema.index({ manufacturing_order: 1, sequence_number: 1 }, { unique: true });
workOrderSchema.index({ status: 1 });

const WorkOrder = mongoose.model('WorkOrder', workOrderSchema);
export default WorkOrder;
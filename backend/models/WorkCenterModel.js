import mongoose from 'mongoose';

const workCenterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    capacity_per_hour: {
        type: Number,
        required: true
    },
    hourly_rate: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Maintenance', 'Inactive'],
        default: 'Active'
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Add indexes for better performance
workCenterSchema.index({ status: 1 });
workCenterSchema.index({ name: 1 });

const WorkCenter = mongoose.model('WorkCenter', workCenterSchema);
export default WorkCenter;
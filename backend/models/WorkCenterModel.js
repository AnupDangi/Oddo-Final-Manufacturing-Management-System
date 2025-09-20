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
    capacity_per_hour: {
        type: Number,
        required: true
    },
    hourly_rate: {
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

const WorkCenter = mongoose.model('WorkCenter', workCenterSchema);
export default WorkCenter;
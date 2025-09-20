import mongoose from 'mongoose';

const kpiSchema = new mongoose.Schema({
    metric_name: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true
    },
    trend: {
        type: Number,  // Percentage change from previous period
        default: 0
    }
});

const dashboardSchema = new mongoose.Schema({
    manufacturing_metrics: {
        total_orders: {
            type: Number,
            default: 0
        },
        completed_orders: {
            type: Number,
            default: 0
        },
        in_progress_orders: {
            type: Number,
            default: 0
        },
        delayed_orders: {
            type: Number,
            default: 0
        },
        efficiency_rate: {
            type: Number,
            default: 0  // Percentage
        }
    },
    inventory_metrics: {
        total_products: {
            type: Number,
            default: 0
        },
        low_stock_items: {
            type: Number,
            default: 0
        },
        stock_value: {
            type: Number,
            default: 0
        },
        stock_turnover_rate: {
            type: Number,
            default: 0
        }
    },
    work_center_metrics: {
        active_work_centers: {
            type: Number,
            default: 0
        },
        utilization_rate: {
            type: Number,
            default: 0  // Percentage
        },
        downtime: {
            type: Number,
            default: 0  // Hours
        }
    },
    quality_metrics: {
        defect_rate: {
            type: Number,
            default: 0  // Percentage
        },
        rework_orders: {
            type: Number,
            default: 0
        },
        quality_score: {
            type: Number,
            default: 0  // 0-100
        }
    },
    time_period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    custom_kpis: [kpiSchema],
    chart_data: {
        production_trend: [{
            date: Date,
            value: Number
        }],
        inventory_trend: [{
            date: Date,
            value: Number
        }],
        efficiency_trend: [{
            date: Date,
            value: Number
        }]
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

// Indexes for faster queries
dashboardSchema.index({ date: 1 });
dashboardSchema.index({ time_period: 1 });
dashboardSchema.index({ 'manufacturing_metrics.efficiency_rate': 1 });
dashboardSchema.index({ 'inventory_metrics.stock_value': 1 });

// Static method to get latest dashboard data
dashboardSchema.statics.getLatestDashboard = async function(timePeriod) {
    return this.findOne({ time_period: timePeriod })
        .sort({ date: -1 })
        .exec();
};

// Method to update metrics
dashboardSchema.methods.updateMetrics = async function() {
    // Add logic to update metrics based on current data
    // This would involve querying other collections and calculating metrics
};

// Virtual for total efficiency score
dashboardSchema.virtual('totalEfficiencyScore').get(function() {
    const {
        efficiency_rate = 0
    } = this.manufacturing_metrics;
    const {
        utilization_rate = 0
    } = this.work_center_metrics;
    const {
        quality_score = 0
    } = this.quality_metrics;

    return ((efficiency_rate + utilization_rate + quality_score) / 3).toFixed(2);
});

// Pre-save middleware to ensure date formats are consistent
dashboardSchema.pre('save', function(next) {
    if (this.date) {
        this.date.setHours(0, 0, 0, 0);
    }
    next();
});

const Dashboard = mongoose.model('Dashboard', dashboardSchema);
export default Dashboard;
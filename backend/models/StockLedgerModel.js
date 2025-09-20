import mongoose from 'mongoose';

const stockLedgerSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    transaction_type: {
        type: String,
        enum: ['Receipt', 'Issue', 'Adjustment'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reference_type: {
        type: String,
        required: true,
        // --- CHANGE 2: Added 'Purchase Order' ---
        enum: ['Manufacturing Order', 'Work Order', 'Manual', 'Purchase Order']
    },
    reference_id: {
        // --- CHANGE 1: Changed type from ObjectId to String ---
        type: String,
        required: true
    },
    unit_cost: {
        type: Number,
        required: true
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

stockLedgerSchema.index({ product: 1, created_at: 1 });
stockLedgerSchema.index({ reference_type: 1, reference_id: 1 });

const StockLedger = mongoose.model('StockLedger', stockLedgerSchema);
export default StockLedger;
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

const bomOperationSchema = new mongoose.Schema({
    operation: {
        type: String,
        required: true
    },
    work_center: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WorkCenter',
        required: true
    },
    expected_duration: {
        type: Number, // in minutes
        required: true
    },
    sequence: {
        type: Number,
        required: true
    }
});

const bomSchema = new mongoose.Schema({
    reference: {
        type: String,
        unique: true
    },
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
    operations: [bomOperationSchema],
    is_active: {
        type: Boolean,
        default: true
    },
    is_default: {
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
bomSchema.index({ reference: 1 });

// Pre-save middleware to generate reference
bomSchema.pre('save', function(next) {
    if (this.isNew && !this.reference) {
        // Generate reference like [3001], [3002], etc.
        const randomRef = Math.floor(Math.random() * 9000) + 1000;
        this.reference = `[${randomRef}]`;
    }
    next();
});

// Static method to get active BOM for a product
bomSchema.statics.getActiveBOM = async function(productId) {
    return this.findOne({ 
        product: productId,
        is_active: true
    })
    .populate('product')
    .populate('components.component_product')
    .populate('operations.work_center');
};

// Static method to calculate total BOM cost
bomSchema.statics.calculateBOMCost = async function(bomId, quantity = 1) {
    const bom = await this.findById(bomId).populate('components.component_product');
    if (!bom) throw new Error('BOM not found');
    
    let totalCost = 0;
    const componentDetails = [];
    
    for (const component of bom.components) {
        const componentCost = component.component_product.standard_cost * component.quantity_required * quantity;
        totalCost += componentCost;
        
        componentDetails.push({
            product_id: component.component_product._id, // Add ObjectId for reference
            product: component.component_product.name,
            sku: component.component_product.sku,
            quantity_required: component.quantity_required * quantity,
            unit_cost: component.component_product.standard_cost,
            total_cost: componentCost,
            unit_of_measure: component.component_product.unit_of_measure
        });
    }
    
    return {
        bom_id: bomId,
        quantity: quantity,
        components: componentDetails,
        total_material_cost: totalCost
    };
};

// Pre-save hook to auto-increment version
bomSchema.pre('save', async function(next) {
    if (this.isNew && !this.version) {
        const latestBom = await this.constructor.findOne({ 
            product: this.product 
        }).sort({ version: -1 });
        
        if (latestBom) {
            const currentVersion = parseFloat(latestBom.version);
            this.version = (currentVersion + 0.1).toFixed(1);
        } else {
            this.version = '1.0';
        }
    }
    next();
});

const BOM = mongoose.model('BOM', bomSchema);
export default BOM;
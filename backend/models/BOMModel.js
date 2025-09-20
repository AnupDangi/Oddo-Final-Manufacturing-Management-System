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

// Static method to get active BOM for a product
bomSchema.statics.getActiveBOM = async function(productId) {
    return this.findOne({ 
        product: productId,
        is_active: true
    })
    .populate('product')
    .populate('components.component_product');
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
            product: component.component_product.name,
            sku: component.component_product.sku,
            quantity_required: component.quantity_required * quantity,
            unit_cost: component.component_product.standard_cost,
            total_cost: componentCost
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
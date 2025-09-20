import { mongoose } from '../config/database.js';

/**
 * MongoDB Schemas for Manufacturing ERP System
 * This file contains all Mongoose schema definitions with proper validation,
 * indexes, and relationships for the manufacturing management system.
 */

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'operator', 'inventory'],
    default: 'operator'
  },
  department: {
    type: String,
    enum: ['production', 'inventory', 'quality', 'maintenance', 'admin'],
    default: 'production'
  },
  permissions: [{
    type: String,
    enum: [
      'products.read', 'products.write', 'products.delete',
      'work_centers.read', 'work_centers.write', 'work_centers.delete',
      'boms.read', 'boms.write', 'boms.delete',
      'manufacturing_orders.read', 'manufacturing_orders.write', 'manufacturing_orders.delete',
      'work_orders.read', 'work_orders.write', 'work_orders.delete',
      'stock_ledger.read', 'stock_ledger.write', 'stock_ledger.delete',
      'dashboard.read', 'reports.read', 'reports.export',
      'users.read', 'users.write', 'users.delete'
    ]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    enum: ['raw_material', 'semi_finished', 'finished_good'],
    required: [true, 'Product type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'grams', 'liters', 'pieces', 'meters', 'tons']
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    min: [0, 'Selling price cannot be negative']
  },
  currentStock: {
    type: Number,
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  reorderLevel: {
    type: Number,
    required: [true, 'Reorder level is required'],
    min: [0, 'Reorder level cannot be negative']
  },
  maxStockLevel: {
    type: Number,
    min: [0, 'Max stock level cannot be negative']
  },
  specifications: {
    type: Map,
    of: String
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'products'
});

// Work Center Schema
const workCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Work center name is required'],
    trim: true,
    maxlength: [200, 'Work center name cannot exceed 200 characters']
  },
  code: {
    type: String,
    required: [true, 'Work center code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['production', 'assembly', 'quality', 'packaging', 'maintenance']
  },
  capacityPerHour: {
    type: Number,
    required: [true, 'Capacity per hour is required'],
    min: [0, 'Capacity cannot be negative']
  },
  operatingHours: {
    start: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    },
    end: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
    }
  },
  costPerHour: {
    type: Number,
    required: [true, 'Cost per hour is required'],
    min: [0, 'Cost per hour cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  equipment: [{
    name: String,
    model: String,
    serialNumber: String,
    status: {
      type: String,
      enum: ['operational', 'maintenance', 'breakdown'],
      default: 'operational'
    }
  }],
  supervisors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'work_centers'
});

// Work Center Downtime Schema
const workCenterDowntimeSchema = new mongoose.Schema({
  workCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkCenter',
    required: true
  },
  downtimeDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date
  },
  downtimeMinutes: {
    type: Number,
    min: [0, 'Downtime minutes cannot be negative']
  },
  reason: {
    type: String,
    required: [true, 'Downtime reason is required'],
    enum: ['maintenance', 'breakdown', 'setup', 'material_shortage', 'power_outage', 'other']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  collection: 'work_center_downtime'
});

// BOM (Bill of Materials) Schema
const bomSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  version: {
    type: String,
    required: [true, 'BOM version is required'],
    default: '1.0'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  components: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: [true, 'Component quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      required: true
    },
    wastagePercentage: {
      type: Number,
      default: 0,
      min: [0, 'Wastage percentage cannot be negative'],
      max: [100, 'Wastage percentage cannot exceed 100']
    }
  }],
  totalCost: {
    type: Number,
    default: 0,
    min: [0, 'Total cost cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'boms'
});

// Manufacturing Order Schema
const manufacturingOrderSchema = new mongoose.Schema({
  moNumber: {
    type: String,
    required: [true, 'MO number is required'],
    unique: true,
    uppercase: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  bomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BOM'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  status: {
    type: String,
    enum: ['planned', 'released', 'in_progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  plannedStartDate: {
    type: Date,
    required: [true, 'Planned start date is required']
  },
  plannedEndDate: {
    type: Date,
    required: [true, 'Planned end date is required']
  },
  actualStartDate: {
    type: Date
  },
  actualEndDate: {
    type: Date
  },
  requiredComponents: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    requiredQuantity: {
      type: Number,
      required: true,
      min: [0, 'Required quantity cannot be negative']
    },
    allocatedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Allocated quantity cannot be negative']
    },
    consumedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Consumed quantity cannot be negative']
    }
  }],
  actualQuantityProduced: {
    type: Number,
    default: 0,
    min: [0, 'Actual quantity cannot be negative']
  },
  qualityCheckStatus: {
    type: String,
    enum: ['pending', 'passed', 'failed', 'rework'],
    default: 'pending'
  },
  totalCost: {
    type: Number,
    default: 0,
    min: [0, 'Total cost cannot be negative']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'manufacturing_orders'
});

// Work Order Schema
const workOrderSchema = new mongoose.Schema({
  woNumber: {
    type: String,
    required: [true, 'WO number is required'],
    unique: true,
    uppercase: true
  },
  moId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ManufacturingOrder',
    required: true
  },
  workCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkCenter',
    required: true
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  operation: {
    type: String,
    required: [true, 'Operation is required'],
    trim: true
  },
  sequence: {
    type: Number,
    required: [true, 'Sequence is required'],
    min: [1, 'Sequence must be at least 1']
  },
  plannedQuantity: {
    type: Number,
    required: [true, 'Planned quantity is required'],
    min: [1, 'Planned quantity must be at least 1']
  },
  actualQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Actual quantity cannot be negative']
  },
  estimatedHours: {
    type: Number,
    required: [true, 'Estimated hours is required'],
    min: [0, 'Estimated hours cannot be negative']
  },
  actualHours: {
    type: Number,
    default: 0,
    min: [0, 'Actual hours cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'paused', 'completed', 'cancelled'],
    default: 'pending'
  },
  actualStartTime: {
    type: Date
  },
  actualEndTime: {
    type: Date
  },
  qualityCheck: {
    type: String,
    enum: ['pending', 'passed', 'failed', 'rework']
  },
  timeLog: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: {
      type: Date
    },
    duration: {
      type: Number, // in minutes
      min: [0, 'Duration cannot be negative']
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  materialsUsed: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative']
    },
    recordedAt: {
      type: Date,
      default: Date.now
    }
  }],
  instructions: {
    type: String,
    maxlength: [1000, 'Instructions cannot exceed 1000 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  collection: 'work_orders'
});

// Stock Ledger Schema
const stockLedgerSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  movementType: {
    type: String,
    enum: ['in', 'out', 'adjustment', 'transfer'],
    required: [true, 'Movement type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required']
  },
  unitCost: {
    type: Number,
    required: [true, 'Unit cost is required'],
    min: [0, 'Unit cost cannot be negative']
  },
  totalValue: {
    type: Number,
    required: [true, 'Total value is required']
  },
  balanceQuantity: {
    type: Number,
    required: [true, 'Balance quantity is required'],
    min: [0, 'Balance quantity cannot be negative']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    enum: [
      'purchase', 'production', 'sale', 'consumption', 'wastage',
      'return', 'transfer_in', 'transfer_out', 'adjustment', 'damaged'
    ]
  },
  referenceType: {
    type: String,
    enum: ['purchase_order', 'manufacturing_order', 'work_order', 'sales_order', 'adjustment', 'transfer']
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  referenceNumber: {
    type: String,
    trim: true
  },
  movementDate: {
    type: Date,
    required: [true, 'Movement date is required'],
    default: Date.now
  },
  location: {
    type: String,
    default: 'main_warehouse'
  },
  batchNumber: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  collection: 'stock_ledger'
});

// Add indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, isActive: 1 });

productSchema.index({ type: 1, category: 1 });
productSchema.index({ name: 1 });
productSchema.index({ currentStock: 1, reorderLevel: 1 });
productSchema.index({ isActive: 1 });

workCenterSchema.index({ code: 1 }, { unique: true });
workCenterSchema.index({ department: 1, isActive: 1 });

workCenterDowntimeSchema.index({ workCenterId: 1, downtimeDate: 1 });

bomSchema.index({ productId: 1, version: 1 }, { unique: true });
bomSchema.index({ isActive: 1 });

manufacturingOrderSchema.index({ moNumber: 1 }, { unique: true });
manufacturingOrderSchema.index({ status: 1, plannedStartDate: 1 });
manufacturingOrderSchema.index({ productId: 1, status: 1 });
manufacturingOrderSchema.index({ isActive: 1 });

workOrderSchema.index({ woNumber: 1 }, { unique: true });
workOrderSchema.index({ moId: 1, sequence: 1 });
workOrderSchema.index({ workCenterId: 1, status: 1 });
workOrderSchema.index({ operatorId: 1, status: 1 });

stockLedgerSchema.index({ productId: 1, movementDate: -1 });
stockLedgerSchema.index({ movementType: 1, movementDate: -1 });
stockLedgerSchema.index({ referenceType: 1, referenceId: 1 });

export {
  userSchema,
  productSchema,
  workCenterSchema,
  workCenterDowntimeSchema,
  bomSchema,
  manufacturingOrderSchema,
  workOrderSchema,
  stockLedgerSchema
};